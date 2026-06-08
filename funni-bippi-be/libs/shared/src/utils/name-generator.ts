import type { Gender, StrangerProfile } from '../types';

const ADJECTIVES = [
  'Frosty',
  'Spicy',
  'Cosmic',
  'Velvet',
  'Neon',
  'Fuzzy',
  'Mystic',
  'Turbo',
  'Jolly',
  'Sneaky',
  'Brave',
  'Quirky',
  'Zesty',
  'Peppy',
  'Groovy',
  'Wacky',
  'Sassy',
  'Blazing',
  'Crystal',
  'Shadow',
  'Thunder',
  'Golden',
  'Silver',
  'Wild',
];

const ANIMALS = [
  'Quokka',
  'Capybara',
  'Axolotl',
  'Narwhal',
  'Pangolin',
  'Meerkat',
  'Fennec',
  'Binturong',
  'Tapir',
  'Pika',
  'Wombat',
  'Kinkajou',
  'Margay',
  'Degu',
  'Olm',
  'Aye-aye',
  'Blobfish',
  'Saiga',
  'Gerenuk',
  'Fossa',
];

const GRAD_PAIRS: Array<[string, string]> = [
  ['#FF6B6B', '#FF8E53'],
  ['#A29BFE', '#6C5CE7'],
  ['#55EFC4', '#00B894'],
  ['#FDCB6E', '#E17055'],
  ['#74B9FF', '#0984E3'],
  ['#FD79A8', '#E84393'],
  ['#00CEC9', '#00B894'],
  ['#6C5CE7', '#A29BFE'],
  ['#FF7675', '#D63031'],
  ['#FFEAA7', '#FDCB6E'],
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function makeStranger(gender: Gender = 'everyone'): StrangerProfile {
  const adj = pick(ADJECTIVES);
  const animal = pick(ANIMALS);
  const name = `${adj}${animal}`;
  const grad = pick(GRAD_PAIRS);
  const glyph = name[0];
  return { name, gender, grad, glyph };
}
