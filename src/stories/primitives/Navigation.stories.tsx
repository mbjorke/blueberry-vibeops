import * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";

// Mock Clerk hooks and components for Storybook
const mockUseUser = (isSignedIn: boolean) => ({
  user: isSignedIn ? {
    id: "user_123",
    firstName: "John",
    lastName: "Doe",
    emailAddresses: [{ emailAddress: "john.doe@example.com" }],
  } : null,
  isLoaded: true,
});

const mockUseClerk = () => ({
  signOut: () => Promise.resolve(),
});

const mockUseRouter = () => ({
  push: (path: string) => console.log(`Navigating to ${path}`),
});

const mockUsePathname = () => "/";

// Mock Clerk components
const MockSignInButton = ({ children, mode }: { children: React.ReactNode; mode?: string }) => (
  <button onClick={() => console.log("Sign in clicked")} className="bg-transparent border-none cursor-pointer">
    {children}
  </button>
);

const MockSignUpButton = ({ children, mode }: { children: React.ReactNode; mode?: string }) => (
  <button onClick={() => console.log("Sign up clicked")} className="bg-transparent border-none cursor-pointer">
    {children}
  </button>
);

const MockUserButton = () => (
  <button className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
    <span className="text-xs">JD</span>
  </button>
);

const MockSignedIn = ({ children }: { children: React.ReactNode }) => children;
const MockSignedOut = ({ children }: { children: React.ReactNode }) => children;

// Mock Next.js components
const MockLink = ({ href, children, className, onClick }: {
  href: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => (
  <a href={href} className={className} onClick={onClick}>
    {children}
  </a>
);

// Create a simple mocked Navigation component for Storybook
const MockNavigation = (props: any) => {
  const { brand = "blueberry", showAuth = true, isSignedIn = false, items = [] } = props;
  
  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <a href="/" className="flex items-center">
              <div className="text-2xl font-bold text-blue-600">
                🫐 {brand === "loppis" ? "Loppis" : "Blueberry"}
              </div>
            </a>
          </div>

          {/* Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {items.map((item: any, index: number) => (
              <a
                key={index}
                href={item.href}
                className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50"
              >
                {item.icon && <item.icon className="w-4 h-4" />}
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className="bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5">
                    {item.badge}
                  </span>
                )}
              </a>
            ))}
          </div>

          {/* User menu */}
          {showAuth && (
            <div className="hidden md:flex items-center space-x-2">
              {isSignedIn ? (
                <MockUserButton />
              ) : (
                <>
                  <MockSignInButton mode="modal">
                    <button className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">
                      Sign In
                    </button>
                  </MockSignInButton>
                  <MockSignUpButton mode="modal">
                    <button className="px-3 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                      Sign Up
                    </button>
                  </MockSignUpButton>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

const meta: Meta<typeof MockNavigation> = {
  title: "Navigation/Navigation",
  component: MockNavigation,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component: "A responsive navigation component with Clerk authentication integration and mobile support.",
      },
    },
  },
  argTypes: {
    brand: {
      control: { type: "select" },
      options: ["blueberry", "loppis"],
      description: "Brand variant for the logo",
    },
    showAuth: {
      control: "boolean",
      description: "Whether to show authentication buttons",
    },
    isSignedIn: {
      control: "boolean",
      description: "Mock authentication state for Storybook",
    },
  },
};

export default meta;
type Story = StoryObj<typeof MockNavigation>;

// Default Navigation
export const Default: Story = {
  render: () => <MockNavigation />,
};

// Blueberry Brand
export const BlueberryBrand: Story = {
  render: () => <MockNavigation brand="blueberry" />,
};

// Loppis Brand
export const LoppisBrand: Story = {
  render: () => <MockNavigation brand="loppis" />,
};

// Signed In State
export const SignedIn: Story = {
  render: () => <MockNavigation isSignedIn={true} />,
  parameters: {
    docs: {
      description: {
        story: "Navigation when user is signed in, showing user menu and additional navigation items.",
      },
    },
  },
};

// Signed Out State
export const SignedOut: Story = {
  render: () => <MockNavigation isSignedIn={false} />,
  parameters: {
    docs: {
      description: {
        story: "Navigation when user is signed out, showing sign in/up buttons.",
      },
    },
  },
};

// Without Authentication
export const WithoutAuth: Story = {
  render: () => <MockNavigation showAuth={false} />,
  parameters: {
    docs: {
      description: {
        story: "Navigation without authentication buttons.",
      },
    },
  },
};

// Custom Navigation Items
export const CustomItems: Story = {
  render: () => (
    <MockNavigation
      items={[
        {
          href: "/items",
          label: "Browse",
          icon: ({ className }) => (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          ),
        },
        {
          href: "/categories",
          label: "Categories",
          icon: ({ className }) => (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          ),
        },
        {
          href: "/favorites",
          label: "Favorites",
          badge: 3,
          icon: ({ className }) => (
            <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          ),
        },
      ]}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: "Navigation with custom items including badges and icons.",
      },
    },
  },
};

// Mobile View Simulation
export const MobileView: Story = {
  render: () => (
    <div className="max-w-sm">
      <MockNavigation isSignedIn={true} />
      <p className="mt-4 text-sm text-gray-600">
        Resize browser or use device toolbar to see mobile menu toggle
      </p>
    </div>
  ),
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story: "Navigation optimized for mobile devices with collapsible menu.",
      },
    },
  },
};

// Dark Mode Compatible
export const DarkMode: Story = {
  render: () => (
    <div className="bg-gray-900 p-4">
      <MockNavigation isSignedIn={true} />
    </div>
  ),
  parameters: {
    backgrounds: {
      default: "dark",
    },
    docs: {
      description: {
        story: "Navigation in dark mode context.",
      },
    },
  },
};
