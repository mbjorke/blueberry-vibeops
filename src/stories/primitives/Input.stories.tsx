import type { Meta, StoryObj } from "@storybook/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";

const meta: Meta<typeof Input> = {
  title: "Primitives/Input",
  component: Input,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: { type: "select" },
      options: ["text", "email", "password", "number", "tel", "url", "search"],
      description: "The type of the input element",
    },
    disabled: {
      control: "boolean",
      description: "Whether the input is disabled",
    },
    placeholder: {
      control: "text",
      description: "Placeholder text",
    },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

// Basic Input
export const Default: Story = {
  args: {
    placeholder: "Enter text here...",
  },
};

// Input with Label
export const WithLabel = () => (
  <div className="grid w-full max-w-sm items-center gap-1.5">
    <Label htmlFor="email">Email</Label>
    <Input type="email" id="email" placeholder="name@example.com" />
  </div>
);

// Input with Icon
export const WithIcon = () => (
  <div className="relative">
    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
    <Input
      type="search"
      placeholder="Search..."
      className="pl-9"
    />
  </div>
);

// Input with Error State
export const ErrorState = () => (
  <div className="grid w-full max-w-sm items-center gap-1.5">
    <Label htmlFor="email" className="text-destructive">Email</Label>
    <Input
      type="email"
      id="email"
      placeholder="name@example.com"
      className="border-destructive focus-visible:ring-destructive"
      defaultValue="invalid-email"
    />
    <p className="text-sm text-destructive">Please enter a valid email address</p>
  </div>
);

// Disabled Input
export const Disabled: Story = {
  args: {
    disabled: true,
    placeholder: "This input is disabled",
  },
};

// Input with Right Element
export const WithRightElement = () => {
  const [showPassword, setShowPassword] = useState(false);
  
  return (
    <div className="relative">
      <Input
        type={showPassword ? "text" : "password"}
        placeholder="Enter password"
        className="pr-10"
      />
      <button
        type="button"
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <EyeOff className="h-4 w-4" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
      </button>
    </div>
  );
};

// Sizes
export const Sizes = () => (
  <div className="space-y-4">
    <div>
      <Label>Small</Label>
      <Input className="h-8 text-sm" placeholder="Small input" />
    </div>
    <div>
      <Label>Default</Label>
      <Input placeholder="Default input" />
    </div>
    <div>
      <Label>Large</Label>
      <Input className="h-12 text-base" placeholder="Large input" />
    </div>
  </div>
);

// Input with Helper Text
export const WithHelperText = () => (
  <div className="grid w-full max-w-sm items-center gap-1.5">
    <Label htmlFor="username">Username</Label>
    <Input id="username" placeholder="Enter your username" />
    <p className="text-sm text-muted-foreground">This will be your public display name.</p>
  </div>
);
