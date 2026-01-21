import type { Meta, StoryObj } from '@storybook/react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

const meta: Meta<typeof Collapsible> = {
  title: 'Primitives/Collapsible',
  component: Collapsible,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Collapsible components provide expandable/collapsible content sections. They support smooth animations and proper accessibility features. Built with Radix UI primitives.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls whether the collapsible content is open',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px] space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">Transaction Details</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle details</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-mono">TXN-2024-001</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Date:</span>
                <span>June 15, 2024</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600">Completed</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee:</span>
                <span>€0.00</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const FinancialSummary: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[400px] space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">Monthly Spending Summary</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle summary</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Total Spent:</span>
                <span className="text-lg font-bold text-red-600">€1,569.00</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">Budget Remaining:</span>
                <span className="text-lg font-bold text-green-600">€1,431.00</span>
              </div>
              <div className="pt-2 border-t">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Housing</span>
                    <span>€1,200.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Shopping</span>
                    <span>€90.00</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span>Food</span>
                    <span>€66.00</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const WithCustomStyling: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-[350px] space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold text-blue-600">Account Information</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
              {isOpen ? (
                <ChevronDown className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
              <span className="sr-only">Toggle account info</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border border-blue-200 bg-blue-50/50 px-4 py-3 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-blue-700">Account Number:</span>
                <span className="font-mono text-blue-900">•••• 1234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">IBAN:</span>
                <span className="font-mono text-blue-900">FI21 1234 5600 0007 85</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Account Type:</span>
                <span className="text-blue-900">Checking</span>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  },
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Accessibility Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Proper ARIA attributes for expandable content</li>
          <li>Keyboard navigation support</li>
          <li>Screen reader announcements for state changes</li>
          <li>Semantic HTML structure</li>
          <li>Focus management</li>
        </ul>
      </div>
      
      <Collapsible className="w-[350px] space-y-2">
        <div className="flex items-center justify-between space-x-4 px-4">
          <h4 className="text-sm font-semibold">Accessibility Demo</h4>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="w-9 p-0">
              <ChevronRight className="h-4 w-4" />
              <span className="sr-only">Toggle demo content</span>
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent className="space-y-2">
          <div className="rounded-md border px-4 py-3 text-sm">
            <p>This collapsible demonstrates proper accessibility implementation. Try navigating with your keyboard to see the focus management in action.</p>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  ),
};
