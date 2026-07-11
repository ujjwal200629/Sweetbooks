import { SettingRepository } from "../repositories/setting.repository";
import { Prisma } from "@prisma/client";

const settingRepo = new SettingRepository();

export class SettingService {
  async getShopSettings() {
    let settings = await settingRepo.getSettings();
    if (!settings) {
      settings = await settingRepo.initSettings();
    }
    return settings;
  }

  async updateShopSettings(data: Prisma.SettingUpdateInput) {
    const existing = await settingRepo.getSettings();
    if (!existing) {
      await settingRepo.initSettings();
    }
    return settingRepo.updateSettings(data);
  }
}
