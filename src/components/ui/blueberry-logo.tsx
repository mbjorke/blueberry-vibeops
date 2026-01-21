import React from 'react';
import { Avatar, AvatarImage } from './avatar';

interface BlueberryLogoProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: 'sm' | 'md' | 'lg' | 'xl' | number;
  className?: string;
  variant?: 'blueberry' | 'loppis';
}

const sizeMap = {
  sm: 24,
  md: 32,
  lg: 48,
  xl: 64,
} as const;

const logoMap = {
  blueberry: '/logo.png',
  loppis: '/Loppis.png',
} as const;

export function BlueberryLogo({
  size = 'md',
  className = '',
  variant = 'blueberry',
  ...props
}: BlueberryLogoProps) {
  const sizeValue = typeof size === 'string' ? sizeMap[size] : size;
  const logoSrc = logoMap[variant];

  return (
    <div className={`inline-block ${className}`} {...props}>
      <Avatar className="bg-transparent" style={{ width: sizeValue, height: sizeValue }}>
        <AvatarImage
          src={logoSrc}
          alt={`Blueberry ${variant === 'blueberry' ? 'Logo' : 'Marketplace Logo'}`}
          className="w-full h-full object-contain"
        />
      </Avatar>
    </div>
  );
}

// Keep backward compatibility for existing lopify references
export const LopifyLogo = BlueberryLogo;
export default BlueberryLogo;
