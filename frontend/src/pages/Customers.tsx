import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../services/api";
import { Users, History, Gift, CreditCard, Filter } from "lucide-react";

import { VIPBadge } from "../components/VIPBadge";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Customers() {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);
  const [vipFilter, setVipFilter] = useState<string>("ALL");

  const { data: customersData, isLoading } = useQuery({
    queryKey: ["customers"],
    queryFn: () => api.get("/customers"),
  });

  const { data: invoicesData } = useQuery({
    queryKey: ["customerInvoices", selectedCustomerId],
    queryFn: () => api.get(`/customers/${selectedCustomerId}/invoices`),
    enabled: !!selectedCustomerId,
  });

  const { data: loyaltyData } = useQuery({
    queryKey: ["customerLoyalty", selectedCustomerId],
    queryFn: () => api.get(`/loyalty/${selectedCustomerId}`),
    enabled: !!selectedCustomerId,
  });

  const { data: customerDetailsData } = useQuery({
    queryKey: ["customerDetails", selectedCustomerId],
    queryFn: () => api.get(`/customers/${selectedCustomerId}`),
    enabled: !!selectedCustomerId,
  });

  const customers = customersData?.data || [];
  const selectedCustomer = customerDetailsData?.data || customers.find((c: any) => c.id === selectedCustomerId);
  const invoices = invoicesData?.data || [];
  const loyaltyHistory = loyaltyData?.data || [];

  const filteredCustomers = customers.filter((c: any) => {
    if (vipFilter === "ALL") return true;
    if (vipFilter === "REGULAR") return c.vipLevel === "NONE" || !c.vipLevel;
    return c.vipLevel === vipFilter;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Customers CRM</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage relationships and view customer history</p>
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <select 
            className="h-9 border border-input rounded-md px-3 text-sm bg-background"
            value={vipFilter}
            onChange={(e) => setVipFilter(e.target.value)}
          >
            <option value="ALL">All Customers</option>
            <option value="DIAMOND">👑 Diamond</option>
            <option value="PLATINUM">💎 Platinum</option>
            <option value="GOLD">⭐ Gold</option>
            <option value="REGULAR">Regular</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{customers.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-x-auto border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/90 backdrop-blur-md rounded-2xl">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Phone</TableHead>
              <TableHead>VIP Status</TableHead>
              <TableHead className="text-right">Total Spent</TableHead>
              <TableHead className="text-right">Visits</TableHead>
              <TableHead className="text-right">Loyalty Points</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-6 text-center text-muted-foreground">
                  Loading customers...
                </TableCell>
              </TableRow>
            ) : filteredCustomers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="py-24 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Users className="w-10 h-10 text-primary opacity-80" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">No Customers Found</h3>
                    <p className="text-sm text-muted-foreground">Customers are automatically saved when you generate bills in the POS terminal.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredCustomers.map((customer: any) => (
                <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50" onClick={() => setSelectedCustomerId(customer.id)}>
                  <TableCell className="font-medium">
                    {customer.name || "Unknown"}
                  </TableCell>
                  <TableCell>{customer.phone}</TableCell>
                  <TableCell><VIPBadge level={customer.vipLevel || "NONE"} /></TableCell>
                  <TableCell className="text-right font-semibold">₹{customer.totalSpending.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{customer.totalVisits}</TableCell>
                  <TableCell className="text-right text-emerald-600 font-bold">{customer.loyaltyPoints}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Sheet open={!!selectedCustomerId} onOpenChange={(open) => !open && setSelectedCustomerId(null)}>
        <SheetContent className="w-[100vw] sm:max-w-xl h-full flex flex-col p-0">
          {selectedCustomer && (
            <>
              <div className="p-6 pb-0 border-b border-border bg-muted/30">
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-3 text-2xl">
                    {selectedCustomer.name || "Unknown Customer"}
                    <VIPBadge level={selectedCustomer.vipLevel || "NONE"} className="text-sm px-3 py-1" />
                  </SheetTitle>
                  <SheetDescription className="text-base">
                    Phone: {selectedCustomer.phone}
                  </SheetDescription>
                </SheetHeader>
                
                <div className="grid grid-cols-3 gap-4 py-6">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><CreditCard className="w-3 h-3"/> Total Spent</p>
                    <p className="text-xl font-bold">₹{selectedCustomer.totalSpending.toFixed(2)}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><History className="w-3 h-3"/> Visits</p>
                    <p className="text-xl font-bold">{selectedCustomer.totalVisits}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground flex items-center gap-1"><Gift className="w-3 h-3"/> Points</p>
                    <p className="text-xl font-bold text-emerald-600">{selectedCustomer.loyaltyPoints}</p>
                  </div>
                </div>
              </div>

              <ScrollArea className="flex-1 p-6">
                <Tabs defaultValue="timeline" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-6">
                    <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    <TabsTrigger value="notes">Notes</TabsTrigger>
                    <TabsTrigger value="loyalty">Loyalty</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="timeline" className="space-y-4">
                    {invoices.length === 0 ? (
                      <p className="text-center text-muted-foreground py-10">No history found for this customer.</p>
                    ) : (
                      <div className="space-y-4 border-l-2 border-muted ml-3 pl-4 pb-4">
                        {invoices.map((inv: any) => (
                          <div key={inv.id} className="relative">
                            <div className="absolute -left-6 w-3 h-3 rounded-full mt-1.5 bg-primary" />
                            <div className="bg-card border border-border p-3 rounded-tr-xl rounded-b-xl shadow-sm w-fit min-w-[250px]">
                              <div className="flex justify-between items-center mb-2 border-b pb-1 border-border/50">
                                <span className="text-xs font-semibold text-muted-foreground">{new Date(inv.createdAt).toLocaleString()}</span>
                                <span className="text-xs font-bold text-primary">₹{inv.grandTotal.toFixed(2)}</span>
                              </div>
                                <ul className="text-sm space-y-1">
                                  {inv.items.map((item: any) => (
                                    <li key={item.id} className="flex justify-between">
                                      <span>{item.quantity}x {item.product.name}</span>
                                      <span className="text-muted-foreground text-xs ml-4">₹{item.total ? item.total.toFixed(2) : ((item.price * item.quantity) - (item.discount || 0)).toFixed(2)}</span>
                                    </li>
                                  ))}
                                </ul>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="notes" className="space-y-4">
                    {(!selectedCustomer.notes || selectedCustomer.notes.length === 0) ? (
                      <p className="text-center text-muted-foreground py-10">No notes found.</p>
                    ) : (
                      <div className="space-y-3">
                        {selectedCustomer.notes.map((note: any) => (
                          <Card key={note.id} className="bg-amber-50/50 border-amber-200">
                            <CardContent className="p-3 text-sm">
                              <p className="text-foreground">{note.note}</p>
                              <p className="text-xs text-muted-foreground mt-2 text-right">
                                {new Date(note.createdAt).toLocaleString()} by {note.createdBy}
                              </p>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="loyalty" className="space-y-4">
                    {loyaltyHistory.length === 0 ? (
                      <p className="text-center text-muted-foreground py-10">No loyalty history.</p>
                    ) : (
                      <div className="space-y-4 border-l-2 border-muted ml-3 pl-4">
                        {loyaltyHistory.map((log: any) => (
                          <div key={log.id} className="relative">
                            <div className={`absolute -left-6 w-3 h-3 rounded-full mt-1.5 ${log.pointsEarned > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sm">{log.pointsEarned > 0 ? 'Earned Points' : 'Redeemed Points'}</p>
                                <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                              </div>
                              <Badge variant={log.pointsEarned > 0 ? "default" : "destructive"} className={log.pointsEarned > 0 ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-100" : ""}>
                                {log.pointsEarned > 0 ? "+" + log.pointsEarned : "-" + log.pointsRedeemed} pts
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </ScrollArea>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
