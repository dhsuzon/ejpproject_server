// import "dotenv/config";
// import bcrypt from "bcrypt";
// import { PrismaClient } from "../src/generated/prisma/client.ts";
// import { PrismaPg } from "@prisma/adapter-pg";

// const adapter = new PrismaPg({
//   connectionString: process.env.DATABASE_URL as string,
// });
// const prisma = new PrismaClient({ adapter });

// const hashPassword = async (password: string): Promise<string> => {
//   const rounds = Number(process.env.BCRYPT_PASSWORD_SLOT) || 10;
//   return bcrypt.hash(password, rounds);
// };

// type CategoryInfo = { name: string };

// type ProductInfo = {
//   name: string;
//   title: string;
//   description: string;
//   image: string;
//   price: number;
//   stock: number;
//   categoryName: string;
// };

// const categoriesData: CategoryInfo[] = [
//   { name: "Electronics" },
//   { name: "Fashion" },
//   { name: "Home & Living" },
//   { name: "Sports & Outdoors" },
// ];

// const productsData: ProductInfo[] = [
//   {
//     name: "Wireless Bluetooth Headphones",
//     title: "Noise-Cancelling Wireless Headphones",
//     description:
//       "Premium over-ear headphones with active noise cancellation, 30-hour battery life and crystal-clear sound.",
//     image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80",
//     price: 89.99,
//     stock: 60,
//     categoryName: "Electronics",
//   },
//   {
//     name: "Smart Watch Series 5",
//     title: "Fitness Smart Watch",
//     description:
//       "Track your workouts, heart rate and sleep with this sleek smart watch. Water resistant with week-long battery.",
//     image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&q=80",
//     price: 199.99,
//     stock: 40,
//     categoryName: "Electronics",
//   },
//   {
//     name: "Mechanical Keyboard",
//     title: "RGB Mechanical Gaming Keyboard",
//     description:
//       "Compact mechanical keyboard with hot-swappable switches and customizable RGB backlighting.",
//     image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80",
//     price: 49.99,
//     stock: 80,
//     categoryName: "Electronics",
//   },
//   {
//     name: "Linen Summer Shirt",
//     title: "Classic Linen Summer Shirt",
//     description:
//       "Breathable and lightweight linen shirt, perfect for warm days. Regular fit with a soft feel.",
//     image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600&q=80",
//     price: 39.99,
//     stock: 90,
//     categoryName: "Fashion",
//   },
//   {
//     name: "Leather Crossbody Bag",
//     title: "Handcrafted Leather Crossbody Bag",
//     description:
//       "Genuine leather crossbody bag with adjustable strap and two interior compartments.",
//     image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=600&q=80",
//     price: 75.0,
//     stock: 35,
//     categoryName: "Fashion",
//   },
//   {
//     name: "Running Sneakers",
//     title: "Lightweight Running Sneakers",
//     description:
//       "Lightweight cushioned sneakers for road running and everyday wear. Breathable mesh upper.",
//     image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80",
//     price: 119.99,
//     stock: 50,
//     categoryName: "Fashion",
//   },
//   {
//     name: "Ceramic Coffee Set",
//     title: "Stoneware Ceramic Coffee Mug Set",
//     description:
//       "Set of four hand-finished stoneware mugs with a warm matte glaze. Dishwasher safe.",
//     image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=600&q=80",
//     price: 29.99,
//     stock: 100,
//     categoryName: "Home & Living",
//   },
//   {
//     name: "Scented Soy Candle",
//     title: "Hand-Poured Soy Candle - Vanilla",
//     description:
//       "Hand-poured soy wax candle with a calming vanilla scent. 40 hour burn time in a glass jar.",
//     image: "https://images.unsplash.com/photo-1603006905003-be475563bc59?w=600&q=80",
//     price: 19.99,
//     stock: 120,
//     categoryName: "Home & Living",
//   },
//   {
//     name: "Cotton Throw Blanket",
//     title: "Chunky Cotton Throw Blanket",
//     description:
//       "Soft woven cotton throw blanket that adds warmth and style to any living room.",
//     image: "https://images.unsplash.com/photo-1580301762395-83d8e81451aa?w=600&q=80",
//     price: 54.99,
//     stock: 45,
//     categoryName: "Home & Living",
//   },
//   {
//     name: "Yoga Mat Pro",
//     title: "Non-Slip Exercise Yoga Mat",
//     description:
//       "Thick non-slip yoga mat with carry strap. Ideal for yoga, pilates and home workouts.",
//     image: "https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&q=80",
//     price: 34.99,
//     stock: 70,
//     categoryName: "Sports & Outdoors",
//   },
//   {
//     name: "Insulated Water Bottle",
//     title: "24oz Stainless Steel Water Bottle",
//     description:
//       "Vacuum-insulated steel bottle keeps drinks cold for 24 hours or hot for 12 hours.",
//     image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&q=80",
//     price: 24.99,
//     stock: 110,
//     categoryName: "Sports & Outdoors",
//   },
//   {
//     name: "Dumbbell Set 10kg",
//     title: "Neoprene Dumbbell Pair",
//     description:
//       "Rust-resistant neoprene dumbbells with ergonomic handles for home strength training.",
//     image: "https://images.unsplash.com/photo-1638536532686-d610adfc8e5c?w=600&q=80",
//     price: 59.99,
//     stock: 30,
//     categoryName: "Sports & Outdoors",
//   },
// ];

// async function main(): Promise<void> {
//   const demoAdminPassword = await hashPassword("dider676540");
//   await prisma.user.upsert({
//     where: { email: "diderhossainsuzon@gmail.com" },
//     update: { role: "USER", isActive: "ACTIVE", isDeleted: false },
//     create: {
//       name: "Dider Hossain Suzon",
//       username: "diderhossainsuzon",
//       email: "diderhossainsuzon@gmail.com",
//       password: demoAdminPassword,
//       role: "USER",
//     },
//   });
//   console.log("✓ Demo user (diderhossainsuzon@gmail.com) ready");

//   for (const category of categoriesData) {
//     await prisma.category.upsert({
//       where: { name: category.name },
//       update: { isDeleted: false },
//       create: { name: category.name },
//     });
//   }
//   console.log(`✓ ${categoriesData.length} categories ready`);

//   const categories = await prisma.category.findMany({ where: { isDeleted: false } });
//   const categoryByName = new Map(categories.map((c) => [c.name, c]));

//   for (const product of productsData) {
//     const category = categoryByName.get(product.categoryName);
//     if (!category) continue;
//     const existing = await prisma.product.findFirst({
//       where: { name: product.name },
//     });
//     const data = {
//       description: product.description,
//       image: product.image,
//       price: product.price,
//       stock: product.stock,
//       categoryId: category.id,
//       isDeleted: false,
//     };
//     if (existing) {
//       await prisma.product.update({ where: { id: existing.id }, data });
//     } else {
//       await prisma.product.create({
//         data: { name: product.name, title: product.title, ...data },
//       });
//     }
//   }
//   console.log(`✓ ${productsData.length} products ready`);
// }

// main()
//   .catch((err) => {
//     console.error("Seed failed:", err);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });
