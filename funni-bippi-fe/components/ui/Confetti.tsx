import { CONFETTI_COLORS } from '@/lib/constants';

export function fireConfetti() {
  const n = 70;
  for (let i = 0; i < n; i++) {
    const p = document.createElement('div');
    p.className = 'confetti-piece';
    p.style.left = Math.random() * 100 + 'vw';
    p.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    p.style.setProperty('--dur', 2 + Math.random() * 1.6 + 's');
    p.style.setProperty('--rot', 300 + Math.random() * 540 + 'deg');
    p.style.top = -10 - Math.random() * 20 + 'px';
    p.style.animationDelay = Math.random() * 0.3 + 's';
    if (Math.random() > 0.5) p.style.borderRadius = '50%';
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 4200);
  }
}
