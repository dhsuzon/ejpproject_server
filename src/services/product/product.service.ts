import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import { buildPagedData, getPagination } from "../../lib/pagination.ts";
import {
  optionalNumber,
  optionalString,
  requiredNumber,
  requiredString,
} from "../../lib/validation.ts";
import { validateRating } from "../review/review.service.ts";

export interface CreateProductData {
  name: string;
  title: string;
  image: string;
  description?: string;
  price: number;
  stock?: number;
  categoryId: string;
  category?: string;
}

export interface UpdateProductData {
  name?: string;
  title?: string;
  image?: string;
  description?: string;
  price?: number;
  stock?: number;
  categoryId?: string;
  category?: string;
}

export interface GetProductsQuery {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string | undefined;
  categoryId?: string | undefined;
  category?: string | undefined;
  sort?: string | undefined;
  minPrice?: string | undefined;
  maxPrice?: string | undefined;
}

const getCategoryOrThrow = async (categoryId: string): Promise<void> => {
  const category = await prisma.category.findFirst({
    where: { id: categoryId, isDeleted: false },
  });
  if (!category) {
    throw new AppError(404, "Category not found");
  }
};

const resolveCategoryId = async (
  categoryId: string | undefined,
  categoryName: string | undefined,
): Promise<string> => {
  if (categoryId) {
    await getCategoryOrThrow(categoryId);
    return categoryId;
  }
  const name = requiredString(categoryName, "categoryId");
  const category = await prisma.category.findFirst({
    where: { name, isDeleted: false },
  });
  if (!category) {
    throw new AppError(404, "Category not found");
  }
  return category.id;
};

export const createProductService = async (data: CreateProductData) => {
  const name = requiredString(data.name, "name");
  const title = requiredString(data.title, "title");
  const image = requiredString(data.image, "image");
  const description = optionalString(data.description);
  const price = requiredNumber(data.price, "price");
  if (price < 0) {
    throw new AppError(400, "Price cannot be negative");
  }
  const stock = optionalNumber(data.stock, 0);
  const categoryId = await resolveCategoryId(data.categoryId, data.category);

  return prisma.product.create({
    data: {
      name,
      title,
      image,
      price,
      stock,
      categoryId,
      ...(description !== undefined ? { description } : {}),
    },
  });
};

export const getAllProductsService = async (query: GetProductsQuery) => {
  const { page, limit, skip } = getPagination(query);
  let categoryId = query.categoryId;
  if (!categoryId && query.category) {
    const category = await prisma.category.findFirst({
      where: { name: query.category, isDeleted: false },
    });
    if (category) categoryId = category.id;
  }
  const where = {
    isDeleted: false,
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { title: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(query.minPrice || query.maxPrice
      ? {
          price: {
            ...(query.minPrice
              ? { gte: Number(query.minPrice) }
              : {}),
            ...(query.maxPrice
              ? { lte: Number(query.maxPrice) }
              : {}),
          },
        }
      : {}),
  };

  const orderBy =
    query.sort === "oldest"
      ? { createdAt: "asc" as const }
      : query.sort === "price_asc"
        ? { price: "asc" as const }
        : query.sort === "price_desc"
          ? { price: "desc" as const }
          : { createdAt: "desc" as const };

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      orderBy,
      include: { category: true },
    }),
    prisma.product.count({ where }),
  ]);

  return buildPagedData(products, total, page, limit);
};

export const getProductByIdService = async (id: string) => {
  const product = await prisma.product.findFirst({
    where: { id, isDeleted: false },
    include: {
      category: true,
      reviews: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          user: { select: { id: true, name: true, image: true } },
        },
      },
    },
  });
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  return product;
};

export const updateProductService = async (
  id: string,
  data: UpdateProductData,
) => {
  const product = await prisma.product.findFirst({
    where: { id, isDeleted: false },
  });
  if (!product) {
    throw new AppError(404, "Product not found");
  }

  const updateData: {
    name?: string;
    title?: string;
    image?: string;
    description?: string | null;
    price?: number;
    stock?: number;
    categoryId?: string;
  } = {};

  if (data.name !== undefined) updateData.name = requiredString(data.name, "name");
  if (data.title !== undefined) updateData.title = requiredString(data.title, "title");
  if (data.image !== undefined) updateData.image = requiredString(data.image, "image");
  if (data.description !== undefined) {
    updateData.description = optionalString(data.description) ?? null;
  }
  if (data.price !== undefined) {
    const price = requiredNumber(data.price, "price");
    if (price < 0) {
      throw new AppError(400, "Price cannot be negative");
    }
    updateData.price = price;
  }
  if (data.stock !== undefined) updateData.stock = optionalNumber(data.stock, 0);
  if (data.categoryId !== undefined || data.category !== undefined) {
    updateData.categoryId = await resolveCategoryId(data.categoryId, data.category);
  }

  return prisma.product.update({ where: { id }, data: updateData });
};

export const softDeleteProductService = async (id: string): Promise<void> => {
  const product = await prisma.product.findFirst({
    where: { id, isDeleted: false },
  });
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  await prisma.product.update({ where: { id }, data: { isDeleted: true } });
};

export const getProductCategoriesService = async (): Promise<string[]> => {
  const categories = await prisma.category.findMany({
    where: { isDeleted: false },
    orderBy: { name: "asc" },
  });
  return categories.map((category) => category.name);
};

export const getRelatedProductsService = async (id: string) => {
  const product = await prisma.product.findFirst({
    where: { id, isDeleted: false },
  });
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  return prisma.product.findMany({
    where: {
      isDeleted: false,
      categoryId: product.categoryId,
      NOT: { id },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
    include: { category: true },
  });
};

export const getProductReviewsService = async (productId: string) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false },
  });
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  return prisma.review.findMany({
    where: { productId, isDeleted: false },
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });
};

export const createProductReviewService = async (
  productId: string,
  userId: string,
  data: { rating: number; comment?: string },
) => {
  const product = await prisma.product.findFirst({
    where: { id: productId, isDeleted: false },
  });
  if (!product) {
    throw new AppError(404, "Product not found");
  }
  const rating = validateRating(data.rating);
  const comment = optionalString(data.comment);

  return prisma.review.create({
    data: {
      rating,
      productId,
      userId,
      ...(comment !== undefined ? { comment } : {}),
    },
    include: {
      user: { select: { id: true, name: true, image: true } },
    },
  });
};