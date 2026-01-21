import type { Meta, StoryObj } from '@storybook/react';
import { Command, CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator, CommandShortcut } from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Search, CreditCard, Wallet, PiggyBank, TrendingUp, Settings, User, Shield, Bell, HelpCircle } from 'lucide-react';
import { useState } from 'react';

const meta: Meta<typeof Command> = {
  title: 'Primitives/Command',
  component: Command,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Command components provide a command palette interface for quick navigation and actions. They support search, keyboard navigation, and proper accessibility features. Built with Radix UI primitives.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <div className="w-[400px]">
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          <CommandGroup heading="Suggestions">
            <CommandItem>
              <Search className="mr-2 h-4 w-4" />
              <span>Search transactions</span>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>View cards</span>
            </CommandItem>
            <CommandItem>
              <Wallet className="mr-2 h-4 w-4" />
              <span>Check balance</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Settings">
            <CommandItem>
              <Settings className="mr-2 h-4 w-4" />
              <span>Preferences</span>
            </CommandItem>
            <CommandItem>
              <User className="mr-2 h-4 w-4" />
              <span>Profile</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

export const WithDialog: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <>
        <Button onClick={() => setOpen(true)}>
          <Search className="mr-2 h-4 w-4" />
          Open Command Palette
        </Button>
        <CommandDialog open={open} onOpenChange={setOpen}>
          <CommandInput placeholder="Type a command or search..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Financial Actions">
              <CommandItem>
                <CreditCard className="mr-2 h-4 w-4" />
                <span>Transfer Money</span>
                <CommandShortcut>⌘T</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <PiggyBank className="mr-2 h-4 w-4" />
                <span>Create Savings Goal</span>
                <CommandShortcut>⌘S</CommandShortcut>
              </CommandItem>
              <CommandItem>
                <TrendingUp className="mr-2 h-4 w-4" />
                <span>View Investments</span>
                <CommandShortcut>⌘I</CommandShortcut>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Account">
              <CommandItem>
                <User className="mr-2 h-4 w-4" />
                <span>Edit Profile</span>
              </CommandItem>
              <CommandItem>
                <Shield className="mr-2 h-4 w-4" />
                <span>Security Settings</span>
              </CommandItem>
              <CommandItem>
                <Bell className="mr-2 h-4 w-4" />
                <span>Notifications</span>
              </CommandItem>
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Help">
              <CommandItem>
                <HelpCircle className="mr-2 h-4 w-4" />
                <span>Support Center</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </CommandDialog>
      </>
    );
  },
};

export const FinancialCommands: Story = {
  render: () => (
    <div className="w-[500px]">
      <Command className="rounded-lg border shadow-md">
        <CommandInput placeholder="Search financial tools and actions..." />
        <CommandList>
          <CommandEmpty>No financial tools found.</CommandEmpty>
          <CommandGroup heading="Money Movement">
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Send Money</span>
              <CommandShortcut>⌘S</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Request Money</span>
              <CommandShortcut>⌘R</CommandShortcut>
            </CommandItem>
            <CommandItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Pay Bills</span>
              <CommandShortcut>⌘B</CommandShortcut>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Investments">
            <CommandItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Buy Stocks</span>
            </CommandItem>
            <CommandItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Sell Stocks</span>
            </CommandItem>
            <CommandItem>
              <PiggyBank className="mr-2 h-4 w-4" />
              <span>Portfolio Overview</span>
            </CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Analytics">
            <CommandItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Spending Analysis</span>
            </CommandItem>
            <CommandItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Budget Reports</span>
            </CommandItem>
            <CommandItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Tax Documents</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>
    </div>
  ),
};

export const WithSearch: Story = {
  render: () => {
    const [search, setSearch] = useState('');
    
    const items = [
      { icon: CreditCard, label: 'Credit Card', category: 'Payment' },
      { icon: Wallet, label: 'Digital Wallet', category: 'Payment' },
      { icon: PiggyBank, label: 'Savings Account', category: 'Banking' },
      { icon: TrendingUp, label: 'Investment Account', category: 'Investing' },
      { icon: Shield, label: 'Insurance', category: 'Protection' },
      { icon: Bell, label: 'Alerts', category: 'Notifications' },
    ];
    
    const filteredItems = items.filter(item => 
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase())
    );
    
    return (
      <div className="w-[400px]">
        <Command className="rounded-lg border shadow-md">
          <CommandInput 
            placeholder="Search accounts and services..." 
            value={search}
            onValueChange={setSearch}
          />
          <CommandList>
            <CommandEmpty>No accounts found.</CommandEmpty>
            {filteredItems.map((item, index) => (
              <CommandItem key={index}>
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.category}
                </span>
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </div>
    );
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Accessibility Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Proper ARIA attributes for screen readers</li>
          <li>Keyboard navigation support (Arrow keys, Enter, Escape)</li>
          <li>Focus management and visible focus indicators</li>
          <li>Screen reader announcements for search results</li>
          <li>Semantic HTML structure</li>
        </ul>
      </div>
      
      <div className="w-[400px]">
        <Command className="rounded-lg border shadow-md">
          <CommandInput placeholder="Try keyboard navigation..." />
          <CommandList>
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup heading="Demo Items">
              <CommandItem>
                <Search className="mr-2 h-4 w-4" />
                <span>Accessibility Demo</span>
              </CommandItem>
              <CommandItem>
                <Search className="mr-2 h-4 w-4" />
                <span>Keyboard Navigation</span>
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </div>
      
      <div className="text-xs text-muted-foreground">
        <p className="font-semibold">Keyboard Shortcuts:</p>
        <ul className="list-disc list-inside mt-1">
          <li>↑/↓ - Navigate items</li>
          <li>Enter - Select item</li>
          <li>Escape - Close/clear</li>
          <li>⌘/Ctrl + K - Quick open</li>
        </ul>
      </div>
    </div>
  ),
};
