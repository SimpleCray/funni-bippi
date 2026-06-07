import type { Filter, Stranger } from '@/types';
import { AVA_COLORS } from './constants';

const ADJ = [
  'Blue',
  'Mint',
  'Coral',
  'Sunny',
  'Cosmic',
  'Velvet',
  'Toasty',
  'Jazzy',
  'Pixel',
  'Maple',
  'Lucky',
  'Breezy',
  'Cocoa',
  'Peachy',
  'Frosty',
  'Goldn',
  'Misty',
  'Zesty',
  'Plush',
  'Echo',
];
const ANIMALS = [
  'Otter',
  'Panda',
  'Koala',
  'Fox',
  'Penguin',
  'Narwhal',
  'Axolotl',
  'Yeti',
  'Llama',
  'Quokka',
  'Puffin',
  'Wombat',
  'Tapir',
  'Lynx',
  'Manatee',
  'Hedgehog',
  'Capybara',
];
const COUNTRIES = [
  '🌍 Somewhere',
  '🛰 Online',
  '🌙 Night owl',
  '☕ Café',
  '🏝 Far away',
  '🚆 Commuting',
];
const INTERESTS = [
  'lo-fi beats',
  'street food',
  'retro games',
  'hiking',
  'sci-fi',
  'houseplants',
  'bad puns',
  'film photography',
  'cats',
  'baking',
  'astronomy',
  'skating',
];

let _seed = Math.floor(Math.random() * 9999);
function rnd(n: number): number {
  _seed = (_seed * 9301 + 49297) % 233280;
  return Math.floor((_seed / 233280) * n);
}
function pick<T>(arr: T[]): T {
  return arr[rnd(arr.length)];
}

export function makeStranger(filter: Filter = 'everyone'): Stranger {
  let gender: Stranger['gender'];
  if (filter === 'male') gender = 'male';
  else if (filter === 'female') gender = 'female';
  else gender = pick(['male', 'female', 'any'] as const);

  const name = pick(ADJ) + pick(ANIMALS) + (10 + rnd(89));
  const color1 = pick(AVA_COLORS);
  let color2 = pick(AVA_COLORS);
  if (color2 === color1) color2 = AVA_COLORS[(AVA_COLORS.indexOf(color1) + 3) % AVA_COLORS.length];

  return {
    name,
    gender,
    grad: [color1, color2],
    glyph: name.slice(0, 1).toUpperCase(),
    country: pick(COUNTRIES),
    interests: [pick(INTERESTS), pick(INTERESTS)],
  };
}
