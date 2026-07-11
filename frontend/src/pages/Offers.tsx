import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../services/api";
import { Gift, Plus, Trash2, Crown } from "lucide-react";
import { toast } from "sonner";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VIPBadge } from "../components/VIPBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function Offers() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);

  const [title, setTitle] = useState("");
  const [discountType, setDiscountType] = useState("PERCENT");
  const [discountValue, setDiscountValue] = useState("");
  const [minimumBill, setMinimumBill] = useState("");
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState("");
  
  const [vips, setVips] = useState<string[]>([]);

  const toggleVip = (vip: string) => {
    if (vips.includes(vip)) {
      setVips(vips.filter(v => v !== vip));
    } else {
      setVips([...vips, vip]);
    }
  };

  const { data: offersData, isLoading } = useQuery({
    queryKey: ["offers"],
    queryFn: () => api.get("/offers"),
  });
  const offers = offersData?.data || [];

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/offers", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offer created!");
      setIsOpen(false);
      setTitle(""); setDiscountValue(""); setMinimumBill(""); setEndDate(""); setVips([]);
    },
    onError: (err: any) => toast.error(err.message || "Failed to create offer")
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.delete(`/offers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["offers"] });
      toast.success("Offer deleted!");
    }
  });

  const handleCreate = () => {
    if (!title || !discountValue || !endDate) return toast.error("Please fill required fields");
    createMutation.mutate({
      title,
      offerType: "DISCOUNT",
      discountType,
      discountValue: Number(discountValue),
      minimumBill: Number(minimumBill) || 0,
      startDate: new Date(startDate).toISOString(),
      endDate: new Date(endDate).toISOString(),
      applicableVips: vips
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Gift className="w-8 h-8 text-primary"/> Offers & Marketing
          </h1>
          <p className="text-muted-foreground">Manage discounts and VIP exclusive offers</p>
        </div>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger className={buttonVariants({ variant: "default" })}>
            <Plus className="w-4 h-4 mr-2"/> Create Offer
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Offer Title *</Label>
                <Input placeholder="e.g. Diwali 20% OFF" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Discount Type</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={discountType} onChange={e => setDiscountType(e.target.value)}>
                    <option value="PERCENT">Percentage (%)</option>
                    <option value="FLAT">Flat Amount (₹)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Discount Value *</Label>
                  <Input type="number" placeholder="20" value={discountValue} onChange={e => setDiscountValue(e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Start Date *</Label>
                  <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>End Date *</Label>
                  <Input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Minimum Bill Amount (₹)</Label>
                <Input type="number" placeholder="0" value={minimumBill} onChange={e => setMinimumBill(e.target.value)} />
              </div>

              {/* VIP Restriction */}
              <div className="space-y-3 pt-2">
                <Label className="flex items-center gap-1 text-purple-700 font-bold"><Crown className="w-4 h-4"/> Restrict to VIP Tiers (Optional)</Label>
                <div className="flex gap-2">
                  <Button type="button" variant={vips.includes("DIAMOND") ? "default" : "outline"} className={vips.includes("DIAMOND") ? "bg-purple-600 hover:bg-purple-700" : ""} onClick={() => toggleVip("DIAMOND")}>👑 Diamond</Button>
                  <Button type="button" variant={vips.includes("PLATINUM") ? "default" : "outline"} className={vips.includes("PLATINUM") ? "bg-blue-500 hover:bg-blue-600" : ""} onClick={() => toggleVip("PLATINUM")}>💎 Platinum</Button>
                  <Button type="button" variant={vips.includes("GOLD") ? "default" : "outline"} className={vips.includes("GOLD") ? "bg-amber-500 hover:bg-amber-600" : ""} onClick={() => toggleVip("GOLD")}>⭐ Gold</Button>
                </div>
                <p className="text-[10px] text-muted-foreground">If none selected, offer is available to everyone.</p>
              </div>

              <Button className="w-full mt-4" onClick={handleCreate} disabled={createMutation.isPending}>
                Save Offer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Offer Title</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Valid Until</TableHead>
                <TableHead>Applicable To</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : offers.length === 0 ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No offers created yet.</TableCell></TableRow>
              ) : (
                offers.map((offer: any) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-bold">{offer.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="bg-emerald-100 text-emerald-800">
                        {offer.discountType === "PERCENT" ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`}
                      </Badge>
                      {offer.minimumBill > 0 && <span className="text-[10px] ml-2 text-slate-500">Min: ₹{offer.minimumBill}</span>}
                    </TableCell>
                    <TableCell>{new Date(offer.endDate).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {(!offer.applicableVips || offer.applicableVips.length === 0) ? (
                        <Badge variant="outline" className="text-slate-500">Everyone</Badge>
                      ) : (
                        <div className="flex gap-1">
                          {offer.applicableVips.map((vip: string) => <VIPBadge key={vip} level={vip} showLabel={false} />)}
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" className="text-rose-500 hover:text-rose-700 hover:bg-rose-50" onClick={() => deleteMutation.mutate(offer.id)}>
                        <Trash2 className="w-4 h-4"/>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
