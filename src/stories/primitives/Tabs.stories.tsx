import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bell, CreditCard, KeyRound, Mail, MessageSquare, Settings, User, UserPlus } from "lucide-react";

const meta: Meta<typeof Tabs> = {
  title: "Navigation/Tabs",
  component: Tabs,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Tabs>;

// Basic Tabs
export const Basic: Story = {
  render: () => (
    <Tabs defaultValue="account" className="w-[400px]">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="account">Account</TabsTrigger>
        <TabsTrigger value="password">Password</TabsTrigger>
      </TabsList>
      <TabsContent value="account" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>
              Make changes to your account here. Click save when you're done.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="name">Name</Label>
              <Input id="name" defaultValue="John Doe" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="username">Username</Label>
              <Input id="username" defaultValue="@johndoe" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save changes</Button>
          </CardFooter>
        </Card>
      </TabsContent>
      <TabsContent value="password" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>
              Change your password here. After saving, you'll be logged out.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="space-y-1">
              <Label htmlFor="current">Current password</Label>
              <Input id="current" type="password" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="new">New password</Label>
              <Input id="new" type="password" />
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save password</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

// With Icons and Badges
export const WithIconsAndBadges: Story = {
  render: () => (
    <Tabs defaultValue="inbox" className="w-[600px]">
      <TabsList className="grid w-full grid-cols-4">
        <TabsTrigger value="inbox" className="relative">
          <Mail className="mr-2 h-4 w-4" />
          <span>Inbox</span>
          <Badge variant="secondary" className="ml-2">
            5
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="notifications">
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
          <Badge variant="destructive" className="ml-2">
            3
          </Badge>
        </TabsTrigger>
        <TabsTrigger value="messages">
          <MessageSquare className="mr-2 h-4 w-4" />
          <span>Messages</span>
        </TabsTrigger>
        <TabsTrigger value="settings">
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </TabsTrigger>
      </TabsList>
      <TabsContent value="inbox" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Inbox</CardTitle>
            <CardDescription>Your recent messages will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center space-x-4 rounded-md border p-4">
                <Avatar>
                  <AvatarImage src={`/avatars/0${i}.png`} alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Message from User {i}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    This is a preview of the message content...
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  {i}h ago
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="notifications" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Your recent notifications will appear here.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">New message received</p>
                <p className="text-sm text-muted-foreground">
                  You have 3 unread messages
                </p>
              </div>
              <div className="text-sm text-muted-foreground">2m ago</div>
            </div>
            <div className="flex items-center space-x-4 rounded-md border p-4">
              <div className="flex-1 space-y-1">
                <p className="text-sm font-medium">System update</p>
                <p className="text-sm text-muted-foreground">
                  A new update is available
                </p>
              </div>
              <div className="text-sm text-muted-foreground">1h ago</div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="messages" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
            <CardDescription>Your conversations will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex h-[200px] items-center justify-center rounded-md border">
              <p className="text-sm text-muted-foreground">No messages yet</p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="settings" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Manage your account settings.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Email Notifications</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-news" defaultChecked />
                  <Label htmlFor="email-news" className="font-normal">
                    Newsletter
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-updates" defaultChecked />
                  <Label htmlFor="email-updates" className="font-normal">
                    Product updates
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="email-security" defaultChecked />
                  <Label htmlFor="email-security" className="font-normal">
                    Security alerts
                  </Label>
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button>Save preferences</Button>
          </CardFooter>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};

// Vertical Tabs
export const VerticalTabs: Story = {
  render: () => (
    <Tabs defaultValue="profile" className="flex gap-4" orientation="vertical">
      <TabsList className="flex-col h-auto w-[200px] p-2">
        <TabsTrigger
          value="profile"
          className="justify-start w-full data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
        >
          <User className="mr-2 h-4 w-4" />
          Profile
        </TabsTrigger>
        <TabsTrigger
          value="billing"
          className="justify-start w-full data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Billing
        </TabsTrigger>
        <TabsTrigger
          value="security"
          className="justify-start w-full data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
        >
          <KeyRound className="mr-2 h-4 w-4" />
          Security
        </TabsTrigger>
        <TabsTrigger
          value="team"
          className="justify-start w-full data-[state=active]:bg-accent data-[state=active]:text-accent-foreground"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Team Members
        </TabsTrigger>
      </TabsList>
      
      <div className="flex-1">
        <TabsContent value="profile" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>
                This is your public profile information.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback>JD</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">John Doe</p>
                  <p className="text-sm text-muted-foreground">
                    johndoe@example.com
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label htmlFor="first-name">First name</Label>
                  <Input id="first-name" defaultValue="John" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="last-name">Last name</Label>
                  <Input id="last-name" defaultValue="Doe" />
                </div>
              </div>
              <div className="space-y-1">
                <Label htmlFor="bio">Bio</Label>
                <div className="h-20 rounded-md border bg-background px-3 py-2 text-sm">
                  Product designer with a passion for creating beautiful user experiences.
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Update profile</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Billing</CardTitle>
              <CardDescription>
                Manage your subscription and payment methods.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">
                      $19/month (billed monthly)
                    </p>
                  </div>
                  <Button variant="outline">Change Plan</Button>
                </div>
                <div className="mt-4 pt-4 border-t">
                  <p className="text-sm font-medium">Payment Method</p>
                  <p className="text-sm text-muted-foreground">
                    •••• •••• •••• 4242
                  </p>
                  <Button variant="link" className="h-auto p-0 text-sm">
                    Update payment method
                  </Button>
                </div>
              </div>
              <div className="rounded-md border p-4">
                <p className="font-medium">Billing History</p>
                <div className="mt-2 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>May 1, 2023</span>
                    <span>$19.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>April 1, 2023</span>
                    <span>$19.00</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>March 1, 2023</span>
                    <span>$19.00</span>
                  </div>
                </div>
                <Button variant="link" className="h-auto p-0 text-sm mt-2">
                  View all invoices
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>Security</CardTitle>
              <CardDescription>
                Update your password and enable two-factor authentication.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current password</Label>
                <Input id="current-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="new-password">New password</Label>
                <Input id="new-password" type="password" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm new password</Label>
                <Input id="confirm-password" type="password" />
              </div>
              <div className="pt-2">
                <Button>Update password</Button>
              </div>
              
              <div className="pt-4 mt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Two-factor authentication</p>
                    <p className="text-sm text-muted-foreground">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button variant="outline">Enable 2FA</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="team" className="mt-0">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Team Members</CardTitle>
                  <CardDescription>
                    Manage who has access to this workspace.
                  </CardDescription>
                </div>
                <Button>
                  <UserPlus className="mr-2 h-4 w-4" />
                  Invite member
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: "John Doe", email: "john@example.com", role: "Owner", avatar: "JD" },
                  { name: "Jane Smith", email: "jane@example.com", role: "Admin", avatar: "JS" },
                  { name: "Bob Johnson", email: "bob@example.com", role: "Member", avatar: "BJ" },
                ].map((member) => (
                  <div key={member.email} className="flex items-center justify-between p-3 border rounded-md">
                    <div className="flex items-center space-x-3">
                      <Avatar>
                        <AvatarFallback>{member.avatar}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-muted-foreground">{member.role}</span>
                      <Button variant="ghost" size="icon">
                        <Settings className="h-4 w-4" />
                        <span className="sr-only">Settings</span>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  ),
};

// Fitted Tabs
export const FittedTabs: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-[600px]">
      <TabsList className="w-full">
        <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
        <TabsTrigger value="active" className="flex-1">Active</TabsTrigger>
        <TabsTrigger value="draft" className="flex-1">Draft</TabsTrigger>
        <TabsTrigger value="archived" className="flex-1">Archived</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>All Items</CardTitle>
            <CardDescription>View all your items in one place.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[100px] flex items-center justify-center rounded-md border">
              <p className="text-sm text-muted-foreground">
                All items will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="active" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Items</CardTitle>
            <CardDescription>Your active items will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[100px] flex items-center justify-center rounded-md border">
              <p className="text-sm text-muted-foreground">
                Active items will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="draft" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Drafts</CardTitle>
            <CardDescription>Your draft items will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[100px] flex items-center justify-center rounded-md border">
              <p className="text-sm text-muted-foreground">
                Draft items will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="archived" className="mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Archived Items</CardTitle>
            <CardDescription>Your archived items will appear here.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[100px] flex items-center justify-center rounded-md border">
              <p className="text-sm text-muted-foreground">
                Archived items will appear here
              </p>
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  ),
};
