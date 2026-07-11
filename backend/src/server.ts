import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());

// Standard API Response Format Type
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}

import productRoutes from "./routes/product.routes";
import customerRoutes from "./routes/customer.routes";
import billingRoutes from "./routes/billing.routes";
import stockRoutes from "./routes/stock.routes";
import loyaltyRoutes from "./routes/loyalty.routes";
import settingRoutes from "./routes/setting.routes";
import dashboardRoutes from "./routes/dashboard.routes";
import advanceRoutes from "./routes/advance.routes";
import { offerRouter } from "./routes/offer.routes";
import { reportRouter } from "./routes/report.routes";
import marketingRoutes from "./routes/marketing.routes";

// API Routes
app.use("/api/products", productRoutes);
app.use("/api/customers", customerRoutes);
app.use("/api/billing", billingRoutes);
app.use("/api/stock", stockRoutes);
app.use("/api/loyalty", loyaltyRoutes);
app.use("/api/settings", settingRoutes);
app.use("/api/advance", advanceRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/offers", offerRouter);
app.use("/api/reports", reportRouter);
app.use("/api/marketing", marketingRoutes);

app.get("/", (req, res) => {
  res.send("POS API is running...");
});

// Example Route
app.get("/health", (req: Request, res: Response) => {
  const response: ApiResponse = {
    success: true,
    message: "Server is healthy",
  };
  res.status(200).json(response);
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  const response: ApiResponse = {
    success: false,
    message: err.message || "Internal Server Error",
  };
  res.status(500).json(response);
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
