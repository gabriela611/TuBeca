import confetti from 'canvas-confetti';

/**
 * Dispara confeti discreto y elegante al guardar una beca en favoritos.
 */
export function triggerSaveConfetti(event?: React.MouseEvent) {
  let originX = 0.5;
  let originY = 0.5;

  if (event) {
    originX = event.clientX / window.innerWidth;
    originY = event.clientY / window.innerHeight;
  }

  confetti({
    particleCount: 28,
    spread: 55,
    origin: { x: originX, y: originY },
    colors: ['#1d4ed8', '#facc15', '#2563eb', '#eab308', '#60a5fa'],
    disableForReducedMotion: true,
    ticks: 140,
    gravity: 1.3,
    scalar: 0.75,
  });
}

