

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { User } from "@/api/entities";
import { 
  LayoutDashboard, 
  CreditCard, 
  Receipt, 
  FolderTree, 
  Settings,
  Target,
  TrendingUp,
  Wallet,
  BrainCircuit,
  ClipboardCheck,
  Repeat,
  PiggyBank,
  FilePieChart,
  TrendingDown, // New icon for debt management
  Zap // New icon for insights
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

import UserMenu from "./components/layout/UserMenu";

const navigationItems = [
  {
    title: "Dashboard",
    url: createPageUrl("Dashboard"),
    icon: LayoutDashboard,
  },
  {
    title: "Accounts",
    url: createPageUrl("Accounts"),
    icon: CreditCard,
  },
  {
    title: "Transactions", 
    url: createPageUrl("Transactions"),
    icon: Receipt,
  },
  {
    title: "Budget",
    url: createPageUrl("Budget"),
    icon: PiggyBank,
  },
  {
    title: "Reports",
    url: createPageUrl("Reports"),
    icon: FilePieChart,
  },
  {
    title: "Categories",
    url: createPageUrl("Categories"),
    icon: FolderTree,
  },
  {
    title: "Recurring",
    url: createPageUrl("Recurring"),
    icon: Repeat,
  },
  {
    title: "Reconciliation",
    url: createPageUrl("Reconciliation"),
    icon: ClipboardCheck,
  },
  {
    title: "Goals",
    url: createPageUrl("Goals"),
    icon: Target,
  },
  {
    title: "Debt Payoff", // New navigation item
    url: createPageUrl("DebtPayoff"),
    icon: TrendingDown,
  },
  {
    title: "Insights", // New navigation item
    url: createPageUrl("Insights"),
    icon: Zap,
  },
  {
    title: "Forecast",
    url: createPageUrl("Forecast"),
    icon: BrainCircuit,
  },
  {
    title: "Settings",
    url: createPageUrl("Settings"),
    icon: Settings,
  },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const [theme, setTheme] = useState('system');

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  useEffect(() => {
    const loadUserTheme = async () => {
      try {
        const user = await User.me();
        if (user && user.theme) {
          setTheme(user.theme);
        }
      } catch (error) {
        console.warn("Could not load user theme, using system default.");
      }
    };
    loadUserTheme();
  }, []);

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.remove('light', 'dark');
      root.classList.add(systemTheme);
    } else {
      root.classList.remove('light', 'dark');
      root.classList.add(theme);
    }
  }, [theme]);


  return (
    <SidebarProvider>
      <style>{`
        :root {
          --background: 0 0% 100%;
          --foreground: 240 10% 3.9%;
          --card: 0 0% 100%;
          --card-foreground: 240 10% 3.9%;
          --popover: 0 0% 100%;
          --popover-foreground: 240 10% 3.9%;
          --primary: 250 90% 60%;
          --primary-foreground: 0 0% 100%;
          --secondary: 240 4.8% 95.9%;
          --secondary-foreground: 240 5.9% 10%;
          --muted: 240 4.8% 95.9%;
          --muted-foreground: 240 3.8% 46.1%;
          --accent: 240 4.8% 95.9%;
          --accent-foreground: 240 5.9% 10%;
          --destructive: 0 84.2% 60.2%;
          --destructive-foreground: 0 0% 98%;
          --border: 240 5.9% 90%;
          --input: 240 5.9% 90%;
          --ring: 250 90% 60%;
        }
        
        .dark {
          --background: 222 47% 11%;
          --foreground: 210 40% 98%;
          --card: 222 47% 14%;
          --card-foreground: 210 40% 98%;
          --popover: 222 47% 11%;
          --popover-foreground: 210 40% 98%;
          --primary: 250 80% 65%;
          --primary-foreground: 210 40% 98%;
          --secondary: 217 33% 20%;
          --secondary-foreground: 210 40% 98%;
          --muted: 217 33% 20%;
          --muted-foreground: 215 20% 65%;
          --accent: 217 33% 20%;
          --accent-foreground: 210 40% 98%;
          --destructive: 0 63% 50%;
          --destructive-foreground: 210 40% 98%;
          --border: 215 28% 25%;
          --input: 215 28% 25%;
          --ring: 250 80% 65%;
        }

        body {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          background: hsl(var(--background));
          color: hsl(var(--foreground));
        }
        
        .glass-effect {
          background: hsla(var(--card), 0.8);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid hsla(var(--border), 0.5);
        }

        /* Dark Mode Overrides for common light theme classes */

        /* Backgrounds */
        .dark .bg-white { background-color: hsl(var(--card)); }
        .dark .bg-white\\/80 { background-color: hsla(var(--card), 0.8); }
        .dark .bg-white\\/60 { background-color: hsla(var(--card), 0.6); }

        .dark .bg-slate-50 { background-color: hsl(var(--card)); }
        .dark .bg-slate-100 { background-color: hsl(var(--accent)); }
        .dark .bg-slate-200 { background-color: hsl(var(--accent)); }
        .dark .bg-slate-50\\/50 { background-color: hsla(var(--card), 0.5); }
        .dark .bg-slate-50\\/70 { background-color: hsla(var(--accent), 0.7); }

        .dark .bg-gray-50 { background-color: hsl(var(--card)); }
        .dark .bg-gray-100 { background-color: hsl(var(--accent)); }
        .dark .bg-gray-200 { background-color: hsl(var(--accent)); }
        .dark .bg-gray-300 { background-color: hsl(var(--accent)); }
        .dark .bg-gray-50\\/50 { background-color: hsla(var(--card), 0.5); }
        .dark .bg-gray-100\\/50 { background-color: hsla(var(--accent), 0.5); }
        
        /* Colored Status Backgrounds */
        .dark .bg-red-50 { background-color: hsla(0, 60%, 20%, 0.5); }
        .dark .bg-red-50\\/50 { background-color: hsla(0, 60%, 15%, 0.4); }
        .dark .bg-red-100 { background-color: hsla(0, 60%, 15%, 0.7); }
        .dark .bg-green-50 { background-color: hsla(120, 60%, 20%, 0.5); }
        .dark .bg-blue-50 { background-color: hsla(220, 60%, 20%, 0.5); }
        .dark .bg-emerald-50 { background-color: hsla(155, 60%, 20%, 0.5); }
        .dark .bg-emerald-100 { background-color: hsla(155, 60%, 15%, 0.7); }
        .dark .bg-yellow-50 { background-color: hsla(45, 60%, 20%, 0.5); }
        .dark .bg-purple-50 { background-color: hsla(270, 60%, 20%, 0.5); }
        .dark .bg-indigo-50 { background-color: hsla(240, 60%, 20%, 0.5); }
        .dark .bg-orange-50 { background-color: hsla(30, 60%, 20%, 0.5); }
        .dark .bg-pink-50 { background-color: hsla(330, 60%, 20%, 0.5); }
        .dark .bg-cyan-50 { background-color: hsla(180, 60%, 20%, 0.5); }
        .dark .bg-amber-50 { background-color: hsla(45, 60%, 20%, 0.5); }
        .dark .bg-amber-50\\/50 { background-color: hsla(45, 60%, 15%, 0.4); }
        
        /* Text Colors */
        .dark .text-slate-900 { color: hsl(var(--card-foreground)); }
        .dark .text-slate-800 { color: hsl(var(--card-foreground)); }
        .dark .text-slate-700 { color: hsl(var(--muted-foreground)); }
        .dark .text-slate-600 { color: hsl(var(--muted-foreground)); }
        .dark .text-slate-500 { color: hsl(var(--muted-foreground)); }
        .dark .text-slate-400 { color: hsl(var(--muted-foreground)); }
        .dark .text-slate-300 { color: hsl(var(--border)); }

        .dark .text-gray-900 { color: hsl(var(--foreground)); }
        .dark .text-gray-800 { color: hsl(var(--card-foreground)); }
        .dark .text-gray-700 { color: hsl(var(--muted-foreground)); }
        .dark .text-gray-600 { color: hsl(var(--muted-foreground)); }
        .dark .text-gray-500 { color: hsl(var(--muted-foreground)); }
        .dark .text-gray-400 { color: hsl(var(--muted-foreground)); }
        .dark .text-gray-300 { color: hsl(var(--border)); }

        .dark .text-red-600, .dark .text-red-700, .dark .text-red-800 { color: hsl(0, 80%, 80%); }
        .dark .text-amber-800, .dark .text-amber-900 { color: hsl(45, 80%, 80%); }
        .dark .text-emerald-600, .dark .text-emerald-700, .dark .text-emerald-800 { color: hsl(155, 65%, 80%); }
        .dark .text-blue-600, .dark .text-blue-700, .dark .text-blue-800, .dark .text-blue-900 { color: hsl(220, 80%, 85%); }
        .dark .text-purple-600, .dark .text-purple-700, .dark .text-purple-800 { color: hsl(270, 80%, 85%); }


        /* Borders */
        .dark .border-slate-100 { border-color: hsl(var(--border)); }
        .dark .border-slate-200 { border-color: hsl(var(--border)); }
        .dark .border-slate-300 { border-color: hsl(var(--border)); }
        
        .dark .border-gray-100 { border-color: hsla(var(--border), 0.5); }
        .dark .border-gray-200 { border-color: hsl(var(--border)); }
        .dark .border-gray-300 { border-color: hsl(var(--border)); }
        .dark .border-gray-200\\/60 { border-color: hsla(var(--border), 0.6); }

        /* Colored Status Borders */
        .dark .border-red-100, .dark .border-red-200, .dark .border-red-300 { border-color: hsla(0, 60%, 35%, 0.6); }
        .dark .border-green-100, .dark .border-green-200 { border-color: hsla(120, 60%, 35%, 0.6); }
        .dark .border-blue-100, .dark .border-blue-200 { border-color: hsla(220, 60%, 35%, 0.6); }
        .dark .border-emerald-100, .dark .border-emerald-200 { border-color: hsla(155, 60%, 35%, 0.6); }
        .dark .border-yellow-100 { border-color: hsla(45, 60%, 35%, 0.4); }
        .dark .border-purple-100 { border-color: hsla(270, 60%, 35%, 0.4); }
        .dark .border-indigo-100 { border-color: hsla(240, 60%, 35%, 0.4); }
        .dark .border-orange-100 { border-color: hsla(30, 60%, 35%, 0.4); }
        .dark .border-pink-100 { border-color: hsla(330, 60%, 35%, 0.4); }
        .dark .border-cyan-100 { border-color: hsla(180, 60%, 35%, 0.4); }
        .dark .border-amber-100, .dark .border-amber-200, .dark .border-amber-300 { border-color: hsla(45, 60%, 35%, 0.6); }

        /* Hover Backgrounds */
        .dark .hover\\:bg-slate-50:hover { background-color: hsl(var(--accent)); }
        .dark .hover\\:bg-slate-100:hover { background-color: hsl(var(--accent)); }
        
        .dark .hover\\:bg-gray-50:hover { background-color: hsl(var(--accent)); }
        .dark .hover\\:bg-gray-100:hover { background-color: hsl(var(--accent)); }
        .dark .hover\\:bg-gray-50\\/80:hover { background-color: hsla(var(--accent), 0.8); }
        .dark .hover\\:bg-amber-100\\/50:hover { background-color: hsla(45, 60%, 25%, 0.4); }

        /* Hover Borders */
        .dark .hover\\:border-gray-200:hover { border-color: hsla(var(--border), 0.8); }

        /* Hover Text Colors */
        .dark .hover\\:text-gray-900:hover { color: hsl(var(--foreground)); }


        /* Specific/Component-level Overrides */
        .dark .bg-card { background-color: hsl(var(--card)); }
        .dark .text-card-foreground { color: hsl(var(--card-foreground)); }
        .dark .bg-popover { background-color: hsl(var(--popover)); }
        .dark .text-popover-foreground { color: hsl(var(--popover-foreground)); }
        
        /* Gradient Overrides - Kept for compatibility with specific gradient classes */
        .dark .from-slate-50 { --tw-gradient-from: hsl(var(--background)); --tw-gradient-to: hsl(var(--background)); }
        .dark .to-slate-100 { --tw-gradient-to: hsl(var(--background)); }
        .dark .bg-gradient-to-br.from-indigo-500.to-purple-600 {
            --tw-gradient-from: hsl(var(--primary));
            --tw-gradient-to: #a855f7; /* Approx HSL(264, 89%, 65%) */
        }
        .dark .from-indigo-50 { --tw-gradient-from: hsla(var(--primary), 0.1); }
        .dark .to-purple-50 { --tw-gradient-to: hsla(259, 94%, 60%, 0.1); }
        .dark .text-indigo-700 { color: hsl(var(--primary)); }
        .dark .border-indigo-200 { border-color: hsla(var(--primary), 0.3); }
      `}</style>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar className="border-r border-border/60 glass-effect">
          <SidebarHeader className="border-b border-border/50 px-6 py-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 2L2 7L12 12L22 7L12 2Z"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 17L12 22L22 17"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M2 12L12 17L22 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <div>
                <h2 className="font-bold text-foreground text-base">LuminaFinance</h2>
                <p className="text-xs text-muted-foreground font-medium">Personal Finance</p>
              </div>
            </div>
          </SidebarHeader>
          
          <SidebarContent className="px-4 py-6">
            <SidebarGroup>
              <SidebarGroupLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-2 mb-3">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        className={`transition-all duration-200 rounded-xl px-3 py-3 ${
                          location.pathname === item.url 
                            ? 'bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-700 font-semibold border border-indigo-200 shadow-sm' 
                            : 'hover:bg-accent/80 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/80'
                        }`}
                      >
                        <Link to={item.url} className="flex items-center gap-3">
                          <item.icon className="w-4 h-4 shrink-0" />
                          <span className="font-medium text-sm">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter className="border-t border-border/50 p-4">
            <UserMenu onThemeChange={handleThemeChange} />
          </SidebarFooter>
        </Sidebar>

        <main className="flex-1 flex flex-col min-w-0">
          <header className="glass-effect border-b border-border/50 px-6 py-4 md:hidden">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="hover:bg-accent p-2 rounded-lg transition-colors duration-200" />
              <h1 className="text-lg font-semibold text-foreground">LuminaFinance</h1>
            </div>
          </header>

          <div className="flex-1 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}

