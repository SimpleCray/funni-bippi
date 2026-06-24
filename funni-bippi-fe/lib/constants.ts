import type { AccentColor, Gender, Interest } from '@/types';

// Socket event names live in `@/lib/socketEvents` (SOCKET_EVENTS) — single source of truth.

export const ACCENT_COLORS: { id: AccentColor; grad: string; hex: string }[] = [
  { id: 'coral', grad: 'linear-gradient(135deg, #FF8E6B, #FF5E72)', hex: '#FF6B5E' },
  { id: 'teal', grad: 'linear-gradient(135deg, #2BD9C3, #11A6C7)', hex: '#16BFAE' },
  { id: 'yellow', grad: 'linear-gradient(135deg, #FFD25E, #FFA92E)', hex: '#FFB627' },
  { id: 'blue', grad: 'linear-gradient(135deg, #6EA8FF, #3C6BFF)', hex: '#3C6BFF' },
  { id: 'pink', grad: 'linear-gradient(135deg, #FF9EC8, #FF5E9E)', hex: '#FF5E9E' },
];

export const INTEREST_OPTIONS: { id: Interest; label: string }[] = [
  { id: 'everyone', label: 'Everyone' },
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
];

export const MY_GENDER_OPTIONS: { id: Gender; label: string }[] = [
  { id: 'male', label: 'Male' },
  { id: 'female', label: 'Female' },
];

export const MATCHING_COPY = [
  'Looking for someone cool…',
  'Tuning into the same wavelength…',
  'Shaking the friendship snow globe…',
  'Almost there — they seem nice 👀',
];

export const CONFETTI_COLORS = ['#FF8E6B', '#16BFAE', '#FFB627', '#4A90FF', '#FF6F9E', '#3CC97B'];

export const QUICK_REACTS = ['❤️', '😂', '👍', '😮', '🔥', '🙌'];

export const AVA_COLORS = [
  '#FF8E6B',
  '#16BFAE',
  '#FFB627',
  '#4A90FF',
  '#A66BFF',
  '#FF6F9E',
  '#3CC97B',
  '#FF7A45',
  '#5AC8E0',
  '#E06BC9',
];
