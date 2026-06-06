import type { IcebreakerItem } from '@/types'

export const ICEBREAKERS: IcebreakerItem[] = [
  { e: '🤔', parts: ['Would you rather ', 'always be 10 min late', ' or 20 min early?'], boldIndex: 1 },
  { e: '🍕', parts: ['Pineapple on pizza: ', 'yes or absolutely not', '?'], boldIndex: 1 },
  { e: '🎒', parts: ['You can teleport anywhere ', 'right now', ' — where to?'], boldIndex: 1 },
  { e: '🎶', parts: ['What song is ', 'stuck in your head', ' today?'], boldIndex: 1 },
  { e: '👽', parts: ['Aliens land tomorrow — ', 'first thing you say', '?'], boldIndex: 1 },
  { e: '🦄', parts: ['Pick a ', 'superpower', ' for the weekend only.'], boldIndex: 1 },
  { e: '☕', parts: ['Coffee, tea, or ', 'chaotic energy drink', '?'], boldIndex: 1 },
  { e: '🌮', parts: ['Last meal on Earth ', 'has to be', '...?'], boldIndex: 1 },
]

const OPENERS = [
  "hey hey 👋 how's your day going?",
  "yo! random question — sweet or savoury breakfast? 🥞",
  "hellooo new friend ✨ what are you up to rn?",
  "hi! you look cool. where in the world are you?",
  "oh nice, a human! 😄 how's it going?",
  "heyy 🙌 what's the best thing that happened to you today?",
]

const REPLIES = [
  "haha that's so real 😂", "ooo tell me more!", "no wayyy same here 🙌",
  "okay that's actually awesome", "lol you seem fun ✨", "wait that's a great point",
  "mood honestly 😅", "I'd 100% try that", "you're vibing, I respect it",
  "hmm interesting, never thought of it like that 🤔", "okok I'm listening 👀",
  "that made me smile ngl 😊", "big if true", "stop that's adorable 🥹",
]
const QUESTION_REPLIES = [
  "ooh good question! probably yes 😄 you?", "honestly? a bit of both 🤷",
  "hmm I'd say definitely the first one!", "tough one... I'm gonna go with chaos 🔥",
  "depends on the day tbh, today = yes", "haha you first 👀",
]
const GREET_REPLIES = [
  "hey you! 👋 glad you said hi",
  "ayy hello! how's it going?",
  "hii! 😄 nice to meet you",
]

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

export function pickOpener(): string {
  return pick(OPENERS)
}

export function autoReply(text: string): string {
  const t = (text || '').toLowerCase()
  if (/^(hi|hey|hello|yo|sup|hiya|heya)\b/.test(t)) return pick(GREET_REPLIES)
  if (t.includes('?')) return pick(QUESTION_REPLIES)
  if (t.includes('lol') || t.includes('haha') || t.includes('😂'))
    return pick(["hahaha 😂", "glad I could make u laugh", "you get me 🙌"])
  return pick(REPLIES)
}

export function sampleIcebreakers(n = 4): IcebreakerItem[] {
  return [...ICEBREAKERS].sort(() => Math.random() - 0.5).slice(0, n)
}

export const EMOJI: Record<string, string[]> = {
  Smileys: ['😀','😄','😁','😂','🥹','😊','😍','🥰','😎','🤩','😜','🤪','🤔','🤗','😴','🥳','😇','🙃','😅','😏','🤭','😶'],
  Gestures: ['👋','🙌','👍','👏','🤝','✌️','🤞','🫶','💪','🙏','👀','🫡','🤙','✊','👌'],
  Hearts: ['❤️','🧡','💛','💚','💙','💜','🤎','🖤','💖','💗','💕','💞','✨','⭐','🔥','💫'],
  Fun: ['🎉','🎊','🍕','🌮','🍦','🧋','🌈','🦄','🐧','🦦','🌍','☕','🎶','🎮','🛸','🍀'],
}
