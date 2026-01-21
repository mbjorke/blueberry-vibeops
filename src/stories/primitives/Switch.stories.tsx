import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import * as SwitchPrimitive from "@radix-ui/react-switch";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Moon, Sun, Wifi, WifiOff, Bell, BellOff, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";

const meta: Meta<typeof Switch> = {
  title: "Form/Switch",
  component: Switch,
  tags: ["autodocs"],
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the switch is disabled",
    },
    checked: {
      control: "boolean",
      description: "The controlled checked state of the switch",
    },
    onCheckedChange: {
      action: "checkedChange",
      description: "Event handler called when the checked state changes",
    },
    required: {
      control: "boolean",
      description: "Whether the switch is required",
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
type Story = StoryObj<typeof Switch>;

// Basic Switch
export const Default: Story = {};

// With Label
export const WithLabel = () => (
  <div className="flex items-center space-x-2">
    <Switch id="airplane-mode" />
    <Label htmlFor="airplane-mode">Airplane Mode</Label>
  </div>
);

// States
export const States = () => (
  <div className="space-y-4">
    <div className="flex items-center space-x-2">
      <Switch id="off" />
      <Label htmlFor="off">Off</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Switch id="on" checked />
      <Label htmlFor="on">On</Label>
    </div>
    <div className="flex items-center space-x-2">
      <Switch id="disabled-off" disabled />
      <Label htmlFor="disabled-off" className="text-muted-foreground">
        Disabled (off)
      </Label>
    </div>
    <div className="flex items-center space-x-2">
      <Switch id="disabled-on" checked disabled />
      <Label htmlFor="disabled-on" className="text-muted-foreground">
        Disabled (on)
      </Label>
    </div>
  </div>
);

// With Icons
export const WithIcons = () => {
  const [darkMode, setDarkMode] = React.useState(false);
  const [wifi, setWifi] = React.useState(true);
  const [notifications, setNotifications] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sun className="h-5 w-5 text-yellow-500" />
          <Label htmlFor="dark-mode">Dark Mode</Label>
        </div>
        <Switch
          id="dark-mode"
          checked={darkMode}
          onCheckedChange={setDarkMode}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {wifi ? (
            <Wifi className="h-5 w-5 text-primary" />
          ) : (
            <WifiOff className="h-5 w-5 text-muted-foreground" />
          )}
          <Label htmlFor="wifi">Wi-Fi</Label>
        </div>
        <Switch
          id="wifi"
          checked={wifi}
          onCheckedChange={setWifi}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {notifications ? (
            <Bell className="h-5 w-5 text-primary" />
          ) : (
            <BellOff className="h-5 w-5 text-muted-foreground" />
          )}
          <Label htmlFor="notifications">Notifications</Label>
        </div>
        <Switch
          id="notifications"
          checked={notifications}
          onCheckedChange={setNotifications}
        />
      </div>
    </div>
  );
};

// Custom Styling
export const CustomStyling = () => {
  const [checked, setChecked] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Label>Basic Customization</Label>
        <Switch
          checked={checked}
          onCheckedChange={setChecked}
          className={cn(
            "h-8 w-14 data-[state=unchecked]:bg-slate-300 data-[state=checked]:bg-green-500",
            checked ? "data-[state=checked]:bg-green-500" : "data-[state=unchecked]:bg-slate-300"
          )}
        >
          <SwitchPrimitive.Thumb
            className={cn(
              "h-7 w-7 rounded-full transition-transform",
              checked ? "translate-x-7" : "translate-x-0.5"
            )}
          >
            {checked ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <X className="h-4 w-4 text-slate-400" />
            )}
          </SwitchPrimitive.Thumb>
        </Switch>
      </div>

      <div className="flex items-center justify-between">
        <Label>Gradient Background</Label>
        <Switch
          className={cn(
            "h-7 w-14 data-[state=checked]:bg-gradient-to-r data-[state=checked]:from-pink-500 data-[state=checked]:to-rose-500"
          )}
        >
          <SwitchPrimitive.Thumb className="h-6 w-6 rounded-full bg-white" />
        </Switch>
      </div>
    </div>
  );
};

// With Form
export const WithForm = () => {
  const [settings, setSettings] = React.useState({
    darkMode: false,
    notifications: true,
    autoSave: false,
  });

  const handleChange = (key: string, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h3 className="text-lg font-medium">Settings</h3>
        <p className="text-sm text-muted-foreground">
          Manage your application preferences
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="dark-mode-setting">
              Dark Mode
            </Label>
            <p className="text-sm text-muted-foreground">
              Toggle between light and dark theme
            </p>
          </div>
          <Switch
            id="dark-mode-setting"
            checked={settings.darkMode}
            onCheckedChange={(checked) => handleChange("darkMode", checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="notifications-setting">
              Notifications
            </Label>
            <p className="text-sm text-muted-foreground">
              Enable or disable notifications
            </p>
          </div>
          <Switch
            id="notifications-setting"
            checked={settings.notifications}
            onCheckedChange={(checked) => handleChange("notifications", checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <Label className="text-base" htmlFor="auto-save-setting">
              Auto Save
            </Label>
            <p className="text-sm text-muted-foreground">
              Automatically save changes
            </p>
          </div>
          <Switch
            id="auto-save-setting"
            checked={settings.autoSave}
            onCheckedChange={(checked) => handleChange("autoSave", checked)}
          />
        </div>
      </div>

      <div className="pt-4
      ">
        <pre className="rounded-md bg-muted p-4 text-xs">
          <code>{JSON.stringify(settings, null, 2)}</code>
        </pre>
      </div>
    </div>
  );
};

// Accessibility
export const Accessibility = () => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="mb-2 text-sm font-medium">Accessible Switch</h3>
        <div className="flex items-center space-x-2">
          <Switch id="accessible-switch" />
          <Label htmlFor="accessible-switch">Enable feature</Label>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">
          This switch is fully accessible with keyboard navigation and proper ARIA attributes.
        </p>
      </div>

      <div className="pt-4">
        <h4 className="mb-2 text-sm font-medium">Keyboard Navigation</h4>
        <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          <li>Focus the switch using <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">Tab</kbd></li>
          <li>Toggle with <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">Space</kbd> or <kbd className="rounded border bg-muted px-1.5 py-0.5 text-xs">Enter</kbd></li>
        </ul>
      </div>
    </div>
  );
};
