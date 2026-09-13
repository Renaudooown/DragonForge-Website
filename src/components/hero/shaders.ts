export const vertexShader = `
attribute vec2 aPos;
void main() {
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

export const fragmentShader = `
#ifdef GL_ES
precision highp float;
#endif

uniform vec2 uRes;
uniform float uTime;
uniform vec2 uPointer;
uniform float uIntro;
uniform vec2 uOrigin;
uniform float uRadius;
uniform float uFade;

float hash(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * vec3(0.1031, 0.1030, 0.0973));
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float hash3(vec3 p) {
  p = fract(p * vec3(0.1031, 0.1030, 0.0973));
  p += dot(p, p.yxz + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);

  float n000 = hash3(i);
  float n100 = hash3(i + vec3(1.0, 0.0, 0.0));
  float n010 = hash3(i + vec3(0.0, 1.0, 0.0));
  float n110 = hash3(i + vec3(1.0, 1.0, 0.0));
  float n001 = hash3(i + vec3(0.0, 0.0, 1.0));
  float n101 = hash3(i + vec3(1.0, 0.0, 1.0));
  float n011 = hash3(i + vec3(0.0, 1.0, 1.0));
  float n111 = hash3(i + vec3(1.0, 1.0, 1.0));

  float nx00 = mix(n000, n100, u.x);
  float nx10 = mix(n010, n110, u.x);
  float nx01 = mix(n001, n101, u.x);
  float nx11 = mix(n011, n111, u.x);
  return mix(mix(nx00, nx10, u.y), mix(nx01, nx11, u.y), u.z);
}

float fbm2(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise2(p);
    p = p * 2.09 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float fbm3(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise3(p);
    p = p * 2.11 + vec3(1.3, 0.7, 2.1);
    a *= 0.51;
  }
  return v;
}

vec3 rotateY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  uv -= uPointer * 0.01;
  uv -= uOrigin;

  float t = uTime * 0.32;

  float heatA = fbm2(uv * 2.8 + vec2(t * 0.07, -t * 0.045));
  float heatB = fbm2(uv * 4.1 + vec2(-t * 0.03, t * 0.05) + 8.1);
  vec2 uvw = uv + vec2(heatA - 0.5, heatB - 0.5) * 0.028;

  float r = length(uvw);
  float rad = uRadius + 0.005 * sin(t * 0.41 + heatA * 1.4);
  float inside = rad * rad - dot(uvw, uvw);
  float z = sqrt(max(inside, 0.0));
  vec3 nrm = normalize(vec3(uvw, z));

  vec3 sp = rotateY(nrm, t * 0.018);
  float warp3 = fbm3(sp * 2.2 + t * 0.025);
  sp += 0.18 * (warp3 * 2.0 - 1.0) * vec3(0.42, 0.18, 0.36);

  float gran = fbm3(sp * 6.2);
  float granFine = fbm3(sp * 18.4 + vec3(t * 0.022));
  float filaments = fbm3(sp * 3.4 + vec3(0.0, t * 0.016, 4.2));
  float surface = gran * 0.5 + granFine * 0.38 + filaments * 0.12;
  surface = pow(clamp(surface, 0.0, 1.0), 0.92);

  float spots = smoothstep(0.58, 0.84, fbm3(sp * 1.55 + 9.2));
  float umbra = smoothstep(0.72, 0.94, fbm3(sp * 1.55 + 9.2));

  float limb = pow(clamp(nrm.z, 0.0, 1.0), 0.9);

  vec3 colDeep = vec3(0.10, 0.012, 0.008);
  vec3 colEmber = vec3(0.38, 0.045, 0.016);
  vec3 colMid = vec3(0.62, 0.12, 0.028);
  vec3 colHot = vec3(0.86, 0.28, 0.05);
  vec3 colAmber = vec3(0.93, 0.46, 0.10);

  vec3 photo = mix(colDeep, colEmber, smoothstep(0.02, 0.42, limb));
  photo = mix(photo, colMid, smoothstep(0.18, 0.64, limb * (0.48 + 0.52 * surface)));
  photo = mix(photo, colHot, smoothstep(0.52, 0.9, limb * surface));
  photo = mix(photo, colAmber, pow(limb, 6.2) * smoothstep(0.62, 0.95, surface) * 0.38);
  photo *= 0.34 + 1.08 * surface;
  photo *= 1.0 - spots * 0.52;
  photo *= 1.0 - umbra * 0.62;
  photo *= 0.97 + 0.03 * sin(t * 0.28 + surface * 8.0);

  float ang = atan(uvw.y, uvw.x);
  float warp = fbm2(vec2(ang * 1.85, t * 0.055)) - 0.5;
  float boil = fbm2(uvw * 6.4 + vec2(t * 0.035, -t * 0.028));
  photo *= 0.88 + 0.2 * boil;
  float disc = smoothstep(rad + 0.034 + warp * 0.1, rad - 0.016, r);
  float rim = exp(-pow(abs(r - rad) * 52.0, 2.0));
  float cr = (r - rad) + warp * 0.08;

  float spike = fbm2(vec2(ang * 2.55 + t * 0.042, t * 0.06));
  float spike2 = fbm2(vec2(ang * 7.1 - t * 0.03, 5.0 + t * 0.04));
  float coronaShape = 0.28 + 0.72 * spike;
  coronaShape *= 0.46 + 0.54 * spike2;

  float corona = exp(-max(cr, 0.0) * mix(6.2, 2.4, coronaShape)) * coronaShape;
  float tongues = smoothstep(0.54, 0.94, spike) * exp(-max(cr, 0.0) * 2.55);
  tongues *= smoothstep(-0.05, 0.02, cr);

  vec3 coronaCol = mix(vec3(0.36, 0.03, 0.01), vec3(0.78, 0.18, 0.04), spike);
  vec3 tongueCol = vec3(0.82, 0.16, 0.03);
  vec3 rimCol = vec3(0.76, 0.22, 0.05);

  vec3 col = vec3(0.0);
  col += photo * disc;
  col += rimCol * rim * 0.72;
  col += coronaCol * corona * 0.88;
  col += tongueCol * tongues * 0.64;

  col *= uIntro;
  col = max(col, vec3(0.0));
  float alpha = clamp(max(max(col.r, col.g), col.b) * 1.18, 0.0, 1.0) * uFade;

  gl_FragColor = vec4(col * alpha, alpha);
}
`;
