import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Check, Loader2, Send, Smile, X } from "lucide-react";

const meta: Meta<typeof Textarea> = {
  title: "Form/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean", description: "Whether the textarea is disabled" },
    placeholder: { control: "text", description: "Placeholder text" },
    rows: { control: { type: "number", min: 1, max: 20 }, description: "Number of visible text lines" },
    className: { control: "text", description: "Additional CSS classes" },
  },
  args: {
    placeholder: "Type your message here...",
    disabled: false,
    rows: 4,
  },
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};

export const WithLabel = () => (
  <div className="grid w-full gap-1.5">
    <Label htmlFor="message">Your message</Label>
    <Textarea placeholder="Type your message here." id="message" />
  </div>
);

export const States = () => (
  <div className="space-y-4">
    <div className="grid w-full gap-1.5">
      <Label htmlFor="default">Default</Label>
      <Textarea id="default" placeholder="Type here..." />
    </div>
    <div className="grid w-full gap-1.5">
      <Label htmlFor="disabled">Disabled</Label>
      <Textarea id="disabled" placeholder="This is disabled" disabled />
    </div>
    <div className="grid w-full gap-1.5">
      <Label htmlFor="error">With Error</Label>
      <Textarea
        id="error"
        placeholder="This field has an error"
        className="border-destructive focus-visible:ring-destructive"
      />
      <p className="text-sm text-destructive">This field is required</p>
    </div>
  </div>
);

// Sizes and Variations
export const Sizes = () => (
  <div className="space-y-4">
    <div className="grid w-full gap-1.5">
      <Label htmlFor="small">Small</Label>
      <Textarea id="small" placeholder="Small textarea" className="min-h-[60px] text-sm" />
    </div>
    <div className="grid w-full gap-1.5">
      <Label htmlFor="default">Default</Label>
      <Textarea id="default" placeholder="Default textarea" />
    </div>
    <div className="grid w-full gap-1.5">
      <Label htmlFor="large">Large</Label>
      <Textarea id="large" placeholder="Large textarea" className="min-h-[120px] text-base" />
    </div>
  </div>
);

// With Character Count
export const WithCharacterCount = () => {
  const [value, setValue] = React.useState("");
  const maxLength = 280;
  
  return (
    <div className="grid w-full gap-1.5">
      <div className="flex items-center justify-between">
        <Label htmlFor="character-count">Your message</Label>
        <span className={cn(
          "text-xs",
          value.length > maxLength ? "text-destructive" : "text-muted-foreground"
        )}>
          {value.length}/{maxLength}
        </span>
      </div>
      <Textarea
        id="character-count"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        maxLength={maxLength}
        className={cn(
          value.length > maxLength && "border-destructive focus-visible:ring-destructive"
        )}
      />
      {value.length > maxLength && (
        <p className="text-sm text-destructive">
          You've exceeded the maximum character limit
        </p>
      )}
    </div>
  );
};

// With Form
export const WithForm = () => {
  const [message, setMessage] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;
    
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      alert(`Message sent: ${message}`);
      setMessage("");
      setIsSubmitting(false);
    }, 1000);
  };
  
  return (
    <Card className="w-[400px]">
      <CardHeader>
        <CardTitle>Contact Us</CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Your name" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="your@email.com" required />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="message">Message</Label>
            <Textarea
              id="message"
              placeholder="How can we help you?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              required
            />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" size="sm">
            <Smile className="mr-2 h-4 w-4" />
            Add emoji
          </Button>
          <Button type="submit" disabled={!message.trim() || isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Send message
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

// With Auto Resize
export const AutoResize = () => {
  const [value, setValue] = React.useState("");
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value);
    
    // Auto-resize
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };
  
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="auto-resize">Auto-resizing textarea</Label>
      <Textarea
        ref={textareaRef}
        id="auto-resize"
        value={value}
        onChange={handleChange}
        className="min-h-[60px] max-h-[300px] resize-none overflow-hidden"
        placeholder="Type here and the textarea will grow..."
      />
    </div>
  );
};

// With Validation
export const WithValidation = () => {
  const [value, setValue] = React.useState("");
  const [isValid, setIsValid] = React.useState<boolean | null>(null);
  
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };
  
  const handleBlur = () => {
    if (value.trim() === "") {
      setIsValid(null);
    } else {
      setIsValid(validateEmail(value));
    }
  };
  
  return (
    <div className="grid w-full gap-1.5">
      <Label htmlFor="email">Email Address</Label>
      <Textarea
        id="email"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        placeholder="Enter your email address"
        className={cn(
          "pr-10",
          isValid === false && "border-destructive focus-visible:ring-destructive"
        )}
      />
      <div className="flex items-center gap-2">
        {isValid === true && (
          <>
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm text-green-600">Valid email address</span>
          </>
        )}
        {isValid === false && (
          <>
            <X className="h-4 w-4 text-destructive" />
            <span className="text-sm text-destructive">Please enter a valid email address</span>
          </>
        )}
      </div>
    </div>
  );
};
