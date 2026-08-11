import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import { createToken, PasswordVerify } from "../../lib/auth.ts";
import { sanitizeUser } from "../../lib/transform.ts";
import { requiredString, validateEmail } from "../../lib/validation.ts";
import { createUserRecord } from "../user/user.service.ts";

export interface RegisterData {
  name: string;
  username?: string;
  email: string;
  password: string;
  image?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export const registerService = async (data: RegisterData) => {
  const email = validateEmail(data.email).toLowerCase();
  const derivedUsername = email.split("@")[0] ?? email;
  const username =
    typeof data.username === "string" && data.username.trim() !== ""
      ? data.username.trim()
      : derivedUsername;

  const userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    image?: string;
  } = { name: data.name, username, email, password: data.password };
  if (data.image !== undefined) userData.image = data.image;

  const user = await createUserRecord(userData);
  const token = createToken({ id: user.id, role: user.role });
  return { token, user };
};

export const loginService = async (data: LoginData) => {
  const email = validateEmail(data.email);
  const password = requiredString(data.password, "password");

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isDeleted) {
    throw new AppError(401, "Invalid email or password");
  }

  const isPasswordValid = await PasswordVerify(password, user.password);
  if (!isPasswordValid) {
    throw new AppError(401, "Invalid email or password");
  }

  const token = createToken({ id: user.id, role: user.role });
  return { token, user: sanitizeUser(user) };
};

export const getCurrentUserService = async (id: string) => {
  const user = await prisma.user.findFirst({ where: { id, isDeleted: false } });
  if (!user) {
    throw new AppError(404, "User not found");
  }
  return sanitizeUser(user);
};