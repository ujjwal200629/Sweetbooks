import { Router } from "express";
import { BillingController } from "../controllers/billing.controller";

const router = Router();
const controller = new BillingController();

router.post("/", controller.generate);

export default router;
