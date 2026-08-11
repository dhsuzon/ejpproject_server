import { prisma } from "../../lib/prisma.ts";

export interface DashboardStats {
  totalProducts: number;
  totalUsers: number;
  totalRevenue: number;
  totalOrders: number;
}

export interface MonthlyOrder {
  month: string;
  count: number;
  revenue: number;
}

export interface OrderStatusDistribution {
  name: string;
  value: number;
}

export const getStatsService = async (): Promise<DashboardStats> => {
  const [totalProducts, totalUsers, orders] = await Promise.all([
    prisma.product.count({ where: { isDeleted: false } }),
    prisma.user.count({ where: { isDeleted: false } }),
    prisma.order.findMany({ where: { isDeleted: false }, select: { totalAmount: true } }),
  ]);
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
  return {
    totalProducts,
    totalUsers,
    totalRevenue,
    totalOrders: orders.length,
  };
};

const monthKey = (date: Date): string =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

export const getMonthlyOrdersService = async (): Promise<MonthlyOrder[]> => {
  const orders = await prisma.order.findMany({
    where: { isDeleted: false },
    select: { totalAmount: true, createdAt: true },
  });

  const months: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.push(monthKey(d));
  }

  const grouped = new Map<string, { count: number; revenue: number }>();
  for (const m of months) grouped.set(m, { count: 0, revenue: 0 });
  for (const o of orders) {
    const key = monthKey(new Date(o.createdAt));
    const entry = grouped.get(key);
    if (entry) {
      entry.count += 1;
      entry.revenue += Number(o.totalAmount) || 0;
    }
  }

  return months.map((month) => {
    const entry = grouped.get(month)!;
    const [year, monthNum] = month.split("-");
    return {
      month: new Date(Number(year), Number(monthNum) - 1, 1).toLocaleString("en-US", {
        month: "short",
      }),
      count: entry.count,
      revenue: entry.revenue,
    };
  });
};

export const getOrderStatusService = async (): Promise<OrderStatusDistribution[]> => {
  const orders = await prisma.order.findMany({
    where: { isDeleted: false },
    select: { status: true },
  });

  const counts: Record<string, number> = {};
  for (const o of orders) {
    const key = (o.status as string).toLowerCase();
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return (["pending", "shipping", "delivered"] as const).map((name) => ({
    name,
    value: counts[name] ?? 0,
  }));
};