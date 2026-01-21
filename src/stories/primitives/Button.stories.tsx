import type { Meta, StoryObj } from "@storybook/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { ArrowRight, Check, Plus, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const meta: Meta<typeof Button> = {
  title: "Primitives/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: [
        "default", 
        "destructive", 
        "outline", 
        "secondary", 
        "ghost", 
        "link",
        "premium",
        "success",
        "fintech"
      ],
      description: "The visual style of the button",
    },
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg", "xl", "icon", "circle"],
      description: "The size of the button",
    },
    asChild: {
      control: "boolean",
      description: "Render as a child component",
    },
    disabled: {
      control: "boolean",
      description: "Whether the button is disabled",
    },
    children: {
      control: "text",
      description: "Button content",
    },
  },
  args: {
    variant: "default",
    size: "default",
    children: "Button",
    disabled: false,
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

// Basic Button
export const Default: Story = {};

// All Variants
export const Variants = () => {
  const variants = [
    "default", 
    "destructive", 
    "outline", 
    "secondary", 
    "ghost", 
    "link",
    "premium",
    "success",
    "fintech"
  ] as const;
  
  return (
    <div className="grid grid-cols-2 gap-4">
      {variants.map((variant) => (
        <div key={variant} className="flex flex-col items-center gap-2">
          <span className="text-xs text-muted-foreground">{variant}</span>
          <Button variant={variant}>
            {variant.charAt(0).toUpperCase() + variant.slice(1)}
          </Button>
        </div>
      ))}
    </div>
  );
};

// All Sizes
export const Sizes = () => {
  const sizes = ["sm", "default", "lg", "xl"] as const;
  
  return (
    <div className="flex flex-col items-center gap-4">
      {sizes.map((size) => (
        <div key={size} className="flex items-center gap-4">
          <span className="w-20 text-sm text-muted-foreground">{size}</span>
          <Button size={size}>
            Button
          </Button>
        </div>
      ))}
    </div>
  );
};

// With Icons
export const WithIcons = () => (
  <div className="flex flex-wrap items-center gap-4">
    <Button>
      Get Started
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
    <Button variant="outline">
      <Check className="mr-2 h-4 w-4" />
      Complete
    </Button>
    <Button size="icon">
      <Plus className="h-4 w-4" />
    </Button>
  </div>
);

// Loading State
export const Loading = () => (
  <div className="flex items-center gap-4">
    <Button disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </Button>
    <Button variant="outline" disabled>
      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      Loading...
    </Button>
  </div>
);

// Disabled State
export const Disabled = () => (
  <div className="flex items-center gap-4">
    <Button disabled>Default Disabled</Button>
    <Button variant="outline" disabled>Outline Disabled</Button>
    <Button variant="ghost" disabled>Ghost Disabled</Button>
  </div>
);

// As Child
export const AsChild = () => (
  <div className="space-y-4">
    <Button asChild>
      <a href="#">Button as Link</a>
    </Button>
    <Button asChild variant="outline">
      <div className="flex items-center gap-2">
        <span>Custom Element</span>
        <span className="text-xs opacity-70">(click me)</span>
      </div>
    </Button>
  </div>
);

// Custom Styling
export const CustomStyling = () => (
  <Button 
    className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
  >
    Custom Gradient
  </Button>
);

// Interactive Example
export const Interactive: Story = {
  args: {
    variant: "default",
    size: "default",
    children: "Click me",
    onClick: () => console.log("Button clicked!"),
  },
  parameters: {
    docs: {
      description: {
        story: "This is an interactive button. Check the Actions tab to see the click event.",
      },
    },
  },
};
