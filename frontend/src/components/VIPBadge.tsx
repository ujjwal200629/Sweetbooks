import { Badge } from "@/components/ui/badge";

export const VIPBadge = ({ level, showLabel = true, className = "" }: { level: string, showLabel?: boolean, className?: string }) => {
  if (level === "DIAMOND") return <Badge className={`bg-gradient-to-r from-purple-600 to-fuchsia-500 hover:from-purple-700 hover:to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)] whitespace-nowrap border-none font-bold uppercase tracking-wider ${className}`}>👑 {showLabel && "Diamond"}</Badge>;
  if (level === "PLATINUM") return <Badge className={`bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)] whitespace-nowrap border-none font-bold uppercase tracking-wider ${className}`}>💎 {showLabel && "Platinum"}</Badge>;
  if (level === "GOLD") return <Badge className={`bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 shadow-[0_0_15px_rgba(251,191,36,0.4)] whitespace-nowrap border-none font-bold uppercase tracking-wider ${className}`}>⭐ {showLabel && "Gold"}</Badge>;
  return showLabel ? <Badge variant="outline" className={`text-slate-500 font-bold border-slate-300 bg-slate-100/50 shadow-sm whitespace-nowrap uppercase tracking-wider ${className}`}>Regular</Badge> : null;
};
