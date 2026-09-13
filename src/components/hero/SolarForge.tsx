"use client";

import { useEffect, useRef } from "react";
import { fragmentShader, vertexShader } from "./shaders";

type Pointer = { x: number; y: number };

function compile(
  gl: WebGLRenderingContext,
  type: number,
  source: string,
): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    console.warn(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

type Ember = {
  a: number;
  life: number;
  max: number;
  r: number;
  s: number;
  vx: number;
  vy: number;
  x: number;
  y: number;
};

function spawnEmber(w: number, h: number, pointer: Pointer): Ember {
  const min = Math.min(w, h);
  const rad = min * 0.345;
  const ang = Math.random() * Math.PI * 2;
  const cx = w * 0.5 + pointer.x * min * 0.02;
  const cy = h * 0.43 + pointer.y * min * 0.02;
  const speed = 0.08 + Math.random() * 0.22;
  return {
    x: cx + Math.cos(ang) * rad * (0.92 + Math.random() * 0.18),
    y: cy + Math.sin(ang) * rad * (0.92 + Math.random() * 0.18),
    vx: Math.cos(ang) * speed,
    vy: Math.sin(ang) * speed - (0.12 + Math.random() * 0.18),
    r: 0.4 + Math.random() * 1.15,
    a: 0.15 + Math.random() * 0.35,
    life: 0,
    max: 90 + Math.random() * 160,
    s: 0.6 + Math.random() * 0.8,
  };
}

export function SolarForge() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const emberRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const glCanvas = glRef.current;
    const emberCanvas = emberRef.current;
    if (!wrap || !glCanvas || !emberCanvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const pointer: Pointer = { x: 0, y: 0 };
    const pointerTarget: Pointer = { x: 0, y: 0 };
    let intro = 0;
    let fade = 1;
    let visible = true;
    let running = true;
    let raf = 0;
    const start = performance.now();

    const gl =
      glCanvas.getContext("webgl", {
        alpha: true,
        antialias: false,
        depth: false,
        premultipliedAlpha: true,
        stencil: false,
      }) ||
      (glCanvas.getContext("experimental-webgl", {
        alpha: true,
        antialias: false,
      }) as WebGLRenderingContext | null);

    let program: WebGLProgram | null = null;
    let locTime: WebGLUniformLocation | null = null;
    let locRes: WebGLUniformLocation | null = null;
    let locPointer: WebGLUniformLocation | null = null;
    let locIntro: WebGLUniformLocation | null = null;
    let locFade: WebGLUniformLocation | null = null;
    let locLift: WebGLUniformLocation | null = null;

    if (gl) {
      const vs = compile(gl, gl.VERTEX_SHADER, vertexShader);
      const fs = compile(gl, gl.FRAGMENT_SHADER, fragmentShader);
      if (vs && fs) {
        program = gl.createProgram();
        if (program) {
          gl.attachShader(program, vs);
          gl.attachShader(program, fs);
          gl.bindAttribLocation(program, 0, "aPos");
          gl.linkProgram(program);
          if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.warn(gl.getProgramInfoLog(program));
            program = null;
          }
        }
      }
    }

    if (gl && program) {
      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array([-1, -1, 3, -1, -1, 3]),
        gl.STATIC_DRAW,
      );
      gl.enableVertexAttribArray(0);
      gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      gl.useProgram(program);
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.ONE, gl.ONE);
      locTime = gl.getUniformLocation(program, "uTime");
      locRes = gl.getUniformLocation(program, "uRes");
      locPointer = gl.getUniformLocation(program, "uPointer");
      locIntro = gl.getUniformLocation(program, "uIntro");
      locFade = gl.getUniformLocation(program, "uFade");
      locLift = gl.getUniformLocation(program, "uLift");
      wrap.dataset.gl = "ready";
    }

    const emberCtx = emberCanvas.getContext("2d");
    const embers: Ember[] = [];
    const mobile = window.matchMedia("(max-width: 768px)").matches;
    const emberCount = reduceMotion ? 0 : mobile ? 18 : 36;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
      const scale = mobile ? 0.5 : 0.72;

      glCanvas.style.width = `${w}px`;
      glCanvas.style.height = `${h}px`;
      glCanvas.width = Math.max(1, Math.floor(w * dpr * scale));
      glCanvas.height = Math.max(1, Math.floor(h * dpr * scale));

      emberCanvas.style.width = `${w}px`;
      emberCanvas.style.height = `${h}px`;
      emberCanvas.width = Math.max(1, Math.floor(w * dpr));
      emberCanvas.height = Math.max(1, Math.floor(h * dpr));

      if (gl) gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    };

    const onPointer = (event: PointerEvent) => {
      const rect = wrap.getBoundingClientRect();
      pointerTarget.x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
      pointerTarget.y = ((event.clientY - rect.top) / rect.height - 0.5) * -2;
    };

    const onScroll = () => {
      const rect = wrap.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, -rect.top / Math.max(rect.height, 1)));
      fade = 1 - p * 0.62;
      wrap.style.setProperty("--sun-scroll", p.toFixed(4));
    };

    const tick = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (document.hidden || !visible) return;

      const t = (now - start) / 1000;
      if (!reduceMotion) {
        pointerTarget.x += Math.sin(t * 0.17) * 0.0022;
        pointerTarget.y += Math.cos(t * 0.13) * 0.0016;
      }
      pointer.x += (pointerTarget.x - pointer.x) * 0.045;
      pointer.y += (pointerTarget.y - pointer.y) * 0.045;
      intro = Math.min(1, intro + (reduceMotion ? 1 : 0.012));

      wrap.style.setProperty("--sun-x", `${50 + pointer.x * 2.2}%`);
      wrap.style.setProperty("--sun-y", `${43 + pointer.y * -2.2}%`);

      if (gl && program) {
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(locTime, reduceMotion ? 8.5 : t);
        gl.uniform2f(locRes, glCanvas.width, glCanvas.height);
        gl.uniform2f(locPointer, pointer.x, pointer.y);
        gl.uniform1f(locIntro, intro);
        gl.uniform1f(locFade, fade);
        const aspect = glCanvas.width / Math.max(glCanvas.height, 1);
        gl.uniform1f(locLift, aspect < 0.85 ? 0.02 : 0.055);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      if (emberCtx && emberCount > 0) {
        const w = emberCanvas.width;
        const h = emberCanvas.height;
        emberCtx.clearRect(0, 0, w, h);
        emberCtx.globalCompositeOperation = "lighter";
        while (embers.length < emberCount) {
          embers.push(spawnEmber(w, h, pointer));
        }
        for (let i = embers.length - 1; i >= 0; i -= 1) {
          const p = embers[i];
          p.life += 1;
          p.x += p.vx * p.s;
          p.y += p.vy * p.s;
          const k = p.life / p.max;
          const alpha = p.a * (1 - k) * intro * fade;
          emberCtx.beginPath();
          emberCtx.fillStyle = `rgba(255, ${130 + p.r * 40}, 60, ${alpha})`;
          emberCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          emberCtx.fill();
          if (p.life > p.max) embers.splice(i, 1);
        }
      }
    };

    resize();
    onScroll();
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0.01 },
    );
    io.observe(wrap);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="sun-stage pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div className="sun-atmosphere" />
      <div className="sun-fallback" />
      <canvas ref={glRef} className="absolute inset-0 h-full w-full mix-blend-screen" />
      <canvas ref={emberRef} className="absolute inset-0 h-full w-full mix-blend-screen" />
      <div className="sun-vignette" />
    </div>
  );
}
