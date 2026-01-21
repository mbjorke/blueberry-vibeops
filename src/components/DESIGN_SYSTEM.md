# Fintech App Design System Documentation

A comprehensive design system for building beautiful, consistent fintech applications inspired by modern banking interfaces like Revolut.

## Table of Contents

1. [Design Principles](#design-principles)
2. [Color System](#color-system)
3. [Typography](#typography)
4. [Spacing & Layout](#spacing--layout)
5. [Components](#components)
6. [Fintech-Specific Components](#fintech-specific-components)
7. [Animation & Transitions](#animation--transitions)
8. [Usage Guidelines](#usage-guidelines)

---

## Design Principles

### Trust & Security
- Use professional color palettes that inspire confidence
- Maintain high contrast for accessibility
- Clear visual hierarchy for financial data

### Modern & Clean
- Minimalist design with purposeful elements
- Premium gradients and sophisticated shadows
- Consistent spacing and alignment

### User-Centric
- Intuitive navigation and clear call-to-actions
- Responsive design for all devices
- Accessible components following WCAG guidelines

---

## Color System

All colors are defined using HSL values for better consistency and theming support.

### Primary Colors
```css
--primary: 221 83% 53%        /* Brand blue - #3B82F6 */
--primary-foreground: 0 0% 100%  /* White text on primary */
--primary-glow: 258 90% 66%      /* Purple accent - #8B5CF6 */
```

### Semantic Colors
```css
--success: 142 71% 45%        /* Green for positive transactions */
--warning: 38 92% 50%         /* Orange for warnings */
--destructive: 0 72% 51%      /* Red for negative actions */
--accent: 258 90% 66%         /* Purple for highlights */
```

### Neutral Colors
```css
--background: 248 250% 99%    /* Main background (light mode) */
--foreground: 222 47% 11%     /* Primary text color */
--muted: 210 40% 96%          /* Subtle backgrounds */
--muted-foreground: 215 16% 47%  /* Secondary text */
--border: 214 32% 91%         /* Border color */
```

### Dark Mode
```css
--background: 8 12% 6%        /* Dark background */
--card: 15 15% 9%            /* Dark card background */
--border: 217 33% 18%        /* Dark borders */
```

### Gradient System
```css
--gradient-primary: linear-gradient(135deg, hsl(221 83% 53%), hsl(258 90% 66%))
--gradient-secondary: linear-gradient(135deg, hsl(215 28% 17%), hsl(222 47% 11%))
--gradient-success: linear-gradient(135deg, hsl(142 71% 45%), hsl(120 60% 50%))
```

---

## Typography

### Font Stack
The design system uses system fonts for optimal performance:
```css
font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif
```

### Font Weights
- **Regular (400)**: Body text, descriptions
- **Medium (500)**: Subtitles, labels
- **Semibold (600)**: Headings, important text
- **Bold (700)**: Emphasized headings, amounts

### Text Scales
- `text-xs` (12px): Small labels, badges
- `text-sm` (14px): Body text, descriptions
- `text-base` (16px): Default text size
- `text-lg` (18px): Section headings
- `text-xl` (20px): Page headings
- `text-2xl` (24px): Large amounts, hero text
- `text-3xl` (30px): Balance displays
- `text-4xl` (36px): Hero titles

---

## Spacing & Layout

### Spacing Scale
Based on 0.25rem (4px) increments:
- `1` = 4px
- `2` = 8px
- `3` = 12px
- `4` = 16px
- `6` = 24px
- `8` = 32px
- `12` = 48px
- `16` = 64px

### Layout Patterns
- **Container**: `container mx-auto px-4` for page content
- **Grid**: `grid grid-cols-1 lg:grid-cols-3 gap-6` for dashboard layout
- **Card spacing**: `p-6` for standard card padding
- **Section spacing**: `space-y-6` between major sections

---

## Components

### Button Variants

#### Default Variants
```tsx
<Button variant="default">Primary Action</Button>
<Button variant="outline">Secondary Action</Button>
<Button variant="ghost">Subtle Action</Button>
<Button variant="destructive">Delete Action</Button>
```

#### Fintech-Specific Variants
```tsx
<Button variant="premium">Premium Feature</Button>
<Button variant="success">Confirm Transaction</Button>
<Button variant="fintech">Dark Elegant</Button>
```

#### Sizes
```tsx
<Button size="sm">Small</Button>
<Button size="default">Default</Button>
<Button size="lg">Large</Button>
<Button size="xl">Extra Large</Button>
<Button size="icon">Icon Only</Button>
```

### Card Component
```tsx
<Card className="shadow-card">Basic Card</Card>
<Card className="shadow-elegant">Elevated Card</Card>
<Card className="shadow-premium">Premium Card</Card>
```

### Badge Component
```tsx
<Badge variant="default">Default</Badge>
<Badge variant="secondary">Secondary</Badge>
<Badge variant="outline">Outline</Badge>
<Badge variant="destructive">Error</Badge>
```

---

## Fintech-Specific Components

### AccountCard
Displays account balance with quick actions.

**Props:**
- `balance: number` - Account balance
- `currency?: string` - Currency symbol (default: "£")
- `accountName?: string` - Account display name
- `onAddMoney?: () => void` - Add money callback
- `onSendMoney?: () => void` - Send money callback
- `onRequestMoney?: () => void` - Request money callback

**Features:**
- Balance visibility toggle
- Premium gradient background
- Responsive quick action buttons
- Formatted currency display

```tsx
<AccountCard 
  balance={3247.82}
  currency="£"
  accountName="Main Account"
  onAddMoney={() => {}}
  onSendMoney={() => {}}
  onRequestMoney={() => {}}
/>
```

### TransactionItem
Displays individual transaction with category icons and status.

**Props:**
- `transaction: Transaction` - Transaction object
- `onClick?: () => void` - Click handler

**Transaction Interface:**
```tsx
interface Transaction {
  id: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  currency: string;
  description: string;
  category: 'food' | 'transport' | 'shopping' | 'housing' | 'technology' | 'other';
  date: Date;
  status: 'completed' | 'pending' | 'failed';
  merchantName?: string;
  merchantImage?: string;
}
```

**Features:**
- Category-based color coding
- Transaction direction indicators
- Smart date formatting
- Status badges
- Merchant avatar support

```tsx
<TransactionItem 
  transaction={transaction}
  onClick={() => viewDetails(transaction.id)}
/>
```

### QuickActions
Grid of common financial action buttons.

**Props:**
- `onTransfer?: () => void` - Transfer money
- `onTopUp?: () => void` - Add money
- `onPayBills?: () => void` - Pay bills
- `onCards?: () => void` - Manage cards
- `onSavings?: () => void` - Savings actions
- `onInvesting?: () => void` - Investment actions
- `onSplitBill?: () => void` - Split expenses
- `onReceipts?: () => void` - View receipts

**Features:**
- Responsive grid layout
- Icon-based actions
- Hover animations
- Color-coded categories

```tsx
<QuickActions 
  onTransfer={() => {}}
  onTopUp={() => {}}
  onPayBills={() => {}}
  onCards={() => {}}
/>
```

### SpendingInsights
Analytics component showing budget progress and category breakdown.

**Props:**
- `monthlyBudget: number` - Total monthly budget
- `spent: number` - Amount spent this month
- `currency?: string` - Currency symbol
- `categories: SpendingCategory[]` - Category data
- `trend: { percentage: number; direction: 'up' | 'down' }` - Spending trend
- `onViewDetails?: () => void` - View analytics callback

**SpendingCategory Interface:**
```tsx
interface SpendingCategory {
  name: string;
  amount: number;
  budget: number;
  color: string;
  icon?: string;
}
```

**Features:**
- Budget progress visualization
- Category-wise breakdown
- Trend indicators
- Progress bars with color coding
- Responsive design

```tsx
<SpendingInsights 
  monthlyBudget={2000}
  spent={1070}
  categories={categories}
  trend={{ percentage: 12, direction: 'up' }}
  onViewDetails={() => {}}
/>
```

---

## Animation & Transitions

### Transition Classes
```css
--transition-smooth: all 0.3s cubic-bezier(0.4, 0, 0.2, 1)
--transition-spring: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)
```

### Hover Effects
- **Buttons**: Scale, shadow, and color transitions
- **Cards**: Subtle lift with shadow increase
- **Interactive elements**: Smooth color transitions

### Loading States
- **Skeleton components** for loading states
- **Progressive enhancement** for better UX
- **Smooth state transitions**

---

## Shadow System

### Shadow Scales
```css
--shadow-card: 0 4px 12px -2px hsl(221 83% 53% / 0.08)      /* Subtle card shadow */
--shadow-elegant: 0 10px 30px -10px hsl(221 83% 53% / 0.3)  /* Medium elevation */
--shadow-premium: 0 20px 40px -12px hsl(258 90% 66% / 0.25) /* High elevation */
```

### Usage
- **Cards**: `shadow-card` for basic elevation
- **Modals/Dropdowns**: `shadow-elegant` for floating elements
- **Hero sections**: `shadow-premium` for premium features

---

## Usage Guidelines

### Do's ✅
- Use semantic color tokens instead of direct colors
- Apply consistent spacing using the spacing scale
- Use appropriate component variants for context
- Follow the established visual hierarchy
- Test components in both light and dark modes
- Ensure proper contrast ratios for accessibility

### Don'ts ❌
- Don't use arbitrary colors (`text-blue-500`, `bg-red-400`)
- Don't apply custom styles that break the design system
- Don't ignore responsive design considerations
- Don't use overly complex animations that distract
- Don't break the established spacing patterns

### Accessibility
- All components support keyboard navigation
- Color combinations meet WCAG AA standards
- Focus indicators are clearly visible
- Screen reader compatible markup
- Proper ARIA labels and roles

### Responsive Design
- Mobile-first approach
- Flexible grid systems
- Appropriate touch targets (minimum 44px)
- Readable text sizes on all devices
- Optimized for different screen densities

---

## Integration Examples

### Basic Page Layout
```tsx
function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <AccountCard balance={3247.82} />
            <QuickActions />
          </div>
          <div className="space-y-6">
            <SpendingInsights />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### Custom Component Example
```tsx
function CustomFinancialWidget() {
  return (
    <Card className="p-6 shadow-card bg-gradient-primary text-white">
      <h3 className="text-lg font-semibold mb-4">Investment Portfolio</h3>
      <div className="space-y-3">
        <div className="flex justify-between">
          <span className="text-white/80">Total Value</span>
          <span className="font-bold">£15,247.50</span>
        </div>
        <Button variant="secondary" size="sm" className="w-full">
          View Details
        </Button>
      </div>
    </Card>
  );
}
```

---

This design system provides a solid foundation for building modern fintech applications with consistent, accessible, and beautiful interfaces. All components are designed to work together harmoniously while maintaining flexibility for customization.