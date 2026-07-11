import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "react-router";
import { api } from "../services/api";
import { toast } from "sonner";
import { 
  Search, Plus, Minus, Trash2, User, CreditCard, Banknote, 
  Smartphone, Receipt, History, MessageSquare, Percent, Gift, Package
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { VIPBadge } from "../components/VIPBadge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ThermalReceipt } from "../components/ThermalReceipt";

interface CartItem {
  product: any;
  quantity: number;
  discount: number;
}

export default function Billing() {
  const location = useLocation();
  const queryClient = useQueryClient();
  const advanceOrderFulfillment = location.state?.advanceOrder;

  // --- Core State ---
  const [cart, setCart] = useState<CartItem[]>([]);
  const [latestInvoice, setLatestInvoice] = useState<any>(null);
  
  // Customer State
  const [customerSearch, setCustomerSearch] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerBirthday, setCustomerBirthday] = useState("");
  const [customerAnniversary, setCustomerAnniversary] = useState("");
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [activeCustomerIndex, setActiveCustomerIndex] = useState(-1);
  const customerInputRef = useRef<HTMLInputElement>(null);

  // Advance Order State
  const [isAdvanceOrder, setIsAdvanceOrder] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [occasion, setOccasion] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");
  const [advancePaid, setAdvancePaid] = useState<number | "">("");
  const [linkedAdvanceOrderId, setLinkedAdvanceOrderId] = useState<string | null>(null);
  const [fulfillmentAdvancePaid, setFulfillmentAdvancePaid] = useState<number>(0);

  // Product Entry State
  const [productSearch, setProductSearch] = useState("");
  const [isProductDropdownOpen, setIsProductDropdownOpen] = useState(false);
  const [activeProductIndex, setActiveProductIndex] = useState(-1);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [entryQuantity, setEntryQuantity] = useState<number | "">(1);
  const [entryDiscount, setEntryDiscount] = useState<number | "">(0);
  const productInputRef = useRef<HTMLInputElement>(null);

  // Modifiers & Payment State
  const [discountType, setDiscountType] = useState<"FLAT" | "PERCENT">("FLAT");
  const [globalDiscountValue, setGlobalDiscountValue] = useState<number | "">("");
  const [additionalCharges, setAdditionalCharges] = useState<number | "">("");
  const [billNotes, setBillNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("CASH");

  // CRM Note State
  const [newNote, setNewNote] = useState("");

  // --- API Queries ---
  // Products
  const { data: productsData } = useQuery({ queryKey: ["products"], queryFn: () => api.get("/products") });
  const products = productsData?.data || [];
  
  // Customers
  const { data: allCustomersData } = useQuery({ queryKey: ["customers"], queryFn: () => api.get("/customers") });
  const allCustomers = allCustomersData?.data || [];
  
  // Selected Customer Detail
  const { data: customerData, isFetching: isFetchingCustomer } = useQuery({
    queryKey: ["customer", customerPhone],
    queryFn: () => api.get(`/customers/phone/${customerPhone}`),
    enabled: customerPhone.length >= 4,
    retry: false,
  });
  const customer = customerData?.data;

  // Selected Customer Invoices
  const { data: invoicesData } = useQuery({
    queryKey: ["customerInvoices", customer?.id],
    queryFn: () => api.get(`/customers/${customer?.id}/invoices`),
    enabled: !!customer?.id,
  });
  const invoices = invoicesData?.data || [];

  // Settings for VIP Calculation
  const { data: settingsData } = useQuery({ queryKey: ["settings"], queryFn: () => api.get("/settings") });
  const settings = settingsData?.data;

  const getNextVipTier = () => {
    if (!settings || !customer) return null;
    if (customer.vipLevel === "DIAMOND") return null;
    
    if (customer.vipLevel === "PLATINUM") return { 
      name: "Diamond", spendNeeded: Math.max(0, settings.diamondSpending - customer.totalSpending), visitsNeeded: Math.max(0, settings.diamondVisits - customer.totalVisits) 
    };
    if (customer.vipLevel === "GOLD") return { 
      name: "Platinum", spendNeeded: Math.max(0, settings.platinumSpending - customer.totalSpending), visitsNeeded: Math.max(0, settings.platinumVisits - customer.totalVisits) 
    };
    return { 
      name: "Gold", spendNeeded: Math.max(0, settings.goldSpending - customer.totalSpending), visitsNeeded: Math.max(0, settings.goldVisits - customer.totalVisits) 
    };
  };
  const nextTier = getNextVipTier();

  // Active Offers
  const { data: offersData } = useQuery({ 
    queryKey: ["activeOffers", customer?.vipLevel], 
    queryFn: () => api.get(`/offers/active?vipLevel=${customer?.vipLevel || "NONE"}`) 
  });
  const activeOffers = offersData?.data || [];
  const [selectedOfferId, setSelectedOfferId] = useState<string>("NONE");

  // --- Initialization ---
  useEffect(() => {
    if (advanceOrderFulfillment) {
      setCustomerPhone(advanceOrderFulfillment.customer.phone || "");
      setCustomerSearch(advanceOrderFulfillment.customer.phone || "");
      setCustomerName(advanceOrderFulfillment.customer.name || "");
      setLinkedAdvanceOrderId(advanceOrderFulfillment.id);
      setFulfillmentAdvancePaid(advanceOrderFulfillment.advancePaid || 0);
      
      const mappedCart = advanceOrderFulfillment.items.map((item: any) => ({
        product: { ...item.product, price: item.price },
        quantity: item.quantity,
        discount: 0
      }));
      setCart(mappedCart);
      toast.info("Advance order items loaded into cart");
    }
  }, [advanceOrderFulfillment]);

  // --- Mutations ---
  const generateBillMutation = useMutation({
    mutationFn: (payload: any) => api.post(isAdvanceOrder ? "/advance" : "/billing", payload),
    onSuccess: (response: any) => {
      toast.success(isAdvanceOrder ? "Advance Order Created!" : "Bill Generated Successfully!");
      queryClient.invalidateQueries({ queryKey: ["customers"] });
      
      if (!isAdvanceOrder) {
        setLatestInvoice(response.data.data);
      }

      // Reset Form
      setCart([]);
      setCustomerSearch(""); setCustomerPhone(""); setCustomerName(""); setCustomerBirthday(""); setCustomerAnniversary("");
      setIsAdvanceOrder(false); setPickupDate(""); setPickupTime(""); setAdvancePaid(""); setOccasion(""); setSpecialInstructions("");
      setLinkedAdvanceOrderId(null); setFulfillmentAdvancePaid(0);
      setGlobalDiscountValue(""); setBillNotes(""); setAdditionalCharges("");
      
      if (!isAdvanceOrder) {
        setTimeout(() => window.print(), 500);
      }
    },
    onError: (err: any) => toast.error(err.message || "Failed to process order")
  });

  const addNoteMutation = useMutation({
    mutationFn: (payload: { id: string, note: string }) => api.post(`/customers/${payload.id}/notes`, { note: payload.note }),
    onSuccess: () => {
      toast.success("Note added!");
      setNewNote("");
      queryClient.invalidateQueries({ queryKey: ["customer", customerPhone] });
    },
  });

  // --- Search Logic ---
  // Customer
  const [debouncedCustomerSearch, setDebouncedCustomerSearch] = useState("");
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedCustomerSearch(customerSearch), 200);
    return () => clearTimeout(handler);
  }, [customerSearch]);

  const filteredCustomers = debouncedCustomerSearch.trim().length > 0 ? allCustomers.filter((c: any) => 
    c.phone.includes(debouncedCustomerSearch) || (c.name && c.name.toLowerCase().includes(debouncedCustomerSearch.toLowerCase()))
  ).slice(0, 8) : [];

  const handleCustomerSelect = (c: any) => {
    setCustomerSearch(c.phone);
    setCustomerPhone(c.phone);
    setIsCustomerDropdownOpen(false);
    setActiveCustomerIndex(-1);
  };

  // Product
  const filteredProducts = productSearch.trim().length > 0 ? products.filter((p: any) => 
    p.name.toLowerCase().includes(productSearch.toLowerCase())
  ).slice(0, 8) : [];

  const handleProductSelect = (p: any) => {
    setSelectedProduct(p);
    setProductSearch("");
    setIsProductDropdownOpen(false);
    setActiveProductIndex(-1);
    setEntryQuantity(1);
    setEntryDiscount(0);
  };

  // --- Highlights ---
  const renderHighlighted = (text: string, highlight: string) => {
    if (!highlight) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${highlight})`, 'gi'));
    return (
      <span>{parts.map((part, i) => part.toLowerCase() === highlight.toLowerCase() ? <b key={i} className="text-primary">{part}</b> : part)}</span>
    );
  };

  // --- Keyboard Handlers ---
  const handleCustomerKeyDown = (e: React.KeyboardEvent) => {
    if (!isCustomerDropdownOpen) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveCustomerIndex(prev => Math.min(prev + 1, filteredCustomers.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveCustomerIndex(prev => Math.max(prev - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (activeCustomerIndex >= 0) handleCustomerSelect(filteredCustomers[activeCustomerIndex]); }
    else if (e.key === "Escape") setIsCustomerDropdownOpen(false);
  };

  const handleProductKeyDown = (e: React.KeyboardEvent) => {
    if (!isProductDropdownOpen) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveProductIndex(prev => Math.min(prev + 1, filteredProducts.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveProductIndex(prev => Math.max(prev - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (activeProductIndex >= 0) handleProductSelect(filteredProducts[activeProductIndex]); }
    else if (e.key === "Escape") setIsProductDropdownOpen(false);
  };

  // --- Cart Management ---
  const addEntryToCart = () => {
    if (!selectedProduct) return toast.error("Select a product first");
    const qty = Number(entryQuantity);
    const disc = Number(entryDiscount);
    if (qty <= 0) return toast.error("Quantity must be greater than 0");
    if (qty > selectedProduct.stock) return toast.error(`Only ${selectedProduct.stock} available`);

    setCart(prev => {
      const existing = prev.find(item => item.product.id === selectedProduct.id);
      if (existing) {
        if (existing.quantity + qty > selectedProduct.stock) {
          toast.error("Not enough stock!");
          return prev;
        }
        return prev.map(item => item.product.id === selectedProduct.id 
          ? { ...item, quantity: item.quantity + qty, discount: item.discount + disc } 
          : item);
      }
      return [...prev, { product: selectedProduct, quantity: qty, discount: disc }];
    });
    
    setSelectedProduct(null);
    setEntryQuantity(1);
    setEntryDiscount(0);
  };

  const removeFromCart = (productId: string) => setCart(prev => prev.filter(item => item.product.id !== productId));
  const editCartItemQuantity = (productId: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.product.id === productId) {
        const newQ = Math.max(0.1, item.quantity + delta);
        if (newQ > item.product.stock) { toast.error("Not enough stock!"); return item; }
        return { ...item, quantity: newQ };
      }
      return item;
    }));
  };

  // --- Calculations ---
  const rawSubtotal = cart.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const totalItemDiscount = cart.reduce((acc, item) => acc + (item.discount || 0), 0);
  const subtotalAfterItemDiscounts = rawSubtotal - totalItemDiscount;

  let calculatedGlobalDiscount = 0;
  const activeOffer = activeOffers.find((o: any) => o.id === selectedOfferId);

  if (activeOffer && subtotalAfterItemDiscounts >= activeOffer.minimumBill) {
    if (activeOffer.discountType === "FLAT") calculatedGlobalDiscount = activeOffer.discountValue;
    else calculatedGlobalDiscount = (subtotalAfterItemDiscounts * activeOffer.discountValue) / 100;
  } else if (globalDiscountValue && selectedOfferId === "NONE") {
    if (discountType === "FLAT") calculatedGlobalDiscount = Number(globalDiscountValue);
    else calculatedGlobalDiscount = (subtotalAfterItemDiscounts * Number(globalDiscountValue)) / 100;
  }

  const taxableSubtotal = Math.max(0, subtotalAfterItemDiscounts - calculatedGlobalDiscount);
  
  const totalGst = cart.reduce((acc, item) => {
    const itemTotal = (item.product.price * item.quantity) - item.discount;
    const proportion = rawSubtotal > 0 ? itemTotal / subtotalAfterItemDiscounts : 0;
    const itemFinalTotal = itemTotal - (calculatedGlobalDiscount * proportion);
    return acc + ((itemFinalTotal * item.product.gst) / 100);
  }, 0);

  const charges = Number(additionalCharges) || 0;
  const calculatedTotal = taxableSubtotal + totalGst + charges;
  const grandTotal = Math.max(0, calculatedTotal - fulfillmentAdvancePaid);

  // --- Submission ---
  const handleGenerateBill = () => {
    if (cart.length === 0) return toast.error("Cart is empty");
    
    if (isAdvanceOrder) {
      if (!pickupDate || !pickupTime) return toast.error("Pickup Date and Time are required");
      generateBillMutation.mutate({
        customerPhone: customerPhone.length >= 4 ? customerPhone : undefined,
        customerName: customerName || undefined,
        customerBirthday: customerBirthday || undefined,
        customerAnniversary: customerAnniversary || undefined,
        pickupDate: new Date(pickupDate).toISOString(),
        pickupTime,
        occasion: occasion || undefined,
        specialInstructions: specialInstructions || undefined,
        advancePaid: Number(advancePaid) || 0,
        items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity, price: item.product.price }))
      });
    } else {
      generateBillMutation.mutate({
        customerPhone: customerPhone.length >= 4 ? customerPhone : undefined,
        customerName: customerName || undefined,
        customerBirthday: customerBirthday || undefined,
        customerAnniversary: customerAnniversary || undefined,
        billingType: "REGULAR",
        paymentMethod,
        additionalCharges: charges,
        globalDiscount: calculatedGlobalDiscount,
        billNotes: billNotes || undefined,
        advanceOrderId: linkedAdvanceOrderId || undefined,
        items: cart.map(item => ({ productId: item.product.id, quantity: item.quantity, discount: item.discount }))
      });
    }
  };

  return (
    <>
      <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:h-[calc(100vh-100px)] lg:overflow-hidden print:hidden font-sans">
      
      {/* ================================================================= */}
      {/* LEFT COLUMN: COMMAND CENTER */}
      {/* ================================================================= */}
      <div className={`w-full ${customer ? 'lg:col-span-5 xl:col-span-4' : 'lg:col-span-6 xl:col-span-5'} flex flex-col gap-4 lg:overflow-y-auto pr-1 pb-4`}>
        
        {/* 1. Customer Section */}
        <Card className="border-border shadow-sm rounded-2xl bg-white/80 backdrop-blur-md overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="py-3 bg-gradient-to-r from-slate-50 to-white border-b border-border px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2 tracking-wide text-slate-800"><User className="h-4 w-4 text-primary"/> Customer Lookup</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input 
                ref={customerInputRef}
                placeholder="Phone or Name (e.g. 987...)" 
                className="pl-10 h-10 font-medium shadow-sm bg-slate-50 focus:bg-white transition-colors border-border rounded-xl focus-visible:ring-primary/20"
                value={customerSearch}
                onChange={(e) => {
                  setCustomerSearch(e.target.value);
                  setIsCustomerDropdownOpen(true);
                  setActiveCustomerIndex(-1);
                  setCustomerPhone(e.target.value.replace(/\D/g, ''));
                }}
                onKeyDown={handleCustomerKeyDown}
                onBlur={() => setTimeout(() => setIsCustomerDropdownOpen(false), 200)}
                onFocus={() => { if (customerSearch.trim().length > 0) setIsCustomerDropdownOpen(true); }}
              />
              
              {isCustomerDropdownOpen && filteredCustomers.length > 0 && (
                <Card className="absolute top-11 left-0 w-full z-50 shadow-2xl border-slate-200 overflow-hidden">
                  <ScrollArea className="max-h-64">
                    <div className="flex flex-col">
                      {filteredCustomers.map((c: any, idx: number) => (
                        <div
                          key={c.id}
                          className={`flex items-center justify-between p-2 cursor-pointer text-sm ${idx === activeCustomerIndex ? "bg-primary/10 border-l-2 border-primary" : "hover:bg-slate-100"}`}
                          onMouseEnter={() => setActiveCustomerIndex(idx)}
                          onClick={() => handleCustomerSelect(c)}
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <VIPBadge level={c.vipLevel || "NONE"} showLabel={false} className="px-1" />
                              <span className="font-bold w-24 inline-block">{renderHighlighted(c.phone, debouncedCustomerSearch)}</span>
                            </div>
                            <span className="text-muted-foreground ml-2">{renderHighlighted(c.name || "Unknown", debouncedCustomerSearch)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </Card>
              )}
            </div>

            {/* New Customer Inline Form */}
            {customerPhone.length >= 4 && !isFetchingCustomer && !customer && filteredCustomers.length === 0 && (
              <div className="bg-gradient-to-br from-amber-50 to-orange-50/50 p-4 rounded-xl border border-amber-200/60 space-y-3 animate-in fade-in slide-in-from-top-2 shadow-sm">
                <div className="flex justify-between items-center">
                  <p className="text-xs font-bold text-amber-900 tracking-wide">New Customer Profile</p>
                  <Badge variant="outline" className="text-[10px] bg-white border-amber-300 text-amber-800 shadow-sm">Auto-saves on Bill</Badge>
                </div>
                <Input placeholder="Full Name *" className="h-8 text-sm bg-white" value={customerName} onChange={e => setCustomerName(e.target.value)} />
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1"><Label className="text-[10px] text-slate-500">Birthday</Label><Input type="date" className="h-8 text-xs bg-white" value={customerBirthday} onChange={e => setCustomerBirthday(e.target.value)} /></div>
                  <div className="space-y-1"><Label className="text-[10px] text-slate-500">Anniversary</Label><Input type="date" className="h-8 text-xs bg-white" value={customerAnniversary} onChange={e => setCustomerAnniversary(e.target.value)} /></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 2. Order Type */}
        <Card className="border-border shadow-sm rounded-2xl bg-white/80 backdrop-blur-md overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="py-3 bg-gradient-to-r from-slate-50 to-white border-b border-border px-5">
            <div className="flex justify-between items-center">
              <CardTitle className="text-sm font-bold tracking-wide text-slate-800">Order Details</CardTitle>
              <div className="flex items-center space-x-2 bg-slate-200/50 p-1 rounded-md">
                <Label htmlFor="advance-order" className={`text-xs ${!isAdvanceOrder ? "font-bold text-slate-800" : "text-slate-400"}`}>Regular</Label>
                <Switch id="advance-order" className="scale-75 data-[state=checked]:bg-amber-500" checked={isAdvanceOrder} onCheckedChange={setIsAdvanceOrder} />
                <Label htmlFor="advance-order" className={`text-xs ${isAdvanceOrder ? "font-bold text-amber-600" : "text-slate-400"}`}>Advance</Label>
              </div>
            </div>
          </CardHeader>
          {isAdvanceOrder && (
            <CardContent className="p-4 space-y-3 animate-in fade-in">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs font-bold text-slate-700">Pickup Date *</Label><Input type="date" className="h-8 text-sm" value={pickupDate} onChange={e => setPickupDate(e.target.value)} /></div>
                <div className="space-y-1"><Label className="text-xs font-bold text-slate-700">Pickup Time *</Label><Input type="time" className="h-8 text-sm" value={pickupTime} onChange={e => setPickupTime(e.target.value)} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1"><Label className="text-xs font-bold text-slate-700">Advance Paid (₹) *</Label><Input type="number" className="h-8 text-sm" placeholder="0" value={advancePaid} onChange={e => setAdvancePaid(e.target.value ? Number(e.target.value) : "")} /></div>
                <div className="space-y-1"><Label className="text-xs font-semibold text-slate-600">Occasion</Label><Input className="h-8 text-sm" placeholder="e.g. Wedding" value={occasion} onChange={e => setOccasion(e.target.value)} /></div>
              </div>
              <div className="space-y-1"><Label className="text-xs font-semibold text-slate-600">Special Instructions</Label><Input className="h-8 text-sm" placeholder="Notes for kitchen..." value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} /></div>
            </CardContent>
          )}
        </Card>

        {/* 3. Product Entry Workflow */}
        <Card className="border-primary/20 shadow-sm rounded-2xl bg-white/80 backdrop-blur-md overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="py-3 bg-gradient-to-r from-primary/10 to-primary/5 border-b border-primary/10 px-5">
            <CardTitle className="text-sm font-bold text-primary flex items-center gap-2"><Package className="w-4 h-4"/> Add Product</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {!selectedProduct ? (
              <div className="relative z-50">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-primary/50" />
                <Input 
                  ref={productInputRef}
                  placeholder="Scan or type product name..." 
                  className="pl-10 h-10 border-border bg-slate-50 focus:bg-white focus-visible:ring-primary/20 font-medium shadow-sm rounded-xl"
                  value={productSearch}
                  onChange={(e) => {
                    setProductSearch(e.target.value);
                    setIsProductDropdownOpen(true);
                    setActiveProductIndex(-1);
                  }}
                  onKeyDown={handleProductKeyDown}
                  onBlur={() => setTimeout(() => setIsProductDropdownOpen(false), 200)}
                  onFocus={() => { if (productSearch.trim().length > 0) setIsProductDropdownOpen(true); }}
                />
                
                {isProductDropdownOpen && productSearch.trim().length > 0 && (
                  <Card className="absolute top-11 left-0 w-full shadow-2xl border-slate-200 overflow-hidden bg-white">
                    <ScrollArea className="max-h-64">
                      <div className="flex flex-col">
                        {filteredProducts.length > 0 ? (
                          filteredProducts.map((p: any, idx: number) => (
                            <div
                              key={p.id}
                              className={`flex justify-between items-center p-3 cursor-pointer text-sm ${idx === activeProductIndex ? "bg-emerald-50 border-l-2 border-emerald-500" : "hover:bg-slate-50"}`}
                              onMouseEnter={() => setActiveProductIndex(idx)}
                              onClick={() => handleProductSelect(p)}
                            >
                              <span className="font-semibold">{renderHighlighted(p.name, productSearch)}</span>
                              <div className="text-right">
                                <div className="font-bold text-emerald-700">₹{p.price}</div>
                                <div className={`text-[10px] ${p.stock <= 0 ? 'text-rose-500 font-bold' : 'text-muted-foreground'}`}>{p.stock} in stock</div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-4 text-center text-sm text-slate-500">No products found.</div>
                        )}
                      </div>
                    </ScrollArea>
                  </Card>
                )}
              </div>
            ) : (
              <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200 space-y-3 animate-in fade-in zoom-in-95">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-emerald-900">{selectedProduct.name}</h4>
                    <p className="text-xs font-semibold text-emerald-700">₹{selectedProduct.price} / {selectedProduct.unit} &bull; <span className="text-slate-500">{selectedProduct.stock} in stock</span></p>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 px-2 text-xs text-slate-500 hover:text-slate-800" onClick={() => setSelectedProduct(null)}>Cancel</Button>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Quantity</Label>
                    <Input type="number" className="h-9 bg-white" value={entryQuantity} onChange={e => setEntryQuantity(e.target.value ? Number(e.target.value) : "")} autoFocus />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs font-bold text-slate-700">Discount (₹)</Label>
                    <Input type="number" className="h-9 bg-white" placeholder="0" value={entryDiscount} onChange={e => setEntryDiscount(e.target.value ? Number(e.target.value) : "")} />
                  </div>
                  <div className="space-y-1 flex flex-col justify-end">
                    <Button className="h-9 w-full bg-emerald-600 hover:bg-emerald-700 font-bold" onClick={addEntryToCart}>Add</Button>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 4. Modifiers (Discounts & Notes) */}
        <Card className="border-border shadow-sm rounded-2xl bg-white/80 backdrop-blur-md overflow-hidden transition-all hover:shadow-md">
          <CardHeader className="py-3 bg-gradient-to-r from-slate-50 to-white border-b border-border px-5">
            <CardTitle className="text-sm font-bold flex items-center gap-2 text-slate-800"><Percent className="w-4 h-4 text-primary"/> Bill Modifiers</CardTitle>
          </CardHeader>
          <CardContent className="p-4 space-y-4">
            
            {activeOffers.length > 0 && (
              <div className="space-y-2 bg-purple-50 p-3 rounded-lg border border-purple-100">
                <Label className="text-xs font-bold text-purple-800 flex items-center gap-1"><Gift className="w-3 h-3"/> Apply Offer</Label>
                <select 
                  className="flex h-9 w-full rounded-md border border-purple-200 bg-white px-3 py-1 text-sm font-semibold text-purple-900 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-purple-500"
                  value={selectedOfferId}
                  onChange={e => setSelectedOfferId(e.target.value)}
                >
                  <option value="NONE">No Offer Selected</option>
                  {activeOffers.map((offer: any) => (
                    <option key={offer.id} value={offer.id} disabled={subtotalAfterItemDiscounts < offer.minimumBill}>
                      {offer.title} - {offer.discountType === 'PERCENT' ? `${offer.discountValue}% OFF` : `₹${offer.discountValue} OFF`} 
                      {subtotalAfterItemDiscounts < offer.minimumBill ? ` (Min Bill: ₹${offer.minimumBill})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Global Discount</Label>
                <div className="flex items-center gap-1">
                  <div className="flex bg-slate-100 p-0.5 rounded-md border">
                    <Button variant={discountType === "FLAT" ? "default" : "ghost"} size="sm" className="h-7 text-[10px] font-bold px-2" onClick={() => setDiscountType("FLAT")} disabled={selectedOfferId !== "NONE"}>₹</Button>
                    <Button variant={discountType === "PERCENT" ? "default" : "ghost"} size="sm" className="h-7 text-[10px] font-bold px-2" onClick={() => setDiscountType("PERCENT")} disabled={selectedOfferId !== "NONE"}>%</Button>
                  </div>
                  <Input type="number" placeholder="0" className="h-8 text-sm" value={globalDiscountValue} onChange={(e) => setGlobalDiscountValue(e.target.value ? Number(e.target.value) : "")} disabled={selectedOfferId !== "NONE"} />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-bold text-slate-700">Addt. Charges (₹)</Label>
                <Input type="number" placeholder="0" className="h-8 text-sm" value={additionalCharges} onChange={(e) => setAdditionalCharges(e.target.value ? Number(e.target.value) : "")} />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-bold text-slate-700">Bill Notes (Prints on Invoice)</Label>
              <Input placeholder="e.g. Gift Packing, Deliver at 5PM..." className="h-8 text-sm" value={billNotes} onChange={(e) => setBillNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>

        {/* 5. Payment & Checkout */}
        <div className="mt-auto pt-2 space-y-3">
          {!isAdvanceOrder && (
            <div className="grid grid-cols-3 gap-2">
              <Button variant={paymentMethod === "CASH" ? "default" : "outline"} className={`h-14 flex flex-col gap-1 border-slate-300 rounded-xl transition-all ${paymentMethod === "CASH" ? "bg-slate-800 text-white border-transparent shadow-md scale-[1.02]" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setPaymentMethod("CASH")}>
                <Banknote className="h-5 w-5" /> <span className="text-[10px] font-bold uppercase tracking-wider">Cash</span>
              </Button>
              <Button variant={paymentMethod === "UPI" ? "default" : "outline"} className={`h-14 flex flex-col gap-1 border-slate-300 rounded-xl transition-all ${paymentMethod === "UPI" ? "bg-slate-800 text-white border-transparent shadow-md scale-[1.02]" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setPaymentMethod("UPI")}>
                <Smartphone className="h-5 w-5" /> <span className="text-[10px] font-bold uppercase tracking-wider">UPI</span>
              </Button>
              <Button variant={paymentMethod === "CARD" ? "default" : "outline"} className={`h-14 flex flex-col gap-1 border-slate-300 rounded-xl transition-all ${paymentMethod === "CARD" ? "bg-slate-800 text-white border-transparent shadow-md scale-[1.02]" : "text-slate-600 hover:bg-slate-50"}`} onClick={() => setPaymentMethod("CARD")}>
                <CreditCard className="h-5 w-5" /> <span className="text-[10px] font-bold uppercase tracking-wider">Card</span>
              </Button>
            </div>
          )}
          
          <Button 
            size="lg" 
            className={`w-full h-16 text-lg font-black shadow-xl rounded-2xl uppercase tracking-widest transition-all overflow-hidden relative group ${isAdvanceOrder ? "bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700" : "bg-gradient-to-r from-primary to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white"}`}
            disabled={cart.length === 0 || generateBillMutation.isPending}
            onClick={handleGenerateBill}
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative z-10">{generateBillMutation.isPending ? "Processing..." : isAdvanceOrder ? "Save Advance Order" : "Generate Bill"}</span>
          </Button>
        </div>

      </div>

      {/* ================================================================= */}
      {/* CENTER COLUMN: LIVE CART */}
      {/* ================================================================= */}
      <Card className={`w-full ${customer ? 'lg:col-span-4 xl:col-span-5' : 'lg:col-span-6 xl:col-span-7'} flex flex-col border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-white/90 backdrop-blur-md lg:overflow-hidden`}>
        <CardHeader className="py-4 bg-gradient-to-r from-slate-50 to-white border-b border-border px-5 shrink-0">
          <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 tracking-wide">
            <span className="flex items-center gap-2"><Receipt className="h-5 w-5 text-primary"/> Order Items</span>
            <Badge variant="secondary" className="font-bold bg-primary/10 text-primary border border-primary/20">{cart.length} Items</Badge>
          </CardTitle>
        </CardHeader>
        
        <ScrollArea className="flex-1">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-muted-foreground opacity-50">
              <Receipt className="w-16 h-16 mb-4 stroke-[1.5]" />
              <p className="font-medium text-sm">Cart is empty</p>
              <p className="text-xs mt-1">Use the left panel to add products.</p>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-slate-100">
              {cart.map((item, index) => (
                <div key={item.product.id} className="p-3 bg-white hover:bg-slate-50 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-2">
                      <span className="text-xs font-bold text-slate-400 mt-0.5">{index + 1}.</span>
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{item.product.name}</h4>
                        <p className="text-[10px] font-semibold text-slate-500 mt-0.5">₹{item.product.price} / {item.product.unit}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {item.discount > 0 && <div className="text-[10px] text-rose-500 font-bold">-₹{item.discount.toFixed(2)}</div>}
                      <div className="font-black text-sm text-slate-800">
                        ₹{((item.product.price * item.quantity) - item.discount).toFixed(2)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pl-5">
                    <div className="flex items-center bg-slate-100 rounded border border-slate-200">
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none hover:bg-slate-200" onClick={() => editCartItemQuantity(item.product.id, -1)}><Minus className="h-3 w-3" /></Button>
                      <span className="w-8 text-center text-xs font-bold text-slate-700">{item.quantity}</span>
                      <Button variant="ghost" size="icon" className="h-6 w-6 rounded-none hover:bg-slate-200" onClick={() => editCartItemQuantity(item.product.id, 1)}><Plus className="h-3 w-3" /></Button>
                    </div>
                    <Button variant="ghost" size="sm" className="h-6 text-[10px] text-rose-500 hover:text-rose-700 hover:bg-rose-50 px-2" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 className="h-3 w-3 mr-1" /> Remove
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Live Cart Bottom Summary */}
        <div className="bg-slate-900 text-white p-5 shrink-0 shadow-[0_-10px_40px_-10px_rgba(0,0,0,0.3)] z-10 relative overflow-hidden rounded-b-2xl">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
          <div className="space-y-1.5 mb-4 relative z-10">
            <div className="flex justify-between text-slate-400 text-xs"><span>Subtotal</span><span className="font-medium text-slate-200">₹{rawSubtotal.toFixed(2)}</span></div>
            {totalItemDiscount > 0 && <div className="flex justify-between text-rose-300 text-xs"><span>Item Discounts</span><span className="font-medium">-₹{totalItemDiscount.toFixed(2)}</span></div>}
            {calculatedGlobalDiscount > 0 && <div className="flex justify-between text-amber-300 text-xs font-bold"><span>Global Discount</span><span>-₹{calculatedGlobalDiscount.toFixed(2)}</span></div>}
            <div className="flex justify-between text-slate-400 text-xs"><span>GST Taxes</span><span className="font-medium text-slate-200">₹{totalGst.toFixed(2)}</span></div>
            {charges > 0 && <div className="flex justify-between text-slate-400 text-xs"><span>Addt. Charges</span><span className="font-medium text-slate-200">+₹{charges.toFixed(2)}</span></div>}
            {fulfillmentAdvancePaid > 0 && <div className="flex justify-between text-emerald-300 text-xs font-bold mt-1 pt-1 border-t border-slate-700"><span>Advance Already Paid</span><span>-₹{fulfillmentAdvancePaid.toFixed(2)}</span></div>}
          </div>
          <div className="flex justify-between items-end pt-4 border-t border-white/10 relative z-10">
            <span className="font-bold text-slate-300 text-sm uppercase tracking-widest">Grand Total</span>
            <span className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-200 tracking-tighter leading-none">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </Card>

      {/* ================================================================= */}
      {/* RIGHT COLUMN: LIVE CRM */}
      {/* ================================================================= */}
      {customer && (
        <Card className="w-full lg:col-span-3 flex flex-col border-border shadow-[0_8px_30px_rgb(0,0,0,0.04)] rounded-2xl bg-white/90 backdrop-blur-md lg:overflow-hidden relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl pointer-events-none"></div>
          <CardHeader className="py-4 bg-gradient-to-r from-slate-50 to-white border-b border-border px-5 shrink-0 z-10">
            <CardTitle className="text-sm font-bold flex items-center justify-between text-slate-800 tracking-wide">
              <span className="flex items-center gap-2"><User className="h-5 w-5 text-accent"/> CRM Profile</span>
            </CardTitle>
          </CardHeader>
          
          <ScrollArea className="flex-1">
            <div className="p-4 space-y-6">
              
              {/* Header */}
              <div className="text-center space-y-1">
                <div className="mx-auto w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-2 shadow-inner border border-slate-200">
                  <User className="w-6 h-6 text-slate-400" />
                </div>
                <h3 className="font-black text-lg text-slate-800 leading-tight">{customer.name}</h3>
                <p className="text-xs font-bold text-slate-500">{customer.phone}</p>
                <div className="mt-2 flex justify-center">
                  <VIPBadge level={customer.vipLevel || "NONE"} />
                </div>
              </div>

              {/* VIP Progress Info */}
              {nextTier ? (
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 p-3 rounded-lg text-center shadow-inner">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Path to {nextTier.name}</p>
                  <p className="text-xs text-slate-700">Need <span className="font-bold text-emerald-600">₹{nextTier.spendNeeded.toFixed(0)}</span> or <span className="font-bold text-blue-600">{nextTier.visitsNeeded} visits</span></p>
                </div>
              ) : (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 p-3 rounded-lg text-center shadow-inner">
                  <p className="text-xs font-black uppercase tracking-wider text-purple-700">👑 Highest Tier Reached</p>
                </div>
              )}

              {/* Core Stats */}
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-emerald-50 border border-emerald-100 p-2.5 rounded-lg text-center">
                  <p className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider mb-0.5">Lifetime Spent</p>
                  <p className="text-sm font-black text-emerald-700">₹{customer.totalSpending.toFixed(2)}</p>
                </div>
                <div className="bg-blue-50 border border-blue-100 p-2.5 rounded-lg text-center">
                  <p className="text-[9px] font-bold text-blue-800 uppercase tracking-wider mb-0.5">Total Visits</p>
                  <p className="text-sm font-black text-blue-700">{customer.totalVisits}</p>
                </div>
              </div>

              {/* Mini Details Table */}
              <div className="bg-slate-50 rounded-lg border p-3 space-y-2">
                <div className="flex justify-between text-xs"><span className="text-slate-500 font-semibold">Avg Bill</span><span className="font-bold text-slate-800">₹{customer.averageBill.toFixed(2)}</span></div>
                <Separator />
                <div className="flex justify-between text-xs"><span className="text-slate-500 font-semibold">Loyalty Pts</span><span className="font-bold text-emerald-600">{customer.loyaltyPoints}</span></div>
                <Separator />
                <div className="flex justify-between text-xs"><span className="text-slate-500 font-semibold">Birthday</span><span className="font-bold text-slate-800">{customer.birthday ? new Date(customer.birthday).toLocaleDateString() : 'N/A'}</span></div>
                <Separator />
                <div className="flex justify-between text-xs"><span className="text-slate-500 font-semibold">Anniversary</span><span className="font-bold text-slate-800">{customer.anniversary ? new Date(customer.anniversary).toLocaleDateString() : 'N/A'}</span></div>
              </div>

              {/* Notes Section */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1 uppercase tracking-wider"><MessageSquare className="w-3 h-3 text-slate-400"/> CRM Notes</h4>
                <div className="flex gap-2 mb-3">
                  <Input placeholder="Type note..." className="h-7 text-xs bg-slate-50" value={newNote} onChange={(e) => setNewNote(e.target.value)}/>
                  <Button size="sm" className="h-7 text-[10px] px-2 font-bold" disabled={!newNote || addNoteMutation.isPending} onClick={() => addNoteMutation.mutate({ id: customer.id, note: newNote })}>Add</Button>
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {(!customer.notes || customer.notes.length === 0) ? (
                    <p className="text-[10px] text-slate-400 font-medium italic text-center py-2">No notes added.</p>
                  ) : (
                    customer.notes.map((note: any) => (
                      <div key={note.id} className="bg-amber-50/50 border border-amber-200 p-2 rounded-md">
                        <p className="text-amber-900 font-medium text-[11px] leading-tight">{note.note}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <h4 className="text-xs font-bold text-slate-800 mb-3 flex items-center gap-1 uppercase tracking-wider"><History className="w-3 h-3 text-slate-400"/> Recent Visits</h4>
                {invoices.length === 0 ? (
                  <p className="text-[10px] text-slate-400 font-medium italic text-center py-2">No past visits.</p>
                ) : (
                  <div className="space-y-3 border-l-2 border-slate-100 ml-1.5 pl-3">
                    {invoices.slice(0, 5).map((inv: any) => (
                      <div key={inv.id} className="relative">
                        <div className="absolute -left-[17px] top-1 w-2 h-2 rounded-full bg-slate-300 ring-2 ring-white" />
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-[10px] font-bold text-slate-600">{new Date(inv.createdAt).toLocaleDateString()}</p>
                            <p className="text-[9px] text-slate-400">{inv.items.length} items</p>
                          </div>
                          <span className="text-[10px] font-black text-emerald-600">₹{inv.grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </ScrollArea>
        </Card>
      )}

    </div>
    <ThermalReceipt invoice={latestInvoice} />
    </>
  );
}
