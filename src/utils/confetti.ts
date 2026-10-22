/**
 * Safe Confetti utility that handles both ESM and CommonJS bundles
 * and never throws runtime errors.
 */
import confetti from 'canvas-confetti';

export function triggerConfetti() {
  try {
    const fire = typeof confetti === 'function' ? confetti : (confetti as unknown as { default?: typeof confetti })?.default;
    if (typeof fire === 'function') {
      fire({
        particleCount: 55,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#6366f1', '#10b981', '#38bdf8', '#fbbf24'],
      });
    }
  } catch (err) {
    console.warn('Confetti trigger ignored:', err);
  }
}
