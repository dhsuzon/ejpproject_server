import type { OrderStatus } from "../../generated/prisma/client.ts";
import { prisma } from "../../lib/prisma.ts";
import { AppError } from "../../lib/error.ts";
import { optionalString } from "../../lib/validation.ts";

export interface OrderItemInput {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface CreateOrderData {
  items?: OrderItemInput[];
  totalAmount?: number;
  paymentIntentId?: string;
}

const validateItems = (items: unknown): OrderItemInput[] => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new AppError(400, "Order must contain at least one item");
  }
  return items.map((item) => {
    const i = item as OrderItemInput;
    if (!i.productId || !i.name) {
      throw new AppError(400, "Each order item needs productId and name");
    }
    const orderItem: OrderItemInput = {
      productId: String(i.productId),
      name: String(i.name),
      price: Number(i.price) || 0,
      quantity: Math.max(1, Number(i.quantity) || 1),
    };
    const image = optionalString(i.image);
    if (image !== undefined) orderItem.image = image;
    return orderItem;
  });
};

export const createOrderService = async (
  userId: string,
  data: CreateOrderData,
) => {
  const items = validateItems(data.items);
  const totalAmount = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );
  const paymentIntentId = optionalString(data.paymentIntentId);

  return prisma.order.create({
    data: {
      userId,
      items: items as unknown as object,
      totalAmount,
      ...(paymentIntentId ? { paymentIntentId } : {}),
    },
  });
};

export const getMyOrdersService = async (userId: string) => {
  return prisma.order.findMany({
    where: { userId, isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
};

export const getAllOrdersService = async () => {
  return prisma.order.findMany({
    where: { isDeleted: false },
    orderBy: { createdAt: "desc" },
  });
};

const normalizeStatus = (value: unknown): OrderStatus => {
  const status = String(value ?? "").toUpperCase();
  if (!["PENDING", "SHIPPING", "DELIVERED"].includes(status)) {
    throw new AppError(400, "Status must be pending, shipping or delivered");
  }
  return status as OrderStatus;
};

export const updateOrderStatusService = async (id: string, status: unknown) => {
  const order = await prisma.order.findFirst({ where: { id, isDeleted: false } });
  if (!order) {
    throw new AppError(404, "Order not found");
  }
  return prisma.order.update({ where: { id }, data: { status: normalizeStatus(status) } });
};