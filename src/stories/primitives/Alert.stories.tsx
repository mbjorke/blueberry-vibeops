import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertCircle, Bell, CheckCircle2, Info, Terminal, X, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const meta: Meta<typeof Alert> = {
  title: "Primitives/Alert",
  component: Alert,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Alert>;

// Reusable icons for alerts
const AlertIcons = {
  info: <Info className="h-4 w-4" />,
  success: <CheckCircle2 className="h-4 w-4" />,
  warning: <AlertCircle className="h-4 w-4" />,
  error: <XCircle className="h-4 w-4" />,
};

// Basic Alerts
export const Basic: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <Alert>
        <Terminal className="h-4 w-4" />
        <AlertTitle>Heads up!</AlertTitle>
        <AlertDescription>
          You can add components to your app using the cli.
        </AlertDescription>
      </Alert>
      
      <Alert variant="destructive">
        <Terminal className="h-4 w-4" />
        <AlertTitle>Something went wrong</AlertTitle>
        <AlertDescription>
          Your session has expired. Please log in again.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <Alert>
        {AlertIcons.info}
        <AlertTitle>Information</AlertTitle>
        <AlertDescription>
          This is an informational message. Use it to provide additional context to the user.
        </AlertDescription>
      </Alert>
      
      <Alert className="border-green-500/50 text-green-700 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400">
        {AlertIcons.success}
        <AlertTitle>Success!</AlertTitle>
        <AlertDescription>
          Your changes have been saved successfully.
        </AlertDescription>
      </Alert>
      
      <Alert className="border-amber-500/50 text-amber-700 dark:text-amber-400 [&>svg]:text-amber-600 dark:[&>svg]:text-amber-400">
        {AlertIcons.warning}
        <AlertTitle>Warning</AlertTitle>
        <AlertDescription>
          Your subscription will expire in 7 days. Renew now to avoid interruption.
        </AlertDescription>
      </Alert>
      
      <Alert variant="destructive" className="[&>svg]:text-destructive">
        {AlertIcons.error}
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>
          There was a problem processing your request. Please try again later.
        </AlertDescription>
      </Alert>
    </div>
  ),
};

// Dismissible Alerts
export const Dismissible: Story = {
  render: () => {
    const [showAlert, setShowAlert] = React.useState(true);
    
    if (!showAlert) {
      return (
        <Button 
          variant="outline" 
          onClick={() => setShowAlert(true)}
          className="flex items-center gap-2"
        >
          <Bell className="h-4 w-4" />
          Show alert
        </Button>
      );
    }
    
    return (
      <Alert className="relative pr-12">
        <div className="flex items-center gap-3">
          <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          <div>
            <AlertTitle>New feature available!</AlertTitle>
            <AlertDescription>
              Check out our new dashboard with improved analytics.
            </AlertDescription>
          </div>
        </div>
        <button
          onClick={() => setShowAlert(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
      </Alert>
    );
  },
};

// With Actions
export const WithActions: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <Alert className="bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-900">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
            <div>
              <AlertTitle className="text-blue-800 dark:text-blue-200">New update available</AlertTitle>
              <AlertDescription className="text-blue-700 dark:text-blue-300">
                Version 2.0 is now available with new features and improvements.
              </AlertDescription>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button variant="outline" size="sm" className="border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50">
              Learn more
            </Button>
            <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white">
              Update now
            </Button>
          </div>
        </div>
      </Alert>
      
      <Alert variant="destructive" className="[&>svg]:text-destructive">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
            <div>
              <AlertTitle>Account suspended</AlertTitle>
              <AlertDescription>
                Your account has been suspended due to multiple failed login attempts.
              </AlertDescription>
            </div>
          </div>
          <Button variant="outline" size="sm" className="border-destructive/50 text-destructive hover:bg-destructive/10">
            Contact support
          </Button>
        </div>
      </Alert>
    </div>
  ),
};

