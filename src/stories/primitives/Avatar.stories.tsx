import type { Meta, StoryObj } from "@storybook/react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { User, User2, UserCheck, UserCog, UserPlus, UserX } from "lucide-react";

const meta: Meta<typeof Avatar> = {
  title: "Primitives/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  argTypes: {
    className: {
      control: "text",
      description: "Additional CSS classes",
    },
  },
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

// Basic Avatar
export const Default: Story = {
  render: () => (
    <Avatar>
      <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
  ),
};

// Sizes
export const Sizes = () => (
  <div className="flex items-center gap-8">
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground">xs</span>
      <Avatar className="h-6 w-6">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback className="text-xs">CN</AvatarFallback>
      </Avatar>
    </div>
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground">sm</span>
      <Avatar className="h-8 w-8">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback className="text-sm">CN</AvatarFallback>
      </Avatar>
    </div>
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground">md</span>
      <Avatar className="h-10 w-10">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback>CN</AvatarFallback>
      </Avatar>
    </div>
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground">lg</span>
      <Avatar className="h-14 w-14">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback className="text-lg">CN</AvatarFallback>
      </Avatar>
    </div>
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs text-muted-foreground">xl</span>
      <Avatar className="h-20 w-20">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback className="text-xl">CN</AvatarFallback>
      </Avatar>
    </div>
  </div>
);

// Fallback Only
export const FallbackOnly = () => (
  <div className="flex items-center gap-4">
    <Avatar>
      <AvatarFallback>CN</AvatarFallback>
    </Avatar>
    <Avatar>
      <AvatarFallback className="bg-primary text-primary-foreground">
        <User className="h-4 w-4" />
      </AvatarFallback>
    </Avatar>
  </div>
);

// With Status
export const WithStatus = () => {
  const statuses = [
    { color: "bg-success", label: "Online" },
    { color: "bg-warning", label: "Away" },
    { color: "bg-destructive", label: "Busy" },
    { color: "bg-muted-foreground/20", label: "Offline" },
  ];

  return (
    <div className="flex items-center gap-8">
      {statuses.map((status) => (
        <div key={status.label} className="flex flex-col items-center gap-2">
          <div className="relative">
            <Avatar>
              <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <div
              className={cn(
                "absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-background",
                status.color
              )}
            />
          </div>
          <span className="text-xs text-muted-foreground">{status.label}</span>
        </div>
      ))}
    </div>
  );
};

// Grouped
export const Grouped = () => (
  <div className="flex -space-x-2">
    {Array.from({ length: 5 }).map((_, i) => (
      <Avatar key={i} className="h-10 w-10 border-2 border-background">
        <AvatarImage
          src={`https://i.pravatar.cc/150?img=${i + 1}`}
          alt={`User ${i + 1}`}
        />
        <AvatarFallback>U{i + 1}</AvatarFallback>
      </Avatar>
    ))}
    <Avatar className="h-10 w-10 border-2 border-background">
      <AvatarFallback className="bg-muted text-muted-foreground">
        +5
      </AvatarFallback>
    </Avatar>
  </div>
);

// With Custom Content
export const CustomContent = () => (
  <div className="flex flex-wrap items-center gap-8">
    <div className="flex flex-col items-center gap-2">
      <Avatar className="h-16 w-16">
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
          <User2 className="h-6 w-6 text-white" />
        </div>
      </Avatar>
      <span className="text-xs text-muted-foreground">Gradient</span>
    </div>
    
    <div className="flex flex-col items-center gap-2">
      <Avatar className="h-16 w-16 border-2 border-primary">
        <div className="flex h-full w-full items-center justify-center bg-muted">
          <UserCog className="h-6 w-6 text-muted-foreground" />
        </div>
      </Avatar>
      <span className="text-xs text-muted-foreground">Bordered</span>
    </div>
    
    <div className="flex flex-col items-center gap-2">
      <div className="relative">
        <Avatar className="h-16 w-16">
          <div className="flex h-full w-full items-center justify-center bg-primary">
            <UserPlus className="h-6 w-6 text-primary-foreground" />
          </div>
        </Avatar>
        <div className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-xs text-destructive-foreground">
          3
        </div>
      </div>
      <span className="text-xs text-muted-foreground">With Badge</span>
    </div>
  </div>
);

// Interactive
export const Interactive: Story = {
  render: () => (
    <div className="flex flex-col items-center gap-4">
      <Avatar className="h-20 w-20 cursor-pointer transition-transform hover:scale-110">
        <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
        <AvatarFallback className="bg-primary text-primary-foreground">
          <UserX className="h-8 w-8" />
        </AvatarFallback>
      </Avatar>
      <p className="text-sm text-muted-foreground">Click me!</p>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: "This is an interactive avatar. Hover to see the scale effect.",
      },
    },
  },
};
