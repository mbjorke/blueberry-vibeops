import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Sidebar, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Home, CreditCard, Repeat, PiggyBank, Receipt, Users, Gift, BarChart2, Search, Bell, Settings, LogOut, ChevronDown, Plus, CreditCard as CardIcon, Wallet, Banknote, ArrowUpDown, Clock, HelpCircle, MessageSquare, Menu, Coffee, ShoppingBag, DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

const meta: Meta<typeof Sidebar> = {
  title: "Navigation/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div className="flex h-screen">
        <Story />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
            <p className="text-muted-foreground mb-8">
              This is the main content area. The sidebar can be toggled using the menu button in the header or with the keyboard shortcut <kbd className="px-2 py-1 bg-muted rounded-md text-xs">⌘B</kbd>.
            </p>
            <div className="grid gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <h3 className="font-medium mb-2">Card {i + 1}</h3>
                    <p className="text-sm text-muted-foreground">
                      This is a sample card with some content. The sidebar can be toggled without affecting the layout of the main content.
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </main>
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

// Navigation items for the sidebar
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

// Account switcher component
const AccountSwitcher = () => {
  return (
    <div className="mb-6 px-3">
      <div className="relative">
        <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
          <div className="flex-shrink-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-medium text-sm">
              AC
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Acme Corp</p>
            <p className="text-xs text-muted-foreground truncate">Free Plan</p>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>
    </div>
  );
};

// Search component for the sidebar
const SidebarSearch = () => {
  return (
    <div className="px-3 mb-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search..."
          className="w-full pl-9 bg-background/50 backdrop-blur-sm"
        />
      </div>
    </div>
  );
};

// Navigation item component
const NavItem = ({ item, isActive = false }: { item: typeof navItems[0]; isActive?: boolean }) => {
  const Icon = item.icon;
  return (
    <a
      href={item.to}
      className={cn(
        "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
        isActive
          ? "bg-accent text-accent-foreground"
          : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <span>{item.label}</span>
      {item.label === "Cards" && (
        <Badge variant="secondary" className="ml-auto">
          3
        </Badge>
      )}
    </a>
  );
};

// Quick actions section
const QuickActions = () => {
  const actions = [
    { label: "Send", icon: ArrowUpDown },
    { label: "Request", icon: Wallet },
    { label: "Pay", icon: Banknote },
  ];

  return (
    <div className="px-3 mb-6">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
        Quick Actions
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {actions.map((action) => (
          <button
            key={action.label}
            className="flex flex-col items-center justify-center gap-1.5 p-2 rounded-lg hover:bg-accent/50 transition-colors"
          >
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
              <action.icon className="h-5 w-5" />
            </div>
            <span className="text-xs">{action.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

// Recent transactions component
const RecentTransactions = () => {
  const transactions = [
    { id: 1, name: "Starbucks", amount: "-$5.40", time: "10:42 AM", icon: Coffee },
    { id: 2, name: "Amazon", amount: "-$89.99", time: "Yesterday", icon: ShoppingBag },
    { id: 3, name: "Salary", amount: "+$4,500.00", time: "Mar 1", icon: DollarSign },
  ];

  return (
    <div className="px-3">
      <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-1">
        Recent Transactions
      </h3>
      <div className="space-y-3">
        {transactions.map((tx) => (
          <div key={tx.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50">
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <tx.icon className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{tx.name}</p>
              <p className="text-xs text-muted-foreground">{tx.time}</p>
            </div>
            <span className={cn(
              "text-sm font-medium",
              tx.amount.startsWith('+') ? 'text-green-500' : 'text-foreground'
            )}>
              {tx.amount}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Help section
const HelpSection = () => {
  return (
    <div className="px-3 mt-auto pt-6">
      <div className="p-3 bg-accent/30 rounded-lg">
        <div className="flex items-start gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <HelpCircle className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h4 className="font-medium text-sm">Need help?</h4>
            <p className="text-xs text-muted-foreground mt-0.5">Our team is here to help you</p>
            <Button variant="link" size="sm" className="h-auto p-0 mt-2 text-xs">
              Contact support
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main sidebar content
const SidebarContent = ({ variant = 'default' }: { variant?: 'default' | 'collapsed' }) => {
  return (
    <>
      <div className="flex items-center justify-between px-3 py-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-blue-400 flex items-center justify-center">
            <span className="text-white font-bold">$</span>
          </div>
          {variant !== 'collapsed' && <span className="font-bold">Fintech</span>}
        </div>
        {variant !== 'collapsed' && (
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Bell className="h-4 w-4" />
            <span className="sr-only">Notifications</span>
          </Button>
        )}
      </div>

      <div className="px-3 py-2">
        <Button className="w-full justify-start gap-2" size="sm">
          <Plus className="h-4 w-4" />
          {variant !== 'collapsed' && 'New Transaction'}
        </Button>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        <div className="space-y-1 px-1">
          {navItems.map((item) => (
            <NavItem 
              key={item.label} 
              item={item} 
              isActive={item.label === 'Dashboard'} 
            />
          ))}
        </div>
      </nav>

      <div className="px-3 py-2">
        <Button variant="outline" className="w-full justify-start gap-2" size="sm">
          <Settings className="h-4 w-4" />
          {variant !== 'collapsed' && 'Settings'}
        </Button>
      </div>
    </>
  );
};

// Default sidebar with all features
export const Default: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarContent />
      </Sidebar>
    </SidebarProvider>
  ),
};

// Collapsible sidebar
export const Collapsible: Story = {
  render: () => (
    <SidebarProvider defaultOpen={true}>
      <Sidebar collapsible="icon" className="w-16 md:w-64 transition-all duration-300">
        <SidebarContent variant="collapsed" />
      </Sidebar>
    </SidebarProvider>
  ),
};

// Sidebar with account switcher and search
export const WithAccountAndSearch: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar className="w-72 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <AccountSwitcher />
        <SidebarSearch />
        <Separator className="my-2" />
        <nav className="flex-1 overflow-y-auto py-2">
          <div className="space-y-1 px-1">
            {navItems.map((item) => (
              <NavItem 
                key={item.label} 
                item={item} 
                isActive={item.label === 'Dashboard'} 
              />
            ))}
          </div>
        </nav>
        <Separator className="my-2" />
        <QuickActions />
        <HelpSection />
      </Sidebar>
    </SidebarProvider>
  ),
};

// Sidebar with dark theme
export const DarkTheme: Story = {
  parameters: {
    theme: 'dark',
  },
  render: () => (
    <div className="dark bg-background text-foreground min-h-screen">
      <SidebarProvider>
        <Sidebar className="w-64 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <AccountSwitcher />
          <SidebarSearch />
          <Separator className="my-2 bg-border/50" />
          <nav className="flex-1 overflow-y-auto py-2">
            <div className="space-y-1 px-1">
              {navItems.map((item) => (
                <NavItem 
                  key={item.label} 
                  item={item} 
                  isActive={item.label === 'Dashboard'} 
                />
              ))}
            </div>
          </nav>
          <Separator className="my-2 bg-border/50" />
          <div className="px-3 py-2">
            <Button variant="outline" className="w-full justify-start gap-2" size="sm">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </Sidebar>
      </SidebarProvider>
    </div>
  ),
};

// Sidebar with custom content
export const WithCustomContent: Story = {
  render: () => (
    <SidebarProvider>
      <Sidebar className="w-80 border-r bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Fintech App</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="mt-6 space-y-4">
            <div className="p-3 bg-accent/30 rounded-lg">
              <p className="text-sm font-medium">Available Balance</p>
              <p className="text-2xl font-bold mt-1">$12,450.00</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-muted-foreground">**** 3456</span>
                <div className="flex -space-x-2">
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarImage src="/avatars/01.png" alt="User" />
                    <AvatarFallback>U1</AvatarFallback>
                  </Avatar>
                  <Avatar className="h-6 w-6 border-2 border-background">
                    <AvatarImage src="/avatars/02.png" alt="User" />
                    <AvatarFallback>U2</AvatarFallback>
                  </Avatar>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start gap-2">
                <Plus className="h-4 w-4" />
                New Transaction
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <CreditCard className="h-4 w-4" />
                Add Card
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-2" />

        <nav className="flex-1 overflow-y-auto py-2">
          <div className="space-y-1 px-3">
            {navItems.map((item) => (
              <NavItem 
                key={item.label} 
                item={item} 
                isActive={item.label === 'Dashboard'} 
              />
            ))}
          </div>
        </nav>

        <div className="p-3 border-t">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
            <Avatar className="h-8 w-8">
              <AvatarImage src="/avatars/01.png" alt="User" />
              <AvatarFallback>JD</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">John Doe</p>
              <p className="text-xs text-muted-foreground truncate">john@example.com</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Sidebar>
    </SidebarProvider>
  ),
};
