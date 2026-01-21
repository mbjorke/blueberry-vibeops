import type { Meta, StoryObj } from "@storybook/react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

const meta: Meta<typeof Label> = {
  title: "Primitives/Label",
  component: Label,
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
    htmlFor: {
      control: "text",
      description: "ID of the form element the label is associated with",
    },
  },
  args: {
    children: "Label",
  },
  parameters: {
    layout: "centered",
  },
  decorators: [
    (Story) => (
      <div className="w-[400px] p-4">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Label>;

// Basic Label
export const Default: Story = {};

// With Form Controls
export const WithFormControls = () => (
  <div className="grid w-full max-w-sm items-center gap-5">
    <div className="space-y-2">
      <Label htmlFor="email">Email</Label>
      <Input type="email" id="email" placeholder="Enter your email" />
    </div>

    <div className="space-y-2">
      <Label htmlFor="username">Username</Label>
      <div className="relative">
        <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
          <span className="text-sm text-muted-foreground">@</span>
        </div>
        <Input
          id="username"
          placeholder="username"
          className="pl-8"
        />
      </div>
    </div>

    <div className="space-y-2">
      <Label htmlFor="bio">Bio</Label>
      <Textarea id="bio" placeholder="Tell us about yourself" className="min-h-[100px]" />
      <p className="text-sm text-muted-foreground">
        This will be displayed on your public profile.
      </p>
    </div>
  </div>
);

// With Checkbox
export const WithCheckbox = () => (
  <div className="flex items-center space-x-2">
    <Checkbox id="terms" />
    <Label htmlFor="terms">Accept terms and conditions</Label>
  </div>
);

// With Radio Group
export const WithRadioGroup = () => (
  <RadioGroup defaultValue="comfortable" className="space-y-2">
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="default" id="r1" />
      <Label htmlFor="r1">Default</Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="comfortable" id="r2" />
      <Label htmlFor="r2">Comfortable</Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem value="compact" id="r3" />
      <Label htmlFor="r3">Compact</Label>
    </div>
  </RadioGroup>
);

// With Switch
export const WithSwitch = () => (
  <div className="flex items-center space-x-2">
    <Switch id="airplane-mode" />
    <Label htmlFor="airplane-mode">Airplane Mode</Label>
  </div>
);

// Required Fields
export const RequiredFields = () => (
  <form className="space-y-6">
    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor="fullname">Full Name</Label>
        <span className="text-destructive">*</span>
      </div>
      <Input id="fullname" required />
    </div>

    <div className="space-y-2">
      <div className="flex items-center gap-1">
        <Label htmlFor="email">Email</Label>
        <span className="text-destructive">*</span>
      </div>
      <Input id="email" type="email" required />
    </div>
  </form>
);

// Disabled State
export const DisabledState = () => (
  <div className="space-y-4">
    <div className="space-y-2">
      <Label htmlFor="disabled-input" className="text-muted-foreground">
        Disabled Input
      </Label>
      <Input id="disabled-input" disabled />
    </div>

    <div className="flex items-center space-x-2">
      <Checkbox id="disabled-checkbox" disabled />
      <Label htmlFor="disabled-checkbox" className="text-muted-foreground">
        Disabled Checkbox
      </Label>
    </div>
  </div>
);

// Custom Styling
export const CustomStyling = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Label
        htmlFor="fancy"
        className="text-lg font-bold text-primary"
      >
        Fancy Label
      </Label>
      <Input id="fancy" className="border-primary/50" />
    </div>

    <div className="space-y-2">
      <Label
        htmlFor="gradient"
        className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-lg font-bold text-transparent"
      >
        Gradient Label
      </Label>
      <Input id="gradient" className="border-purple-500/50" />
    </div>
  </div>
);

// With Helper Text
export const WithHelperText = () => {
  const fields = [
    {
      id: "username",
      label: "Username",
      helper: "This is your public display name.",
      placeholder: "Enter username",
    },
    {
      id: "password",
      label: "Password",
      helper: "Must be at least 8 characters long.",
      placeholder: "Enter password",
      type: "password",
    },
  ];

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.id} className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor={field.id}>{field.label}</Label>
            <span className="text-xs text-muted-foreground">
              {field.helper}
            </span>
          </div>
          <Input
            id={field.id}
            type={field.type || "text"}
            placeholder={field.placeholder}
          />
        </div>
      ))}
    </div>
  );
};
