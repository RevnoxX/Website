import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
}

export default function MouseTrail() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: -1000, y: -1000, vx: 0, vy: 0 });
  const lastMouse = useRef({ x: -1000, y: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const getColors = () => {
      if (location.pathname === '/air-quality') {
        return ['#60a5fa', '#94a3b8', '#e2e8f0'];
      } else if (location.pathname === '/climate-water') {
        return ['#4db6ac', '#80cbc4', '#e0f2f1'];
      } else {
        return ['#a5d0b9', '#4ade80', '#e1e3e4'];
      }
    };

    const handleMouseMove = (e: MouseEvent) => {
      const currentX = e.clientX;
      const currentY = e.clientY;
      
      mouse.current.vx = currentX - lastMouse.current.x;
      mouse.current.vy = currentY - lastMouse.current.y;
      
      mouse.current.x = currentX;
      mouse.current.y = currentY;

      lastMouse.current.x = currentX;
      lastMouse.current.y = currentY;

      const speed = Math.sqrt(mouse.current.vx ** 2 + mouse.current.vy ** 2);
      const colors = getColors();

      // Spawn particles
      if (speed > 1) {
        const numParticles = Math.min(Math.floor(speed / 5), 5);
        for (let i = 0; i < numParticles; i++) {
          particles.current.push({
            x: currentX + (Math.random() - 0.5) * 20,
            y: currentY + (Math.random() - 0.5) * 20,
            vx: (Math.random() - 0.5) * 2 + mouse.current.vx * 0.05,
            vy: (Math.random() - 0.5) * 2 + mouse.current.vy * 0.05,
            life: 1,
            maxLife: 40 + Math.random() * 40 + (speed > 20 ? 30 : 0),
            color: colors[Math.floor(Math.random() * colors.length)]
          });
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = particles.current.length - 1; i >= 0; i--) {
        const p = particles.current[i];
        
        // Physics: Attraction to mouse
        const dx = mouse.current.x - p.x;
        const dy = mouse.current.y - p.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0 && dist < 200) {
          // Subtle attraction
          p.vx += (dx / dist) * 0.05;
          p.vy += (dy / dist) * 0.05;
        }

        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;
        
        // Friction
        p.vx *= 0.95;
        p.vy *= 0.95;

        p.life++;

        if (p.life >= p.maxLife) {
          particles.current.splice(i, 1);
          continue;
        }

        const progress = p.life / p.maxLife;
        const opacity = 1 - progress;
        const size = Math.max(0.5, 4 * (1 - progress));

        ctx.beginPath();
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity * 0.6;
        ctx.fill();
      }
      
      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [location.pathname]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 mix-blend-screen"
    />
  );
}
