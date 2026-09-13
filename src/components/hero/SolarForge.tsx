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

function spawnEmber(
  w: number,
  h: number,
  origin: { x: number; y: number },
  radius: number,
): Ember {
  const ang = -0.35 + Math.random() * 2.2;
  const cx = origin.x * w;
  const cy = origin.y * h;
  const rad = radius * Math.min(w, h);
  const speed = 0.04 + Math.random() * 0.12;
  return {
    x: cx + Math.cos(ang) * rad * (0.9 + Math.random() * 0.12),
    y: cy + Math.sin(ang) * rad * (0.9 + Math.random() * 0.12),
    vx: Math.cos(ang) * speed * 0.35,
    vy: Math.sin(ang) * speed - 0.06,
    r: 0.35 + Math.random() * 0.8,
    a: 0.08 + Math.random() * 0.16,
    life: 0,
    max: 140 + Math.random() * 180,
    s: 0.45 + Math.random() * 0.5,
  };
}

function layoutFor(width: number, height: number) {
  const portrait = height > width * 1.08;
  if (portrait) {
    return {
      origin: { x: 0.46, y: 0.58 },
      radius: 0.82,
      cssX: "78%",
      cssY: "6%",
      ember: { x: 0.78, y: 0.12 },
    };
  }
  return {
    origin: { x: 0.64, y: 0.26 },
    radius: 0.7,
    cssX: "84%",
    cssY: "18%",
    ember: { x: 0.82, y: 0.22 },
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
    let visible = true;
    let running = true;
    let raf = 0;
    const start = performance.now();
    let layout = layoutFor(window.innerWidth, window.innerHeight);

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
    let locOrigin: WebGLUniformLocation | null = null;
    let locRadius: WebGLUniformLocation | null = null;

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
      gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      locTime = gl.getUniformLocation(program, "uTime");
      locRes = gl.getUniformLocation(program, "uRes");
      locPointer = gl.getUniformLocation(program, "uPointer");
      locIntro = gl.getUniformLocation(program, "uIntro");
      locOrigin = gl.getUniformLocation(program, "uOrigin");
      locRadius = gl.getUniformLocation(program, "uRadius");
      wrap.dataset.gl = "ready";
    }

    const emberCtx = emberCanvas.getContext("2d");
    const embers: Ember[] = [];
    const emberCount = reduceMotion ? 0 : 8;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      layout = layoutFor(w, h);
      wrap.style.setProperty("--sun-x", layout.cssX);
      wrap.style.setProperty("--sun-y", layout.cssY);

      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      const scale = w < 768 ? 0.52 : 0.7;

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

    const tick = (now: number) => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      if (document.hidden || !visible) return;

      const t = (now - start) / 1000;
      pointer.x += (pointerTarget.x - pointer.x) * 0.035;
      pointer.y += (pointerTarget.y - pointer.y) * 0.035;
      intro = Math.min(1, intro + (reduceMotion ? 1 : 0.008));

      if (gl && program) {
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.uniform1f(locTime, reduceMotion ? 12 : t);
        gl.uniform2f(locRes, glCanvas.width, glCanvas.height);
        gl.uniform2f(locPointer, pointer.x, pointer.y);
        gl.uniform1f(locIntro, intro);
        gl.uniform2f(locOrigin, layout.origin.x, layout.origin.y);
        gl.uniform1f(locRadius, layout.radius);
        gl.drawArrays(gl.TRIANGLES, 0, 3);
      }

      if (emberCtx && emberCount > 0) {
        const w = emberCanvas.width;
        const h = emberCanvas.height;
        emberCtx.clearRect(0, 0, w, h);
        emberCtx.globalCompositeOperation = "lighter";
        while (embers.length < emberCount) {
          embers.push(spawnEmber(w, h, layout.ember, layout.radius * 0.55));
        }
        for (let i = embers.length - 1; i >= 0; i -= 1) {
          const p = embers[i];
          p.life += 1;
          p.x += p.vx * p.s;
          p.y += p.vy * p.s;
          const k = p.life / p.max;
          const alpha = p.a * (1 - k) * intro;
          emberCtx.beginPath();
          emberCtx.fillStyle = `rgba(210, ${70 + p.r * 30}, 28, ${alpha})`;
          emberCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          emberCtx.fill();
          if (p.life > p.max) embers.splice(i, 1);
        }
      }
    };

    resize();
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

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onPointer);
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
      <canvas ref={glRef} className="absolute inset-0 h-full w-full" />
      <canvas ref={emberRef} className="absolute inset-0 h-full w-full" />
    </div>
  );
}
