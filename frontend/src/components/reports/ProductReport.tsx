import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Package, AlertTriangle, XCircle, TrendingUp, TrendingDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function ProductReport({ dates }: { dates: any }) {
  const { data: reportResponse, isLoading } = useQuery({
    queryKey: ["productReport", dates],
    queryFn: () => api.get(`/reports/products?start=${dates.start.toISOString()}&end=${dates.end.toISOString()}`)
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading Product Report...</div>;
  if (!reportResponse?.data) return null;

  const data = reportResponse.data;

  // Format data for BarChart (top 15 products by revenue)
  const chartData = data.performance.slice(0, 15).map((p: any) => ({
    name: p.name,
    revenue: p.revenue
  }));

  return (
    <div className="space-y-6 pt-8 border-t break-inside-avoid">
      <div className="flex items-center gap-2 border-b pb-2">
        <Package className="w-6 h-6 text-amber-600"/>
        <h2 className="text-2xl font-bold text-slate-800">2. Product Report</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1"><Package className="w-4 h-4"/> Total Products</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.totalProducts}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1"><TrendingUp className="w-4 h-4 text-emerald-500"/> Products Sold</p>
            <h3 className="text-2xl font-bold text-slate-800">
              {data.performance.reduce((acc: number, p: any) => acc + p.sold, 0)}
            </h3>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-amber-700 font-medium flex items-center gap-1"><AlertTriangle className="w-4 h-4"/> Low Stock</p>
            <h3 className="text-2xl font-bold text-amber-900">{data.lowStockProducts}</h3>
          </CardContent>
        </Card>
        <Card className="bg-rose-50 border-rose-100">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-rose-700 font-medium flex items-center gap-1"><XCircle className="w-4 h-4"/> Out of Stock</p>
            <h3 className="text-2xl font-bold text-rose-900">{data.outOfStockProducts}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Product Revenue Comparison</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ left: 50 }}>
                <XAxis type="number" fontSize={12} tickFormatter={(val) => `₹${val}`} />
                <YAxis dataKey="name" type="category" fontSize={12} width={100} />
                <Tooltip formatter={(val) => `₹${val}`} />
                <Bar dataKey="revenue" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
             <div className="h-full flex items-center justify-center text-slate-400">No data for selected period</div>
          )}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="bg-emerald-50 border-b border-emerald-100 py-3">
            <CardTitle className="text-sm flex items-center gap-2 text-emerald-800"><TrendingUp className="w-4 h-4"/> Top Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topSelling.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-4">No data</TableCell></TableRow>}
                {data.topSelling.map((p: any, i: number) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold text-slate-400">#{i + 1}</TableCell>
                    <TableCell className="font-bold">{p.name}</TableCell>
                    <TableCell>{p.sold}</TableCell>
                    <TableCell className="text-right font-medium text-emerald-700">₹{p.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="bg-rose-50 border-b border-rose-100 py-3">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-800"><TrendingDown className="w-4 h-4"/> Least Selling Products</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Sold</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.leastSelling.length === 0 && <TableRow><TableCell colSpan={4} className="text-center text-slate-400 py-4">No data</TableCell></TableRow>}
                {data.leastSelling.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold">{p.name}</TableCell>
                    <TableCell>{p.sold}</TableCell>
                    <TableCell>{p.stock}</TableCell>
                    <TableCell className="text-right">
                      {p.stock <= 0 ? <Badge variant="destructive">Out of Stock</Badge> : <Badge variant="outline">Slow Moving</Badge>}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

    </div>
  );
}
