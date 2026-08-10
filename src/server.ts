import app from "./app.ts";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma.ts";

dotenv.config();
const PORT: string | number = process.env.PORT || 4000;
const localhost: string = "localhost";

const connectPostgresDB = async (): Promise<void> => {
  try {
    await prisma.$connect();
    console.log(`Postgress Database is Connected Successfully`);
  } catch (error) {
    console.log(`Postgress Database Error -> ${error}`);
  }
};
await connectPostgresDB();

app.listen(PORT, (): void => {
  console.log(`server is running http://${localhost}:${PORT}`);
});
