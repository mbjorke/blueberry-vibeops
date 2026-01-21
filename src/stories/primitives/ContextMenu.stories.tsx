import type { Meta, StoryObj } from '@storybook/react';
import { ContextMenu, ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioGroup, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut, ContextMenuSub, ContextMenuSubContent, ContextMenuSubTrigger, ContextMenuTrigger } from '@/components/ui/context-menu';
import { CreditCard, Wallet, PiggyBank, TrendingUp, Settings, User, Shield, Bell, HelpCircle, Copy, Edit, Trash2, Download, Share2, MoreHorizontal } from 'lucide-react';

const meta: Meta<typeof ContextMenu> = {
  title: 'Primitives/ContextMenu',
  component: ContextMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'ContextMenu components provide right-click context menus with various menu items, checkboxes, radio groups, and sub-menus. They include proper accessibility features and keyboard navigation. Built with Radix UI primitives.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click here
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuItem>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy</span>
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit</span>
          <ContextMenuShortcut>⌘E</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete</span>
          <ContextMenuShortcut>⌘D</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const FinancialContextMenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click on transaction
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Transaction Actions</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Edit className="mr-2 h-4 w-4" />
          <span>Edit Transaction</span>
        </ContextMenuItem>
        <ContextMenuItem>
          <Copy className="mr-2 h-4 w-4" />
          <span>Copy Transaction ID</span>
        </ContextMenuItem>
        <ContextMenuItem>
          <Download className="mr-2 h-4 w-4" />
          <span>Download Receipt</span>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Share2 className="mr-2 h-4 w-4" />
            <span>Share</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>
              <span>Email</span>
            </ContextMenuItem>
            <ContextMenuItem>
              <span>Message</span>
            </ContextMenuItem>
            <ContextMenuItem>
              <span>Copy Link</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Delete Transaction</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithCheckboxes: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click for options
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Account Settings</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>
          <Bell className="mr-2 h-4 w-4" />
          <span>Push Notifications</span>
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked>
          <Shield className="mr-2 h-4 w-4" />
          <span>Two-Factor Auth</span>
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>
          <TrendingUp className="mr-2 h-4 w-4" />
          <span>Investment Alerts</span>
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem>
          <CreditCard className="mr-2 h-4 w-4" />
          <span>Card Notifications</span>
        </ContextMenuCheckboxItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const WithRadioGroup: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click for view options
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>View Mode</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="list">
          <ContextMenuRadioItem value="list">
            <span>List View</span>
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="grid">
            <span>Grid View</span>
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="table">
            <span>Table View</span>
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
        <ContextMenuSeparator />
        <ContextMenuLabel>Sort By</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuRadioGroup value="date">
          <ContextMenuRadioItem value="date">
            <span>Date</span>
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="amount">
            <span>Amount</span>
          </ContextMenuRadioItem>
          <ContextMenuRadioItem value="category">
            <span>Category</span>
          </ContextMenuRadioItem>
        </ContextMenuRadioGroup>
      </ContextMenuContent>
    </ContextMenu>
  ),
};

export const ComplexMenu: Story = {
  render: () => (
    <ContextMenu>
      <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
        Right click for complex menu
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        <ContextMenuLabel>Account Management</ContextMenuLabel>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>View Profile</span>
          <ContextMenuShortcut>⌘P</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
          <ContextMenuShortcut>⌘,</ContextMenuShortcut>
        </ContextMenuItem>
        <ContextMenuSeparator />
        <ContextMenuSub>
          <ContextMenuSubTrigger>
            <Wallet className="mr-2 h-4 w-4" />
            <span>Accounts</span>
          </ContextMenuSubTrigger>
          <ContextMenuSubContent className="w-48">
            <ContextMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Checking Account</span>
            </ContextMenuItem>
            <ContextMenuItem>
              <PiggyBank className="mr-2 h-4 w-4" />
              <span>Savings Account</span>
            </ContextMenuItem>
            <ContextMenuItem>
              <TrendingUp className="mr-2 h-4 w-4" />
              <span>Investment Account</span>
            </ContextMenuItem>
          </ContextMenuSubContent>
        </ContextMenuSub>
        <ContextMenuSeparator />
        <ContextMenuCheckboxItem checked>
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </ContextMenuCheckboxItem>
        <ContextMenuCheckboxItem checked>
          <Shield className="mr-2 h-4 w-4" />
          <span>Security Features</span>
        </ContextMenuCheckboxItem>
        <ContextMenuSeparator />
        <ContextMenuItem>
          <HelpCircle className="mr-2 h-4 w-4" />
          <span>Help & Support</span>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  ),
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
          <li>Screen reader announcements for menu items</li>
          <li>Semantic HTML structure</li>
        </ul>
      </div>
      
      <ContextMenu>
        <ContextMenuTrigger className="flex h-[150px] w-[300px] items-center justify-center rounded-md border border-dashed text-sm">
          Right click for accessibility demo
        </ContextMenuTrigger>
        <ContextMenuContent className="w-64">
          <ContextMenuLabel>Accessibility Demo</ContextMenuLabel>
          <ContextMenuSeparator />
          <ContextMenuItem>
            <span>Keyboard Navigation</span>
          </ContextMenuItem>
          <ContextMenuItem>
            <span>Screen Reader Support</span>
          </ContextMenuItem>
          <ContextMenuItem>
            <span>Focus Management</span>
          </ContextMenuItem>
        </ContextMenuContent>
      </ContextMenu>
      
      <div className="text-xs text-muted-foreground">
        <p className="font-semibold">Keyboard Shortcuts:</p>
        <ul className="list-disc list-inside mt-1">
          <li>↑/↓ - Navigate menu items</li>
          <li>→ - Open sub-menus</li>
          <li>← - Close sub-menus</li>
          <li>Enter - Select item</li>
          <li>Escape - Close menu</li>
        </ul>
      </div>
    </div>
  ),
};
