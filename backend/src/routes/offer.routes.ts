import { Router } from "express";
import { OfferService } from "../services/offer.service";

export const offerRouter = Router();
const offerService = new OfferService();

offerRouter.get("/", async (req, res) => {
  try {
    const data = await offerService.getOffers();
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

offerRouter.get("/active", async (req, res) => {
  try {
    const data = await offerService.getActiveOffers(req.query.vipLevel as string);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

offerRouter.post("/", async (req, res) => {
  try {
    const data = await offerService.createOffer(req.body);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

offerRouter.delete("/:id", async (req, res) => {
  try {
    await offerService.deleteOffer(req.params.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
