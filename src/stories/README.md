# Storybook Organization

This document outlines the **atomic design** Storybook organization structure for the Blueberry design system.

## 📁 **Atomic Design Structure**

```
src/stories/
├── components/                  # 🧩 Molecules - Our Custom Components
│   ├── ItemCard.stories.tsx         # Marketplace item cards
│   ├── Navigation.stories.tsx       # Clerk-integrated navigation
│   ├── BlueberryLogo.stories.tsx    # Brand logos
│   ├── AlertsDropdown.stories.tsx   # Fintech alerts
│   ├── UserAvatar.stories.tsx       # Fintech user avatars
│   └── AccountCard.stories.tsx      # Fintech account cards
└── primitives/                  # ⚛️ Atoms - Radix UI Primitives
    ├── Button.stories.tsx          # Button primitive
    ├── Input.stories.tsx           # Input primitive
    ├── Card.stories.tsx            # Card primitive
    ├── Dialog.stories.tsx          # Dialog primitive
    ├── Badge.stories.tsx           # Badge primitive
    └── ...                         # All other Radix primitives
```

## 🎯 **Atomic Design Principles**

### **⚛️ Primitives** (Atoms)
- **Low-level, unstyled building blocks** from Radix UI
- **Accessible, functional components** without design opinions
- **Used to build higher-level components**
- **Examples:** Button, Input, Dialog, Card, Badge
- **Title format:** `Primitives/[ComponentName]`

### **🧩 Components** (Molecules)
- **Our custom Blueberry components** with specific styling and behavior
- **Composed from primitives** for specific use cases
- **Include marketplace, fintech, and brand functionality**
- **Examples:** ItemCard, Navigation, AlertsDropdown, BlueberryLogo
- **Title format:** `Components/[ComponentName]`

### **🎨 Why This Structure?**
- **Follows atomic design methodology** (Atoms → Molecules → Organisms)
- **Clear separation of concerns** between base and custom components
- **Scalable architecture** for growing design systems
- **Professional design system practices** used by companies like IBM, Salesforce

### **📝 Quick Atomic Design Refresher:**

| Level | Purpose | Examples | Our Implementation |
|-------|---------|----------|-------------------|
| **⚛️ Atoms** | Fundamental building blocks | Button, Input, Colors | `Primitives/` folder |
| **🧩 Molecules** | Atoms bonded together | Search form, Card with avatar | `Components/` folder |
| **🦠 Organisms** | Complex UI sections | Header, Sidebar, Product grid | Future `Patterns/` folder |
| **📄 Templates** | Page layouts | Homepage, Product page | Future `Templates/` folder |
| **📄 Pages** | Specific content | "Nike Air Max page" | Not in design system |

### **🔍 Base vs Primitives in Atomic Design:**

**"Base" was our old approach:**
- ❌ Inconsistent naming (we used it for both primitives and custom components)
- ❌ Didn't follow Atomic Design philosophy
- ❌ Confusing for developers

**"Primitives" is the correct Atomic Design term:**
- ✅ **Atoms**: Fundamental, unstyled, accessible building blocks
- ✅ **No design opinions**: Just functionality and accessibility
- ✅ **Composed by higher levels**: Molecules use Atoms to build complex UI

### **📋 Our Atomic Design Mapping:**

| Atomic Level | Our Folder | Examples | Purpose |
|-------------|------------|----------|---------|
| **⚛️ Atoms** | `Primitives/` | Button, Input, Dialog, Card | Building blocks from Radix UI |
| **🧩 Molecules** | `Components/` | ItemCard, Navigation, AlertsDropdown | Our custom compositions |
| **🦠 Organisms** | Future `Patterns/` | Header, Sidebar, ProductGrid | Complex UI sections |
| **📄 Templates** | Future `Templates/` | HomepageLayout, ProductPage | Page-level layouts |

### **🔗 Real-World Example:**

**ItemCard (Molecule) Composition:**
```
ItemCard (🧩 Molecule)
├── Card (⚛️ Atom) - Container
├── Image (⚛️ Atom) - Product image
├── Badge (⚛️ Atom) - Condition/status
├── Button (⚛️ Atom) - Favorite button
└── Typography (⚛️ Atom) - Title, price, description
```

**Navigation (Molecule) Composition:**
```
Navigation (🧩 Molecule)
├── BlueberryLogo (🧩 Molecule) - Brand
├── Button (⚛️ Atom) - Menu toggle
├── Link (⚛️ Atom) - Navigation links
└── Avatar (⚛️ Atom) - User profile
```

## 📊 **Navigation Hierarchy in Storybook**

When you open Storybook, you'll now see:

```
🧩 Components
├── Item Card          # Marketplace listings
├── Navigation         # Clerk-integrated nav
├── Logo              # Brand logos
├── Alerts Dropdown   # Fintech notifications
├── User Avatar       # Fintech user display
└── Account Card      # Fintech account info

⚛️ Primitives
├── Button
├── Input
├── Card
├── Dialog
├── Badge
└── ...               # All other Radix components
```

## 🚀 **Benefits of This Structure**

### **For Designers & Developers:**
1. **Clear separation** between our components and Radix primitives
2. **Easy navigation** - instantly know what's custom vs. primitive
3. **Logical grouping** - components, patterns, templates flow naturally
4. **Scalable** - easy to add new components in the right place

### **For Component Usage:**
1. **Start with Primitives** for basic building blocks from Radix UI
2. **Use Blueberry/Components** for all our custom branded components
3. **Everything under Blueberry** is our design system work

## 📝 **Migration Guide**

### **Migration to Atomic Design**
- `Base/ItemCard` → `Components/ItemCard`
- `Navigation/Navigation` → `Components/Navigation`
- `Fintech/AlertsDropdown` → `Components/AlertsDropdown`
- `Base/Button` → `Primitives/Button`

### **Adding New Components:**
1. **If it's a primitive** (Radix-based): Add to `primitives/` with title `Primitives/[Name]`
2. **If it's a custom component**: Add to `components/` with title `Components/[Name]`

## 🎨 **Quick Reference**

| Design Level | Location | Title Format | Example | Purpose |
|-------------|----------|--------------|---------|---------|
| ⚛️ **Atoms** | `primitives/` | `Primitives/[Name]` | `Primitives/Button` | Low-level building blocks |
| 🧩 **Molecules** | `components/` | `Components/[Name]` | `Components/ItemCard` | Custom composed components |

This structure makes it crystal clear what's part of our Blueberry design system versus what's a Radix UI primitive, making the design system much easier to navigate and understand! 🎉
