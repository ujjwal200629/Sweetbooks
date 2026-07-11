import { Router } from "express";
import { StockController } from "../controllers/stock.controller";

const router = Router();
const controller = new StockController();

router.get("/:productId", controller.getHistory);
router.post("/:productId", controller.adjust);

export default router;
