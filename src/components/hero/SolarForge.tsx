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

function layoutFor(width: number, height: number) {
  const portrait = height > width * 1.08;
  if (portrait) {
    return { origin: { x: 0.9, y: 1.22 }, radius: 1.16 };
  }
  return { origin: { x: 0.9, y: 0.4 }, radius: 0.98 };
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

  useEffect(() => {
    const wrap = wrapRef.current;
    const glCanvas = glRef.current;
    if (!wrap || !glCanvas) return;

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

    const resize = () => {
      const rect = wrap.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      layout = layoutFor(w, h);

      const dpr = Math.min(Math.round(window.devicePixelRatio || 1), 2);

      glCanvas.style.width = `${w}px`;
      glCanvas.style.height = `${h}px`;
      glCanvas.width = Math.max(1, w * dpr);
      glCanvas.height = Math.max(1, h * dpr);

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
      className="sun-stage pointer-events-none absolute inset-0"
    >
      <div className="sun-fallback" />
      <canvas ref={glRef} className="sun-canvas" />
    </div>
  );
}
