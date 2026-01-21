import type { Meta, StoryObj } from '@storybook/react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

const meta: Meta<typeof AlertDialog> = {
  title: 'Primitives/AlertDialog',
  component: AlertDialog,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'AlertDialog components provide modal dialogs for critical actions that require user confirmation. They support different variants and include proper accessibility features like focus management and ARIA attributes. Built with Radix UI primitives for robust accessibility.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    open: {
      control: 'boolean',
      description: 'Controls whether the dialog is open',
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Delete Account</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your account
            and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Delete Account</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Destructive: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">Delete Transaction</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this transaction? This action cannot be undone and will permanently remove the transaction from your account history.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const FinancialAction: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">Transfer Large Amount</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirm Large Transfer</AlertDialogTitle>
          <AlertDialogDescription>
            You are about to transfer €10,000 to account ending in 5678. 
            This is a significant amount. Please confirm that all details are correct.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Review Details</AlertDialogCancel>
          <AlertDialogAction>Confirm Transfer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const WithCustomStyling: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50">
          Update Payment Method
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="border-blue-200 bg-blue-50/50">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-blue-900">Update Payment Method</AlertDialogTitle>
          <AlertDialogDescription className="text-blue-700">
            Your current payment method will expire soon. Would you like to update it now to avoid any service interruptions?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-blue-300 text-blue-700 hover:bg-blue-100">
            Later
          </AlertDialogCancel>
          <AlertDialogAction className="bg-blue-600 hover:bg-blue-700">
            Update Now
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = useState(false);
    
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button onClick={() => setOpen(true)}>Open Dialog</Button>
          <Button variant="outline" onClick={() => setOpen(false)}>Close Dialog</Button>
        </div>
        
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Controlled Dialog</AlertDialogTitle>
              <AlertDialogDescription>
                This dialog is controlled by external state. You can open and close it programmatically.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    );
  },
};

export const WithLongContent: Story = {
  render: () => (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">View Terms & Conditions</Button>
      </AlertDialogTrigger>
      <AlertDialogContent className="max-h-[80vh] overflow-y-auto">
        <AlertDialogHeader>
          <AlertDialogTitle>Terms and Conditions</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <p>
              By using our financial services, you agree to the following terms and conditions:
            </p>
            <div className="space-y-2 text-sm">
              <p><strong>1. Account Security:</strong> You are responsible for maintaining the security of your account credentials and for all activities that occur under your account.</p>
              <p><strong>2. Transaction Limits:</strong> Daily and monthly transaction limits apply based on your account type and verification status.</p>
              <p><strong>3. Data Privacy:</strong> We collect and process your personal data in accordance with our Privacy Policy and applicable data protection laws.</p>
              <p><strong>4. Service Availability:</strong> While we strive for 99.9% uptime, services may be temporarily unavailable due to maintenance or technical issues.</p>
              <p><strong>5. Fee Structure:</strong> Applicable fees are clearly disclosed in your account agreement and may be updated with 30 days notice.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Decline</AlertDialogCancel>
          <AlertDialogAction>Accept Terms</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  ),
};

export const Accessibility: Story = {
  render: () => (
    <div className="space-y-4">
      <div className="text-sm text-muted-foreground">
        <h3 className="font-semibold mb-2">Accessibility Features:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>Proper ARIA attributes and roles for screen readers</li>
          <li>Focus management and trap focus within dialog</li>
          <li>Keyboard navigation support (Escape to close, Tab for navigation)</li>
          <li>Screen reader announcements for dialog state changes</li>
          <li>High contrast colors and proper text sizing</li>
          <li>Semantic HTML structure with proper headings</li>
        </ul>
      </div>
      
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="outline">Accessibility Demo</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Accessibility Demo</AlertDialogTitle>
            <AlertDialogDescription>
              This dialog demonstrates proper accessibility implementation. Try navigating with your keyboard and using a screen reader to experience the accessibility features.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  ),
};