// In Card
export const InCard: Story = {
  render: () => (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle>Billing</CardTitle>
        <CardDescription>Manage your subscription and payment methods.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert className="border-amber-500/50 bg-amber-50 dark:bg-amber-950/20">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          <div>
            <AlertTitle className="text-amber-800 dark:text-amber-200">Payment required</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Your subscription will end on June 8, 2023. Renew to avoid service interruption.
            </AlertDescription>
          </div>
        </Alert>
        
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="card-number">Card number</Label>
            <Input id="card-number" placeholder="4242 4242 4242 4242" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry date</Label>
              <Input id="expiry" placeholder="MM/YY" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="cvc">CVC</Label>
              <Input id="cvc" placeholder="123" />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">Name on card</Label>
            <Input id="name" placeholder="John Doe" />
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Update payment method</Button>
      </CardFooter>
    </Card>
  ),
};

// With Tabs
export const WithTabs: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[500px]">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
        <TabsTrigger value="billing">Billing</TabsTrigger>
      </TabsList>
      
      <TabsContent value="account" className="space-y-4 pt-4">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>Complete your profile</AlertTitle>
          <AlertDescription>
            Add your profile picture and bio to make your account more personal.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue="John Doe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" defaultValue="@johndoe" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue="john@example.com" />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="password" className="space-y-4 pt-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Security alert</AlertTitle>
          <AlertDescription>
            Your password hasn't been changed in over 6 months. Consider updating it for better security.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="current">Current password</Label>
            <Input id="current" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new">New password</Label>
            <Input id="new" type="password" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirm">Confirm password</Label>
            <Input id="confirm" type="password" />
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="billing" className="space-y-4 pt-4">
        <Alert className="bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-900">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          <AlertTitle className="text-green-800 dark:text-green-200">Payment successful</AlertTitle>
          <AlertDescription className="text-green-700 dark:text-green-300">
            Your subscription has been updated successfully.
          </AlertDescription>
        </Alert>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Plan</Label>
            <div className="rounded-md border p-4">
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Pro Plan</p>
                  <p className="text-sm text-muted-foreground">$29/month (billed monthly)</p>
                </div>
                <Button variant="outline">Change plan</Button>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Payment method</Label>
            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-12 rounded-md bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">VISA</span>
                  </div>
                  <div>
                    <p className="font-medium">•••• •••• •••• 4242</p>
                    <p className="text-sm text-muted-foreground">Expires 12/25</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">Update</Button>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  ),
};

// Custom Styles
export const CustomStyles: Story = {
  render: () => (
    <div className="space-y-4 max-w-2xl">
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-900/50 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
              <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div>
            <AlertTitle className="text-blue-800 dark:text-blue-200 text-base">New feature available</AlertTitle>
            <AlertDescription className="text-blue-700 dark:text-blue-300">
              Check out our new dashboard with improved analytics and reporting features.
            </AlertDescription>
          </div>
        </div>
      </Alert>
      
      <Alert className="border-l-4 border-amber-500 bg-amber-50 dark:bg-amber-950/20 rounded-r-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
          <div>
            <AlertTitle className="text-amber-800 dark:text-amber-200">Scheduled maintenance</AlertTitle>
            <AlertDescription className="text-amber-700 dark:text-amber-300">
              Our services will be undergoing scheduled maintenance on June 15, 2023, from 2:00 AM to 6:00 AM UTC.
            </AlertDescription>
          </div>
        </div>
      </Alert>
      
      <Alert className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30 border border-purple-200 dark:border-purple-900/50 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white">
                <Bell className="h-5 w-5" />
              </div>
            </div>
            <div>
              <AlertTitle className="text-purple-900 dark:text-purple-100 text-base">Special offer!</AlertTitle>
              <AlertDescription className="text-purple-800 dark:text-purple-200">
                Get 30% off on your first year subscription. Limited time offer.
              </AlertDescription>
            </div>
          </div>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white">
            Claim offer
          </Button>
        </div>
      </Alert>
    </div>
  ),
};
