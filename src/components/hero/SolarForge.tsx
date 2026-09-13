"use client";

import { type MotionValue } from "framer-motion";
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
  const ang = -0.5 + Math.random() * 2.4;
  const cx = origin.x * w;
  const cy = origin.y * h;
  const rad = radius * Math.min(w, h);
  const speed = 0.03 + Math.random() * 0.1;
  return {
    x: cx + Math.cos(ang) * rad * (0.88 + Math.random() * 0.14),
    y: cy + Math.sin(ang) * rad * (0.88 + Math.random() * 0.14),
    vx: Math.cos(ang) * speed * 0.32,
    vy: Math.sin(ang) * speed - 0.05,
    r: 0.3 + Math.random() * 0.7,
    a: 0.06 + Math.random() * 0.12,
    life: 0,
    max: 160 + Math.random() * 200,
    s: 0.4 + Math.random() * 0.5,
  };
}

function layoutFor(width: number, height: number) {
  const portrait = height > width * 1.08;
  if (portrait) {
    return {
      origin: { x: 0.9, y: 1.22 },
      radius: 1.16,
      cssX: "108%",
      cssY: "-6%",
      ember: { x: 0.92, y: 0.04 },
    };
  }
  return {
    origin: { x: 0.86, y: 0.38 },
    radius: 0.94,
    cssX: "96%",
    cssY: "4%",
    ember: { x: 0.9, y: 0.1 },
  };
}

export function SolarForge({
  fade,
  progress,
}: {
  fade?: MotionValue<number>;
  progress?: MotionValue<number>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const glRef = useRef<HTMLCanvasElement>(null);
  const emberRef = useRef<HTMLCanvasElement>(null);
  const atmosphereRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const glCanvas = glRef.current;
    const emberCanvas = emberRef.current;
    const atmosphere = atmosphereRef.current;
    if (!wrap || !glCanvas || !emberCanvas) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const pointer: Pointer = { x: 0, y: 0 };
    const pointerTarget: Pointer = { x: 0, y: 0 };
    let intro = 0;
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
        preserveDrawingBuffer: false,
      }) ||
      (glCanvas.getContext("experimental-webgl", {
        alpha: true,
        antialias: false,
        premultipliedAlpha: true,
      }) as WebGLRenderingContext | null);

    let program: WebGLProgram | null = null;
    let locTime: WebGLUniformLocation | null = null;
    let locRes: WebGLUniformLocation | null = null;
    let locPointer: WebGLUniformLocation | null = null;
    let locIntro: WebGLUniformLocation | null = null;
    let locOrigin: WebGLUniformLocation | null = null;
    let locRadius: WebGLUniformLocation | null = null;
    let locFade: WebGLUniformLocation | null = null;

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
      locFade = gl.getUniformLocation(program, "uFade");
      wrap.dataset.gl = "ready";
    }

    const emberCtx = emberCanvas.getContext("2d");
    const embers: Ember[] = [];
    const emberCount = reduceMotion ? 0 : 7;

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      layout = layoutFor(w, h);
      wrap.style.setProperty("--sun-x", layout.cssX);
      wrap.style.setProperty("--sun-y", layout.cssY);

      const dpr = Math.min(window.devicePixelRatio || 1, 1.35);
      const scale = w < 768 ? 0.62 : 0.88;

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
      if (document.hidden) return;

      const t = (now - start) / 1000;
      const fadeValue = fade?.get() ?? 1;
      const scroll = reduceMotion ? 0 : (progress?.get() ?? 0);
      const originX = layout.origin.x + scroll * 0.32;
      const originY = layout.origin.y + scroll * 0.4;
      const radius = layout.radius * (1 + scroll * 0.42);

      pointer.x += (pointerTarget.x - pointer.x) * 0.03;
      pointer.y += (pointerTarget.y - pointer.y) * 0.03;
      intro = Math.min(1, intro + (reduceMotion ? 1 : 0.007));

      wrap.style.visibility = fadeValue < 0.012 ? "hidden" : "visible";
      if (atmosphere) atmosphere.style.opacity = String(fadeValue);

      if (gl && program) {
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT);
        if (fadeValue > 0.01) {
          gl.uniform1f(locTime, reduceMotion ? 16 : t);
          gl.uniform2f(locRes, glCanvas.width, glCanvas.height);
          gl.uniform2f(locPointer, pointer.x, pointer.y);
          gl.uniform1f(locIntro, intro);
          gl.uniform2f(locOrigin, originX, originY);
          gl.uniform1f(locRadius, radius);
          gl.uniform1f(locFade, fadeValue);
          gl.drawArrays(gl.TRIANGLES, 0, 3);
        }
      }

      if (emberCtx) {
        const w = emberCanvas.width;
        const h = emberCanvas.height;
        emberCtx.clearRect(0, 0, w, h);
        if (fadeValue > 0.01 && emberCount > 0) {
          emberCtx.globalCompositeOperation = "lighter";
          while (embers.length < emberCount) {
            embers.push(spawnEmber(w, h, layout.ember, layout.radius * 0.42));
          }
          for (let i = embers.length - 1; i >= 0; i -= 1) {
            const p = embers[i];
            p.life += 1;
            p.x += p.vx * p.s;
            p.y += p.vy * p.s;
            const k = p.life / p.max;
            const alpha = p.a * (1 - k) * intro * fadeValue;
            emberCtx.beginPath();
            emberCtx.fillStyle = `rgba(196, ${58 + p.r * 24}, 22, ${alpha})`;
            emberCtx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            emberCtx.fill();
            if (p.life > p.max) embers.splice(i, 1);
          }
        }
      }
    };

    resize();
    raf = requestAnimationFrame(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [fade, progress]);

  return (
    <div
      ref={wrapRef}
      aria-hidden="true"
      className="sun-stage pointer-events-none absolute inset-0 overflow-hidden"
    >
      <div ref={atmosphereRef} className="sun-atmosphere" />
      <div className="sun-fallback" />
      <canvas ref={glRef} className="sun-canvas" />
      <canvas ref={emberRef} className="sun-canvas" />
    </div>
  );
}
