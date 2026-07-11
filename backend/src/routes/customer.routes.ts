import { Router } from "express";
import { CustomerController } from "../controllers/customer.controller";

const router = Router();
const controller = new CustomerController();

router.get("/", controller.getAll);
router.get("/:id", controller.getById);
router.post("/:id/notes", controller.addNote);
router.get("/:id/invoices", controller.getInvoices);
router.get("/phone/:phone", controller.getByPhone);
router.post("/", controller.create);
router.put("/:id", controller.update);

export default router;
