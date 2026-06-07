export type Screen = 'landing' | 'matching' | 'chat';
export type Gender = 'male' | 'female' | 'any';
export type AccentColor = 'coral' | 'teal' | 'yellow' | 'blue' | 'pink';
export type Theme = 'light' | 'dark';
export type Filter = 'everyone' | 'male' | 'female';

export interface Stranger {
  name: string;
  gender: Gender;
  grad: [string, string];
  glyph: string;
  country: string;
  interests: string[];
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
