import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { CalendarClock, CheckCircle, Clock } from "lucide-react";
import { useNavigate } from "react-router";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdvanceOrders() {
  const navigate = useNavigate();

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ["advanceOrders"],
    queryFn: () => api.get("/advance"),
  });

  const handleFulfillOrder = (order: any) => {
    navigate("/billing", { state: { advanceOrder: order } });
  };

  const orders = ordersData?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Advance Orders</h1>
          <p className="text-muted-foreground">Manage upcoming orders and pickups.</p>
        </div>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Pickup Date & Time</TableHead>
              <TableHead>Items</TableHead>
              <TableHead className="text-right">Advance Paid</TableHead>
              <TableHead className="text-right">Remaining</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                  Loading advance orders...
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <CalendarClock className="w-8 h-8 text-muted-foreground/50" />
                    <p>No advance orders found.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order: any) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">
                    {order.customer.name}
                    <div className="text-xs text-muted-foreground">{order.customer.phone}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {new Date(order.pickupDate).toLocaleDateString()} at {order.pickupTime}
                    </div>
                    {order.occasion && <div className="text-xs text-muted-foreground">Occasion: {order.occasion}</div>}
                  </TableCell>
                  <TableCell>
                    <ul className="text-xs list-disc list-inside">
                      {order.items.map((item: any) => (
                        <li key={item.id}>{item.quantity}x {item.product.name}</li>
                      ))}
                    </ul>
                  </TableCell>
                  <TableCell className="text-right font-medium text-emerald-600">₹{order.advancePaid.toFixed(2)}</TableCell>
                  <TableCell className="text-right font-bold text-rose-600">₹{order.remainingAmount.toFixed(2)}</TableCell>
                  <TableCell className="text-center">
                    {order.status === "PENDING" ? (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">Pending</Badge>
                    ) : (
                      <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">Completed</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {order.status === "PENDING" && (
                      <Button 
                        size="sm" 
                        variant="default"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleFulfillOrder(order)}
                      >
                        <CheckCircle className="w-4 h-4 mr-1" />
                        Fulfill
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
