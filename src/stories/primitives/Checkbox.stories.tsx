import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Check, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

const meta: Meta<typeof Checkbox> = {
  title: "Form/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the checkbox is disabled",
    },
    checked: {
      control: { type: "select" },
      options: [true, false, "indeterminate"],
      description: "The controlled checked state of the checkbox",
    },
    onCheckedChange: {
      action: "checkedChange",
      description: "Event handler called when the checked state changes",
    },
    required: {
      control: "boolean",
      description: "Whether the checkbox is required",
    },
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
  args: {
    disabled: false,
    required: false,
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

// Basic Checkbox
export const Default: Story = {
  render: (args) => <Checkbox {...args} id="terms" />,
};

// With Label
export const WithLabel = () => (
  <div className="flex items-center space-x-2">
    <Checkbox id="terms" />
    <Label htmlFor="terms">Accept terms and conditions</Label>
  </div>
);

// States
export const States = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-2">
      <Checkbox id="unchecked" />
      <Label htmlFor="unchecked">Unchecked</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="checked" checked />
      <Label htmlFor="checked">Checked</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="indeterminate" checked="indeterminate" />
      <Label htmlFor="indeterminate">Indeterminate</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="disabled" disabled />
      <Label htmlFor="disabled" className="text-muted-foreground">
        Disabled
      </Label>
    </div>
    <div className="flex items-center space-x-2">
      <Checkbox id="disabled-checked" checked disabled />
      <Label htmlFor="disabled-checked" className="text-muted-foreground">
        Disabled checked
      </Label>
    </div>
  </div>
);

// With Form
export const WithForm = () => {
  const [checked, setChecked] = React.useState(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="form-terms"
          checked={checked}
          onCheckedChange={(value) => setChecked(!!value)}
        />
        <Label htmlFor="form-terms">I agree to the terms and conditions</Label>
      </div>
      <Button
        type="submit"
        disabled={!checked}
        className={cn(!checked && "opacity-50 cursor-not-allowed")}
      >
        Continue
      </Button>
      <p className="text-sm text-muted-foreground">
        {checked
          ? "You can now continue with the form."
          : "You must accept the terms to continue."}
      </p>
    </div>
  );
};

// With Custom Icons
export const WithCustomIcons = () => {
  const [checked, setChecked] = React.useState<boolean | "indeterminate">(false);
  
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="custom-icons"
          checked={checked}
          onCheckedChange={setChecked}
          className={cn(
            "h-6 w-6 rounded-md border-2 data-[state=checked]:bg-green-500 data-[state=indeterminate]:bg-yellow-500",
            checked === "indeterminate" && "bg-yellow-500"
          )}
        >
          <CheckboxPrimitive.Indicator className="text-white">
            {checked === "indeterminate" ? (
              <Minus className="h-4 w-4" />
            ) : (
              <Check className="h-4 w-4" />
            )}
          </CheckboxPrimitive.Indicator>
        </Checkbox>
        <Label htmlFor="custom-icons">
          {checked === "indeterminate" ? "Partially Completed" : "Task"}
        </Label>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setChecked("indeterminate")}
        >
          Set Indeterminate
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setChecked(false)}
        >
          Uncheck
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setChecked(true)}
        >
          Check
        </Button>
      </div>
    </div>
  );
};

// Checkbox Group
export const CheckboxGroup = () => {
  const [selected, setSelected] = React.useState<string[]>([]);
  
  const options = [
    { id: "react", label: "React" },
    { id: "vue", label: "Vue" },
    { id: "svelte", label: "Svelte" },
    { id: "angular", label: "Angular" },
  ];
  
  const toggleOption = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(option => option !== id)
        : [...prev, id]
    );
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Select your favorite frameworks</Label>
        <div className="space-y-2">
          {options.map((option) => (
            <div key={option.id} className="flex items-center space-x-2">
              <Checkbox
                id={option.id}
                checked={selected.includes(option.id)}
                onCheckedChange={() => toggleOption(option.id)}
              />
              <Label htmlFor={option.id}>{option.label}</Label>
            </div>
          ))}
        </div>
      </div>
      <div className="pt-4 border-t">
        <p className="text-sm text-muted-foreground">
          Selected: {selected.length > 0 ? selected.join(", ") : "None"}
        </p>
      </div>
    </div>
  );
};

// With Card
export const WithCard = () => {
  const [selected, setSelected] = React.useState<string[]>([]);
  
  const plans = [
    {
      id: "starter",
      name: "Starter",
      description: "Perfect for individuals",
      price: "$9",
      features: ["5 projects", "10GB storage", "Basic support"],
    },
    {
      id: "pro",
      name: "Pro",
      description: "For growing teams",
      price: "$29",
      features: ["Unlimited projects", "100GB storage", "Priority support"],
      popular: true,
    },
    {
      id: "enterprise",
      name: "Enterprise",
      description: "For large organizations",
      price: "Custom",
      features: ["Unlimited everything", "Dedicated support", "Custom solutions"],
    },
  ];
  
  const togglePlan = (id: string) => {
    setSelected(prev => 
      prev.includes(id) 
        ? prev.filter(plan => plan !== id)
        : [...prev, id]
    );
  };
  
  return (
    <div className="grid gap-4 md:grid-cols-3">
      {plans.map((plan) => (
        <div
          key={plan.id}
          className={cn(
            "relative rounded-lg border p-4 transition-all",
            selected.includes(plan.id) ? "border-primary ring-2 ring-primary/20" : "",
            plan.popular ? "ring-2 ring-primary/20" : ""
          )}
        >
          {plan.popular && (
            <div className="absolute -top-2 right-4 rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              Popular
            </div>
          )}
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">{plan.name}</h3>
              <p className="text-sm text-muted-foreground">{plan.description}</p>
            </div>
            <Checkbox
              id={plan.id}
              checked={selected.includes(plan.id)}
              onCheckedChange={() => togglePlan(plan.id)}
              className="h-5 w-5"
            />
          </div>
          <div className="mt-4">
            <p className="text-2xl font-bold">{plan.price}</p>
            <ul className="mt-2 space-y-1 text-sm">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  <Check className="mr-2 h-3.5 w-3.5 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ))}
    </div>
  );
};
