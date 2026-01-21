import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  useUser,
  useClerk,
  SignInButton,
  SignUpButton,
  UserButton,
  SignedIn,
  SignedOut,
} from '@clerk/nextjs';
import { BlueberryLogo } from './blueberry-logo';
import { Button } from './button';

interface NavigationItem {
  href: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  badge?: number;
}

interface NavigationProps {
  brand?: 'blueberry' | 'loppis';
  items?: NavigationItem[];
  showAuth?: boolean;
  className?: string;
}

const defaultItems: NavigationItem[] = [
  {
    href: '/items',
    label: 'Browse',
    icon: ({ className }) => (
      <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  },
];

export function Navigation({
  brand = 'blueberry',
  items = defaultItems,
  showAuth = true,
  className = '',
}: NavigationProps) {
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoadingCount] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Temporary translations
  const t = (key: string) => {
    const translations: Record<string, string> = {
      browse: 'Browse',
      sell: 'Sell',
      messages: 'Messages',
      dashboard: 'Dashboard',
      signIn: 'Sign In',
      signUp: 'Sign Up',
      signOut: 'Sign Out',
    };
    return translations[key] || key;
  };

  useEffect(() => {
    const getUnreadCount = async () => {
      if (!user || !isLoaded) {
        setLoadingCount(false);
        return;
      }
      // TODO: Implement unread message count
      setUnreadCount(0);
      setLoadingCount(false);
    };

    getUnreadCount();
  }, [user, isLoaded]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Don't show navbar on auth pages
  if (pathname?.startsWith('/auth/')) {
    return null;
  }

  const userItems: NavigationItem[] = user ? [
    {
      href: '/items/create',
      label: 'Sell',
      icon: ({ className }) => (
        <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
      ),
    },
  ] : [];

  const allItems = [...items, ...userItems];

  return (
    <nav className={`bg-white border-b border-gray-200 sticky top-0 z-50 ${className}`}>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between h-16'>
          {/* Logo */}
          <div className='flex items-center'>
            <Link href='/' className='flex items-center'>
              <BlueberryLogo
                size={100}
                height={32}
                variant={brand}
                className='hover:scale-105 transition-transform duration-200'
              />
            </Link>
          </div>

          {/* Navigation */}
          <div className='hidden md:flex items-center space-x-1'>
            {allItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {item.icon && <item.icon className='w-4 h-4' />}
                <span>{item.label}</span>
                {item.badge && item.badge > 0 && (
                  <span className='bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5'>
                    {item.badge}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Mobile menu button */}
          <div className='md:hidden flex items-center'>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className='p-2 rounded-lg text-gray-600 hover:text-gray-900 hover:bg-gray-100'
            >
              <svg className='w-6 h-6' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M4 6h16M4 12h16M4 18h16' />
              </svg>
            </button>
          </div>

          {/* User menu */}
          {showAuth && (
            <div className='hidden md:flex items-center space-x-2'>
              <SignedOut>
                <SignInButton mode='modal'>
                  <Button variant='ghost' size='sm'>
                    {t('signIn')}
                  </Button>
                </SignInButton>
                <SignUpButton mode='modal'>
                  <Button size='sm'>
                    {t('signUp')}
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <UserButton />
              </SignedIn>
            </div>
          )}
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className='md:hidden py-4 border-t border-gray-200'>
            <div className='space-y-1'>
              {allItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-base font-medium ${
                    pathname === item.href
                      ? 'text-emerald-700 bg-emerald-50'
                      : 'text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  {item.icon && <item.icon className='w-5 h-5' />}
                  <span>{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <span className='bg-red-500 text-white text-xs rounded-full px-1.5 py-0.5'>
                      {item.badge}
                    </span>
                  )}
                </Link>
              ))}

              {showAuth && (
                <SignedOut>
                  <div className='px-3 py-2 space-y-2'>
                    <SignInButton mode='modal'>
                      <button className='w-full text-left px-3 py-2 rounded-lg text-base font-medium text-emerald-600 hover:bg-emerald-50'>
                        {t('signIn')}
                      </button>
                    </SignInButton>
                    <SignUpButton mode='modal'>
                      <button className='w-full text-left px-3 py-2 rounded-lg text-base font-medium bg-emerald-600 text-white hover:bg-emerald-700'>
                        {t('signUp')}
                      </button>
                    </SignUpButton>
                  </div>
                </SignedOut>
              )}

              {showAuth && (
                <SignedIn>
                  <Link
                    href='/messages'
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
                  >
                    {t('messages')}
                  </Link>
                  <Link
                    href='/items/create'
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
                  >
                    {t('sell')}
                  </Link>
                  <Link
                    href='/dashboard'
                    onClick={() => setIsMobileMenuOpen(false)}
                    className='block px-3 py-2 rounded-lg text-base font-medium text-gray-700 hover:text-emerald-700 hover:bg-emerald-50'
                  >
                    {t('dashboard')}
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className='block w-full text-left px-3 py-2 rounded-lg text-base font-medium text-red-600 hover:bg-red-50'
                  >
                    {t('signOut')}
                  </button>
                </SignedIn>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navigation;
