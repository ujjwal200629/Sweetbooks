import { Router } from "express";
import { LoyaltyController } from "../controllers/loyalty.controller";

const router = Router();
const controller = new LoyaltyController();

router.get("/:customerId", controller.getHistory);
router.post("/:customerId/redeem", controller.redeem);

export default router;
