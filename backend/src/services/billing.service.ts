import { prisma } from "../prisma/client";
import { CustomerService } from "./customer.service";
import { ProductRepository } from "../repositories/product.repository";

const customerService = new CustomerService();
const productRepo = new ProductRepository();

export class BillingService {
  async generateBill(data: {
    customerPhone?: string;
    customerName?: string;
    customerBirthday?: string;
    customerAnniversary?: string;
    billingType: string;
    paymentMethod: string;
    additionalCharges: number;
    globalDiscount?: number;
    billNotes?: string;
    advanceOrderId?: string;
    items: { productId: string; quantity: number; discount: number }[];
  }) {
    return await prisma.$transaction(async (tx) => {
      let customerId: string | undefined = undefined;

      // 1. Auto-create or fetch customer
      if (data.customerPhone) {
        const name = data.customerName || "Walk-in Customer";
        let customer = await tx.customer.findUnique({ where: { phone: data.customerPhone } });
        if (!customer) {
          customer = await tx.customer.create({
            data: { 
              phone: data.customerPhone, 
              name,
              birthday: data.customerBirthday ? new Date(data.customerBirthday) : undefined,
              anniversary: data.customerAnniversary ? new Date(data.customerAnniversary) : undefined
            },
          });
        }
        customerId = customer.id;
      }

      // 2. Calculate totals and check stock
      let subtotal = 0;
      let totalGst = 0;
      let totalDiscount = 0;

      const invoiceItemsInput = [];

      for (const item of data.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error(`Product not found: ${item.productId}`);
        
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stock}`);
        }

        const lineTotalBeforeDiscount = product.price * item.quantity;
        const discountAmount = item.discount || 0;
        const lineTotalAfterDiscount = lineTotalBeforeDiscount - discountAmount;
        
        // GST is typically included in price or calculated on top. Assuming on top for now based on PRD generic description.
        const gstAmount = (lineTotalAfterDiscount * product.gst) / 100;
        const finalLineTotal = lineTotalAfterDiscount + gstAmount;

        subtotal += lineTotalBeforeDiscount;
        totalDiscount += discountAmount;
        totalGst += gstAmount;

        invoiceItemsInput.push({
          productId: product.id,
          quantity: item.quantity,
          price: product.price,
          gst: gstAmount,
          discount: discountAmount,
          total: finalLineTotal,
        });

        // Deduct Stock
        await tx.product.update({
          where: { id: product.id },
          data: { stock: product.stock - item.quantity },
        });

        // Record stock history
        await tx.stockHistory.create({
          data: {
            productId: product.id,
            changeType: "Sale",
            quantity: -item.quantity,
            reason: "Billing",
          }
        });
      }

      const finalDiscount = totalDiscount + (data.globalDiscount || 0);
      const grandTotal = subtotal - finalDiscount + totalGst + data.additionalCharges;

      // Complete advance order if fulfilling one
      if (data.advanceOrderId) {
        await tx.advanceOrder.update({
          where: { id: data.advanceOrderId },
          data: { status: "COMPLETED", remainingAmount: 0 }
        });
      }

      // 3. Create Invoice
      const invoiceNumber = `INV-${Date.now()}`; // Simple auto-generation
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          customerId,
          billingType: data.billingType,
          subtotal,
          discount: finalDiscount,
          gst: totalGst,
          additionalCharges: data.additionalCharges,
          grandTotal,
          paymentMethod: data.paymentMethod,
          status: "COMPLETED",
          notes: data.billNotes,
          items: {
            create: invoiceItemsInput
          }
        },
        include: { items: true, customer: true }
      });

      // 4. Update Customer Stats
      if (customerId) {
        const earnedPoints = Math.floor(grandTotal * 0.01);
        const customer = await tx.customer.findUnique({ where: { id: customerId } });
        
        const newTotalSpending = (customer?.totalSpending || 0) + grandTotal;
        const newTotalVisits = (customer?.totalVisits || 0) + 1;
        const newAverageBill = newTotalSpending / newTotalVisits;

        const settings = await tx.setting.findFirst({ where: { id: "1" } });
        let newVipLevel = customer?.vipLevel || "NONE";
        
        if (settings) {
          if (newTotalSpending >= settings.diamondSpending || newTotalVisits >= settings.diamondVisits) {
            newVipLevel = "DIAMOND";
          } else if (newTotalSpending >= settings.platinumSpending || newTotalVisits >= settings.platinumVisits) {
            newVipLevel = "PLATINUM";
          } else if (newTotalSpending >= settings.goldSpending || newTotalVisits >= settings.goldVisits) {
            newVipLevel = "GOLD";
          }
        }

        await tx.customer.update({
          where: { id: customerId },
          data: {
            totalSpending: newTotalSpending,
            totalVisits: newTotalVisits,
            averageBill: newAverageBill,
            vipLevel: newVipLevel,
            loyaltyPoints: { increment: earnedPoints }
          }
        });
        
        if (earnedPoints > 0) {
          await tx.loyaltyTransaction.create({
            data: {
              pointsEarned: earnedPoints,
              invoice: { connect: { id: invoice.id } },
              customer: { connect: { id: customerId } }
            }
          });
        }
        
        // Note: VIP recalculation and average bill can be done asynchronously or here.
        // Doing average bill update:
        const customerStats = await tx.customer.findUnique({ where: { id: customerId }, select: { totalSpending: true, totalVisits: true } });
        if (customerStats && customerStats.totalVisits > 0) {
           await tx.customer.update({
             where: { id: customerId },
             data: { averageBill: customerStats.totalSpending / customerStats.totalVisits }
           });
        }
      }

      return invoice;
    });
  }
}
