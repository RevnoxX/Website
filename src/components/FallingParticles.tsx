import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function FallingParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    let mouse = { x: -1000, y: -1000 };

    const defaultLeafSVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj48cGF0aCBkPSJNIDUwIDIgQyA3NSAyMCwgOTUgNjAsIDUwIDkwIEMgNSA2MCwgMjUgMjAsIDUwIDIgWiIgZmlsbD0iIzRhZGU4MCIgc3Ryb2tlPSIjMTZhMzRhIiBzdHJva2Utd2lkdGg9IjEuNSIvPjxwYXRoIGQ9Ik0gNTAgMiBMIDUwIDkwIE0gNTAgNTAgTCA3MCAzMCBNIDUwIDYzIEwgMzAgNzUgTSA1MCAzNSBMIDMwIDIwIE0gNTAgNzggTCA3MCA2NSIgc3Ryb2tlPSIjMTZhMzRhIiBmaWxsPSJub25lIiBzdHJva2Utd2lkdGg9IjEuNSIvPjwvc3ZnPg==";
    const leafImg = new Image();
    let yellowLeafImg: HTMLCanvasElement | null = null;
    leafImg.src = '/leaf.png';
    leafImg.onerror = () => {
      if (leafImg.src !== defaultLeafSVG) {
        leafImg.src = defaultLeafSVG;
      }
    };
    leafImg.onload = () => {
      const offscreen = document.createElement('canvas');
      offscreen.width = leafImg.width || 100;
      offscreen.height = leafImg.height || 100;
      const octx = offscreen.getContext('2d');
      if (octx) {
        octx.drawImage(leafImg, 0, 0, offscreen.width, offscreen.height);
        octx.globalCompositeOperation = 'source-in';
        octx.fillStyle = 'rgba(250, 204, 21, 0.5)'; // Yellow tint
        octx.fillRect(0, 0, offscreen.width, offscreen.height);
        
        octx.globalCompositeOperation = 'destination-over';
        octx.drawImage(leafImg, 0, 0, offscreen.width, offscreen.height);
        
        yellowLeafImg = offscreen;
      }
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };
    window.addEventListener('mousemove', handleMouseMove);

    const path = location.pathname;
    const mode = path === '/' ? 'mix' : path === '/air-quality' ? 'leaf-dust' : 'rain';

    const numParticles = mode === 'rain' ? 150 : 40; // Increase rain particles
    for (let i = 0; i < numParticles; i++) {
      particles.push(createParticle(mode, canvas.width, canvas.height));
    }

    function createParticle(mode: string, w: number, h: number, yPos?: number) {
      let type = 'dust';
      if (mode === 'mix') {
        const r = Math.random();
        if (r < 0.33) type = 'rain';
        else if (r < 0.66) type = 'leaf';
      } else if (mode === 'leaf-dust') {
        type = Math.random() < 0.5 ? 'leaf' : 'dust';
      } else {
        type = 'rain';
      }

      if (type === 'rain') {
        const z = Math.random(); // Depth: 0 (far) to 1 (near)
        const speed = z * 20 + 15; // 15 to 35
        const angle = -Math.PI / 16; // Slight angle to the left
        return {
          type,
          x: Math.random() * w,
          y: yPos ?? Math.random() * h,
          z: z,
          vx: Math.sin(angle) * speed,
          vy: Math.cos(angle) * speed,
          length: z * 60 + 20,
          width: z * 2 + 0.5,
          opacity: z * 0.6 + 0.2,
        };
      }

      const isYellow = Math.random() > 0.6; // 40% are yellow
      return {
        type,
        x: Math.random() * w,
        y: yPos ?? Math.random() * h,
        vx: type === 'leaf' ? (Math.random() - 0.5) * 0.8 : (Math.random() - 0.5) * 0.8, // slower
        vy: type === 'leaf' ? Math.random() * 1 + 0.5 : Math.random() * 0.5 + 0.2, // slower
        size: type === 'leaf' ? Math.random() * 15 + 10 : Math.random() * 2 + 1, // larger size for img
        angle: Math.random() * Math.PI * 2,
        spin: (Math.random() - 0.5) * 0.05, // more spin variability
        isYellow,
        color: type === 'leaf' ? (isYellow ? 'rgba(250, 204, 21, 0.5)' : 'rgba(74, 222, 128, 0.5)') : 'rgba(150, 150, 150, 0.3)'
      };
    }

    let lightningFlash = 0;
    let framesSinceStart = 0;
    let hasDoneFirstLightning = false;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      framesSinceStart++;

      // Lightning logic
      if (mode === 'rain') {
        if (!hasDoneFirstLightning) {
          // 3 seconds at ~60fps is 180 frames
          if (framesSinceStart === 180) {
            lightningFlash = 1;
            hasDoneFirstLightning = true;
          }
        } else if (Math.random() < 0.0015) {
          lightningFlash = 1;
        }
      }

      if (lightningFlash > 0) {
        // Draw the background flash
        ctx.fillStyle = `rgba(255, 255, 255, ${lightningFlash * 0.8})`; // Brighter
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw the actual lightning bolt
        if (lightningFlash > 0.5) {
          ctx.beginPath();
          let startX = Math.random() * canvas.width;
          let currentX = startX;
          let currentY = 0;
          ctx.moveTo(currentX, currentY);
          
          while (currentY < canvas.height) {
            currentX += (Math.random() - 0.5) * 100;
            currentY += Math.random() * 100 + 50;
            ctx.lineTo(currentX, currentY);
          }
          
          ctx.strokeStyle = `rgba(255, 255, 255, ${lightningFlash})`;
          ctx.lineWidth = Math.random() * 3 + 2;
          ctx.stroke();
          
          // Add a branch
          if (Math.random() > 0.5) {
            ctx.beginPath();
            ctx.moveTo(startX, 0);
            let branchX = startX;
            let branchY = 0;
            while (branchY < canvas.height / 2) {
              branchX += (Math.random() - 0.5) * 150;
              branchY += Math.random() * 80 + 40;
              ctx.lineTo(branchX, branchY);
            }
            ctx.lineWidth = Math.random() * 2 + 1;
            ctx.stroke();
          }
        }
        
        lightningFlash -= 0.05; // Slightly faster fade
      }

      for (let i = 0; i < particles.length; i++) {
        let p = particles[i];

        // Mouse repulsion (only for non-rain)
        if (p.type !== 'rain') {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const force = (120 - dist) / 120;
            p.vx += (dx / dist) * force * 1.5;
            p.vy += (dy / dist) * force * 1.5;
          }
        }

        // Apply velocity
        p.x += p.vx;
        p.y += p.vy;
        if (p.type !== 'rain') p.angle += p.spin;

        // Friction / Gravity reset
        if (p.type !== 'rain') {
          p.vx *= 0.98; // friction
          if (p.vy < (p.type === 'leaf' ? 2.5 : 1.5)) p.vy += 0.02; // gentle gravity
        }

        // Wrap around
        if (p.y > canvas.height + (p.length || 20)) {
          particles[i] = createParticle(mode, canvas.width, canvas.height, -(p.length || 20));
          particles[i].x = Math.random() * canvas.width;
        }
        if (p.x > canvas.width + 50) p.x = -50;
        if (p.x < -50) p.x = canvas.width + 50;

        // Draw
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.type === 'rain') {
          const streakRatio = p.length / Math.sqrt(p.vx * p.vx + p.vy * p.vy);
          const dx = p.vx * streakRatio;
          const dy = p.vy * streakRatio;
          
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(-dx, -dy);
          
          const grad = ctx.createLinearGradient(0, 0, -dx, -dy);
          grad.addColorStop(0, `rgba(255, 255, 255, ${p.opacity})`);
          grad.addColorStop(1, `rgba(255, 255, 255, 0)`);
          
          ctx.strokeStyle = grad;
          ctx.lineWidth = p.width;
          ctx.lineCap = 'round';
          
          if (p.z > 0.8) {
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(255, 255, 255, ${p.opacity})`;
          }
          
          ctx.stroke();
        } else {
          ctx.rotate(p.angle);
          if (p.type === 'leaf') {
            const imgToDraw = p.isYellow && yellowLeafImg ? yellowLeafImg : leafImg;
            if (imgToDraw.width > 0) {
              const aspect = imgToDraw.width / imgToDraw.height || 1;
              const width = p.size * 2 * aspect;
              const height = p.size * 2;
              ctx.drawImage(imgToDraw, -width / 2, -height / 2, width, height);
            } else {
              // fallback if neither loaded
              ctx.fillStyle = p.color;
              ctx.beginPath();
              ctx.ellipse(0, 0, p.size, p.size / 2, 0, 0, Math.PI * 2);
              ctx.fill();
            }
          } else {
            ctx.fillStyle = p.color;
            ctx.beginPath();
            ctx.arc(0, 0, p.size, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        ctx.restore();
      }

      animationFrameId = requestAnimationFrame(render);
    };
    render();

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, [location.pathname]);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}
