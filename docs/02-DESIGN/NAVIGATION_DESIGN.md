# Unified Navigation Design

## Overview

Design a unified navigation system that works across separate apps (Public Discovery, Private Ops, Personal Productivity) under one domain (vibeops.org).

## Navigation Structure

### Top-Level Navigation

```
┌─────────────────────────────────────────────────────────────┐
│  [Logo] VibeOps                    [User Menu] [Settings]   │
├─────────────────────────────────────────────────────────────┤
│  Tools  |  Findings  |  Ops  |  Productivity  |  Help      │
└─────────────────────────────────────────────────────────────┘
```

### Route Organization

```
/ (Landing)
├── /tools (Public Discovery)
│   ├── /tools - Browse all tools
│   ├── /tools/:id - Tool detail
│   ├── /tools/:id/reviews - Tool reviews
│   ├── /tools/:id/insights - Tool insights (from ops data)
│   ├── /top-tools - Top rated tools
│   ├── /stacks - Tool stack calculator
│   └── /my-lists - User's tool lists
│
├── /findings (Public Ops Insights)
│   ├── /findings - Browse all findings
│   ├── /findings/:id - Finding detail
│   ├── /findings/trends - Trend analysis
│   └── /findings/compare - Compare tool stacks
│
├── /ops (Private Ops Dashboard) [Requires Auth]
│   ├── /ops (redirects to /repositories)
│   ├── /repositories - Repo management
│   ├── /repositories/:id - Repo detail
│   ├── /security - Security dashboard
│   ├── /compliance - GDPR compliance
│   ├── /clients - Organization management
│   ├── /admin - Admin panel
│   └── /ops-guide - Migration helper
│
├── /productivity (Personal Productivity) [Requires Auth, Future]
│   ├── /productivity - Dashboard
│   ├── /productivity/tracking - Time tracking
│   ├── /productivity/achievements - Achievements
│   ├── /productivity/retros - AI retros
│   └── /productivity/best-work - Portfolio
│
└── /help (Public)
    ├── /help - Help center
    ├── /help/docs - Documentation
    └── /legal/* - Legal pages
```

## Navigation Components

### 1. Unified Header

**Location**: All pages
**Purpose**: Top-level navigation and user context

```tsx
// components/layout/UnifiedHeader.tsx
export function UnifiedHeader() {
  const { user, isAdmin, isSuperAdmin } = useAuth();
  const location = useLocation();
  
  const isPublicSection = location.pathname.startsWith('/tools') || 
                         location.pathname.startsWith('/findings');
  const isOpsSection = location.pathname.startsWith('/ops') ||
                      location.pathname.startsWith('/repositories');
  const isProductivitySection = location.pathname.startsWith('/productivity');
  
  return (
    <header className="border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <Logo />
            <span className="font-bold">VibeOps</span>
          </Link>
          
          {/* Main Navigation */}
          <nav className="flex items-center gap-6">
            <NavLink to="/tools" active={isPublicSection}>
              Tools
            </NavLink>
            <NavLink to="/findings" active={location.pathname.startsWith('/findings')}>
              Findings
            </NavLink>
            {user && (
              <>
                <NavLink to="/ops" active={isOpsSection}>
                  Ops
                </NavLink>
                <NavLink to="/productivity" active={isProductivitySection}>
                  Productivity
                </NavLink>
              </>
            )}
            <NavLink to="/help">Help</NavLink>
          </nav>
          
          {/* User Menu */}
          <div className="flex items-center gap-4">
            {user ? (
              <UserMenu user={user} isAdmin={isAdmin} isSuperAdmin={isSuperAdmin} />
            ) : (
              <div className="flex gap-2">
                <Button variant="ghost" asChild>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
```

### 2. Context-Aware Sidebar

**Location**: Ops and Productivity sections
**Purpose**: Section-specific navigation

```tsx
// components/layout/ContextSidebar.tsx
export function ContextSidebar() {
  const { currentOrganization, isOrgAdmin } = useAuth();
  const location = useLocation();
  
  // Ops Sidebar
  if (location.pathname.startsWith('/ops') || location.pathname.startsWith('/repositories')) {
    return <OpsSidebar organization={currentOrganization} isOrgAdmin={isOrgAdmin} />;
  }
  
  // Productivity Sidebar (Future)
  if (location.pathname.startsWith('/productivity')) {
    return <ProductivitySidebar />;
  }
  
  return null; // No sidebar for public sections
}

// Ops Sidebar
function OpsSidebar({ organization, isOrgAdmin }: Props) {
  return (
    <Sidebar>
      <SidebarHeader>
        {organization && (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={organization.logo_url} />
              <AvatarFallback>{organization.logo_initial}</AvatarFallback>
            </Avatar>
            <div>
              <div className="font-semibold">{organization.display_name}</div>
              <div className="text-xs text-muted-foreground">Organization</div>
            </div>
          </div>
        )}
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/repositories">
                  <GitBranch /> Repositories
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link to="/clients">
                  <Building2 /> Clients
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isOrgAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/admin">
                    <Users /> Admin Panel
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
```

### 3. Public Discovery Navigation

**Location**: `/tools`, `/findings` sections
**Purpose**: Public browsing navigation

