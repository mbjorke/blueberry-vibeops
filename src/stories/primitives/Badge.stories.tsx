import type { Meta, StoryObj } from "@storybook/react";
import { Badge, badgeVariants } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, X, AlertTriangle, Info, Bell, Clock, Star, Zap } from "lucide-react";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
  component: Badge,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "secondary", "warning", "destructive", "outline"],
      description: "The visual style of the badge",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
  args: {
    children: "Badge",
    variant: "default",
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

// Basic Badge
export const Default: Story = {};

// All Variants
export const Variants = () => (
  <div className="flex flex-wrap items-center gap-4">
    <Badge variant="default">Default</Badge>
    <Badge variant="secondary">Secondary</Badge>
    <Badge variant="warning">Warning</Badge>
    <Badge variant="destructive">Destructive</Badge>
    <Badge variant="outline">Outline</Badge>
  </div>
);

// With Icons
export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-4">
    <Badge className="gap-1">
      <Check className="h-3 w-3" />
      Success
    </Badge>
    <Badge variant="secondary" className="gap-1">
      <Info className="h-3 w-3" />
      Info
    </Badge>
    <Badge variant="warning" className="gap-1">
      <AlertTriangle className="h-3 w-3" />
      Warning
    </Badge>
    <Badge variant="destructive" className="gap-1">
      <X className="h-3 w-3" />
      Error
    </Badge>
  </div>
);

// With Counters
export const WithCounters = () => (
  <div className="flex flex-wrap items-center gap-4">
    <div className="relative">
      <Bell className="h-5 w-5" />
      <Badge className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full p-0">
        3
      </Badge>
    </div>
    <div className="relative">
      <Badge variant="destructive" className="absolute -right-2 -top-2 h-5 w-5 items-center justify-center rounded-full p-0">
        5
      </Badge>
      <div className="h-10 w-10 rounded-full bg-muted" />
    </div>
  </div>
);

// Status Indicators
export const StatusIndicators = () => (
  <div className="space-y-4">
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 rounded-full bg-success" />
      <span>Active</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 rounded-full bg-warning" />
      <span>Pending</span>
    </div>
    <div className="flex items-center gap-2">
      <div className="h-3 w-3 rounded-full bg-destructive" />
      <span>Inactive</span>
    </div>
  </div>
);

// With Custom Content
export const CustomContent = () => (
  <div className="flex flex-wrap items-center gap-4">
    <Badge className="gap-1">
      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
      Featured
    </Badge>
    <Badge variant="secondary" className="gap-1">
      <Zap className="h-3 w-3 fill-amber-400 text-amber-400" />
      Pro
    </Badge>
    <Badge className="gap-1 bg-gradient-to-r from-blue-500 to-purple-500 text-white">
      Premium
    </Badge>
  </div>
);

// Interactive Example
export const Interactive: Story = {
  args: {
    children: "Click me",
    onClick: () => console.log("Badge clicked!"),
    className: "cursor-pointer hover:opacity-80 transition-opacity",
  },
  parameters: {
    docs: {
      description: {
        story: "This is an interactive badge. Check the Actions tab to see the click event.",
      },
    },
  },
};
