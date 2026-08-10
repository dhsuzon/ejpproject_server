export interface PaginationQuery {
  page?: string | undefined;
  limit?: string | undefined;
}

export interface PaginationResult {
  page: number;
  limit: number;
  skip: number;
}

export const getPagination = (
  query: PaginationQuery,
  defaultLimit = 10,
): PaginationResult => {
  const page = Math.max(1, Number(query.page ?? 1) || 1);
  const limit = Math.min(
    100,
    Math.max(1, Number(query.limit ?? defaultLimit) || defaultLimit),
  );
  return { page, limit, skip: (page - 1) * limit };
};

export const buildPagedData = <T>(
  items: T[],
  total: number,
  page: number,
  limit: number,
): { items: T[]; meta: PaginationResult & { total: number; totalPages: number } } => ({
  items,
  meta: { page, limit, skip: (page - 1) * limit, total, totalPages: Math.ceil(total / limit) },
});