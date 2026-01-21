import React from 'react';

interface BrandLogoProps {
  variant?: string;
  className?: string;
}

export const BrandLogo = ({ variant, className = "" }: BrandLogoProps) => {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary to-primary-glow animate-glow-pulse" style={{
        boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.3)'
      }} />
      <div className="flex items-center gap-2">
        <span className="text-xl font-bold bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-transparent">
          blueberry
        </span>
        {variant && (
          <div className="px-3 py-1 bg-muted/50 rounded-full">
            <span className="text-base bg-gradient-to-br from-primary to-primary-glow bg-clip-text text-transparent font-medium">
              {variant}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
