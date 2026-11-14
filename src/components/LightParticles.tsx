import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { isDark, onThemeChange } from '../utils/theme';

/**
 * 光塵粒子（three.js）— 日系午後的窗邊光
 * - 柔焦光點：大小不一、極淡的暖白／淡藍／淡粉圓光，緩緩漂浮
 * - 微塵：細小亮點在光裡閃爍
 * - 滑鼠移動有輕微視差；點擊會輕輕撒出一小撮光塵
 */

const VERT = /* glsl */ `
  attribute float aSize;
  attribute float aSeed;
  attribute float aKind;
  attribute vec3 aColor;
  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uNight;
  varying float vNight;
  varying float vAlpha;
  varying float vKind;
  varying vec3 vColor;
  void main() {
    vec3 p = position;
    p.y += mod(uTime * (0.05 + aSeed * 0.08) + aSeed * 30.0, 22.0) - 11.0;
    p.x += sin(uTime * 0.15 + aSeed * 10.0) * 0.6;
    vKind = aKind;
    vNight = uNight;
    vColor = aColor;
    vAlpha = aKind > 0.5
      ? pow(0.5 + 0.5 * sin(uTime * (1.6 + aSeed * 2.6) + aSeed * 30.0), 10.0)
      : 0.55 + 0.45 * sin(uTime * 0.4 + aSeed * 9.0);
    vec4 mv = modelViewMatrix * vec4(p, 1.0);
    gl_Position = projectionMatrix * mv;
    gl_PointSize = aSize * uPixelRatio * (16.0 / -mv.z);
  }
`;

const FRAG = /* glsl */ `
  varying float vAlpha;
  varying float vKind;
  varying vec3 vColor;
  varying float vNight;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = vKind > 0.5
      ? smoothstep(0.5, 0.0, d) * 0.95
      : (smoothstep(0.5, 0.15, d) * 0.45 + exp(-d * 6.0) * 0.2);
    // 夜晚：光點更亮、偏暖，像遠方的城市燈火
    vec3 col = mix(vColor, mix(vColor, vec3(1.0, 0.78, 0.45), 0.35) * 1.25, vNight);
    gl_FragColor = vec4(col, a * vAlpha * mix(1.0, 1.6, vNight));
  }
`;

const COLORS: [number, number, number][] = [
  [1.0, 0.8, 0.55],
  [0.62, 0.8, 0.95],
  [0.98, 0.72, 0.76],
  [0.65, 0.88, 0.8]
];

export default function LightParticles({ className = '' }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const parent = canvas.parentElement!;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth < 640;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: 'low-power' });
    } catch {
      return;
    }
    const dpr = Math.min(window.devicePixelRatio, 1.75);
    renderer.setPixelRatio(dpr);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.z = 16;

    const BOKEH = small ? 14 : 26;
    const DUST = small ? 45 : 90;
    const BURST = 24;
    const N = BOKEH + DUST + BURST;
    const pos = new Float32Array(N * 3);
    const size = new Float32Array(N);
    const seed = new Float32Array(N);
    const kind = new Float32Array(N);
    const color = new Float32Array(N * 3);
    for (let i = 0; i < N; i++) {
      const dust = i >= BOKEH;
      pos.set([(Math.random() - 0.5) * 30, (Math.random() - 0.5) * 22, (Math.random() - 0.5) * 10], i * 3);
      size[i] = dust ? 1.6 + Math.random() * 3.2 : 7 + Math.random() ** 2 * 16;
      seed[i] = Math.random();
      kind[i] = dust ? 1 : 0;
      color.set(dust ? [0.9, 0.7, 0.35] : COLORS[i % COLORS.length], i * 3);
      if (i >= BOKEH + DUST) size[i] = 0; // 點擊用，先隱藏
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aSize', new THREE.BufferAttribute(size, 1));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 1));
    geo.setAttribute('aKind', new THREE.BufferAttribute(kind, 1));
    geo.setAttribute('aColor', new THREE.BufferAttribute(color, 3));
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: { uTime: { value: 0 }, uPixelRatio: { value: dpr }, uNight: { value: 0 } },
      transparent: true,
      depthWrite: false,
      blending: THREE.NormalBlending
    });
    scene.add(new THREE.Points(geo, mat));
    const applyTheme = (dark: boolean) => {
      mat.uniforms.uNight.value = dark ? 1 : 0;
      mat.blending = dark ? THREE.AdditiveBlending : THREE.NormalBlending;
      mat.needsUpdate = true;
    };
    applyTheme(isDark());
    const offTheme = onThemeChange((t) => applyTheme(t === 'dark'));

    const resize = () => {
      renderer.setSize(parent.clientWidth, parent.clientHeight, false);
      camera.aspect = parent.clientWidth / Math.max(1, parent.clientHeight);
      camera.updateProjectionMatrix();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(parent);

    const target = new THREE.Vector2();
    const onMove = (e: PointerEvent) => {
      const r = parent.getBoundingClientRect();
      target.set(((e.clientX - r.left) / r.width - 0.5) * 2, ((e.clientY - r.top) / r.height - 0.5) * 2);
    };
    const onDown = (e: PointerEvent) => {
      if ((e.target as HTMLElement).closest('button, a, input')) return;
      const r = parent.getBoundingClientRect();
      const v = new THREE.Vector3(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1, 0.5).unproject(camera);
      const dir = v.sub(camera.position).normalize();
      const p = camera.position.clone().add(dir.multiplyScalar(-camera.position.z / dir.z));
      for (let i = BOKEH + DUST; i < N; i++) {
        pos.set([p.x + (Math.random() - 0.5) * 1.6, p.y - 11 + (Math.random() - 0.5) * 1.6, (Math.random() - 0.5) * 2], i * 3);
        size[i] = 2 + Math.random() * 3.5;
        kind[i] = 1;
      }
      geo.attributes.position.needsUpdate = true;
      geo.attributes.aSize.needsUpdate = true;
    };
    parent.addEventListener('pointermove', onMove);
    parent.addEventListener('pointerdown', onDown);

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      mat.uniforms.uTime.value = clock.getElapsedTime();
      camera.position.x += (target.x * 0.6 - camera.position.x) * 0.02;
      camera.position.y += (-target.y * 0.4 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);
      renderer.render(scene, camera);
    };
    const loop = () => {
      raf = requestAnimationFrame(loop);
      if (!document.hidden) tick();
    };
    if (reduce) tick();
    else loop();

    return () => {
      cancelAnimationFrame(raf);
      offTheme();
      ro.disconnect();
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerdown', onDown);
      geo.dispose();
      mat.dispose();
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className={`absolute inset-0 w-full h-full pointer-events-none ${className}`} aria-hidden="true" />;
}
