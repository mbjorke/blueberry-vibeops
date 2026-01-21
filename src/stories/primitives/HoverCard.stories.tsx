import type { Meta, StoryObj } from '@storybook/react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { CreditCard, TrendingUp, PiggyBank, Shield, Bell, User, Settings, HelpCircle } from 'lucide-react';

const meta: Meta<typeof HoverCard> = {
  title: 'Primitives/HoverCard',
  component: HoverCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'HoverCard components provide rich content previews on hover. They support various content types and include proper accessibility features. Built with Radix UI primitives.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="link">@username</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="flex justify-between space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src="/marcus-bjorke.jpeg" />
            <AvatarFallback>MB</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Marcus Björke</h4>
            <p className="text-sm text-muted-foreground">
              Financial Technology Developer
            </p>
            <div className="flex items-center pt-2">
              <CreditCard className="mr-1 h-3 w-3 fill-current" />
              <span className="text-xs text-muted-foreground">
                Premium Member
              </span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const FinancialProfile: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline">View Profile</Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="flex items-center space-x-3">
            <Avatar className="h-10 w-10">
              <AvatarImage src="/marcus-bjorke.jpeg" />
              <AvatarFallback>MB</AvatarFallback>
            </Avatar>
            <div>
              <h4 className="text-sm font-semibold">Marcus Björke</h4>
              <p className="text-xs text-muted-foreground">Member since 2023</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3 text-green-500" />
              <span>Credit Score: 780</span>
            </div>
            <div className="flex items-center space-x-1">
              <Shield className="h-3 w-3 text-blue-500" />
              <span>Verified</span>
            </div>
            <div className="flex items-center space-x-1">
              <PiggyBank className="h-3 w-3 text-purple-500" />
              <span>3 Accounts</span>
            </div>
            <div className="flex items-center space-x-1">
              <Bell className="h-3 w-3 text-orange-500" />
              <span>Alerts: On</span>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <p className="text-xs text-muted-foreground">
              Last active: 2 hours ago
            </p>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const TransactionDetails: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="ghost" size="sm">
          <CreditCard className="mr-2 h-4 w-4" />
          Transaction #12345
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-72">
        <div className="space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-sm font-semibold">Coffee Shop Purchase</h4>
              <p className="text-xs text-muted-foreground">Food & Dining</p>
            </div>
            <span className="text-sm font-bold text-red-600">-€4.50</span>
          </div>
          
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date:</span>
              <span>June 15, 2024</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Time:</span>
              <span>09:23 AM</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Location:</span>
              <span>Helsinki, FI</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Card:</span>
              <span>•••• 1234</span>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Status:</span>
              <span className="text-green-600 font-medium">Completed</span>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const AccountSummary: Story = {
  render: () => (
    <HoverCard>
      <HoverCardTrigger asChild>
        <Button variant="outline" size="sm">
          <PiggyBank className="mr-2 h-4 w-4" />
          Savings Account
        </Button>
      </HoverCardTrigger>
      <HoverCardContent className="w-80">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold">Premium Savings</h4>
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
              Active
            </span>
          </div>
          
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Current Balance:</span>
              <span className="font-semibold">€12,450.67</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Interest Rate:</span>
              <span className="text-green-600">2.5% APY</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Monthly Interest:</span>
              <span>€25.94</span>
            </div>
          </div>
          
          <div className="pt-2 border-t">
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-muted-foreground">Last Deposit:</span>
                <p className="font-medium">€500.00 (June 1)</p>
              </div>
              <div>
                <span className="text-muted-foreground">Next Interest:</span>
                <p className="font-medium">July 1</p>
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  ),
};

export const WithIcons: Story = {
  render: () => (
    <div className="flex items-center space-x-4">
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon">
            <User className="h-4 w-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-48">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">User Profile</h4>
            <p className="text-xs text-muted-foreground">
              Click to view your profile settings and preferences
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-48">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Settings</h4>
            <p className="text-xs text-muted-foreground">
              Configure your account preferences and security options
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="ghost" size="icon">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </HoverCardTrigger>
        <HoverCardContent className="w-48">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Help & Support</h4>
            <p className="text-xs text-muted-foreground">
              Get help with your account or report an issue
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
    </div>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Accessibility Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Proper ARIA attributes for screen readers</li>
          <li>Keyboard navigation support</li>
          <li>Focus management</li>
          <li>Screen reader announcements</li>
          <li>High contrast colors for visibility</li>
        </ul>
      </div>
      
      <HoverCard>
        <HoverCardTrigger asChild>
          <Button variant="outline" aria-describedby="hover-demo">
            Accessibility Demo
          </Button>
        </HoverCardTrigger>
        <HoverCardContent id="hover-demo" className="w-64">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">Accessibility Demo</h4>
            <p className="text-xs text-muted-foreground">
              This hover card demonstrates proper accessibility implementation with ARIA labels and screen reader support.
            </p>
          </div>
        </HoverCardContent>
      </HoverCard>
      
      <div className="text-xs text-muted-foreground">
        <p className="font-semibold">Usage Notes:</p>
        <ul className="list-disc list-inside mt-1">
          <li>Hover cards appear on mouse hover or focus</li>
          <li>Content is announced to screen readers</li>
          <li>Keyboard users can navigate with Tab</li>
          <li>Escape key dismisses the card</li>
        </ul>
      </div>
    </div>
  ),
};
