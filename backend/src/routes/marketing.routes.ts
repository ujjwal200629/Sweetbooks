import { Router } from "express";
import { MarketingController } from "../controllers/marketing.controller";

const router = Router();
const controller = new MarketingController();

router.get("/offers", controller.getOffers);
router.post("/offers", controller.createOffer);
router.get("/campaigns", controller.getCampaigns);
router.post("/campaigns", controller.createCampaign);

export default router;
