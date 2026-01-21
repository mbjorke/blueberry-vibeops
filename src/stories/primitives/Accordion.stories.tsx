import type { Meta, StoryObj } from '@storybook/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const meta: Meta = {
  title: 'Primitives/Accordion',
  component: Accordion,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'A vertically collapsible accordion component built with Radix UI primitives. Supports single or multiple open items with smooth animations and keyboard navigation.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <Accordion type="single" collapsible className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>What is Fintech Spark Studio?</AccordionTrigger>
        <AccordionContent>
          Fintech Spark Studio is a modern financial technology application that provides users with comprehensive account management, transaction tracking, and spending insights. It features a beautiful, accessible interface built with React and Tailwind CSS.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>How do I add a new account?</AccordionTrigger>
        <AccordionContent>
          To add a new account, navigate to the accounts section and click the "Add Account" button. You'll need to provide basic information like account name, type, and initial balance. The system supports checking, savings, investment, and credit accounts.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Can I export my transaction data?</AccordionTrigger>
        <AccordionContent>
          Yes! You can export your transaction data in multiple formats including CSV, PDF, and JSON. This feature is available in the transaction history section and allows you to download data for specific date ranges or account types.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Multiple: Story = {
  render: () => (
    <Accordion type="multiple" className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Account Security</AccordionTrigger>
        <AccordionContent>
          Your account security is our top priority. We use bank-level encryption and multi-factor authentication to protect your financial data. All transactions are monitored for suspicious activity.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger>Transaction Categories</AccordionTrigger>
        <AccordionContent>
          Transactions are automatically categorized using AI-powered analysis. You can also manually categorize transactions or create custom categories to better track your spending patterns.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger>Mobile App</AccordionTrigger>
        <AccordionContent>
          Our mobile app is available for both iOS and Android devices. It provides the same features as the web version with a touch-optimized interface and offline capabilities for viewing recent transactions.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Disabled: Story = {
  render: () => (
    <Accordion type="single" disabled className="w-[400px]">
      <AccordionItem value="item-1">
        <AccordionTrigger>Disabled Item</AccordionTrigger>
        <AccordionContent>
          This accordion item is disabled and cannot be interacted with.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const CustomStyling: Story = {
  render: () => (
    <Accordion type="single" className="w-[400px]">
      <AccordionItem value="item-1" className="border-primary/20">
        <AccordionTrigger className="text-primary hover:text-primary/80">
          Custom Styled Trigger
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          This accordion item has custom styling with primary colors and hover effects.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2" className="border-secondary/20">
        <AccordionTrigger className="text-secondary hover:text-secondary/80">
          Secondary Styled Trigger
        </AccordionTrigger>
        <AccordionContent className="text-muted-foreground">
          This item uses secondary colors for a different visual hierarchy.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Accessibility Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Keyboard navigation with Tab, Enter, Space, and arrow keys</li>
          <li>ARIA attributes for screen readers</li>
          <li>Focus management and visible focus indicators</li>
          <li>Proper heading structure and semantic markup</li>
          <li>High contrast ratios for text readability</li>
        </ul>
      </div>
      <Accordion type="single" className="w-[400px]">
        <AccordionItem value="item-1">
          <AccordionTrigger>Accessibility Demo</AccordionTrigger>
          <AccordionContent>
            This accordion demonstrates proper accessibility implementation. Try navigating with your keyboard to see the focus management in action.
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  ),
};
