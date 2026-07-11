import { prisma } from "../prisma/client";

export class ReportService {
  
  // Helper to fetch invoices within a date range
  private async getInvoicesInRange(startDate: Date, endDate: Date) {
    return await prisma.invoice.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate,
        },
        status: "COMPLETED",
      },
      include: { items: { include: { product: true } }, customer: true }
    });
  }

  // 1. Sales Report
  async getSalesReport(startDate: Date, endDate: Date, prevStartDate?: Date, prevEndDate?: Date) {
    const currentInvoices = await this.getInvoicesInRange(startDate, endDate);
    const previousInvoices = prevStartDate && prevEndDate ? await this.getInvoicesInRange(prevStartDate, prevEndDate) : [];

    const calculateSalesMetrics = (invoices: any[]) => {
      let totalRevenue = 0;
      let totalDiscount = 0;
      let totalProductsSold = 0;
      const paymentDistribution: Record<string, number> = {};
      const hourCounts: Record<string, number> = {};
      const hourRevenue: Record<string, number> = {};
      const dayRevenue: Record<string, number> = {};

      invoices.forEach(inv => {
        totalRevenue += inv.grandTotal;
        totalDiscount += inv.discount;
        inv.items.forEach((item: any) => totalProductsSold += item.quantity);
        
        // Payment dist
        paymentDistribution[inv.paymentMethod] = (paymentDistribution[inv.paymentMethod] || 0) + inv.grandTotal;

        // Date metrics for charts/best selling
        const date = new Date(inv.createdAt);
        const hour = date.getHours();
        const day = date.getDay(); // 0 = Sunday, 1 = Monday...
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        const dayName = dayNames[day];

        hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        hourRevenue[hour] = (hourRevenue[hour] || 0) + inv.grandTotal;
        dayRevenue[dayName] = (dayRevenue[dayName] || 0) + inv.grandTotal;
      });

      // Find Peak and Least Busy Hour
      let peakHour = "N/A"; let leastHour = "N/A"; let bestSellingHour = "N/A"; let bestSellingDay = "N/A";
      let maxCount = -1; let minCount = Infinity; let maxHourRev = -1; let maxDayRev = -1;

      Object.entries(hourCounts).forEach(([hour, count]) => {
        if (count > maxCount) { maxCount = count; peakHour = `${hour}:00 - ${Number(hour)+1}:00`; }
        if (count < minCount) { minCount = count; leastHour = `${hour}:00 - ${Number(hour)+1}:00`; }
      });

      Object.entries(hourRevenue).forEach(([hour, rev]) => {
        if (rev > maxHourRev) { maxHourRev = rev; bestSellingHour = `${hour}:00 - ${Number(hour)+1}:00`; }
      });

      Object.entries(dayRevenue).forEach(([day, rev]) => {
        if (rev > maxDayRev) { maxDayRev = rev; bestSellingDay = day; }
      });

      // Daily Revenue Chart Data (Group by Day)
      const dailyChartData: Record<string, number> = {};
      invoices.forEach(inv => {
        const dString = new Date(inv.createdAt).toLocaleDateString();
        dailyChartData[dString] = (dailyChartData[dString] || 0) + inv.grandTotal;
      });

      const chartData = Object.entries(dailyChartData).map(([date, revenue]) => ({ date, revenue })).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      const pieChartData = Object.entries(paymentDistribution).map(([name, value]) => ({ name, value }));

      return {
        totalRevenue,
        totalBills: invoices.length,
        averageBill: invoices.length ? totalRevenue / invoices.length : 0,
        totalProductsSold,
        totalDiscount,
        peakBusinessHour: peakHour,
        leastBusyHour: minCount === Infinity ? "N/A" : leastHour,
        bestSellingTime: bestSellingHour,
        bestSellingDay: maxDayRev === -1 ? "N/A" : bestSellingDay,
        chartData,
        pieChartData
      };
    };

    const current = calculateSalesMetrics(currentInvoices);
    const previous = calculateSalesMetrics(previousInvoices);

    const revenueGrowth = previous.totalRevenue ? ((current.totalRevenue - previous.totalRevenue) / previous.totalRevenue) * 100 : 0;

    return {
      current,
      previous,
      revenueGrowth
    };
  }

  // 2. Product Report
  async getProductReport(startDate: Date, endDate: Date) {
    const invoices = await this.getInvoicesInRange(startDate, endDate);
    const allProducts = await prisma.product.findMany();

    const productStats: Record<string, { id: string, name: string, sold: number, revenue: number, stock: number, status: string }> = {};

    allProducts.forEach(p => {
      productStats[p.id] = { id: p.id, name: p.name, sold: 0, revenue: 0, stock: p.stock, status: p.status };
    });

    invoices.forEach(inv => {
      inv.items.forEach((item: any) => {
        if (productStats[item.productId]) {
          productStats[item.productId].sold += item.quantity;
          productStats[item.productId].revenue += item.total;
        }
      });
    });

    const performance = Object.values(productStats).sort((a, b) => b.revenue - a.revenue);
    
    return {
      totalProducts: allProducts.length,
      lowStockProducts: allProducts.filter(p => p.stock > 0 && p.stock <= p.minimumStock).length,
      outOfStockProducts: allProducts.filter(p => p.stock <= 0).length,
      performance,
      // For Top Selling Table
      topSelling: performance.slice(0, 10),
      leastSelling: [...performance].sort((a, b) => a.sold - b.sold).slice(0, 10),
    };
  }

  // 3. Customer Report
  async getCustomerReport(startDate: Date, endDate: Date) {
    const invoices = await this.getInvoicesInRange(startDate, endDate);
    
    const newCustomers = await prisma.customer.count({
      where: {
        createdAt: { gte: startDate, lte: endDate }
      }
    });

    const totalCustomers = await prisma.customer.count();
    const vipCustomers = await prisma.customer.count({
      where: { vipLevel: { not: "NONE" } }
    });

    const customerStats: Record<string, { id: string, name: string, phone: string, visits: number, spending: number, vipLevel: string }> = {};

    invoices.forEach(inv => {
      if (inv.customerId && inv.customer) {
        if (!customerStats[inv.customerId]) {
          customerStats[inv.customerId] = {
            id: inv.customerId, name: inv.customer.name, phone: inv.customer.phone, visits: 0, spending: 0, vipLevel: inv.customer.vipLevel
          };
        }
        customerStats[inv.customerId].visits += 1;
        customerStats[inv.customerId].spending += inv.grandTotal;
      }
    });

    const topCustomers = Object.values(customerStats).sort((a, b) => b.spending - a.spending).slice(0, 20);

    // Birthdays and Anniversaries
    const currentMonth = new Date().getMonth() + 1; // 1-12
    
    // In PostgreSQL/Prisma, filtering by birth month without raw query is tricky. Let's just fetch those that have birthdays and filter in memory since dataset isn't huge.
    const allCusts = await prisma.customer.findMany({
      where: { OR: [{ birthday: { not: null } }, { anniversary: { not: null } }] }
    });

    const upcomingBirthdays = allCusts.filter(c => c.birthday && c.birthday.getMonth() + 1 === currentMonth);
    const upcomingAnniversaries = allCusts.filter(c => c.anniversary && c.anniversary.getMonth() + 1 === currentMonth);

    return {
      totalCustomers,
      newCustomers,
      returningCustomers: Object.keys(customerStats).length - newCustomers, // Approx
      vipCustomers,
      topCustomers,
      upcomingBirthdays,
      upcomingAnniversaries
    };
  }

  // 4. VIP & Loyalty Report
  async getVipReport(startDate: Date, endDate: Date) {
    const invoices = await this.getInvoicesInRange(startDate, endDate);
    const allCustomers = await prisma.customer.findMany({ select: { vipLevel: true, loyaltyPoints: true, name: true, phone: true } });

    const distribution = { DIAMOND: 0, PLATINUM: 0, GOLD: 0, NONE: 0 };
    allCustomers.forEach(c => {
      distribution[c.vipLevel as keyof typeof distribution] = (distribution[c.vipLevel as keyof typeof distribution] || 0) + 1;
    });

    const revenueByVip = { DIAMOND: 0, PLATINUM: 0, GOLD: 0, NONE: 0 };
    invoices.forEach(inv => {
      const level = inv.customer?.vipLevel || "NONE";
      revenueByVip[level as keyof typeof revenueByVip] = (revenueByVip[level as keyof typeof revenueByVip] || 0) + inv.grandTotal;
    });

    const loyaltyTx = await prisma.loyaltyTransaction.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } }
    });

    let pointsEarned = 0; let pointsRedeemed = 0;
    loyaltyTx.forEach(tx => {
      pointsEarned += tx.pointsEarned;
      pointsRedeemed += tx.pointsRedeemed;
    });

    let outstandingPoints = 0;
    allCustomers.forEach(c => outstandingPoints += c.loyaltyPoints);

    const topPointHolders = [...allCustomers].sort((a, b) => b.loyaltyPoints - a.loyaltyPoints).slice(0, 10);

    return {
      distribution,
      revenueByVip,
      loyalty: {
        pointsEarned,
        pointsRedeemed,
        outstandingPoints,
        topPointHolders
      }
    };
  }

  // 5. Inventory Report
  async getInventoryReport(startDate: Date, endDate: Date) {
    const allProducts = await prisma.product.findMany();
    const stockHistory = await prisma.stockHistory.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } },
      include: { product: true }
    });

    const movement: Record<string, { product: string, added: number, sold: number, waste: number }> = {};
    allProducts.forEach(p => {
      movement[p.id] = { product: p.name, added: 0, sold: 0, waste: 0 };
    });

    stockHistory.forEach(history => {
      if (!movement[history.productId]) return;
      if (history.changeType === "Sale") movement[history.productId].sold += Math.abs(history.quantity);
      if (history.changeType === "Restock") movement[history.productId].added += history.quantity;
      if (history.changeType === "Waste") movement[history.productId].waste += Math.abs(history.quantity);
    });

    return {
      currentStock: allProducts,
      movement: Object.values(movement)
    };
  }

  // 6. Payment Report
  async getPaymentReport(startDate: Date, endDate: Date) {
    const invoices = await this.getInvoicesInRange(startDate, endDate);
    const advanceOrders = await prisma.advanceOrder.findMany({
      where: { createdAt: { gte: startDate, lte: endDate } }
    });

    let totalAdvanceReceived = 0;
    advanceOrders.forEach(o => totalAdvanceReceived += o.advancePaid);

    const revenueByMethod: Record<string, number> = {};
    const chartDataMap: Record<string, any> = {};

    invoices.forEach(inv => {
      revenueByMethod[inv.paymentMethod] = (revenueByMethod[inv.paymentMethod] || 0) + inv.grandTotal;
      
      const dString = new Date(inv.createdAt).toLocaleDateString();
      if (!chartDataMap[dString]) chartDataMap[dString] = { date: dString, CASH: 0, UPI: 0, CARD: 0 };
      
      if (["CASH", "UPI", "CARD"].includes(inv.paymentMethod)) {
        chartDataMap[dString][inv.paymentMethod] += inv.grandTotal;
      }
    });

    const chartData = Object.values(chartDataMap).sort((a: any,b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      revenueByMethod,
      chartData,
      advancePayments: {
        totalReceived: totalAdvanceReceived,
        ordersCount: advanceOrders.length
      }
    };
  }

  // 7. GST Report
  async getGstReport(startDate: Date, endDate: Date) {
    const invoices = await this.getInvoicesInRange(startDate, endDate);
    
    let totalGst = 0;
    invoices.forEach(inv => totalGst += inv.gst);

    const cgst = totalGst / 2;
    const sgst = totalGst / 2;

    const invoiceWiseGst = invoices.map(inv => ({
      invoiceNumber: inv.invoiceNumber,
      date: inv.createdAt,
      subtotal: inv.subtotal,
      gst: inv.gst,
      total: inv.grandTotal
    })).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return {
      totalGst,
      cgst,
      sgst,
      invoiceWiseGst
    };
  }
}
