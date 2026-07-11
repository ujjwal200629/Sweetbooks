import { Request, Response } from "express";
import { CustomerService } from "../services/customer.service";
import { createCustomerSchema, updateCustomerSchema } from "../validators/customer.validator";
import { ApiResponse } from "../server";

const customerService = new CustomerService();

export class CustomerController {
  async getAll(req: Request, res: Response) {
    try {
      const customers = await customerService.getAllCustomers();
      res.json({ success: true, message: "Customers fetched", data: customers } as ApiResponse);
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message } as ApiResponse);
    }
  }

  async getById(req: Request, res: Response) {
    try {
      const customer = await customerService.getCustomerById(req.params.id as string);
      if (!customer) {
        res.status(404).json({ success: false, message: "Customer not found" });
        return;
      }
      res.json({ success: true, message: "Customer fetched", data: customer });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getByPhone(req: Request, res: Response) {
    try {
      const customer = await customerService.getCustomerByPhone(req.params.phone as string);
      if (!customer) {
        res.status(404).json({ success: false, message: "Customer not found" });
        return;
      }
      res.json({ success: true, message: "Customer fetched", data: customer });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async create(req: Request, res: Response) {
    try {
      const parsedData = createCustomerSchema.parse(req.body);
      const newCustomer = await customerService.createCustomer({
        name: parsedData.name,
        phone: parsedData.phone,
        birthday: parsedData.birthday ? new Date(parsedData.birthday) : undefined,
        anniversary: parsedData.anniversary ? new Date(parsedData.anniversary) : undefined,
      });
      res.status(201).json({ success: true, message: "Customer created", data: newCustomer });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const parsedData = updateCustomerSchema.parse(req.body);
      const updatedCustomer = await customerService.updateCustomer(req.params.id as string, {
        ...parsedData,
        birthday: parsedData.birthday ? new Date(parsedData.birthday) : undefined,
        anniversary: parsedData.anniversary ? new Date(parsedData.anniversary) : undefined,
      });
      res.json({ success: true, message: "Customer updated", data: updatedCustomer });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.errors || error.message });
    }
  }

  async getInvoices(req: Request, res: Response) {
    try {
      const invoices = await customerService.getCustomerInvoices(req.params.id as string);
      res.json({ success: true, data: invoices });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async addNote(req: Request, res: Response) {
    try {
      const note = await customerService.addNote(req.params.id as string, req.body.note);
      res.status(201).json({ success: true, data: note });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  }
}
