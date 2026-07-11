import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, UserPlus, UserCheck, Crown, Gift, Heart } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VIPBadge } from "../VIPBadge";

export default function CustomerReport({ dates }: { dates: any }) {
  const { data: reportResponse, isLoading } = useQuery({
    queryKey: ["customerReport", dates],
    queryFn: () => api.get(`/reports/customers?start=${dates.start.toISOString()}&end=${dates.end.toISOString()}`)
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading Customer Report...</div>;
  if (!reportResponse?.data) return null;

  const data = reportResponse.data;

  return (
    <div className="space-y-6 pt-8 border-t break-inside-avoid">
      <div className="flex items-center gap-2 border-b pb-2">
        <Users className="w-6 h-6 text-indigo-600"/>
        <h2 className="text-2xl font-bold text-slate-800">3. Customer Report</h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1"><Users className="w-4 h-4"/> Total Customers</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.totalCustomers}</h3>
          </CardContent>
        </Card>
        <Card className="bg-indigo-50 border-indigo-100">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-indigo-700 font-medium flex items-center gap-1"><UserPlus className="w-4 h-4"/> New Customers</p>
            <h3 className="text-2xl font-bold text-indigo-900">{data.newCustomers}</h3>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-slate-500 font-medium flex items-center gap-1"><UserCheck className="w-4 h-4 text-emerald-500"/> Returning</p>
            <h3 className="text-2xl font-bold text-slate-800">{data.returningCustomers}</h3>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4 flex flex-col justify-center">
            <p className="text-sm text-purple-700 font-medium flex items-center gap-1"><Crown className="w-4 h-4"/> VIP Customers</p>
            <h3 className="text-2xl font-bold text-purple-900">{data.vipCustomers}</h3>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Highest Spending Customers (Top 20)</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead className="text-right">Spending</TableHead>
                  <TableHead className="text-right">VIP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.topCustomers.length === 0 && <TableRow><TableCell colSpan={5} className="text-center text-slate-400 py-4">No data</TableCell></TableRow>}
                {data.topCustomers.map((c: any) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-bold">{c.name}</TableCell>
                    <TableCell className="text-slate-500">{c.phone}</TableCell>
                    <TableCell>{c.visits}</TableCell>
                    <TableCell className="text-right font-medium">₹{c.spending.toLocaleString()}</TableCell>
                    <TableCell className="text-right"><div className="flex justify-end"><VIPBadge level={c.vipLevel} showLabel={false} /></div></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card className="shadow-sm border-rose-100">
            <CardHeader className="bg-rose-50 border-b border-rose-100 py-3">
              <CardTitle className="text-sm flex items-center gap-2 text-rose-800"><Gift className="w-4 h-4"/> Birthdays This Month</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {data.upcomingBirthdays.length === 0 && <TableRow><TableCell className="text-center text-slate-400 py-4">No upcoming birthdays</TableCell></TableRow>}
                  {data.upcomingBirthdays.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-bold text-sm">{c.name}</TableCell>
                      <TableCell className="text-xs text-slate-500">{new Date(c.birthday).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-pink-100">
            <CardHeader className="bg-pink-50 border-b border-pink-100 py-3">
              <CardTitle className="text-sm flex items-center gap-2 text-pink-800"><Heart className="w-4 h-4"/> Anniversaries This Month</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableBody>
                  {data.upcomingAnniversaries.length === 0 && <TableRow><TableCell className="text-center text-slate-400 py-4">No upcoming anniversaries</TableCell></TableRow>}
                  {data.upcomingAnniversaries.map((c: any) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-bold text-sm">{c.name}</TableCell>
                      <TableCell className="text-xs text-slate-500">{new Date(c.anniversary).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}
