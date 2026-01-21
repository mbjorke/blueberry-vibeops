# Components Library

This directory contains the complete component library for the fintech application, organized into logical categories.

## Directory Structure

```
components/
├── ui/              # Shadcn/ui base components
├── fintech/         # Fintech-specific components
├── DESIGN_SYSTEM.md # Complete design system documentation
└── README.md        # This file
```

## Component Categories

### 🎨 UI Components (`/ui`)
Base components from shadcn/ui with fintech enhancements:
- **Button**: Enhanced with fintech variants (`premium`, `success`, `fintech`)
- **Card**: Supports shadow system (`shadow-card`, `shadow-elegant`, `shadow-premium`)
- **Badge**: Status indicators for transactions and categories
- **Avatar**: User and merchant avatars
- **Progress**: Budget and spending visualizations

### 💰 Fintech Components (`/fintech`)
Specialized financial application components:

#### AccountCard
Main account balance display with integrated quick actions
- Balance visibility toggle
- Currency formatting
- Quick action buttons (Add, Send, Request)
- Premium gradient background

#### TransactionItem  
Individual transaction display with rich categorization
- Category-based icons and colors
- Transaction direction indicators
- Smart date formatting
- Status badges (completed, pending, failed)
- Merchant avatar support

#### QuickActions
Responsive grid of common financial actions
- Transfer, Top Up, Pay Bills
- Cards, Savings, Investing
- Split Bills, Receipts
- Icon-based design with descriptions

#### SpendingInsights
Budget tracking and spending analytics
- Monthly budget progress
- Category-wise breakdown
- Spending trend indicators
- Progress visualization
- Over-budget warnings

## Design System

The complete design system documentation is available in [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md), which includes:

- **Color System**: HSL-based semantic tokens
- **Typography**: Font scales and weights
- **Spacing**: Consistent spacing patterns
- **Shadows**: Elevation system
- **Gradients**: Premium visual effects
- **Animation**: Smooth transitions

## Usage Examples

### Basic Import
```tsx
import { AccountCard, TransactionItem } from '@/components/fintech';
import { Button, Card } from '@/components/ui';
```

### Component Usage
```tsx
// Account balance display
<AccountCard 
  balance={3247.82}
  currency="£"
  onAddMoney={() => {}}
  onSendMoney={() => {}}
/>

// Transaction list
{transactions.map(transaction => (
  <TransactionItem 
    key={transaction.id}
    transaction={transaction}
    onClick={() => viewDetails(transaction.id)}
  />
))}
```

## Design Principles

1. **Semantic Tokens**: Use design system tokens instead of direct colors
2. **Responsive Design**: Mobile-first approach with flexible layouts
3. **Accessibility**: WCAG AA compliance with proper ARIA labels
4. **Performance**: Tree-shakeable imports and optimized rendering
5. **Consistency**: Unified visual language across all components

## Development Guidelines

- Follow TypeScript interfaces for all props
- Include comprehensive JSDoc documentation
- Use semantic color tokens from the design system
- Ensure responsive behavior across all screen sizes
- Test in both light and dark modes
- Include hover and focus states for interactive elements

## Contributing

When adding new components:
1. Follow the established naming conventions
2. Include TypeScript interfaces
3. Add comprehensive documentation
4. Use design system tokens
5. Ensure accessibility compliance
6. Update this README and the design system docs