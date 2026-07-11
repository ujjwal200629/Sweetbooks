import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "../services/api";
import { toast } from "sonner";
import { Save, Store, Receipt, Gift, Crown } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

const settingSchema = z.object({
  shopName: z.string().min(1, "Shop Name is required"),
  phone: z.string().optional(),
  address: z.string().optional(),
  gstNumber: z.string().optional(),
  invoicePrefix: z.string().min(1, "Invoice Prefix is required"),
  pointsPerRupee: z.number().min(0).default(0.01),
  goldSpending: z.number().min(0),
  goldVisits: z.number().min(0),
  platinumSpending: z.number().min(0),
  platinumVisits: z.number().min(0),
  diamondSpending: z.number().min(0),
  diamondVisits: z.number().min(0),
});

export default function Settings() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["settings"],
    queryFn: () => api.get("/settings"),
  });

  const form = useForm<any>({
    resolver: zodResolver(settingSchema),
    values: data?.data || {
      shopName: "My Sweet Shop",
      phone: "",
      address: "",
      gstNumber: "",
      invoicePrefix: "INV-",
      pointsPerRupee: 0.01,
      goldSpending: 20000,
      goldVisits: 10,
      platinumSpending: 50000,
      platinumVisits: 20,
      diamondSpending: 100000,
      diamondVisits: 40,
    }
  });

  const updateMutation = useMutation({
    mutationFn: (values: any) => api.put("/settings", values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["settings"] });
      toast.success("Settings updated successfully!");
    },
    onError: (err: any) => {
      toast.error(err.message || "Failed to update settings");
    }
  });

  const onSubmit = (values: any) => {
    updateMutation.mutate(values);
  };

  const errors = form.formState.errors;

  if (isLoading) {
    return <div className="animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Shop Settings</h1>
        <p className="text-muted-foreground">Manage your store's configuration and loyalty rules.</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {/* General Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Store className="w-5 h-5"/> General Information</CardTitle>
            <CardDescription>Basic details about your sweet shop.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Shop Name *</Label>
                <Input {...form.register("shopName")} placeholder="Sri Krishna Sweets" />
                {errors.shopName && <p className="text-sm text-red-500">{errors.shopName.message as string}</p>}
              </div>
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input {...form.register("phone")} placeholder="+91 9876543210" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Store Address</Label>
              <Input {...form.register("address")} placeholder="123 Market Street, City" />
            </div>

            <div className="space-y-2">
              <Label>GST Number</Label>
              <Input {...form.register("gstNumber")} placeholder="22AAAAA0000A1Z5" />
            </div>
          </CardContent>
        </Card>

        {/* Billing Configuration */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Receipt className="w-5 h-5"/> Billing</CardTitle>
            <CardDescription>Configure how invoices are generated.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-xs">
              <Label>Invoice Prefix *</Label>
              <Input {...form.register("invoicePrefix")} placeholder="INV-" />
              {errors.invoicePrefix && <p className="text-sm text-red-500">{errors.invoicePrefix.message as string}</p>}
              <p className="text-xs text-muted-foreground">Invoices will look like: {form.watch("invoicePrefix")}1001</p>
            </div>
          </CardContent>
        </Card>

        {/* Loyalty Program */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Gift className="w-5 h-5"/> Loyalty Program</CardTitle>
            <CardDescription>Rules for earning loyalty points.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2 max-w-xs">
              <Label>Points per Rupee spent</Label>
              <Input type="number" step="0.01" {...form.register("pointsPerRupee", { valueAsNumber: true })} />
              <p className="text-xs text-muted-foreground">Default is 0.01 (1% cashback).</p>
            </div>
          </CardContent>
        </Card>

        {/* VIP Customer Rules */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Crown className="w-5 h-5 text-amber-500"/> VIP Customer Rules</CardTitle>
            <CardDescription>Configure thresholds for automatic VIP upgrades.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-8">
              {/* Gold */}
              <div className="space-y-3 p-4 border rounded-xl bg-amber-50/30 border-amber-200">
                <h4 className="font-bold text-amber-600 flex items-center gap-2">⭐ Gold Tier</h4>
                <div className="space-y-2">
                  <Label className="text-xs">Required Lifetime Spending (₹)</Label>
                  <Input type="number" {...form.register("goldSpending", { valueAsNumber: true })} className="bg-white" />
                </div>
                <div className="text-center text-xs font-bold text-slate-400">OR</div>
                <div className="space-y-2">
                  <Label className="text-xs">Required Total Visits</Label>
                  <Input type="number" {...form.register("goldVisits", { valueAsNumber: true })} className="bg-white" />
                </div>
              </div>

              {/* Platinum */}
              <div className="space-y-3 p-4 border rounded-xl bg-blue-50/30 border-blue-200">
                <h4 className="font-bold text-blue-600 flex items-center gap-2">💎 Platinum Tier</h4>
                <div className="space-y-2">
                  <Label className="text-xs">Required Lifetime Spending (₹)</Label>
                  <Input type="number" {...form.register("platinumSpending", { valueAsNumber: true })} className="bg-white" />
                </div>
                <div className="text-center text-xs font-bold text-slate-400">OR</div>
                <div className="space-y-2">
                  <Label className="text-xs">Required Total Visits</Label>
                  <Input type="number" {...form.register("platinumVisits", { valueAsNumber: true })} className="bg-white" />
                </div>
              </div>

              {/* Diamond */}
              <div className="space-y-3 p-4 border rounded-xl bg-purple-50/30 border-purple-200 col-span-2">
                <h4 className="font-bold text-purple-600 flex items-center gap-2">👑 Diamond Tier</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs">Required Lifetime Spending (₹)</Label>
                    <Input type="number" {...form.register("diamondSpending", { valueAsNumber: true })} className="bg-white" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs">Required Total Visits (Alternative)</Label>
                    <Input type="number" {...form.register("diamondVisits", { valueAsNumber: true })} className="bg-white" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending} size="lg" className="px-8">
            <Save className="w-4 h-4 mr-2" />
            {updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>

      </form>
    </div>
  );
}
