/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from '@tailwindcss/vite';
import path from "path";
import { fileURLToPath } from 'node:url';


const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  const isLibraryBuild = process.env.LIB_BUILD === '1';
  
  return ({
  server: {
    host: "::",
    port: 8080
  },
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src")
    }
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(mode),
    global: 'globalThis',
  },
  build: isLibraryBuild ? {
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'BlueberryDesignSystem',
      fileName: (format) => `blueberry-design-system.${format}.js`
    },
    rollupOptions: {
      external: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        // Radix UI components - all use React hooks
        '@radix-ui/react-accordion',
        '@radix-ui/react-alert-dialog',
        '@radix-ui/react-aspect-ratio',
        '@radix-ui/react-avatar',
        '@radix-ui/react-checkbox',
        '@radix-ui/react-collapsible',
        '@radix-ui/react-context-menu',
        '@radix-ui/react-dialog',
        '@radix-ui/react-dropdown-menu',
        '@radix-ui/react-hover-card',
        '@radix-ui/react-label',
        '@radix-ui/react-menubar',
        '@radix-ui/react-navigation-menu',
        '@radix-ui/react-popover',
        '@radix-ui/react-progress',
        '@radix-ui/react-radio-group',
        '@radix-ui/react-scroll-area',
        '@radix-ui/react-select',
        '@radix-ui/react-separator',
        '@radix-ui/react-slider',
        '@radix-ui/react-slot',
        '@radix-ui/react-switch',
        '@radix-ui/react-tabs',
        '@radix-ui/react-toast',
        '@radix-ui/react-toggle',
        '@radix-ui/react-toggle-group',
        '@radix-ui/react-tooltip',
        '@radix-ui/themes',
        // Other React hook libraries
        '@tanstack/react-query',
        'react-hook-form',
        'react-router-dom',
        'sonner',
        'react-day-picker',
        'react-resizable-panels',
        'embla-carousel-react',
        'input-otp',
        'vaul',
        // Other libraries that might use React
        'next-themes',
        '@clerk/nextjs',
        '@clerk/react',
        'date-fns',
        '@hookform/resolvers'
      ],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'react/jsx-runtime',
          // Radix UI components
          '@radix-ui/react-accordion': 'RadixAccordion',
          '@radix-ui/react-alert-dialog': 'RadixAlertDialog',
          '@radix-ui/react-aspect-ratio': 'RadixAspectRatio',
          '@radix-ui/react-avatar': 'RadixAvatar',
          '@radix-ui/react-checkbox': 'RadixCheckbox',
          '@radix-ui/react-collapsible': 'RadixCollapsible',
          '@radix-ui/react-context-menu': 'RadixContextMenu',
          '@radix-ui/react-dialog': 'RadixDialog',
          '@radix-ui/react-dropdown-menu': 'RadixDropdownMenu',
          '@radix-ui/react-hover-card': 'RadixHoverCard',
          '@radix-ui/react-label': 'RadixLabel',
          '@radix-ui/react-menubar': 'RadixMenubar',
          '@radix-ui/react-navigation-menu': 'RadixNavigationMenu',
          '@radix-ui/react-popover': 'RadixPopover',
          '@radix-ui/react-progress': 'RadixProgress',
          '@radix-ui/react-radio-group': 'RadixRadioGroup',
          '@radix-ui/react-scroll-area': 'RadixScrollArea',
          '@radix-ui/react-select': 'RadixSelect',
          '@radix-ui/react-separator': 'RadixSeparator',
          '@radix-ui/react-slider': 'RadixSlider',
          '@radix-ui/react-slot': 'RadixSlot',
          '@radix-ui/react-switch': 'RadixSwitch',
          '@radix-ui/react-tabs': 'RadixTabs',
          '@radix-ui/react-toast': 'RadixToast',
          '@radix-ui/react-toggle': 'RadixToggle',
          '@radix-ui/react-toggle-group': 'RadixToggleGroup',
          '@radix-ui/react-tooltip': 'RadixTooltip',
          '@radix-ui/themes': 'RadixThemes',
          // Other React libraries
          '@tanstack/react-query': 'TanStackQuery',
          'react-hook-form': 'ReactHookForm',
          'react-router-dom': 'ReactRouterDOM',
          'sonner': 'Sonner',
          'react-day-picker': 'ReactDayPicker',
          'react-resizable-panels': 'ReactResizablePanels',
          'embla-carousel-react': 'EmblaCarouselReact',
          'input-otp': 'InputOTP',
          'vaul': 'Vaul',
          // Other libraries
          'next-themes': 'NextThemes',
          '@clerk/nextjs': 'Clerk',
          '@clerk/react': 'ClerkReact',
          'date-fns': 'DateFns',
          '@hookform/resolvers': 'HookformResolvers'
        }
      },
      plugins: [
        {
          name: 'replace-process-env',
          renderChunk(code) {
            return code
              .replace(/process\.env\.NODE_ENV/g, JSON.stringify('production'))
              .replace(/process\.env\.__NEXT_MANUAL_TRAILING_SLASH/g, 'false')
              .replace(/process\.env\.__NEXT_TRAILING_SLASH/g, 'false')
              .replace(/process\.env\.__NEXT_I18N_SUPPORT/g, 'false')
              .replace(/process\.env\.__NEXT_ROUTER_BASEPATH/g, JSON.stringify(''))
              .replace(/process\.env/g, '({ NODE_ENV: "production" })');
          }
        }
      ]
    }
  } : undefined,
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['.storybook/vitest-setup.ts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx', 'src/**/*.stories.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      exclude: ['node_modules/', '.storybook/']
    }
  }
  });
});