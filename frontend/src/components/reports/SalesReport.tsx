import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, IndianRupee, Receipt, ShoppingBag, Percent, Clock } from "lucide-react";

export default function SalesReport({ dates }: { dates: any }) {
  const { data: reportResponse, isLoading } = useQuery({
    queryKey: ["salesReport", dates],
    queryFn: () => api.get(`/reports/sales?start=${dates.start.toISOString()}&end=${dates.end.toISOString()}&prevStart=${dates.prevStart.toISOString()}&prevEnd=${dates.prevEnd.toISOString()}`)
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading Sales Report...</div>;
  if (!reportResponse?.data) return null;

  const { current, revenueGrowth } = reportResponse.data;
  const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6'];

  return (
    <div className="space-y-6 break-inside-avoid">
      <div className="flex items-center gap-2 border-b pb-2">
        <TrendingUp className="w-6 h-6 text-blue-600"/>
        <h2 className="text-2xl font-bold text-slate-800">1. Sales Report</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="bg-blue-50/50 border-blue-100">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1"><IndianRupee className="w-4 h-4"/> Revenue</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{current.totalRevenue.toLocaleString()}</h3>
            <div className="mt-2 flex items-center text-xs font-medium">
              {revenueGrowth > 0 ? (
                <span className="text-emerald-600 flex items-center"><ArrowUpRight className="w-3 h-3"/> {revenueGrowth.toFixed(1)}%</span>
              ) : revenueGrowth < 0 ? (
                <span className="text-rose-600 flex items-center"><ArrowDownRight className="w-3 h-3"/> {Math.abs(revenueGrowth).toFixed(1)}%</span>
              ) : (
                <span className="text-slate-400">0.0%</span>
              )}
              <span className="text-slate-400 ml-1">vs prev</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1"><Receipt className="w-4 h-4"/> Bills</p>
            <h3 className="text-2xl font-bold text-slate-800">{current.totalBills}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1"><IndianRupee className="w-4 h-4 text-emerald-500"/> Avg Bill</p>
            <h3 className="text-2xl font-bold text-slate-800">₹{Math.round(current.averageBill).toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1"><ShoppingBag className="w-4 h-4"/> Products Sold</p>
            <h3 className="text-2xl font-bold text-slate-800">{current.totalProductsSold}</h3>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1"><Percent className="w-4 h-4 text-rose-500"/> Discounts</p>
            <h3 className="text-2xl font-bold text-slate-800 text-rose-600">₹{current.totalDiscount.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Revenue Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-[300px]">
            {current.chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={current.chartData}>
                  <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value}`} />
                  <RechartsTooltip formatter={(value) => `₹${value}`} />
                  <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400">No data for selected period</div>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Sales Analytics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 font-medium"><Clock className="w-4 h-4"/> Peak Hour</div>
              <div className="font-bold">{current.peakBusinessHour}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
              <div className="flex items-center gap-2 text-slate-600 font-medium"><Clock className="w-4 h-4 text-slate-400"/> Least Busy</div>
              <div className="font-bold text-slate-500">{current.leastBusyHour}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-100">
              <div className="flex items-center gap-2 font-medium">Best Selling Time</div>
              <div className="font-bold">{current.bestSellingTime}</div>
            </div>
            <div className="flex items-center justify-between p-3 bg-amber-50 text-amber-800 rounded-lg border border-amber-100">
              <div className="flex items-center gap-2 font-medium">Best Selling Day</div>
              <div className="font-bold">{current.bestSellingDay}</div>
            </div>

            <div className="pt-4 border-t">
              <h4 className="text-sm font-bold text-slate-500 mb-2">Payment Distribution</h4>
              <div className="h-[120px]">
                {current.pieChartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={current.pieChartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={30} outerRadius={50}>
                        {current.pieChartData.map((_: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(val) => `₹${val}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-400 text-xs">No Data</div>
                )}
              </div>
              <div className="flex justify-center gap-4 text-xs font-medium text-slate-500">
                {current.pieChartData.map((d: any, i: number) => (
                  <div key={d.name} className="flex items-center gap-1"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></div>{d.name}</div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
