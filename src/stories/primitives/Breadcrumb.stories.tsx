import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronRight, Home, Slash } from "lucide-react";
import { cn } from "@/lib/utils";

const meta: Meta<typeof Breadcrumb> = {
  title: "Navigation/Breadcrumb",
  component: Breadcrumb,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Breadcrumb>;

// Basic Breadcrumb
export const Basic: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/documents">Documents</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage>Document.pdf</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// With Custom Separator
export const WithCustomSeparator: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Home</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash className="h-3 w-3 -rotate-12" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink href="/documents">Documents</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <Slash className="h-3 w-3 -rotate-12" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage>Document.pdf</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// With Icons
export const WithIcons: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center gap-1">
            <Home className="h-4 w-4" />
            <span>Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/documents" className="flex items-center gap-1">
            <span>Documents</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="flex items-center gap-1">
            <span>Document.pdf</span>
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};

// With Dropdown
export const WithDropdown: Story = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);
    
    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                className="px-1.5 h-7 text-sm font-normal text-muted-foreground hover:bg-transparent"
                onClick={() => setIsOpen(!isOpen)}
              >
                <span className="sr-only">Toggle menu</span>
                <BreadcrumbEllipsis className="h-4 w-4" />
              </Button>
              {isOpen && (
                <div className="absolute z-50 flex w-48 flex-col rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
                  <button className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                    Settings
                  </button>
                  <button className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                    Team
                  </button>
                  <button className="flex items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground">
                    Documents
                  </button>
                </div>
              )}
            </div>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Document.pdf</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    );
  },
};

// In Card Header
export const InCardHeader: Story = {
  render: () => (
    <Card className="w-[600px]">
      <CardHeader>
        <div className="flex flex-col space-y-1.5">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/" className="text-sm">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbLink href="/documents" className="text-sm">Documents</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator>
                <ChevronRight className="h-3.5 w-3.5" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                <BreadcrumbPage className="text-sm font-medium">Document.pdf</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">Document Title</CardTitle>
              <CardDescription>Last edited 2 hours ago</CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Share
              </Button>
              <Button size="sm">Edit</Button>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[200px] flex items-center justify-center rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground">Document content will appear here</p>
        </div>
      </CardContent>
    </Card>
  ),
};

// Responsive with Truncation
export const ResponsiveWithTruncation: Story = {
  render: () => {
    const items = [
      { label: "Home", href: "/" },
      { label: "Documents", href: "/documents" },
      { label: "Projects", href: "/documents/projects" },
      { label: "2024", href: "/documents/projects/2024" },
      { label: "Q1", href: "/documents/projects/2024/q1" },
      { label: "January", href: "/documents/projects/2024/q1/january" },
      { label: "Weekly Report" },
    ];

    return (
      <div className="w-full max-w-2xl">
        <Breadcrumb>
          <BreadcrumbList className="flex-nowrap overflow-hidden">
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              const isFirst = index === 0;
              const isEllipsis = index === 1 && items.length > 4;
              const isHidden = index > 1 && index < items.length - 2 && items.length > 4;

              if (isEllipsis) {
                return (
                  <React.Fragment key="ellipsis">
                    <BreadcrumbItem>
                      <BreadcrumbEllipsis className="h-4 w-4" />
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </React.Fragment>
                );
              }

              if (isHidden) return null;

              return (
                <React.Fragment key={item.href || item.label}>
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage className="whitespace-nowrap">
                        {item.label}
                      </BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink 
                        href={item.href} 
                        className={cn(
                          "whitespace-nowrap transition-colors hover:text-foreground",
                          isFirst ? "flex items-center gap-1" : ""
                        )}
                      >
                        {isFirst && <Home className="h-3.5 w-3.5" />}
                        <span className={cn(isFirst ? "sr-only sm:not-sr-only" : "")}>
                          {item.label}
                        </span>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                  {!isLast && <BreadcrumbSeparator />}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        
        <div className="mt-4 text-sm text-muted-foreground">
          <p>Resize the browser window to see the responsive behavior. On smaller screens, the breadcrumb will truncate with an ellipsis.</p>
        </div>
      </div>
    );
  },
};

// With Custom Styling
export const WithCustomStyling: Story = {
  render: () => (
    <Breadcrumb>
      <BreadcrumbList className="rounded-lg bg-accent/20 p-2">
        <BreadcrumbItem>
          <BreadcrumbLink 
            href="/" 
            className="flex items-center gap-1 text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4 text-foreground/50" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbLink 
            href="/documents" 
            className="text-sm font-medium text-foreground/80 transition-colors hover:text-foreground"
          >
            Documents
          </BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4 text-foreground/50" />
        </BreadcrumbSeparator>
        <BreadcrumbItem>
          <BreadcrumbPage className="text-sm font-semibold text-primary">
            Document.pdf
          </BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  ),
};
