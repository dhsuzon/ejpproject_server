import type { Role } from "../../generated/prisma/client.ts";
import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import { buildPagedData, getPagination } from "../../lib/pagination.ts";
import {
  optionalString,
  requiredNumber,
  requiredString,
} from "../../lib/validation.ts";

export interface CreateReviewData {
  rating: number;
  comment?: string;
  productId: string;
}

export interface UpdateReviewData {
  rating?: number;
  comment?: string;
}

export interface GetReviewsQuery {
  page?: string | undefined;
  limit?: string | undefined;
  productId?: string | undefined;
}

const getProductOrThrow = async (productId: string): Promise<void> => {
  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false },
  });
  if (!product) {
    throw new AppError(404, "Product not found");
  }
};

export const validateRating = (value: number): number => {
  const rating = requiredNumber(value, "rating");
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new AppError(400, "Rating must be an integer between 1 and 5");
  }
  return rating;
};

export const createReviewService = async (
  data: CreateReviewData,
  userId: string,
) => {
  const rating = validateRating(data.rating);
  const comment = optionalString(data.comment);
  const productId = requiredString(data.productId, "productId");

  await getProductOrThrow(productId);

  return prisma.review.create({
    data: {
      rating,
      productId,
      userId,
      ...(comment !== undefined ? { comment } : {}),
    },
  });
};

export const getAllReviewsService = async (query: GetReviewsQuery) => {
  const { page, limit, skip } = getPagination(query);
  const where = {
    isDeleted: false,
    ...(query.productId ? { productId: query.productId } : {}),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { id: true, name: true, image: true } },
        product: { select: { id: true, name: true, title: true } },
      },
    }),
    prisma.review.count({ where }),
  ]);

  return buildPagedData(reviews, total, page, limit);
};

export const getReviewByIdService = async (id: string) => {
  const review = await prisma.review.findFirst({
    where: { id, isDeleted: false },
    include: {
      user: { select: { id: true, name: true, image: true } },
      product: { select: { id: true, name: true, title: true } },
    },
  });
  if (!review) {
    throw new AppError(404, "Review not found");
  }
  return review;
};

const canModifyReview = (
  ownerId: string,
  currentUserId: string,
  role: Role,
): boolean => ownerId === currentUserId || role === "ADMIN";

export const updateReviewService = async (
  id: string,
  data: UpdateReviewData,
  currentUserId: string,
  role: Role,
) => {
  const review = await prisma.review.findFirst({
    where: { id, isDeleted: false },
  });
  if (!review) {
    throw new AppError(404, "Review not found");
  }
  if (!canModifyReview(review.userId, currentUserId, role)) {
    throw new AppError(403, "Forbidden: You can only update your own reviews");
  }

  const updateData: { rating?: number; comment?: string | null } = {};
  if (data.rating !== undefined) updateData.rating = validateRating(data.rating);
  if (data.comment !== undefined) {
    updateData.comment = optionalString(data.comment) ?? null;
  }

  return prisma.review.update({ where: { id }, data: updateData });
};

export const softDeleteReviewService = async (
  id: string,
  currentUserId: string,
  role: Role,
): Promise<void> => {
  const review = await prisma.review.findFirst({
    where: { id, isDeleted: false },
  });
  if (!review) {
    throw new AppError(404, "Review not found");
  }
  if (!canModifyReview(review.userId, currentUserId, role)) {
    throw new AppError(403, "Forbidden: You can only delete your own reviews");
  }
  await prisma.review.update({ where: { id }, data: { isDeleted: true } });
};