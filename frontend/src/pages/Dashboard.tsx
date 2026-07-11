import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { 
  IndianRupee, 
  ShoppingCart, 
  TrendingUp,
  Package,
  Clock,
  Crown,
  Star,
  Gift,
  AlertTriangle
} from "lucide-react";
import { motion } from "framer-motion";
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: any = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: () => api.get("/dashboard/stats"),
  });

  const stats = data?.data || {
    todayRevenue: 0,
    todayOrders: 0,
    monthlyRevenue: 0,
    monthlyOrders: 0,
    revenueTrend: [],
    topProducts: [],
    businessInsights: { peakHour: "N/A", leastBusyHour: "N/A" },
    lowStockAlerts: [],
    pendingAdvanceOrders: [],
    vipStats: { DIAMOND: { count: 0, revenue: 0 }, PLATINUM: { count: 0, revenue: 0 }, GOLD: { count: 0, revenue: 0 }, NONE: { count: 0, revenue: 0 } },
    vipVisitsToday: { DIAMOND: 0, PLATINUM: 0, GOLD: 0 }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-primary animate-pulse font-bold tracking-widest uppercase">Loading Dashboard...</div>
      </div>
    );
  }

  return (
    <motion.div 
      className="space-y-8 pb-8"
      variants={containerVariants}
      initial="hidden"
      animate="show"
    >
      <motion.div variants={itemVariants} className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Business Overview</h1>
          <p className="text-muted-foreground font-medium">Real-time performance metrics for your sweet boutique.</p>
        </div>
      </motion.div>

      {/* Primary KPIs */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-emerald-500/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Today's Revenue</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-emerald-700">₹{stats.todayRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Total collected today</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-blue-500/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Today's Orders</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-blue-700">{stats.todayOrders}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Invoices generated today</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-accent/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-accent/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Monthly Revenue</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-amber-700">₹{stats.monthlyRevenue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Revenue for current month</p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-md border border-white/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:-translate-y-1 transition-transform duration-300 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-purple-500/20"></div>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0 relative z-10">
            <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Monthly Orders</CardTitle>
            <div className="w-8 h-8 rounded-lg bg-purple-100 flex items-center justify-center text-purple-600">
              <Package className="w-4 h-4" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-black text-purple-700">{stats.monthlyOrders}</div>
            <p className="text-xs text-muted-foreground font-medium mt-1">Invoices generated this month</p>
          </CardContent>
        </Card>
      </motion.div>

      {/* VIP Overview Row */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-4">
        <Card className="col-span-4 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-xl rounded-2xl overflow-hidden relative">
          <div className="absolute right-0 bottom-0 opacity-5 pointer-events-none">
            <Crown className="w-64 h-64 -mb-16 -mr-16" />
          </div>
          <CardHeader className="pb-4 border-b border-white/10 relative z-10">
            <CardTitle className="text-xl flex items-center justify-between">
              <span className="flex items-center gap-3 font-bold tracking-tight"><Crown className="w-6 h-6 text-accent"/> VIP Analytics</span>
              <div className="flex gap-4 text-sm font-medium">
                <span className="flex items-center gap-1 text-slate-400">Visited Today:</span>
                {stats.vipVisitsToday?.DIAMOND > 0 && <span className="bg-gradient-to-r from-purple-600 to-purple-400 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">👑 {stats.vipVisitsToday.DIAMOND} Diamond</span>}
                {stats.vipVisitsToday?.PLATINUM > 0 && <span className="bg-gradient-to-r from-blue-600 to-blue-400 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">💎 {stats.vipVisitsToday.PLATINUM} Platinum</span>}
                {stats.vipVisitsToday?.GOLD > 0 && <span className="bg-gradient-to-r from-amber-500 to-amber-300 text-white px-2 py-0.5 rounded-md text-xs font-bold shadow-sm">⭐ {stats.vipVisitsToday.GOLD} Gold</span>}
                {(!stats.vipVisitsToday?.DIAMOND && !stats.vipVisitsToday?.PLATINUM && !stats.vipVisitsToday?.GOLD) && <span className="text-slate-500 italic">No VIPs yet today</span>}
              </div>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <p className="text-purple-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">👑 Diamond</p>
                <div className="text-4xl font-black text-white leading-none">{stats.vipStats?.DIAMOND?.count || 0}</div>
                <div className="text-slate-400 font-medium mt-3 text-xs">Total Customers</div>
                <div className="text-primary font-bold mt-1 text-lg">₹{(stats.vipStats?.DIAMOND?.revenue || 0).toFixed(0)} <span className="text-slate-400 font-medium text-xs">Revenue</span></div>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">💎 Platinum</p>
                <div className="text-4xl font-black text-white leading-none">{stats.vipStats?.PLATINUM?.count || 0}</div>
                <div className="text-slate-400 font-medium mt-3 text-xs">Total Customers</div>
                <div className="text-primary font-bold mt-1 text-lg">₹{(stats.vipStats?.PLATINUM?.revenue || 0).toFixed(0)} <span className="text-slate-400 font-medium text-xs">Revenue</span></div>
              </div>
              <div className="bg-white/5 p-5 rounded-2xl border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                <p className="text-amber-300 text-xs font-bold uppercase tracking-widest mb-3 flex items-center gap-2">⭐ Gold</p>
                <div className="text-4xl font-black text-white leading-none">{stats.vipStats?.GOLD?.count || 0}</div>
                <div className="text-slate-400 font-medium mt-3 text-xs">Total Customers</div>
                <div className="text-primary font-bold mt-1 text-lg">₹{(stats.vipStats?.GOLD?.revenue || 0).toFixed(0)} <span className="text-slate-400 font-medium text-xs">Revenue</span></div>
              </div>
              <div className="bg-black/20 p-5 rounded-2xl border border-black/50 backdrop-blur-sm">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-3">Regular</p>
                <div className="text-4xl font-black text-white leading-none">{stats.vipStats?.NONE?.count || 0}</div>
                <div className="text-slate-400 font-medium mt-3 text-xs">Total Customers</div>
                <div className="text-primary font-bold mt-1 text-lg">₹{(stats.vipStats?.NONE?.revenue || 0).toFixed(0)} <span className="text-slate-400 font-medium text-xs">Revenue</span></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Business Insights Row */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        
        {/* Insights */}
        <Card className="col-span-1 lg:col-span-2 bg-white/80 backdrop-blur-md border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 font-bold">
              <Star className="w-5 h-5 text-accent fill-accent/20" /> Business Insights
            </CardTitle>
            <CardDescription className="font-medium">AI-driven analysis of your peak operational hours.</CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 relative overflow-hidden">
                <div className="absolute right-[-10px] bottom-[-10px] opacity-10"><Clock className="w-16 h-16 text-primary" /></div>
                <p className="text-xs text-primary font-bold uppercase tracking-wider mb-2">🔥 Peak Hour</p>
                <p className="text-3xl font-black text-primary">{stats.businessInsights.peakHour}</p>
              </div>
              <div className="bg-slate-50 p-4 rounded-xl border border-border relative overflow-hidden">
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">💤 Least Busy</p>
                <p className="text-3xl font-black text-foreground">{stats.businessInsights.leastBusyHour}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Advance Orders */}
        <Card className="col-span-1 border-accent/20 bg-accent/5 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-amber-800 font-bold">
              <Gift className="w-5 h-5" /> Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
              {stats.pendingAdvanceOrders.length === 0 ? (
                <div className="text-center text-muted-foreground font-medium py-6 text-sm">
                  No advance orders pending.
                </div>
              ) : (
                stats.pendingAdvanceOrders.map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-accent/20 shadow-sm">
                    <div>
                      <span className="font-bold text-sm text-foreground">{order.customer?.name || order.customer?.phone}</span>
                      <p className="text-xs text-muted-foreground font-medium">{new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}</p>
                    </div>
                    <div className="w-2 h-2 rounded-full bg-accent animate-pulse"></div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Low Stock */}
        <Card className="col-span-1 border-rose-200 bg-rose-50/50 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center gap-2 text-rose-800 font-bold">
              <AlertTriangle className="w-5 h-5" /> Low Stock
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="space-y-3 max-h-[140px] overflow-y-auto pr-2 custom-scrollbar">
              {stats.lowStockAlerts.length === 0 ? (
                <div className="text-center text-emerald-600 font-bold py-6 text-sm">
                  Inventory looks great! ✨
                </div>
              ) : (
                stats.lowStockAlerts.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-rose-100 shadow-sm">
                    <span className="font-bold text-sm text-foreground">{item.name}</span>
                    <span className="text-xs font-bold text-rose-600 bg-rose-100 px-2 py-1 rounded-md">{item.stock} {item.unit}</span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Charts & Tables */}
      <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl overflow-hidden border-border">
          <CardHeader>
            <CardTitle className="font-bold text-lg">Revenue Trend</CardTitle>
            <CardDescription className="font-medium">Performance over the last 7 days.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0 h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={stats.revenueTrend} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE4D8" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#1F2937', fontWeight: 500 }} />
                <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} tick={{ fontSize: 12, fill: '#1F2937', fontWeight: 500 }} />
                <Tooltip 
                  formatter={(value) => [`₹${value}`, "Revenue"]}
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white/80 backdrop-blur-md shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl border-border">
          <CardHeader>
            <CardTitle className="font-bold text-lg">Top Selling Products</CardTitle>
            <CardDescription className="font-medium">Customer favorites this period.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.topProducts.length === 0 ? (
                <div className="text-center text-muted-foreground py-8 font-medium">
                  <Package className="mx-auto h-8 w-8 opacity-20 mb-3" />
                  <p>No sales data available yet.</p>
                </div>
              ) : (
                stats.topProducts.map((product: any, index: number) => (
                  <div key={index} className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors group">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary font-bold mr-4 group-hover:scale-110 transition-transform shadow-sm">
                      #{index + 1}
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm font-bold leading-none text-foreground">{product.name}</p>
                      <p className="text-xs text-muted-foreground font-medium">
                        {product.quantity} units sold
                      </p>
                    </div>
                    <div className="font-black text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg shadow-sm">
                      ₹{product.revenue.toFixed(0)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
