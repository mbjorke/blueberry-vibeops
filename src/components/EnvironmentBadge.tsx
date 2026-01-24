import { getEnvironment } from '@/integrations/supabase/client';

type Environment = 'DEV' | 'BETA' | 'PROD' | 'LOCAL';

const environmentConfig: Record<
  Environment,
  { bg: string; text: string; label: string }
> = {
  DEV: {
    bg: 'bg-blue-500',
    text: 'text-white',
    label: 'DEV',
  },
  BETA: {
    bg: 'bg-orange-500',
    text: 'text-white',
    label: 'BETA',
  },
  PROD: {
    bg: 'bg-red-500',
    text: 'text-white',
    label: 'PROD',
  },
  LOCAL: {
    bg: 'bg-gray-500',
    text: 'text-white',
    label: 'LOCAL',
  },
};

export const EnvironmentBadge = () => {
  const environment = getEnvironment();
  const config = environmentConfig[environment];

  return (
    <div
      className="fixed bottom-4 right-4 z-50 pointer-events-none"
      role="status"
      aria-label={`Current environment: ${config.label}`}
    >
      <div
        className={`${config.bg} ${config.text} px-3 py-1.5 rounded-lg shadow-lg font-semibold text-sm tracking-wide`}
      >
        {config.label}
      </div>
    </div>
  );
};
