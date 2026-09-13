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

float hash(vec2 p) {
  p = fract(p * vec2(127.1, 311.7));
  p += dot(p, p + 34.123);
  return fract(p.x * p.y);
}

float hash3(vec3 p) {
  p = fract(p * 0.3183099 + vec3(0.11, 0.17, 0.13));
  p *= 17.0;
  return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}

float noise3(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);

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
    p = p * 2.07 + vec2(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}

float fbm3(vec3 p) {
  float v = 0.0;
  float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * noise3(p);
    p = p * 2.13 + vec3(1.3, 0.7, 2.1);
    a *= 0.52;
  }
  return v;
}

vec3 rotateY(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(c * p.x + s * p.z, p.y, -s * p.x + c * p.z);
}

vec3 rotateX(vec3 p, float a) {
  float c = cos(a);
  float s = sin(a);
  return vec3(p.x, c * p.y - s * p.z, s * p.y + c * p.z);
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * uRes) / min(uRes.x, uRes.y);
  uv -= uPointer * 0.014;
  uv -= uOrigin;

  float t = uTime * 0.38;
  float rad = uRadius + 0.006 * sin(t * 0.48);

  float heat = fbm2(uv * 2.4 + vec2(t * 0.09, -t * 0.05));
  vec2 uvw = uv + normalize(uv + 1e-5) * 0.018 * (heat - 0.48);

  float r = length(uvw);
  float inside = rad * rad - dot(uvw, uvw);
  float z = sqrt(max(inside, 0.0));
  vec3 nrm = normalize(vec3(uvw, z));

  vec3 sp = rotateX(nrm, 0.58);
  sp = rotateY(sp, t * 0.022);
  sp += 0.22 * (fbm3(sp * 2.4 + t * 0.03) * 2.0 - 1.0) * vec3(0.35, 0.2, 0.35);

  float gran = fbm3(sp * 5.6);
  float granFine = fbm3(sp * 16.0 + vec3(t * 0.028));
  float lanes = fbm3(sp * 2.1 + 3.7);
  float surface = gran * 0.58 + granFine * 0.42;
  surface = mix(surface, lanes, 0.22);

  float spots = smoothstep(0.52, 0.78, fbm3(sp * 1.45 + 6.1));
  float umbra = smoothstep(0.68, 0.9, fbm3(sp * 1.45 + 6.1));

  float limb = pow(clamp(nrm.z, 0.0, 1.0), 0.62);

  vec3 colDeep = vec3(0.16, 0.015, 0.008);
  vec3 colEmber = vec3(0.48, 0.06, 0.015);
  vec3 colMid = vec3(0.78, 0.18, 0.035);
  vec3 colHot = vec3(0.96, 0.40, 0.07);
  vec3 colAmber = vec3(0.98, 0.56, 0.14);

  vec3 photo = mix(colDeep, colEmber, smoothstep(0.04, 0.38, limb));
  photo = mix(photo, colMid, smoothstep(0.22, 0.62, limb * (0.55 + 0.45 * surface)));
  photo = mix(photo, colHot, smoothstep(0.48, 0.86, limb * surface));
  photo = mix(photo, colAmber, pow(limb, 5.5) * smoothstep(0.55, 0.92, surface) * 0.55);
  photo *= 0.38 + 1.05 * surface;
  photo *= 1.0 - spots * 0.48;
  photo *= 1.0 - umbra * 0.55;
  photo *= 0.96 + 0.04 * sin(t * 0.35 + surface * 9.0);

  float ang = atan(uvw.y, uvw.x);
  float warp = fbm2(vec2(ang * 2.1, t * 0.07)) - 0.5;
  float disc = smoothstep(rad + 0.018 + warp * 0.05, rad - 0.006, r);
  float rim = exp(-pow(abs(r - rad) * 58.0, 2.0));
  float cr = (r - rad) + warp * 0.07;

  float spike = fbm2(vec2(ang * 2.35 + t * 0.055, t * 0.08));
  float spike2 = fbm2(vec2(ang * 6.2 - t * 0.04, 4.0 + t * 0.05));
  float coronaShape = 0.32 + 0.68 * spike;
  coronaShape *= 0.5 + 0.5 * spike2;

  float corona = exp(-max(cr, 0.0) * mix(5.6, 2.1, coronaShape)) * coronaShape;
  float tongues = smoothstep(0.5, 0.93, spike) * exp(-max(cr, 0.0) * 2.35);
  tongues *= smoothstep(-0.04, 0.016, cr);

  vec3 coronaCol = mix(vec3(0.42, 0.04, 0.01), vec3(0.86, 0.28, 0.05), spike);
  vec3 tongueCol = vec3(0.9, 0.22, 0.04);
  vec3 rimCol = vec3(0.88, 0.32, 0.08);

  vec3 col = vec3(0.0);
  col += photo * disc;
  col += rimCol * rim * 0.95;
  col += coronaCol * corona * 0.95;
  col += tongueCol * tongues * 0.72;

  col *= uIntro;
  col = max(col, vec3(0.0));

  gl_FragColor = vec4(col, 1.0);
}
`;
