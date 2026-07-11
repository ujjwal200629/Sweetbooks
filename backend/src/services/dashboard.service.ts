import { prisma } from "../prisma/client";

export class DashboardService {
  async getStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    // Today's stats
    const todaysInvoices = await prisma.invoice.findMany({
      where: { createdAt: { gte: today } },
    });
    const todayRevenue = todaysInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const todayOrders = todaysInvoices.length;

    // Monthly stats & Peak/Least Busy Hour Calculation (Last 30 days for better data)
    const thirtyDaysAgo = new Date(today);
    thirtyDaysAgo.setDate(today.getDate() - 30);
    const monthlyInvoices = await prisma.invoice.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
    });
    
    // Revenue for the CURRENT month only (for the stat card)
    const currentMonthInvoices = monthlyInvoices.filter(inv => inv.createdAt >= firstDayOfMonth);
    const monthlyRevenue = currentMonthInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
    const monthlyOrders = currentMonthInvoices.length;

    // Peak and Least Busy Hour calculations
    const hourCounts: Record<number, number> = {};
    for (let i = 0; i < 24; i++) hourCounts[i] = 0;
    
    monthlyInvoices.forEach(inv => {
      const hour = new Date(inv.createdAt).getHours();
      hourCounts[hour]++;
    });

    let peakHour = 0;
    let leastBusyHour = 0;
    let maxOrders = -1;
    let minOrders = Infinity;

    // Only consider business hours (e.g. 8 AM to 10 PM)
    for (let i = 8; i <= 22; i++) {
      if (hourCounts[i] > maxOrders) {
        maxOrders = hourCounts[i];
        peakHour = i;
      }
      if (hourCounts[i] < minOrders) {
        minOrders = hourCounts[i];
        leastBusyHour = i;
      }
    }
    
    // If no orders yet
    if (minOrders === Infinity) leastBusyHour = 8;

    const formatHour = (h: number) => {
      const ampm = h >= 12 ? 'PM' : 'AM';
      const hr = h % 12 || 12;
      return `${hr} ${ampm}`;
    };

    const businessInsights = {
      peakHour: `${formatHour(peakHour)} - ${formatHour(peakHour + 1)}`,
      leastBusyHour: `${formatHour(leastBusyHour)} - ${formatHour(leastBusyHour + 1)}`
    };
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 6);
    const trendInvoices = await prisma.invoice.findMany({
      where: { createdAt: { gte: sevenDaysAgo } },
    });
    
    const trendData: Record<string, number> = {};
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgo);
      d.setDate(d.getDate() + i);
      trendData[d.toLocaleDateString('en-GB')] = 0; // 'DD/MM/YYYY'
    }

    trendInvoices.forEach(inv => {
      const dateStr = new Date(inv.createdAt).toLocaleDateString('en-GB');
      if (trendData[dateStr] !== undefined) {
        trendData[dateStr] += inv.grandTotal;
      }
    });

    const revenueTrend = Object.keys(trendData).map(date => ({
      date,
      revenue: trendData[date]
    }));

    // Top Selling Products
    const invoiceItems = await prisma.invoiceItem.findMany({
      include: { product: true }
    });

    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    
    invoiceItems.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = { name: item.product.name, quantity: 0, revenue: 0 };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.total;
    });

    const topProducts = Object.values(productSales)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // Low Stock Alerts
    const rawLowStockProducts = await prisma.product.findMany({
      where: { status: "ACTIVE" }
    });
    const lowStockAlerts = rawLowStockProducts.filter(p => p.stock <= p.minimumStock);

    // Pending Advance Orders
    const pendingAdvanceOrders = await prisma.advanceOrder.findMany({
      where: { status: "PENDING" },
      include: { customer: true },
      orderBy: { pickupDate: 'asc' },
      take: 5
    });

    // VIP Analytics
    const customers = await prisma.customer.findMany({ select: { vipLevel: true, totalSpending: true } });
    const vipStats = {
      DIAMOND: { count: 0, revenue: 0 },
      PLATINUM: { count: 0, revenue: 0 },
      GOLD: { count: 0, revenue: 0 },
      NONE: { count: 0, revenue: 0 },
    };
    customers.forEach(c => {
      const level = c.vipLevel || "NONE";
      if (vipStats[level as keyof typeof vipStats]) {
        vipStats[level as keyof typeof vipStats].count++;
        vipStats[level as keyof typeof vipStats].revenue += c.totalSpending;
      }
    });

    // VIP Visits Today
    const todayUniqueCustomers = new Set<string>();
    todaysInvoices.forEach(inv => {
      if (inv.customerId) todayUniqueCustomers.add(inv.customerId);
    });
    const todaysCustomers = await prisma.customer.findMany({
      where: { id: { in: Array.from(todayUniqueCustomers) } },
      select: { vipLevel: true }
    });
    
    const vipVisitsToday = {
      DIAMOND: 0,
      PLATINUM: 0,
      GOLD: 0,
    };
    todaysCustomers.forEach(c => {
      if (c.vipLevel === "DIAMOND") vipVisitsToday.DIAMOND++;
      if (c.vipLevel === "PLATINUM") vipVisitsToday.PLATINUM++;
      if (c.vipLevel === "GOLD") vipVisitsToday.GOLD++;
    });

    return {
      todayRevenue,
      todayOrders,
      monthlyRevenue,
      monthlyOrders,
      revenueTrend,
      topProducts,
      businessInsights,
      lowStockAlerts,
      pendingAdvanceOrders,
      vipStats,
      vipVisitsToday
    };
  }
}
