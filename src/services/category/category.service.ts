import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import { buildPagedData, getPagination } from "../../lib/pagination.ts";
import { requiredString } from "../../lib/validation.ts";

export interface CreateCategoryData {
  name: string;
}

export interface UpdateCategoryData {
  name?: string;
}

export interface GetCategoriesQuery {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string | undefined;
}

export const createCategoryService = async (data: CreateCategoryData) => {
  const name = requiredString(data.name, "name");

  const existing = await prisma.category.findFirst({
    where: { name, isDeleted: false },
  });
  if (existing) {
    throw new AppError(409, "Category already exists");
  }

  return prisma.category.create({ data: { name } });
};

export const getAllCategoriesService = async (query: GetCategoriesQuery) => {
  const { page, limit, skip } = getPagination(query);
  const where = {
    isDeleted: false,
    ...(query.search
      ? { name: { contains: query.search, mode: "insensitive" as const } }
      : {}),
  };

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.count({ where }),
  ]);

  return buildPagedData(categories, total, page, limit);
};

export const getCategoryByIdService = async (id: string) => {
  const category = await prisma.category.findFirst({
    where: { id, isDeleted: false },
    include: {
      product: {
        where: { isDeleted: false },
        orderBy: { createdAt: "desc" },
      },
    },
  });
  if (!category) {
    throw new AppError(404, "Category not found");
  }
  return category;
};

export const updateCategoryService = async (
  id: string,
  data: UpdateCategoryData,
) => {
  const category = await prisma.category.findFirst({
    where: { id, isDeleted: false },
  });
  if (!category) {
    throw new AppError(404, "Category not found");
  }

  const updateData: { name?: string } = {};
  if (data.name !== undefined) {
    const name = requiredString(data.name, "name");
    const existing = await prisma.category.findFirst({
      where: { name, isDeleted: false, NOT: { id } },
    });
    if (existing) {
      throw new AppError(409, "Category already exists");
    }
    updateData.name = name;
  }

  return prisma.category.update({ where: { id }, data: updateData });
};

export const softDeleteCategoryService = async (id: string): Promise<void> => {
  const category = await prisma.category.findFirst({
    where: { id, isDeleted: false },
  });
  if (!category) {
    throw new AppError(404, "Category not found");
  }
  await prisma.category.update({ where: { id }, data: { isDeleted: true } });
};