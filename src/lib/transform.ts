import type { User, Role, IsActive } from "../generated/prisma/client.ts";

export interface SanitizedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  image: string | null;
  role: Role;
  isActive: IsActive;
}

export const sanitizeUser = (user: User): SanitizedUser => ({
  id: user.id,
  name: user.name,
  username: user.username,
  email: user.email,
  image: user.image,
  role: user.role,
  isActive: user.isActive,
});