import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Landmark, FileSpreadsheet } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default function GstReport({ dates }: { dates: any }) {
  const { data: reportResponse, isLoading } = useQuery({
    queryKey: ["gstReport", dates],
    queryFn: () => api.get(`/reports/gst?start=${dates.start.toISOString()}&end=${dates.end.toISOString()}`)
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading GST Report...</div>;
  if (!reportResponse?.data) return null;

  const data = reportResponse.data;

  return (
    <div className="space-y-6 pt-8 border-t break-inside-avoid">
      <div className="flex items-center gap-2 border-b pb-2">
        <Landmark className="w-6 h-6 text-slate-800"/>
        <h2 className="text-2xl font-bold text-slate-800">7. GST Report</h2>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="bg-slate-800 text-white">
          <CardContent className="p-6 flex flex-col justify-center">
            <p className="text-slate-300 font-medium">Total GST Collected</p>
            <h3 className="text-4xl font-bold mt-2">₹{data.totalGst.toLocaleString()}</h3>
          </CardContent>
        </Card>
        
        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium">CGST</p>
            <h3 className="text-3xl font-bold text-slate-800">₹{data.cgst.toLocaleString()}</h3>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardContent className="p-6 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium">SGST</p>
            <h3 className="text-3xl font-bold text-slate-800">₹{data.sgst.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2"><FileSpreadsheet className="w-5 h-5"/> Invoice-wise Tax Summary</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
                <TableHead className="text-right">GST</TableHead>
                <TableHead className="text-right">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.invoiceWiseGst.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-4">No data</TableCell></TableRow>}
              {data.invoiceWiseGst.map((inv: any) => (
                <TableRow key={inv.invoiceNumber}>
                  <TableCell className="font-bold text-blue-600">{inv.invoiceNumber}</TableCell>
                  <TableCell className="text-slate-500">{new Date(inv.date).toLocaleString()}</TableCell>
                  <TableCell className="text-right font-medium">₹{inv.subtotal.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold text-rose-600">₹{inv.gst.toLocaleString()}</TableCell>
                  <TableCell className="text-right font-bold">₹{inv.total.toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
