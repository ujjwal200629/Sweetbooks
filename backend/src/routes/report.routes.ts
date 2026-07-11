import { Router } from "express";
import { ReportService } from "../services/report.service";

export const reportRouter = Router();
const reportService = new ReportService();

// Helper to parse dates from query
const parseDates = (query: any) => {
  if (!query.start || !query.end) throw new Error("start and end date are required");
  return {
    startDate: new Date(query.start),
    endDate: new Date(query.end),
    prevStartDate: query.prevStart ? new Date(query.prevStart) : undefined,
    prevEndDate: query.prevEnd ? new Date(query.prevEnd) : undefined
  };
};

reportRouter.get("/sales", async (req, res) => {
  try {
    const { startDate, endDate, prevStartDate, prevEndDate } = parseDates(req.query);
    const data = await reportService.getSalesReport(startDate, endDate, prevStartDate, prevEndDate);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

reportRouter.get("/products", async (req, res) => {
  try {
    const { startDate, endDate } = parseDates(req.query);
    const data = await reportService.getProductReport(startDate, endDate);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

reportRouter.get("/customers", async (req, res) => {
  try {
    const { startDate, endDate } = parseDates(req.query);
    const data = await reportService.getCustomerReport(startDate, endDate);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

reportRouter.get("/vip", async (req, res) => {
  try {
    const { startDate, endDate } = parseDates(req.query);
    const data = await reportService.getVipReport(startDate, endDate);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

reportRouter.get("/inventory", async (req, res) => {
  try {
    const { startDate, endDate } = parseDates(req.query);
    const data = await reportService.getInventoryReport(startDate, endDate);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

reportRouter.get("/payments", async (req, res) => {
  try {
    const { startDate, endDate } = parseDates(req.query);
    const data = await reportService.getPaymentReport(startDate, endDate);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

reportRouter.get("/gst", async (req, res) => {
  try {
    const { startDate, endDate } = parseDates(req.query);
    const data = await reportService.getGstReport(startDate, endDate);
    res.json({ success: true, data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
