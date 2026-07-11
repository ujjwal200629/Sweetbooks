import { prisma } from "../prisma/client";
import { Prisma } from "@prisma/client";

export class SettingRepository {
  async getSettings() {
    return prisma.setting.findFirst({
      where: { id: "1" }
    });
  }

  async initSettings() {
    return prisma.setting.create({
      data: {
        id: "1",
        shopName: "My Sweet Shop",
      }
    });
  }

  async updateSettings(data: Prisma.SettingUpdateInput) {
    return prisma.setting.update({
      where: { id: "1" },
      data
    });
  }
}
