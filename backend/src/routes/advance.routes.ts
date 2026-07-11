import { Router } from "express";
import { AdvanceController } from "../controllers/advance.controller";

const router = Router();
const controller = new AdvanceController();

router.get("/", controller.getAll);
router.post("/", controller.create);
router.post("/:id/complete", controller.complete);

export default router;
