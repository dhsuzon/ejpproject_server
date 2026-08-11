import { AppError } from "../../lib/error.ts";

export const subscribeNewsletterService = async (email: unknown): Promise<string> => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (typeof email !== "string" || !emailRegex.test(email.trim())) {
    throw new AppError(400, "A valid email is required");
  }
  return email.trim();
};