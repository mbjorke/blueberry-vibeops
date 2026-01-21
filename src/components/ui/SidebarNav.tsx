import { Home, CreditCard, Repeat, PiggyBank, Receipt, Users, Gift, BarChart2, Menu, X } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useState } from "react";
import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";

const navItems = [
  { label: "Home", icon: Home, to: "/dashboard" },
  { label: "Cards", icon: CreditCard, to: "/cards" },
  { label: "Transfers", icon: Repeat, to: "/transfers" },
  { label: "Treasury", icon: PiggyBank, to: "/treasury" },
  { label: "Expenses", icon: Receipt, to: "/expenses" },
  { label: "Team", icon: Users, to: "/team" },
  { label: "Rewards", icon: Gift, to: "/rewards" },
  { label: "Analytics", icon: BarChart2, to: "/analytics" },
];

interface SidebarNavProps {
  isOpen?: boolean;
  onToggle?: (open: boolean) => void;
}

export function SidebarNav({ isOpen = false, onToggle }: SidebarNavProps) {
  const location = useLocation();

  const closeSidebar = () => {
    onToggle?.(false);
  };

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-40 bg-background/90 backdrop-blur-lg flex flex-col py-6 px-2 text-foreground transition-transform duration-300 ease-in-out",
        "w-64 lg:w-56 flex-shrink-0",
        "lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile Close Button */}
        <div className="lg:hidden flex justify-end mb-4">
          <button
            onClick={closeSidebar}
            className="p-2 rounded-md hover:bg-accent/10 transition-colors"
            aria-label="Close navigation menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1">
          <ul className="space-y-1">
            {navItems.map(({ label, icon: Icon, to }) => (
              <li key={label}>
                <Link
                  to={to}
                  onClick={closeSidebar}
                  className={cn(
                    "flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-colors",
                    "min-h-[44px] touch-manipulation", // Better touch target
                    location.pathname === to 
                      ? "bg-card/10 text-foreground" 
                      : "text-foreground/70 hover:bg-card/5 hover:text-foreground"
                  )}
                >
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                  <span className="truncate">{label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Mobile Footer */}
        <div className="lg:hidden mt-auto pb-6">
          <div className="px-3 py-2 text-xs text-muted-foreground">
            Fintech Spark Studio v1.0
          </div>
        </div>
      </aside>
    </>
  );
}
