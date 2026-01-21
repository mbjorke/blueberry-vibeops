import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

const meta: Meta<typeof NavigationMenu> = {
  title: "Navigation/Navigation Menu",
  component: NavigationMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

// Reusable components for navigation items
const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";

// Basic Navigation Menu
export const Basic: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Products
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Pricing
          </NavigationMenuLink>
        </NavigationMenuItem>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            About
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

// With Dropdowns
export const WithDropdowns: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Home
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>Products</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid gap-3 p-6 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
              <li className="row-span-3">
                <NavigationMenuLink asChild>
                  <a
                    className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                    href="/"
                  >
                    <div className="mb-2 mt-4 text-lg font-medium">
                      shadcn/ui
                    </div>
                    <p className="text-sm leading-tight text-muted-foreground">
                      Beautifully designed components built with Radix UI and Tailwind CSS.
                    </p>
                  </a>
                </NavigationMenuLink>
              </li>
              <ListItem href="/docs" title="Introduction">
                Re-usable components built using Radix UI and Tailwind CSS.
              </ListItem>
              <ListItem href="/docs/installation" title="Installation">
                How to install dependencies and structure your app.
              </ListItem>
              <ListItem href="/docs/primitives/typography" title="Typography">
                Styles for headings, paragraphs, lists...etc
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuTrigger>Resources</NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem
                href="/docs"
                title="Documentation"
              >
                Learn how to use our components
              </ListItem>
              <ListItem
                href="/examples"
                title="Examples"
              >
                Explore our component library
              </ListItem>
              <ListItem
                href="/guides"
                title="Guides"
              >
                In-depth guides for building with our components
              </ListItem>
              <ListItem
                href="/blog"
                title="Blog"
              >
                The latest news and updates
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            Contact
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

// With Icons and Badges
export const WithIconsAndBadges: Story = {
  render: () => (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <span className="flex items-center">
              <span className="mr-2">🏠</span>
              Home
            </span>
          </NavigationMenuLink>
        </NavigationMenuItem>
        
        <NavigationMenuItem>
          <NavigationMenuTrigger>
            <span className="flex items-center">
              <span className="mr-2">🛍️</span>
              Shop
              <Badge variant="secondary" className="ml-2">New</Badge>
            </span>
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] md:grid-cols-2 lg:w-[600px]">
              <ListItem
                href="/shop/clothing"
                title="Clothing"
              >
                <div className="flex items-center">
                  <span className="mr-2">👕</span>
                  <span>Shop our clothing collection</span>
                </div>
              </ListItem>
              <ListItem
                href="/shop/accessories"
                title="Accessories"
              >
                <div className="flex items-center">
                  <span className="mr-2">👜</span>
                  <span>Complete your look</span>
                </div>
              </ListItem>
              <ListItem
                href="/shop/sale"
                title="Sale"
              >
                <div className="flex items-center">
                  <span className="mr-2">🔥</span>
                  <span>Limited time offers</span>
                  <Badge variant="destructive" className="ml-2">50% Off</Badge>
                </div>
              </ListItem>
              <ListItem
                href="/shop/new-arrivals"
                title="New Arrivals"
              >
                <div className="flex items-center">
                  <span className="mr-2">✨</span>
                  <span>Just landed</span>
                  <Badge variant="outline" className="ml-2">New</Badge>
                </div>
              </ListItem>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>

        <NavigationMenuItem>
          <NavigationMenuLink className={navigationMenuTriggerStyle()}>
            <span className="flex items-center">
              <span className="mr-2">📞</span>
              Contact
            </span>
          </NavigationMenuLink>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  ),
};

