import { useMemo } from 'react';
import { cn } from '@/lib/utils';

interface PasswordStrengthMeterProps {
  password: string;
}

interface StrengthResult {
  score: number;
  label: 'Weak' | 'Fair' | 'Good' | 'Strong';
  color: string;
  bgColor: string;
}

function calculateStrength(password: string): StrengthResult {
  if (!password) {
    return { score: 0, label: 'Weak', color: 'text-muted-foreground', bgColor: 'bg-muted' };
  }

  let score = 0;

  // Length checks
  if (password.length >= 6) score += 1;
  if (password.length >= 10) score += 1;
  if (password.length >= 14) score += 1;

  // Character variety checks
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;

  // Bonus for mixing character types
  const hasLower = /[a-z]/.test(password);
  const hasUpper = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSymbol = /[^a-zA-Z0-9]/.test(password);
  const varietyCount = [hasLower, hasUpper, hasNumber, hasSymbol].filter(Boolean).length;
  if (varietyCount >= 3) score += 1;
  if (varietyCount === 4) score += 1;

  // Common patterns penalty
  if (/^[a-zA-Z]+$/.test(password)) score -= 1; // Only letters
  if (/^[0-9]+$/.test(password)) score -= 2; // Only numbers
  if (/(.)\1{2,}/.test(password)) score -= 1; // Repeated characters

  // Normalize score to 0-4 range
  const normalizedScore = Math.max(0, Math.min(4, Math.round(score / 2)));

  const results: Record<number, StrengthResult> = {
    0: { score: 0, label: 'Weak', color: 'text-danger', bgColor: 'bg-danger' },
    1: { score: 1, label: 'Weak', color: 'text-danger', bgColor: 'bg-danger' },
    2: { score: 2, label: 'Fair', color: 'text-warning', bgColor: 'bg-warning' },
    3: { score: 3, label: 'Good', color: 'text-success', bgColor: 'bg-success' },
    4: { score: 4, label: 'Strong', color: 'text-success', bgColor: 'bg-success' },
  };

  return results[normalizedScore];
}

export function PasswordStrengthMeter({ password }: PasswordStrengthMeterProps) {
  const strength = useMemo(() => calculateStrength(password), [password]);

  if (!password) return null;

  return (
    <div className="space-y-1.5">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((level) => (
          <div
            key={level}
            className={cn(
              'h-1.5 flex-1 rounded-full transition-colors',
              level <= strength.score ? strength.bgColor : 'bg-muted'
            )}
          />
        ))}
      </div>
      <p className={cn('text-xs font-medium', strength.color)}>
        Password strength: {strength.label}
      </p>
    </div>
  );
}
