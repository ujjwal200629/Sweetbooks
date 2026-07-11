import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CreditCard, Banknote, Smartphone, HandCoins } from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function PaymentReport({ dates }: { dates: any }) {
  const { data: reportResponse, isLoading } = useQuery({
    queryKey: ["paymentReport", dates],
    queryFn: () => api.get(`/reports/payments?start=${dates.start.toISOString()}&end=${dates.end.toISOString()}`)
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading Payment Report...</div>;
  if (!reportResponse?.data) return null;

  const data = reportResponse.data;

  return (
    <div className="space-y-6 pt-8 border-t break-inside-avoid">
      <div className="flex items-center gap-2 border-b pb-2">
        <CreditCard className="w-6 h-6 text-slate-700"/>
        <h2 className="text-2xl font-bold text-slate-800">6. Payment Report</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-emerald-700 font-medium flex items-center gap-1"><Banknote className="w-4 h-4"/> Cash Revenue</p>
            <h3 className="text-2xl font-bold text-emerald-900">₹{(data.revenueByMethod.CASH || 0).toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-blue-700 font-medium flex items-center gap-1"><Smartphone className="w-4 h-4"/> UPI Revenue</p>
            <h3 className="text-2xl font-bold text-blue-900">₹{(data.revenueByMethod.UPI || 0).toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-purple-700 font-medium flex items-center gap-1"><CreditCard className="w-4 h-4"/> Card Revenue</p>
            <h3 className="text-2xl font-bold text-purple-900">₹{(data.revenueByMethod.CARD || 0).toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-amber-700 font-medium flex items-center gap-1"><HandCoins className="w-4 h-4"/> Advance Received</p>
            <h3 className="text-2xl font-bold text-amber-900">₹{data.advancePayments.totalReceived.toLocaleString()}</h3>
            <p className="text-xs text-amber-600 mt-1">{data.advancePayments.ordersCount} orders</p>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Payment Trends</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {data.chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.chartData}>
                <XAxis dataKey="date" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => `₹${val}`} />
                <Tooltip formatter={(val) => `₹${val}`} />
                <Area type="monotone" dataKey="CASH" stackId="1" stroke="#10b981" fill="#10b981" />
                <Area type="monotone" dataKey="UPI" stackId="1" stroke="#3b82f6" fill="#3b82f6" />
                <Area type="monotone" dataKey="CARD" stackId="1" stroke="#8b5cf6" fill="#8b5cf6" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-slate-400">No data for selected period</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
