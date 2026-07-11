import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Boxes, Archive } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export default function InventoryReport({ dates }: { dates: any }) {
  const { data: reportResponse, isLoading } = useQuery({
    queryKey: ["inventoryReport", dates],
    queryFn: () => api.get(`/reports/inventory?start=${dates.start.toISOString()}&end=${dates.end.toISOString()}`)
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading Inventory Report...</div>;
  if (!reportResponse?.data) return null;

  const data = reportResponse.data;
  
  const lowStock = data.currentStock.filter((p: any) => p.stock > 0 && p.stock <= p.minimumStock);
  const outOfStock = data.currentStock.filter((p: any) => p.stock <= 0);

  return (
    <div className="space-y-6 pt-8 border-t break-inside-avoid">
      <div className="flex items-center gap-2 border-b pb-2">
        <Boxes className="w-6 h-6 text-teal-600"/>
        <h2 className="text-2xl font-bold text-slate-800">5. Inventory Report</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm border-amber-100">
          <CardHeader className="bg-amber-50 border-b border-amber-100 py-3">
            <CardTitle className="text-sm flex items-center gap-2 text-amber-800">Low Stock Alerts</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Min Threshold</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStock.length === 0 && <TableRow><TableCell colSpan={3} className="text-center text-slate-400 py-4">No low stock items</TableCell></TableRow>}
                {lowStock.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold">{p.name}</TableCell>
                    <TableCell className="text-right font-bold text-amber-600">{p.stock}</TableCell>
                    <TableCell className="text-right text-slate-500">{p.minimumStock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-rose-100">
          <CardHeader className="bg-rose-50 border-b border-rose-100 py-3">
            <CardTitle className="text-sm flex items-center gap-2 text-rose-800">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {outOfStock.length === 0 && <TableRow><TableCell colSpan={2} className="text-center text-slate-400 py-4">All products in stock</TableCell></TableRow>}
                {outOfStock.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-bold">{p.name}</TableCell>
                    <TableCell className="text-right"><Badge variant="destructive">0 in stock</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><Archive className="w-5 h-5"/> Stock Movement</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Added (Restock)</TableHead>
                <TableHead className="text-right">Sold</TableHead>
                <TableHead className="text-right">Waste</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.movement.map((m: any) => (
                <TableRow key={m.product}>
                  <TableCell className="font-bold">{m.product}</TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">+{m.added}</TableCell>
                  <TableCell className="text-right font-medium text-blue-600">-{m.sold}</TableCell>
                  <TableCell className="text-right font-medium text-rose-600">-{m.waste}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