```tsx
// components/discovery/DiscoveryNav.tsx
export function DiscoveryNav() {
  return (
    <div className="border-b bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-8">
          <NavLink to="/tools">All Tools</NavLink>
          <NavLink to="/tools/categories">Categories</NavLink>
          <NavLink to="/top-tools">Top Tools</NavLink>
          <NavLink to="/stacks">Stack Calculator</NavLink>
          <NavLink to="/findings">Insights</NavLink>
        </div>
      </div>
    </div>
  );
}
```

## User Context Switching

### Organization Switcher

**Location**: Ops section sidebar
**Purpose**: Switch between organizations (if user belongs to multiple)

```tsx
// components/ops/OrgSwitcher.tsx
export function OrgSwitcher() {
  const { organizations, currentOrganization, setCurrentOrganization } = useAuth();
  
  if (organizations.length <= 1) return null;
  
  return (
    <Select
      value={currentOrganization?.id}
      onValueChange={(orgId) => {
        const org = organizations.find(o => o.id === orgId);
        setCurrentOrganization(org || null);
      }}
    >
      <SelectTrigger>
        <SelectValue>
          {currentOrganization?.name || 'Select Organization'}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {organizations.map(org => (
          <SelectItem key={org.id} value={org.id}>
            <div className="flex items-center gap-2">
              <Avatar className="h-6 w-6">
                <AvatarFallback>{org.logo_initial}</AvatarFallback>
              </Avatar>
              <span>{org.name}</span>
              {org.is_org_admin && (
                <Badge variant="outline" className="ml-2">Admin</Badge>
              )}
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

### Public vs Private Views

**Strategy**: Context-aware UI based on authentication

```tsx
// App.tsx routing
<Routes>
  {/* Public Routes */}
  <Route path="/tools/*" element={<PublicDiscoveryLayout />} />
  <Route path="/findings/*" element={<PublicDiscoveryLayout />} />
  
  {/* Private Routes */}
  <Route path="/ops/*" element={
    <ProtectedRoute>
      <OpsLayout />
    </ProtectedRoute>
  } />
  <Route path="/repositories/*" element={
    <ProtectedRoute>
      <OpsLayout />
    </ProtectedRoute>
  } />
  
  {/* Auth Routes */}
  <Route path="/login" element={<Login />} />
  <Route path="/signup" element={<Signup />} />
</Routes>
```

## Layout Components

### PublicDiscoveryLayout

```tsx
export function PublicDiscoveryLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <UnifiedHeader />
      <DiscoveryNav />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </div>
  );
}
```

### OpsLayout

```tsx
export function OpsLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex">
      <ContextSidebar />
      <div className="flex-1 flex flex-col">
        <UnifiedHeader />
        <main className="flex-1 p-6">
          {children}
        </main>
        <Footer />
      </div>
    </div>
  );
}
```

## Navigation States

### Unauthenticated User

**Visible**:
- Tools (public)
- Findings (public)
- Help
- Sign In / Get Started buttons

**Hidden**:
- Ops section
- Productivity section
- User menu

### Authenticated User (Client Role)

**Visible**:
- Tools (public + personal lists)
- Findings (public)
- Ops (limited - assigned repos only)
- User menu

**Hidden**:
- Admin panel
- Organization management
- Productivity (future)

### Authenticated User (Org Admin)

**Visible**:
- Tools (public + personal lists)
- Findings (public + can create)
- Ops (full access to org)
- Admin panel (org-scoped)
- User menu

**Hidden**:
- Superadmin features

### Authenticated User (Superadmin)

**Visible**:
- Everything
- Platform-wide admin features
- All organizations

## Responsive Design

### Mobile Navigation

```tsx
// Mobile: Hamburger menu
<Sheet>
  <SheetTrigger>
    <Menu />
  </SheetTrigger>
  <SheetContent side="left">
    <nav className="flex flex-col gap-4">
      <NavLink to="/tools">Tools</NavLink>
      <NavLink to="/findings">Findings</NavLink>
      {user && (
        <>
          <NavLink to="/ops">Ops</NavLink>
          <NavLink to="/productivity">Productivity</NavLink>
        </>
      )}
    </nav>
  </SheetContent>
</Sheet>
```

### Tablet/Desktop

- Full sidebar for ops section
- Top navigation for public sections
- Context-aware based on section

## Implementation Plan

### Phase 1: Unified Header
- [ ] Create `UnifiedHeader` component
- [ ] Add to all layouts
- [ ] Implement section detection
- [ ] Add user menu

### Phase 2: Context Sidebars
- [ ] Create `ContextSidebar` component
- [ ] Implement `OpsSidebar`
- [ ] Add organization switcher
- [ ] Update existing `AppSidebar` to use new structure

### Phase 3: Route Organization
- [ ] Reorganize routes by section
- [ ] Update route guards
- [ ] Add section-specific layouts
- [ ] Update redirects

### Phase 4: Navigation Polish
- [ ] Add active state indicators
- [ ] Implement breadcrumbs
- [ ] Add section transitions
- [ ] Mobile optimization

This navigation design provides a unified experience while maintaining clear separation between public discovery and private ops sections.