// With Search and User Menu
export const WithSearchAndUserMenu: Story = {
  render: () => (
    <div className="flex w-full items-center justify-between border-b px-4 py-3">
      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuLink className="text-lg font-bold">
              Brand
            </NavigationMenuLink>
          </NavigationMenuItem>
          
          <NavigationMenuItem>
            <NavigationMenuTrigger>Products</NavigationMenuTrigger>
            <NavigationMenuContent>
              <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-2">
                <li className="row-span-3">
                  <NavigationMenuLink asChild>
                    <a
                      className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                      href="/"
                    >
                      <div className="mb-2 text-2xl font-bold">
                        Our Products
                      </div>
                      <p className="text-sm leading-tight text-muted-foreground">
                        Discover our amazing product lineup
                      </p>
                    </a>
                  </NavigationMenuLink>
                </li>
                <ListItem href="/products/featured" title="Featured">
                  Hand-picked selection of our best products
                </ListItem>
                <ListItem href="/products/new" title="New Arrivals">
                  The latest additions to our collection
                </ListItem>
                <ListItem href="/products/bestsellers" title="Bestsellers">
                  Customer favorites
                </ListItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Solutions
            </NavigationMenuLink>
          </NavigationMenuItem>

          <NavigationMenuItem>
            <NavigationMenuLink className={navigationMenuTriggerStyle()}>
              Pricing
            </NavigationMenuLink>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>

      <div className="flex items-center space-x-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search..."
            className="w-full rounded-full pl-10 md:w-[200px] lg:w-[300px]"
          />
        </div>

        <NavigationMenu>
          <NavigationMenuList>
            <NavigationMenuItem>
              <NavigationMenuTrigger>
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/avatars/01.png" alt="User" />
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
              </NavigationMenuTrigger>
              <NavigationMenuContent className="w-48 p-2">
                <div className="flex flex-col space-y-1">
                  <NavigationMenuLink asChild>
                    <a
                      href="/account"
                      className="block rounded px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      Account
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a
                      href="/settings"
                      className="block rounded px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      Settings
                    </a>
                  </NavigationMenuLink>
                  <NavigationMenuLink asChild>
                    <a
                      href="/logout"
                      className="block rounded px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                    >
                      Logout
                    </a>
                  </NavigationMenuLink>
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </div>
  ),
};

// In Card with Tabs
export const InCardWithTabs: Story = {
  render: () => (
    <Card className="w-[600px]">
      <CardHeader>
        <CardTitle>Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border-b">
          <NavigationMenu>
            <NavigationMenuList className="flex-col sm:flex-row">
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "w-full justify-start border-b-2 border-transparent px-1 pb-4 pt-0 text-sm font-medium text-muted-foreground transition-colors hover:border-b-primary/50 hover:bg-transparent hover:text-foreground hover:shadow-none data-[active]:border-b-primary data-[active]:text-foreground"
                  )}
                >
                  Overview
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "w-full justify-start border-b-2 border-transparent px-1 pb-4 pt-0 text-sm font-medium text-muted-foreground transition-colors hover:border-b-primary/50 hover:bg-transparent hover:text-foreground hover:shadow-none data-[active]:border-b-primary data-[active]:text-foreground"
                  )}
                >
                  Analytics
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "w-full justify-start border-b-2 border-transparent px-1 pb-4 pt-0 text-sm font-medium text-muted-foreground transition-colors hover:border-b-primary/50 hover:bg-transparent hover:text-foreground hover:shadow-none data-[active]:border-b-primary data-[active]:text-foreground"
                  )}
                >
                  Reports
                </NavigationMenuLink>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <NavigationMenuLink
                  className={cn(
                    navigationMenuTriggerStyle(),
                    "w-full justify-start border-b-2 border-transparent px-1 pb-4 pt-0 text-sm font-medium text-muted-foreground transition-colors hover:border-b-primary/50 hover:bg-transparent hover:text-foreground hover:shadow-none data-[active]:border-b-primary data-[active]:text-foreground"
                  )}
                >
                  Notifications
                  <Badge variant="secondary" className="ml-2">3</Badge>
                </NavigationMenuLink>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>
        <div className="mt-6">
          <p className="text-muted-foreground">
            This is a tabbed navigation inside a card. Click on different tabs to see the content change.
          </p>
        </div>
      </CardContent>
    </Card>
  ),
};
