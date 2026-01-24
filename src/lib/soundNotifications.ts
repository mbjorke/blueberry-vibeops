// Sound notification utility for critical events
// Uses Web Audio API to generate notification sounds

let audioContext: AudioContext | null = null;
let soundEnabled = true;

// Initialize AudioContext on user interaction (required by browsers)
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  return audioContext;
}

// Generate a notification sound using Web Audio API
function playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
  try {
    const ctx = getAudioContext();
    
    // Resume context if suspended (browser autoplay policy)
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Fade in and out to avoid clicks
    gainNode.gain.setValueAtTime(0, ctx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.05);
    gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch (error) {
    console.warn('Sound notification failed:', error);
  }
}

// Different sounds for different severity levels
export function playCriticalSound() {
  if (!soundEnabled) return;
  
  // Two-tone alert sound (like an alarm)
  playTone(880, 0.15, 'square'); // A5
  setTimeout(() => playTone(660, 0.15, 'square'), 150); // E5
  setTimeout(() => playTone(880, 0.15, 'square'), 300);
}

export function playWarningSound() {
  if (!soundEnabled) return;
  
  // Single descending tone
  playTone(660, 0.2, 'triangle'); // E5
}

export function playSuccessSound() {
  if (!soundEnabled) return;
  
  // Ascending chime
  playTone(523, 0.1, 'sine'); // C5
  setTimeout(() => playTone(659, 0.15, 'sine'), 100); // E5
}

export function playInfoSound() {
  if (!soundEnabled) return;
  
  // Soft notification ping
  playTone(1047, 0.08, 'sine'); // C6
}

// Play sound based on severity
export function playSeveritySound(severity: string) {
  switch (severity) {
    case 'critical':
      playCriticalSound();
      break;
    case 'warning':
      playWarningSound();
      break;
    case 'success':
      playSuccessSound();
      break;
    case 'info':
    default:
      // Don't play sound for info by default
      break;
  }
}

// Enable/disable sounds
export function setSoundEnabled(enabled: boolean) {
  soundEnabled = enabled;
  // Store preference in localStorage
  localStorage.setItem('soundNotificationsEnabled', String(enabled));
}

export function isSoundEnabled(): boolean {
  // Check localStorage for saved preference
  const saved = localStorage.getItem('soundNotificationsEnabled');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
  return soundEnabled;
}

// Initialize from localStorage
export function initializeSoundPreference() {
  const saved = localStorage.getItem('soundNotificationsEnabled');
  if (saved !== null) {
    soundEnabled = saved === 'true';
  }
}

// Initialize on module load
initializeSoundPreference();
