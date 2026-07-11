import { useState, useMemo } from "react";
import { FileText, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import SalesReport from "../components/reports/SalesReport";
import ProductReport from "../components/reports/ProductReport";
import CustomerReport from "../components/reports/CustomerReport";
import VipReport from "../components/reports/VipReport";
import InventoryReport from "../components/reports/InventoryReport";
import PaymentReport from "../components/reports/PaymentReport";
import GstReport from "../components/reports/GstReport";

type DateRangeType = "TODAY" | "THIS_WEEK" | "THIS_MONTH" | "THIS_YEAR" | "CUSTOM";

export default function Reports() {
  const [rangeType, setRangeType] = useState<DateRangeType>("THIS_MONTH");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const dates = useMemo(() => {
    const now = new Date();
    let start = new Date(now);
    let end = new Date(now);
    let prevStart = new Date(now);
    let prevEnd = new Date(now);

    start.setHours(0,0,0,0);
    end.setHours(23,59,59,999);

    if (rangeType === "TODAY") {
      prevStart.setDate(prevStart.getDate() - 1);
      prevStart.setHours(0,0,0,0);
      prevEnd.setDate(prevEnd.getDate() - 1);
      prevEnd.setHours(23,59,59,999);
    } else if (rangeType === "THIS_WEEK") {
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      start = new Date(start.setDate(diff));
      
      prevStart = new Date(start);
      prevStart.setDate(prevStart.getDate() - 7);
      prevEnd = new Date(start);
      prevEnd.setDate(prevEnd.getDate() - 1);
      prevEnd.setHours(23,59,59,999);
    } else if (rangeType === "THIS_MONTH") {
      start.setDate(1);
      
      prevStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      prevEnd = new Date(now.getFullYear(), now.getMonth(), 0);
      prevEnd.setHours(23,59,59,999);
    } else if (rangeType === "THIS_YEAR") {
      start = new Date(now.getFullYear(), 0, 1);
      
      prevStart = new Date(now.getFullYear() - 1, 0, 1);
      prevEnd = new Date(now.getFullYear() - 1, 11, 31);
      prevEnd.setHours(23,59,59,999);
    } else if (rangeType === "CUSTOM") {
      start = customStart ? new Date(customStart) : start;
      end = customEnd ? new Date(customEnd) : end;
      end.setHours(23,59,59,999);
      // For custom, prev period can be same duration before start
      const diffTime = Math.abs(end.getTime() - start.getTime());
      prevEnd = new Date(start.getTime() - 1);
      prevStart = new Date(prevEnd.getTime() - diffTime);
    }

    return { start, end, prevStart, prevEnd };
  }, [rangeType, customStart, customEnd]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-12">
      {/* Header and Filters */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl shadow-sm border print:hidden">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 text-slate-800">
            <FileText className="w-8 h-8 text-blue-600"/> Business Reports
          </h1>
          <p className="text-slate-500 text-sm">Comprehensive historical analytics & insights</p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex items-center bg-slate-100 p-1 rounded-lg">
            <Button variant={rangeType === "TODAY" ? "default" : "ghost"} size="sm" onClick={() => setRangeType("TODAY")}>Today</Button>
            <Button variant={rangeType === "THIS_WEEK" ? "default" : "ghost"} size="sm" onClick={() => setRangeType("THIS_WEEK")}>This Week</Button>
            <Button variant={rangeType === "THIS_MONTH" ? "default" : "ghost"} size="sm" onClick={() => setRangeType("THIS_MONTH")}>This Month</Button>
            <Button variant={rangeType === "THIS_YEAR" ? "default" : "ghost"} size="sm" onClick={() => setRangeType("THIS_YEAR")}>This Year</Button>
            <Button variant={rangeType === "CUSTOM" ? "default" : "ghost"} size="sm" onClick={() => setRangeType("CUSTOM")}>Custom</Button>
          </div>
          
          {rangeType === "CUSTOM" && (
            <div className="flex items-center gap-2">
              <Input type="date" className="h-9 w-36" value={customStart} onChange={e => setCustomStart(e.target.value)} />
              <span className="text-slate-400">-</span>
              <Input type="date" className="h-9 w-36" value={customEnd} onChange={e => setCustomEnd(e.target.value)} />
            </div>
          )}

          <div className="flex items-center gap-2 pl-4 border-l">
            <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2"><Printer className="w-4 h-4"/> Print</Button>
          </div>
        </div>
      </div>

      <div className="print:block hidden text-center mb-8">
        <h1 className="text-2xl font-bold">Business Report</h1>
        <p className="text-slate-500">{dates.start.toLocaleDateString()} to {dates.end.toLocaleDateString()}</p>
      </div>

      <div className="space-y-12">
        {/* We pass the calculated dates to each report component */}
        <SalesReport dates={dates} />
        
        <ProductReport dates={dates} />
        
        <CustomerReport dates={dates} />
        
        <VipReport dates={dates} />
        
        <InventoryReport dates={dates} />
        
        <PaymentReport dates={dates} />
        
        <GstReport dates={dates} />
      </div>
    </div>
  );
}
