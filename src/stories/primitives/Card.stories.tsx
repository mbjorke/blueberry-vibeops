import type { Meta, StoryObj } from "@storybook/react";
import { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Download, Share2, Bell, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const meta: Meta<typeof Card> = {
  title: "Primitives/Card",
  component: Card,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

// Basic Card
export const Default: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <CardTitle>Card Title</CardTitle>
        <CardDescription>This is a basic card with some content.</CardDescription>
      </CardHeader>
      <CardContent>
        <p>Card content goes here. You can put any content inside a card.</p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Continue</Button>
      </CardFooter>
    </Card>
  ),
};

// Card with Form
export const WithForm: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
        <CardDescription>Enter your details to create a new account.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" placeholder="John Doe" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">Cancel</Button>
        <Button>Create Account</Button>
      </CardFooter>
    </Card>
  ),
};

// Card with Tabs
export const WithTabs: Story = {
  render: () => (
    <Card className="w-[400px]">
      <Tabs defaultValue="account" className="w-full">
        <CardHeader>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Account</TabsTrigger>
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
          </TabsList>
        </CardHeader>
        <CardContent className="space-y-4">
          <TabsContent value="account">
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar>
                  <AvatarImage src="https://github.com/shadcn.png" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">john@example.com</p>
                </div>
              </div>
              <Button variant="outline" className="w-full">
                Change Password
              </Button>
            </div>
          </TabsContent>
          <TabsContent value="notifications">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email notifications</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive push notifications</p>
                </div>
                <Button variant="outline" size="sm">
                  Manage
                </Button>
              </div>
            </div>
          </TabsContent>
        </CardContent>
      </Tabs>
    </Card>
  ),
};

// Card with List
export const WithList: Story = {
  render: () => (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Recent Transactions</CardTitle>
        <CardDescription>Your recent transaction history</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {[
          { id: 1, name: "Grocery Store", amount: "-$86.00", date: "2023-10-15", type: "shopping" },
          { id: 2, name: "Salary", amount: "+$2,500.00", date: "2023-10-10", type: "income" },
          { id: 3, name: "Coffee Shop", amount: "-$4.50", date: "2023-10-08", type: "food" },
          { id: 4, name: "Book Store", amount: "-$24.99", date: "2023-10-05", type: "shopping" },
        ].map((item) => (
          <div key={item.id} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent">
                <CreditCard className="h-4 w-4 text-accent-foreground" />
              </div>
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">{item.date}</p>
              </div>
            </div>
            <p className={cn("font-medium", item.amount.startsWith("+") ? "text-success" : "")}>
              {item.amount}
            </p>
          </div>
        ))}
      </CardContent>
      <CardFooter>
        <Button variant="ghost" className="w-full">
          View All Transactions
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Card with Stats
export const WithStats: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Monthly Revenue</CardTitle>
        <CardDescription>+20.1% from last month</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">$45,231.89</div>
        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
      </CardContent>
      <CardFooter className="flex items-center justify-between pt-0">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-2 w-2 rounded-full bg-success" />
          <span>On track</span>
        </div>
        <Button variant="ghost" size="sm" className="h-8">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardFooter>
    </Card>
  ),
};

// Card with Actions
export const WithActions: Story = {
  render: () => (
    <Card className="w-[350px]">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Project Alpha</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
        <CardDescription>Development • In Progress</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Project Alpha is a new initiative to improve our customer experience and increase engagement.
        </p>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline">View Details</Button>
        <div className="flex -space-x-2">
          {["https://github.com/shadcn.png", "https://github.com/shadcn.png"].map((src, i) => (
            <Avatar key={i} className="h-8 w-8 border-2 border-background">
              <AvatarImage src={src} />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
          ))}
          <Avatar className="h-8 w-8 border-2 border-background">
            <AvatarFallback>+2</AvatarFallback>
          </Avatar>
        </div>
      </CardFooter>
    </Card>
  ),
};
