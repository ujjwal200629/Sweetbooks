import { Request, Response } from "express";
import { SettingService } from "../services/setting.service";
import { updateSettingSchema } from "../validators/setting.validator";

const settingService = new SettingService();

export class SettingController {
  async get(req: Request, res: Response) {
    try {
      const settings = await settingService.getShopSettings();
      res.json({ success: true, data: settings });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const parsedData = updateSettingSchema.parse(req.body);
      const result = await settingService.updateShopSettings(parsedData);
      res.json({ success: true, message: "Settings updated", data: result });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  }
}
