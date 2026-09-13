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
uniform float uFade;

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
  for (int i = 0; i < 4; i++) {
    v += a * noise3(p);
    p = p * 2.11 + vec3(1.3, 0.7, 2.1);
    a *= 0.5;
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
  uv -= uPointer * 0.038;

  float t = uTime;
  float breath = 0.01 * sin(t * 0.32);
  float rad = 0.312 + breath;

  uv.y -= 0.07;

  float r = length(uv);
  float inside = rad * rad - dot(uv, uv);
  float z = sqrt(max(inside, 0.0));
  vec3 nrm = normalize(vec3(uv, z));

  vec3 sp = rotateX(nrm, 0.42);
  sp = rotateY(sp, t * 0.046);
  sp += 0.04 * vec3(sin(t * 0.07), cos(t * 0.05), sin(t * 0.04));

  float gran = fbm3(sp * 3.8);
  float granFine = fbm3(sp * 9.5 + vec3(t * 0.05));
  float surface = gran * 0.72 + granFine * 0.28;

  float spots = smoothstep(0.58, 0.78, fbm3(sp * 1.65 + 5.4));
  float umbra = smoothstep(0.72, 0.9, fbm3(sp * 1.65 + 5.4));

  float limb = pow(clamp(nrm.z, 0.0, 1.0), 0.5);

  vec3 colDeep = vec3(0.42, 0.045, 0.012);
  vec3 colMid = vec3(0.96, 0.30, 0.055);
  vec3 colHot = vec3(1.0, 0.70, 0.24);
  vec3 colCore = vec3(1.0, 0.96, 0.84);

  vec3 photo = mix(colDeep, colMid, smoothstep(0.12, 0.52, limb));
  photo = mix(photo, colHot, smoothstep(0.42, 0.84, limb * (0.7 + 0.3 * surface)));
  photo = mix(photo, colCore, pow(limb, 3.8) * smoothstep(0.4, 0.85, surface));
  photo *= 0.62 + 0.9 * surface * mix(0.75, 1.08, limb);
  photo *= 1.0 - spots * 0.38;
  photo *= 1.0 - umbra * 0.45;
  photo *= 0.94 + 0.06 * sin(t * 0.55 + surface * 8.0);

  float disc = smoothstep(rad + 0.008, rad - 0.003, r);
  float rim = exp(-pow(abs(r - rad) * 92.0, 2.0)) * (0.55 + 0.45 * limb);

  float ang = atan(uv.y, uv.x);
  float warp = fbm2(vec2(ang * 2.4, t * 0.13)) - 0.5;
  float cr = (r - rad) + warp * 0.028;

  float spike = fbm2(vec2(ang * 2.7 + t * 0.11, t * 0.16));
  float spike2 = fbm2(vec2(ang * 5.6 - t * 0.07, 3.1 + t * 0.09));
  float coronaShape = 0.42 + 0.58 * spike;
  coronaShape *= 0.62 + 0.38 * spike2;

  float corona = exp(-max(cr, 0.0) * mix(7.4, 3.35, coronaShape)) * coronaShape;
  float tongues = smoothstep(0.62, 0.95, spike) * exp(-max(cr, 0.0) * 3.6);
  tongues *= smoothstep(-0.02, 0.01, cr);

  vec3 coronaCol = mix(vec3(0.78, 0.12, 0.03), vec3(1.0, 0.55, 0.16), spike);
  vec3 tongueCol = vec3(1.0, 0.42, 0.08);
  vec3 rimCol = vec3(1.0, 0.90, 0.68);

  vec3 col = vec3(0.0);
  col += photo * disc;
  col += rimCol * rim * 1.15;
  col += coronaCol * corona * 0.92;
  col += tongueCol * tongues * 0.62;
  col += colCore * pow(limb, 6.0) * disc * 0.35;

  col *= uIntro * uFade;
  col = max(col, vec3(0.0));

  gl_FragColor = vec4(col, 1.0);
}
`;
