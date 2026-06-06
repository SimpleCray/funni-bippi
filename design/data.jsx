/* data.jsx — fake-but-charming content: stranger generator, auto-replies,
   icebreakers, emoji set, avatar palette. */

const ADJ = ["Blue","Mint","Coral","Sunny","Cosmic","Velvet","Toasty","Jazzy","Pixel","Maple",
             "Lucky","Breezy","Cocoa","Peachy","Frosty","Goldn","Misty","Zesty","Plush","Echo"];
const ANIMALS = ["Otter","Panda","Koala","Fox","Penguin","Narwhal","Axolotl","Yeti","Llama",
                 "Quokka","Puffin","Wombat","Tapir","Lynx","Manatee","Hedgehog","Capybara"];
const AVA_COLORS = ["#FF8E6B","#16BFAE","#FFB627","#4A90FF","#A66BFF","#FF6F9E","#3CC97B","#FF7A45","#5AC8E0","#E06BC9"];

let _seed = Math.floor(Math.random() * 9999);
function rnd(n) { _seed = (_seed * 9301 + 49297) % 233280; return Math.floor((_seed / 233280) * n); }
function pick(a) { return a[rnd(a.length)]; }

function makeStranger(filter = "everyone") {
  let gender;
  if (filter === "male") gender = "male";
  else if (filter === "female") gender = "female";
  else gender = pick(["male", "female", "any"]);
  const name = pick(ADJ) + pick(ANIMALS) + (10 + rnd(89));
  const color1 = pick(AVA_COLORS);
  let color2 = pick(AVA_COLORS); if (color2 === color1) color2 = AVA_COLORS[(AVA_COLORS.indexOf(color1)+3)%AVA_COLORS.length];
  return {
    name, gender,
    grad: `linear-gradient(135deg, ${color1}, ${color2})`,
    glyph: name.slice(0, 1).toUpperCase(),
    country: pick(["🌍 Somewhere","🛰 Online","🌙 Night owl","☕ Café","🏝 Far away","🚆 Commuting"]),
    interests: [pick(["lo-fi beats","street food","retro games","hiking","sci-fi","houseplants"]),
                pick(["bad puns","film photography","cats","baking","astronomy","skating"])],
  };
}

const OPENERS = [
  "hey hey 👋 how's your day going?",
  "yo! random question — sweet or savoury breakfast? 🥞",
  "hellooo new friend ✨ what are you up to rn?",
  "hi! you look cool. where in the world are you?",
  "oh nice, a human! 😄 how's it going?",
  "heyy 🙌 what's the best thing that happened to you today?",
];

const REPLIES = [
  "haha that's so real 😂", "ooo tell me more!", "no wayyy same here 🙌",
  "okay that's actually awesome", "lol you seem fun ✨", "wait that's a great point",
  "mood honestly 😅", "I'd 100% try that", "you're vibing, I respect it",
  "hmm interesting, never thought of it like that 🤔", "okok I'm listening 👀",
  "that made me smile ngl 😊", "big if true", "stop that's adorable 🥹",
];
const QUESTION_REPLIES = [
  "ooh good question! probably yes 😄 you?", "honestly? a bit of both 🤷",
  "hmm I'd say definitely the first one!", "tough one... I'm gonna go with chaos 🔥",
  "depends on the day tbh, today = yes", "haha you first 👀",
];
const GREET_REPLIES = ["hey you! 👋 glad you said hi", "ayy hello! how's it going?", "hii! 😄 nice to meet you"];

function autoReply(text) {
  const t = (text || "").toLowerCase();
  if (/^(hi|hey|hello|yo|sup|hiya|heya)\b/.test(t)) return pick(GREET_REPLIES);
  if (t.includes("?")) return pick(QUESTION_REPLIES);
  if (t.includes("lol") || t.includes("haha") || t.includes("😂")) return pick(["hahaha 😂","glad I could make u laugh","you get me 🙌"]);
  return pick(REPLIES);
}

const ICEBREAKERS = [
  { e: "🤔", html: ["Would you rather ", "always be 10 min late", " or 20 min early?"] },
  { e: "🍕", html: ["Pineapple on pizza: ", "yes or absolutely not", "?"] },
  { e: "🎒", html: ["You can teleport anywhere ", "right now", " — where to?"] },
  { e: "🎶", html: ["What song is ", "stuck in your head", " today?"] },
  { e: "👽", html: ["Aliens land tomorrow — ", "first thing you say", "?"] },
  { e: "🦄", html: ["Pick a ", "superpower", " for the weekend only."] },
  { e: "☕", html: ["Coffee, tea, or ", "chaotic energy drink", "?"] },
  { e: "🌮", html: ["Last meal on Earth ", "has to be", "...?"] },
];

const EMOJI = {
  Smileys: ["😀","😄","😁","😂","🥹","😊","😍","🥰","😎","🤩","😜","🤪","🤔","🤗","😴","🥳","😇","🙃","😅","😏","🤭","😶‍🌫️"],
  Gestures: ["👋","🙌","👍","👏","🤝","✌️","🤞","🫶","💪","🙏","👀","🫡","🤙","✊","👌"],
  Hearts: ["❤️","🧡","💛","💚","💙","💜","🤎","🖤","💖","💗","💕","💞","✨","⭐","🔥","💫"],
  Fun: ["🎉","🎊","🍕","🌮","🍦","🧋","🌈","🦄","🐧","🦦","🌍","☕","🎶","🎮","🛸","🍀"],
};
const QUICK_REACTS = ["❤️","😂","👍","😮","🔥","🙌"];

Object.assign(window, {
  makeStranger, autoReply, OPENERS, ICEBREAKERS, EMOJI, QUICK_REACTS, pickRand: pick,
});
