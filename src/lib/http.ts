import { Request } from "express";

export const getRouteId = (req: Request, name = "id"): string => {
  const value = req.params[name];
  const single = Array.isArray(value) ? value[0] : value;
  return single ?? "";
};