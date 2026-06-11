export type Screen = 'landing' | 'matching' | 'chat';
export type Gender = 'male' | 'female';
export type Interest = 'everyone' | 'male' | 'female';
export type AccentColor = 'coral' | 'teal' | 'yellow' | 'blue' | 'pink';
export type Theme = 'light' | 'dark';

export interface Stranger {
  name: string;
  gender: Gender;
  interest: Interest;
  grad: [string, string];
  glyph: string;
  country: string;
}

export interface Message {
  id: string;
  from: 'me' | 'them';
  text?: string;
  imageUrl?: string;
  time: string;
  reaction?: string;
}

export interface IcebreakerItem {
  e: string;
  parts: string[];
  boldIndex: number;
}
