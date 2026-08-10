import type { Role } from "../../generated/prisma/client.ts";
import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import { PasswordHash } from "../../lib/auth.ts";
import { sanitizeUser } from "../../lib/transform.ts";
import { buildPagedData, getPagination } from "../../lib/pagination.ts";
import {
  optionalEnum,
  optionalString,
  requiredString,
  validateEmail,
} from "../../lib/validation.ts";

export interface CreateUserData {
  name: string;
  username: string;
  email: string;
  password: string;
  image?: string;
  role?: Role;
}

export interface GetUsersQuery {
  page?: string | undefined;
  limit?: string | undefined;
  search?: string | undefined;
}

export interface UpdateUserData {
  name?: string;
  username?: string;
  email?: string;
  image?: string;
  password?: string;
  role?: Role;
}

const assertUnusedCredentials = async (
  data: { username?: string | undefined; email?: string | undefined },
  excludeId?: string,
): Promise<void> => {
  if (!data.username && !data.email) return;
  const existing = await prisma.user.findFirst({
    where: {
      OR: [
        ...(data.username ? [{ username: data.username }] : []),
        ...(data.email ? [{ email: data.email }] : []),
      ],
      ...(excludeId ? { NOT: { id: excludeId } } : {}),
      isDeleted: false,
    },
  });
  if (existing) {
    throw new AppError(409, "Username or email already in use");
  }
};

export const createUserRecord = async (
  data: CreateUserData,
): Promise<ReturnType<typeof sanitizeUser>> => {
  const name = requiredString(data.name, "name");
  const username = requiredString(data.username, "username");
  const email = validateEmail(data.email);
  const password = requiredString(data.password, "password");
  if (password.length < 6) {
    throw new AppError(400, "Password must be at least 6 characters");
  }
  const image = optionalString(data.image);
  const role = optionalEnum(data.role, ["USER", "ADMIN"] as const, "role");

  await assertUnusedCredentials({ username, email });

  const hashedPassword = await PasswordHash(password);
  const user = await prisma.user.create({
    data: {
      name,
      username,
      email,
      password: hashedPassword,
      ...(image !== undefined ? { image } : {}),
      ...(role !== undefined ? { role } : {}),
    },
  });
  return sanitizeUser(user);
};

export const getAllUsersService = async (
  query: GetUsersQuery,
): Promise<ReturnType<typeof buildPagedData<ReturnType<typeof sanitizeUser>>>> => {
  const { page, limit, skip } = getPagination(query);
  const where = {
    isDeleted: false,
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { username: { contains: query.search, mode: "insensitive" as const } },
            { email: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.count({ where }),
  ]);

  return buildPagedData(users.map(sanitizeUser), total, page, limit);
};

export const getUserByIdService = async (
  id: string,
): Promise<ReturnType<typeof sanitizeUser>> => {
  const user = await prisma.user.findFirst({ where: { id, isDeleted: false } });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return sanitizeUser(user);
};

export const updateUserService = async (
  id: string,
  data: UpdateUserData,
): Promise<ReturnType<typeof sanitizeUser>> => {
  const user = await prisma.user.findFirst({ where: { id, isDeleted: false } });
  if (!user) {
    throw new AppError(404, "User not found");
  }

  const updateData: {
    name?: string;
    username?: string;
    email?: string;
    image?: string | null;
    password?: string;
    role?: Role;
  } = {};

  if (data.name !== undefined) updateData.name = requiredString(data.name, "name");
  if (data.username !== undefined) updateData.username = requiredString(data.username, "username");
  if (data.email !== undefined) updateData.email = validateEmail(data.email);
  if (data.image !== undefined) updateData.image = optionalString(data.image) ?? null;
  if (data.role !== undefined) {
    const role = optionalEnum(data.role, ["USER", "ADMIN"] as const, "role");
    if (role !== undefined) updateData.role = role;
  }
  if (data.password !== undefined) {
    const password = requiredString(data.password, "password");
    if (password.length < 6) {
      throw new AppError(400, "Password must be at least 6 characters");
    }
    updateData.password = await PasswordHash(password);
  }

  await assertUnusedCredentials(
    { username: updateData.username, email: updateData.email },
    id,
  );

  const updated = await prisma.user.update({
    where: { id },
    data: updateData,
  });
  return sanitizeUser(updated);
};

export const softDeleteUserService = async (id: string): Promise<void> => {
  const user = await prisma.user.findFirst({ where: { id, isDeleted: false } });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  await prisma.user.update({ where: { id }, data: { isDeleted: true } });
};