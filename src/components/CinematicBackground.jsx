import React, { useEffect, useRef } from 'react';

export default function CinematicBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    // Generate stars
    const stars = Array.from({ length: 180 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height * 0.75, // Mostly in upper sky
      radius: Math.random() * 1.5 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      twinkleSpeed: Math.random() * 0.02 + 0.005,
      twinklePhase: Math.random() * Math.PI * 2
    }));

    // Generate dust / cosmic dust particles
    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.15,
      vy: -Math.random() * 0.2 - 0.05,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.3 + 0.05
    }));

    let time = 0;

    const render = () => {
      time += 0.015;
      ctx.clearRect(0, 0, width, height);

      // Deep space gradient
      const bgGrad = ctx.createLinearGradient(0, 0, 0, height);
      bgGrad.addColorStop(0, '#02050e');
      bgGrad.addColorStop(0.5, '#050a18');
      bgGrad.addColorStop(1, '#091024');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Distant Earth in sky (visible at lunar south pole horizon)
      const earthX = width * 0.82;
      const earthY = height * 0.22;
      const earthR = 34;

      // Earth atmosphere glow
      const earthGlow = ctx.createRadialGradient(earthX, earthY, earthR * 0.8, earthX, earthY, earthR * 2.2);
      earthGlow.addColorStop(0, 'rgba(56, 189, 248, 0.4)');
      earthGlow.addColorStop(0.5, 'rgba(14, 165, 233, 0.1)');
      earthGlow.addColorStop(1, 'rgba(14, 165, 233, 0)');
      ctx.fillStyle = earthGlow;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR * 2.2, 0, Math.PI * 2);
      ctx.fill();

      // Earth sphere
      const earthBody = ctx.createRadialGradient(earthX - 8, earthY - 8, 4, earthX, earthY, earthR);
      earthBody.addColorStop(0, '#67e8f9');
      earthBody.addColorStop(0.3, '#0284c7');
      earthBody.addColorStop(0.7, '#03478c');
      earthBody.addColorStop(1, '#021838');
      ctx.fillStyle = earthBody;
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
      ctx.fill();

      // Earth crescent shadow (lunar south pole perspective)
      ctx.save();
      ctx.beginPath();
      ctx.arc(earthX, earthY, earthR, 0, Math.PI * 2);
      ctx.clip();
      ctx.fillStyle = 'rgba(2, 6, 23, 0.65)';
      ctx.beginPath();
      ctx.arc(earthX + 12, earthY - 5, earthR * 0.95, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Render stars
      stars.forEach((star) => {
        const currentAlpha = star.alpha + Math.sin(time * star.twinkleSpeed * 60 + star.twinklePhase) * 0.2;
        ctx.fillStyle = `rgba(224, 242, 254, ${Math.max(0.1, Math.min(1, currentAlpha))})`;
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Render drifting particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = height;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;

        ctx.fillStyle = `rgba(56, 189, 248, ${p.alpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Distant Lunar Horizon Silhouettes (Jagged South Pole mountains / crater rim)
      const drawHorizon = (baseY, amp, color, strokeColor, shadowColor) => {
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(0, baseY);

        const segments = 40;
        const segWidth = width / segments;

        for (let i = 0; i <= segments; i++) {
          const x = i * segWidth;
          // Procedural jagged peaks
          const peak = Math.sin(i * 0.6 + 1.2) * amp + Math.cos(i * 1.4) * (amp * 0.5) + Math.sin(i * 0.2) * (amp * 0.8);
          ctx.lineTo(x, baseY + peak);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        ctx.fillStyle = color;
        ctx.fill();

        if (strokeColor) {
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }
      };

      // Far peaks (illuminated tips)
      drawHorizon(height * 0.78, 35, 'rgba(8, 15, 34, 0.95)', 'rgba(0, 240, 255, 0.15)');
      // Near crater rim
      drawHorizon(height * 0.88, 25, 'rgba(3, 7, 18, 0.98)', 'rgba(56, 189, 248, 0.25)');

      // Grazing polar sunlight beam across horizon
      const sunBeam = ctx.createLinearGradient(0, height * 0.82, width, height * 0.88);
      sunBeam.addColorStop(0, 'rgba(0, 240, 255, 0.08)');
      sunBeam.addColorStop(0.4, 'rgba(186, 230, 253, 0.12)');
      sunBeam.addColorStop(0.7, 'rgba(0, 240, 255, 0.02)');
      sunBeam.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = sunBeam;
      ctx.fillRect(0, height * 0.75, width, height * 0.25);

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
    />
  );
}
