import { Router } from "express";
import { SettingController } from "../controllers/setting.controller";

const router = Router();
const controller = new SettingController();

router.get("/", controller.get);
router.put("/", controller.update);

export default router;
