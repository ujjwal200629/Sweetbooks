import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../services/api";
import { toast } from "sonner";
import { Plus, Package, AlertTriangle, ArrowRightLeft, BarChart3, TrendingUp, History } from "lucide-react";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Bar,
  BarChart
} from "recharts";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  category: z.string().min(1, "Category is required"),
  unit: z.string().min(1, "Unit is required"),
  price: z.number().min(0, "Price must be positive"),
  gst: z.number().min(0, "GST must be positive"),
  stock: z.number().min(0, "Stock cannot be negative"),
  minimumStock: z.number().min(0).default(0),
});

export default function Products() {
  const queryClient = useQueryClient();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  
  // Manage Stock State
  const [stockProduct, setStockProduct] = useState<any>(null);
  const [stockQty, setStockQty] = useState<number>(0);
  const [stockReason, setStockReason] = useState("");

  // Analytics State
  const [analyticsProduct, setAnalyticsProduct] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: () => api.get("/products"),
  });

  const { data: analyticsData, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["productAnalytics", analyticsProduct?.id],
    queryFn: () => api.get(`/products/${analyticsProduct.id}/analytics`),
    enabled: !!analyticsProduct
  });

  const form = useForm<any>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      category: "",
      unit: "kg",
      price: 0,
      gst: 0,
      stock: 0,
      minimumStock: 0,
    },
  });

  const createMutation = useMutation({
    mutationFn: (values: z.infer<typeof productSchema>) => api.post("/products", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Product added successfully");
      setIsSheetOpen(false);
      form.reset();
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to add product");
    },
  });

  const adjustStockMutation = useMutation({
    mutationFn: (payload: { id: string, quantityChange: number, reason: string }) => 
      api.post(`/stock/${payload.id}`, { quantityChange: payload.quantityChange, reason: payload.reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Stock adjusted successfully");
      setStockProduct(null);
      setStockQty(0);
      setStockReason("");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to adjust stock");
    },
  });

  const onSubmit = (values: any) => {
    createMutation.mutate(values);
  };

  const handleAdjustStock = () => {
    if (stockQty === 0) {
      toast.error("Quantity change cannot be zero");
      return;
    }
    if (!stockReason) {
      toast.error("Reason is required");
      return;
    }
    adjustStockMutation.mutate({
      id: stockProduct.id,
      quantityChange: stockQty,
      reason: stockReason
    });
  };

  const products = data?.data || [];
  const errors = form.formState.errors;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Products & Inventory</h1>
          <p className="text-muted-foreground font-medium mt-1">Manage your sweet shop inventory and stock levels</p>
        </div>
        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          {/* @ts-ignore */}
          <SheetTrigger asChild>
            <Button className="bg-gradient-to-r from-primary to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 shadow-md font-bold rounded-xl">
              <Plus className="mr-2 h-4 w-4" /> Add Product
            </Button>
          </SheetTrigger>
          <SheetContent className="sm:max-w-md h-full flex flex-col">
            <SheetHeader>
              <SheetTitle>Add New Product</SheetTitle>
              <SheetDescription>
                Create a new product for the inventory.
              </SheetDescription>
            </SheetHeader>
            <ScrollArea className="flex-1 mt-6 pr-4">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                
                <div className="space-y-2">
                  <Label>Product Name</Label>
                  <Input placeholder="Kaju Katli" {...form.register("name")} />
                  {errors.name && <p className="text-sm text-red-500">{errors.name.message as string}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input placeholder="Sweets" {...form.register("category")} />
                    {errors.category && <p className="text-sm text-red-500">{errors.category.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Unit</Label>
                    <Input placeholder="kg/box" {...form.register("unit")} />
                    {errors.unit && <p className="text-sm text-red-500">{errors.unit.message as string}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (₹)</Label>
                    <Input type="number" step="0.01" {...form.register("price", { valueAsNumber: true })} />
                    {errors.price && <p className="text-sm text-red-500">{errors.price.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>GST (%)</Label>
                    <Input type="number" step="0.01" {...form.register("gst", { valueAsNumber: true })} />
                    {errors.gst && <p className="text-sm text-red-500">{errors.gst.message as string}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Initial Stock</Label>
                    <Input type="number" step="0.01" {...form.register("stock", { valueAsNumber: true })} />
                    {errors.stock && <p className="text-sm text-red-500">{errors.stock.message as string}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label>Min Stock Alert</Label>
                    <Input type="number" step="0.01" {...form.register("minimumStock", { valueAsNumber: true })} />
                    {errors.minimumStock && <p className="text-sm text-red-500">{errors.minimumStock.message as string}</p>}
                  </div>
                </div>

                <Button type="submit" className="w-full mt-6" disabled={createMutation.isPending}>
                  {createMutation.isPending ? "Saving..." : "Save Product"}
                </Button>
              </form>
            </ScrollArea>
          </SheetContent>
        </Sheet>
      </div>

      <Card className="border-none shadow-[0_8px_30px_rgb(0,0,0,0.04)] bg-white/90 backdrop-blur-md rounded-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Stock Level</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                  Loading inventory...
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-24">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                    <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <Package className="w-10 h-10 text-primary opacity-80" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">No Products Yet</h3>
                    <p className="text-sm text-muted-foreground">Your sweet tray is empty! Click "Add Product" to start building your inventory.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              products.map((product: any) => {
                const isLowStock = product.stock <= product.minimumStock;
                return (
                  <TableRow key={product.id} className={isLowStock ? "bg-rose-50/50 dark:bg-rose-950/10" : ""}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {product.name}
                        {isLowStock && (
                          <AlertTriangle className="w-4 h-4 text-rose-500" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell className="text-right font-medium">₹{product.price}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-bold ${isLowStock ? "text-rose-600" : ""}`}>
                          {product.stock} {product.unit}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Min: {product.minimumStock} {product.unit}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      {isLowStock ? (
                        <Badge variant="destructive" className="bg-rose-100 text-rose-800 hover:bg-rose-100 border-rose-200">
                          Low Stock
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                          In Stock
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => setStockProduct(product)}>
                          <ArrowRightLeft className="w-4 h-4 mr-1" />
                          Manage
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setAnalyticsProduct(product)}>
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Stock Management Dialog */}
      <Dialog open={!!stockProduct} onOpenChange={(open) => !open && setStockProduct(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Stock: {stockProduct?.name}</DialogTitle>
            <DialogDescription>
              Adjust inventory levels for this product. 
              Current stock: <strong>{stockProduct?.stock} {stockProduct?.unit}</strong>
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Quantity Change (+ to Add, - to Deduct)</Label>
              <Input 
                type="number" 
                step="0.01" 
                value={stockQty} 
                onChange={(e) => setStockQty(parseFloat(e.target.value) || 0)} 
                className={stockQty > 0 ? "border-emerald-500 text-emerald-600" : stockQty < 0 ? "border-rose-500 text-rose-600" : ""}
              />
              <p className="text-xs text-muted-foreground">
                New Stock will be: <strong>{((stockProduct?.stock || 0) + stockQty).toFixed(2)} {stockProduct?.unit}</strong>
              </p>
            </div>
            <div className="space-y-2">
              <Label>Reason for adjustment</Label>
              <Input 
                placeholder="e.g. New Batch Arrived, Expired" 
                value={stockReason} 
                onChange={(e) => setStockReason(e.target.value)} 
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setStockProduct(null)}>Cancel</Button>
            <Button onClick={handleAdjustStock} disabled={adjustStockMutation.isPending || stockQty === 0 || !stockReason}>
              {adjustStockMutation.isPending ? "Applying..." : "Apply Adjustment"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Analytics Drawer */}
      <Sheet open={!!analyticsProduct} onOpenChange={(open) => !open && setAnalyticsProduct(null)}>
        <SheetContent className="sm:max-w-xl h-full flex flex-col p-0">
          <div className="p-6 pb-2 border-b">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                {analyticsProduct?.name} Analytics
              </SheetTitle>
              <SheetDescription>
                Detailed breakdown of sales and stock history.
              </SheetDescription>
            </SheetHeader>
          </div>
          
          <ScrollArea className="flex-1 p-6">
            {isLoadingAnalytics ? (
              <div className="text-center py-10 text-muted-foreground animate-pulse">
                Loading analytics data...
              </div>
            ) : (
              <div className="space-y-8">
                
                {/* Sales Chart */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2"><TrendingUp className="w-4 h-4 text-emerald-500" /> Sales Frequency</h3>
                  <div className="bg-card border rounded-lg p-4 h-[250px]">
                    {analyticsData?.data?.salesFrequency?.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analyticsData.data.salesFrequency}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                          <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                          <RechartsTooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            cursor={{ fill: 'rgba(0,0,0,0.05)' }}
                          />
                          <Bar dataKey="quantity" fill="#10b981" radius={[4, 4, 0, 0]} name="Units Sold" />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No sales data available.
                      </div>
                    )}
                  </div>
                </div>

                {/* Stock History */}
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2"><History className="w-4 h-4 text-blue-500" /> Stock Timeline</h3>
                  <div className="bg-card border rounded-lg p-0 overflow-hidden">
                    <Table>
                      <TableHeader className="bg-muted/30">
                        <TableRow>
                          <TableHead>Date</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead className="text-right">Change</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {analyticsData?.data?.stockHistory?.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                              No stock changes recorded.
                            </TableCell>
                          </TableRow>
                        ) : (
                          analyticsData?.data?.stockHistory?.map((history: any) => (
                            <TableRow key={history.id}>
                              <TableCell className="text-sm">
                                {new Date(history.createdAt).toLocaleDateString()} {new Date(history.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </TableCell>
                              <TableCell>
                                <span className="text-xs font-medium px-2 py-1 bg-secondary rounded-md">
                                  {history.changeType}
                                </span>
                              </TableCell>
                              <TableCell className={`text-right font-bold ${history.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                {history.quantity > 0 ? "+" : ""}{history.quantity}
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
              </div>
            )}
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  );
}
