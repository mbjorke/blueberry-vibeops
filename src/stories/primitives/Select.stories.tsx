import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Check, ChevronDown, ChevronUp, Loader2, Plus, Search, Users, Calendar, CreditCard, Settings, User } from "lucide-react";

const meta: Meta<typeof Select> = {
  title: "Form/Select",
  component: Select,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    disabled: {
      control: "boolean",
      description: "Whether the select is disabled",
    },
    required: {
      control: "boolean",
      description: "Whether the select is required",
    },
    defaultValue: {
      control: "text",
      description: "The default selected value",
    },
    value: {
      control: "text",
      description: "The controlled selected value",
    },
    onValueChange: {
      action: "valueChange",
      description: "Event handler called when the selected value changes",
    },
  },
  args: {
    disabled: false,
    required: false,
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

// Basic Select
export const Basic: Story = {
  render: (args) => (
    <div className="w-[200px]">
      <Select {...args}>
        <SelectTrigger>
          <SelectValue placeholder="Select an option" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="option-1">Option 1</SelectItem>
          <SelectItem value="option-2">Option 2</SelectItem>
          <SelectItem value="option-3">Option 3</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
};

// With Label
export const WithLabel = () => (
  <div className="grid w-[200px] gap-1.5">
    <Label htmlFor="select-1">Choose an option</Label>
    <Select>
      <SelectTrigger id="select-1">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="option-1">Option 1</SelectItem>
        <SelectItem value="option-2">Option 2</SelectItem>
        <SelectItem value="option-3">Option 3</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

// With Groups
export const WithGroups = () => (
  <div className="w-[250px]">
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>Fruits</SelectLabel>
          <SelectItem value="apple">Apple</SelectItem>
          <SelectItem value="banana">Banana</SelectItem>
          <SelectItem value="orange">Orange</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>Vegetables</SelectLabel>
          <SelectItem value="carrot">Carrot</SelectItem>
          <SelectItem value="broccoli">Broccoli</SelectItem>
          <SelectItem value="spinach">Spinach</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  </div>
);

// With Icons
export const WithIcons = () => {
  const [selectedValue, setSelectedValue] = React.useState("");
  
  const getIcon = (value: string) => {
    switch (value) {
      case "profile":
        return <User className="mr-2 h-4 w-4" />;
      case "billing":
        return <CreditCard className="mr-2 h-4 w-4" />;
      case "settings":
        return <Settings className="mr-2 h-4 w-4" />;
      default:
        return null;
    }
  };
  
  return (
    <div className="w-[250px]">
      <Select value={selectedValue} onValueChange={setSelectedValue}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select an option">
            {selectedValue && (
              <div className="flex items-center">
                {getIcon(selectedValue)}
                {selectedValue.charAt(0).toUpperCase() + selectedValue.slice(1)}
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="profile">
            <div className="flex items-center">
              <User className="mr-2 h-4 w-4" />
              Profile
            </div>
          </SelectItem>
          <SelectItem value="billing">
            <div className="flex items-center">
              <CreditCard className="mr-2 h-4 w-4" />
              Billing
            </div>
          </SelectItem>
          <SelectItem value="settings">
            <div className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Settings
            </div>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

// With Search
export const WithSearch = () => {
  const [searchTerm, setSearchTerm] = React.useState("");
  
  const countries = [
    { value: "us", label: "United States" },
    { value: "ca", label: "Canada" },
    { value: "uk", label: "United Kingdom" },
    { value: "au", label: "Australia" },
    { value: "de", label: "Germany" },
    { value: "fr", label: "France" },
    { value: "jp", label: "Japan" },
  ];
  
  const filteredCountries = countries.filter(country =>
    country.label.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  return (
    <div className="w-[300px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a country" />
        </SelectTrigger>
        <SelectContent>
          <div className="relative px-3 py-2">
            <Search className="absolute left-5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search countries..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <SelectGroup>
            {filteredCountries.length > 0 ? (
              filteredCountries.map((country) => (
                <SelectItem key={country.value} value={country.value}>
                  {country.label}
                </SelectItem>
              ))
            ) : (
              <div className="py-2 text-center text-sm text-muted-foreground">
                No countries found
              </div>
            )}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

// With Form
export const WithForm = () => {
  const [formData, setFormData] = React.useState({
    name: "",
    country: "",
    plan: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.country || !formData.plan) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert(JSON.stringify(formData, null, 2));
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Create Account</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              required
            />
          </div>
          
          <div className="grid gap-1.5">
            <Label htmlFor="country">Country</Label>
            <Select
              value={formData.country}
              onValueChange={(value) => setFormData({...formData, country: value})}
              required
            >
              <SelectTrigger id="country">
                <SelectValue placeholder="Select a country" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="us">United States</SelectItem>
                <SelectItem value="ca">Canada</SelectItem>
                <SelectItem value="uk">United Kingdom</SelectItem>
                <SelectItem value="au">Australia</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-1.5">
            <Label>Subscription Plan</Label>
            <div className="grid gap-2">
              <div className="flex items-center space-x-2">
                <Select
                  value={formData.plan}
                  onValueChange={(value) => setFormData({...formData, plan: value})}
                  required
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select a plan" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Free (10,000 requests/month)</SelectItem>
                    <SelectItem value="pro">Pro (100,000 requests/month)</SelectItem>
                    <SelectItem value="enterprise">Enterprise (Unlimited)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Account"
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

// With Custom Trigger
export const WithCustomTrigger = () => {
  const [selectedValue, setSelectedValue] = React.useState("");
  
  return (
    <div className="w-[250px]">
      <Select value={selectedValue} onValueChange={setSelectedValue}>
        <SelectTrigger className="w-full justify-between">
          <div className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            <span>{selectedValue || "Select a role"}</span>
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="admin">Admin</SelectItem>
          <SelectItem value="editor">Editor</SelectItem>
          <SelectItem value="viewer">Viewer</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};

// With Scrollable Content
export const WithScrollableContent = () => {
  const timezones = [
    "(GMT-12:00) International Date Line West",
    "(GMT-11:00) Midway Island, Samoa",
    "(GMT-10:00) Hawaii",
    "(GMT-09:00) Alaska",
    "(GMT-08:00) Pacific Time (US & Canada)",
    "(GMT-07:00) Arizona",
    "(GMT-07:00) Chihuahua, La Paz, Mazatlan",
    "(GMT-07:00) Mountain Time (US & Canada)",
    "(GMT-06:00) Central America",
    "(GMT-06:00) Central Time (US & Canada)",
    "(GMT-06:00) Guadalajara, Mexico City, Monterrey",
    "(GMT-06:00) Saskatchewan",
    "(GMT-05:00) Bogota, Lima, Quito",
    "(GMT-05:00) Eastern Time (US & Canada)",
    "(GMT-05:00) Indiana (East)",
    "(GMT-04:00) Atlantic Time (Canada)",
    "(GMT-04:00) Caracas, La Paz",
    "(GMT-04:00) Manaus",
    "(GMT-04:00) Santiago",
    "(GMT-03:30) Newfoundland",
    "(GMT-03:00) Brasilia",
    "(GMT-03:00) Buenos Aires, Georgetown",
    "(GMT-03:00) Greenland",
    "(GMT-03:00) Montevideo",
    "(GMT-02:00) Mid-Atlantic",
    "(GMT-01:00) Cape Verde Is.",
    "(GMT-01:00) Azores",
    "(GMT+00:00) Casablanca, Monrovia, Reykjavik",
    "(GMT+00:00) Greenwich Mean Time : Dublin, Edinburgh, Lisbon, London",
    "(GMT+01:00) Amsterdam, Berlin, Bern, Rome, Stockholm, Vienna",
    "(GMT+01:00) Belgrade, Bratislava, Budapest, Ljubljana, Prague",
    "(GMT+01:00) Brussels, Copenhagen, Madrid, Paris",
    "(GMT+01:00) Sarajevo, Skopje, Warsaw, Zagreb",
    "(GMT+01:00) West Central Africa",
    "(GMT+02:00) Amman",
    "(GMT+02:00) Athens, Bucharest, Istanbul",
    "(GMT+02:00) Beirut",
    "(GMT+02:00) Cairo",
    "(GMT+02:00) Harare, Pretoria",
    "(GMT+02:00) Helsinki, Kyiv, Riga, Sofia, Tallinn, Vilnius",
    "(GMT+02:00) Jerusalem",
    "(GMT+02:00) Minsk",
    "(GMT+02:00) Windhoek",
    "(GMT+03:00) Kuwait, Riyadh, Baghdad",
    "(GMT+03:00) Moscow, St. Petersburg, Volgograd",
    "(GMT+03:00) Nairobi",
    "(GMT+03:30) Tehran",
    "(GMT+04:00) Abu Dhabi, Muscat",
    "(GMT+04:00) Baku",
    "(GMT+04:00) Yerevan",
    "(GMT+04:30) Kabul",
    "(GMT+05:00) Yekaterinburg",
    "(GMT+05:00) Islamabad, Karachi, Tashkent",
    "(GMT+05:30) Chennai, Kolkata, Mumbai, New Delhi",
    "(GMT+05:45) Kathmandu",
    "(GMT+06:00) Almaty, Novosibirsk",
    "(GMT+06:00) Astana, Dhaka",
    "(GMT+06:30) Yangon (Rangoon)",
    "(GMT+07:00) Bangkok, Hanoi, Jakarta",
    "(GMT+07:00) Krasnoyarsk",
    "(GMT+08:00) Beijing, Chongqing, Hong Kong, Urumqi",
    "(GMT+08:00) Kuala Lumpur, Singapore",
    "(GMT+08:00) Irkutsk, Ulaan Bataar",
    "(GMT+08:00) Perth",
    "(GMT+08:00) Taipei",
    "(GMT+09:00) Osaka, Sapporo, Tokyo",
    "(GMT+09:00) Seoul",
    "(GMT+09:00) Yakutsk",
    "(GMT+09:30) Adelaide",
    "(GMT+09:30) Darwin",
    "(GMT+10:00) Brisbane",
    "(GMT+10:00) Canberra, Melbourne, Sydney",
    "(GMT+10:00) Hobart",
    "(GMT+10:00) Guam, Port Moresby",
    "(GMT+10:00) Vladivostok",
    "(GMT+11:00) Magadan, Solomon Is., New Caledonia",
    "(GMT+12:00) Auckland, Wellington",
    "(GMT+12:00) Fiji, Kamchatka, Marshall Is.",
    "(GMT+13:00) Nuku'alofa"
  ];
  
  return (
    <div className="w-[350px]">
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a timezone" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          <div className="sticky top-0 z-10 bg-background px-3 py-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search timezones..."
                className="h-8 pl-8"
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>
          <SelectGroup>
            {timezones.map((timezone, index) => (
              <SelectItem key={index} value={timezone}>
                {timezone}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
