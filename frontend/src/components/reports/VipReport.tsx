import { useQuery } from "@tanstack/react-query";
import { api } from "../../services/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Crown, Star, Award, Coins } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { VIPBadge } from "../VIPBadge";

export default function VipReport({ dates }: { dates: any }) {
  const { data: reportResponse, isLoading } = useQuery({
    queryKey: ["vipReport", dates],
    queryFn: () => api.get(`/reports/vip?start=${dates.start.toISOString()}&end=${dates.end.toISOString()}`)
  });

  if (isLoading) return <div className="p-8 text-center animate-pulse text-slate-400">Loading VIP Report...</div>;
  if (!reportResponse?.data) return null;

  const data = reportResponse.data;

  return (
    <div className="space-y-6 pt-8 border-t break-inside-avoid">
      <div className="flex items-center gap-2 border-b pb-2">
        <Crown className="w-6 h-6 text-purple-600"/>
        <h2 className="text-2xl font-bold text-slate-800">4. VIP & Loyalty Report</h2>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">VIP Distribution</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Customers</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><VIPBadge level="DIAMOND" showLabel={true} /></TableCell>
                  <TableCell className="text-right font-bold">{data.distribution.DIAMOND}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><VIPBadge level="PLATINUM" showLabel={true} /></TableCell>
                  <TableCell className="text-right font-bold">{data.distribution.PLATINUM}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><VIPBadge level="GOLD" showLabel={true} /></TableCell>
                  <TableCell className="text-right font-bold">{data.distribution.GOLD}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><span className="text-slate-500 font-bold">Regular</span></TableCell>
                  <TableCell className="text-right font-bold">{data.distribution.NONE}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Revenue by VIP Level</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Level</TableHead>
                  <TableHead className="text-right">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell><VIPBadge level="DIAMOND" showLabel={true} /></TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">₹{data.revenueByVip.DIAMOND.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><VIPBadge level="PLATINUM" showLabel={true} /></TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">₹{data.revenueByVip.PLATINUM.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><VIPBadge level="GOLD" showLabel={true} /></TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">₹{data.revenueByVip.GOLD.toLocaleString()}</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell><span className="text-slate-500 font-bold">Regular</span></TableCell>
                  <TableCell className="text-right font-bold text-emerald-600">₹{data.revenueByVip.NONE.toLocaleString()}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-amber-50 border-amber-100">
          <CardContent className="p-4 flex flex-col justify-center text-center">
            <Star className="w-6 h-6 text-amber-500 mx-auto mb-2"/>
            <p className="text-sm text-amber-700 font-medium">Points Earned</p>
            <h3 className="text-2xl font-bold text-amber-900">{data.loyalty.pointsEarned.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex flex-col justify-center text-center">
            <Coins className="w-6 h-6 text-blue-500 mx-auto mb-2"/>
            <p className="text-sm text-blue-700 font-medium">Points Redeemed</p>
            <h3 className="text-2xl font-bold text-blue-900">{data.loyalty.pointsRedeemed.toLocaleString()}</h3>
          </CardContent>
        </Card>
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4 flex flex-col justify-center text-center">
            <Award className="w-6 h-6 text-purple-500 mx-auto mb-2"/>
            <p className="text-sm text-purple-700 font-medium">Outstanding Points</p>
            <h3 className="text-2xl font-bold text-purple-900">{data.loyalty.outstandingPoints.toLocaleString()}</h3>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Most Loyal Customers (Top Point Holders)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>VIP</TableHead>
                <TableHead className="text-right">Available Points</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.loyalty.topPointHolders.map((c: any) => (
                <TableRow key={c.phone}>
                  <TableCell className="font-bold">{c.name}</TableCell>
                  <TableCell className="text-slate-500">{c.phone}</TableCell>
                  <TableCell><VIPBadge level={c.vipLevel} showLabel={false} /></TableCell>
                  <TableCell className="text-right font-bold text-amber-600">{c.loyaltyPoints.toLocaleString()} pts</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
