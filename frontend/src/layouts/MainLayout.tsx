import { Link, Outlet, useLocation } from "react-router";
import { LayoutDashboard, Receipt, Package, Users, Settings, CalendarClock, Menu, Percent, FileText, Bell, Search, Star } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function MainLayout() {
  const location = useLocation();
  const [greeting, setGreeting] = useState("");
  const [currentDate, setCurrentDate] = useState("");

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting("Good Morning");
    else if (hour < 18) setGreeting("Good Afternoon");
    else setGreeting("Good Evening");

    setCurrentDate(new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }));
  }, []);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Billing", href: "/billing", icon: Receipt },
    { name: "Products", href: "/products", icon: Package },
    { name: "Customers", href: "/customers", icon: Users },
    { name: "Advance Orders", href: "/advance-orders", icon: CalendarClock },
    { name: "Offers", href: "/offers", icon: Percent },
    { name: "Reports", href: "/reports", icon: FileText },
    { name: "Settings", href: "/settings", icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden font-sans">
      
      {/* Desktop Sidebar - Floating style */}
      <aside className="w-[280px] hidden md:flex flex-col p-4 z-20">
        <div className="bg-card h-full w-full rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-border flex flex-col overflow-hidden">
          
          {/* Logo Area */}
          <div className="h-20 flex items-center px-6 shrink-0 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="flex items-center gap-3 relative z-10">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg shadow-primary/20 text-white">
                <Star className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-xl tracking-tight text-foreground leading-none">Sweetbook</span>
                <span className="text-[10px] uppercase tracking-widest text-accent font-bold mt-1">Premium POS</span>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
            {navItems.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className="relative px-4 py-3 rounded-xl transition-all duration-300 group flex items-center gap-3"
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-primary/10 rounded-xl border border-primary/20"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-1/2 bg-accent rounded-r-full"
                      initial={false}
                      transition={{ type: "spring", stiffness: 500, damping: 35 }}
                    />
                  )}
                  
                  <item.icon className={`w-5 h-5 relative z-10 transition-colors ${isActive ? "text-primary fill-primary/20" : "text-muted-foreground group-hover:text-primary"}`} />
                  <span className={`relative z-10 font-semibold text-sm transition-colors ${isActive ? "text-primary" : "text-foreground group-hover:text-primary"}`}>
                    {item.name}
                  </span>
                </Link>
              );
            })}
          </nav>
          
          {/* User Profile Area */}
          <div className="p-4 m-3 mt-auto bg-slate-50 rounded-xl border border-border">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent to-amber-600 flex items-center justify-center text-white font-black shadow-md">
                O
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-foreground">Owner</span>
                <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Admin</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* Background decorative elements */}
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-primary/[0.02] rounded-full blur-3xl -mr-[400px] -mt-[400px] pointer-events-none"></div>
        
        {/* Top Navbar */}
        <header className="h-20 shrink-0 flex items-center justify-between px-6 lg:px-8 z-10">
          {/* Mobile toggle & Logo */}
          <div className="flex items-center md:hidden">
            <Sheet>
              <SheetTrigger className="p-2 -ml-2 rounded-xl bg-card shadow-sm border border-border mr-3">
                <Menu className="w-5 h-5" />
              </SheetTrigger>
              <SheetContent side="left" className="w-[280px] p-4 bg-background">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="bg-card h-full w-full rounded-2xl shadow-sm border border-border flex flex-col overflow-hidden">
                  <div className="h-20 flex items-center px-6 shrink-0 relative overflow-hidden">
                    <div className="flex items-center gap-3 relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-emerald-700 flex items-center justify-center shadow-lg text-white">
                        <Star className="w-5 h-5 fill-current" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-xl tracking-tight leading-none">Sweetbook</span>
                      </div>
                    </div>
                  </div>
                  <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto">
                    {navItems.map((item) => {
                      const isActive = location.pathname === item.href;
                      return (
                        <Link key={item.name} to={item.href} className={`relative px-4 py-3 rounded-xl flex items-center gap-3 ${isActive ? 'bg-primary/10 border border-primary/20' : ''}`}>
                          <item.icon className={`w-5 h-5 ${isActive ? "text-primary fill-primary/20" : "text-muted-foreground"}`} />
                          <span className={`font-semibold text-sm ${isActive ? "text-primary" : "text-foreground"}`}>{item.name}</span>
                        </Link>
                      );
                    })}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="hidden md:flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{greeting}, Ujjwal 👋</h1>
            <p className="text-xs text-muted-foreground font-medium">{currentDate}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center relative">
              <Search className="w-4 h-4 absolute left-3 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search anything..." 
                className="h-10 pl-9 pr-4 rounded-full bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-64 shadow-sm"
              />
            </div>
            
            <button className="w-10 h-10 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary/50 transition-all shadow-sm relative">
              <Bell className="w-4 h-4" />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
            </button>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden z-10 px-4 md:px-6 lg:px-8 pb-8 relative">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
