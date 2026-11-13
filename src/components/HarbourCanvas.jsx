import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function HarbourCanvas() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 150);
    camera.position.set(4, 3.2, 18);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);

    const sculptureGroup = new THREE.Group();
    sculptureGroup.position.set(2.5, -0.5, 0);
    scene.add(sculptureGroup);

    const greenLineMat = new THREE.LineBasicMaterial({
      color: 0x1b4332,
      transparent: true,
      opacity: 0.22
    });
    const goldLineMat = new THREE.LineBasicMaterial({
      color: 0xb8863b,
      transparent: true,
      opacity: 0.32
    });
    const redDotMat = new THREE.MeshBasicMaterial({
      color: 0xa63429,
      transparent: true,
      opacity: 0.65
    });

    const buildings = [
      { x: -5.5, z: -2.0, w: 1.0, d: 1.0, h: 4.2, gold: false },
      { x: -4.1, z: -1.0, w: 0.9, d: 0.9, h: 6.0, gold: false },
      { x: -2.6, z: -1.6, w: 1.2, d: 1.2, h: 8.6, gold: true, prism: true },
      { x: -1.0, z: -0.5, w: 1.1, d: 1.1, h: 5.4, gold: false },
      { x: 0.5, z: -1.4, w: 1.25, d: 1.25, h: 9.8, gold: true },
      { x: 2.1, z: -0.8, w: 0.95, d: 0.95, h: 6.2, gold: false },
      { x: 3.5, z: -2.1, w: 1.1, d: 1.1, h: 7.4, gold: false },
      { x: 5.0, z: -1.2, w: 1.0, d: 1.0, h: 4.8, gold: true }
    ];

    buildings.forEach((b) => {
      const geo = b.prism
        ? new THREE.CylinderGeometry(0.12, 0.95, b.h, 4)
        : new THREE.BoxGeometry(b.w, b.h, b.d);
      const edges = new THREE.EdgesGeometry(geo);
      const line = new THREE.LineSegments(edges, b.gold ? goldLineMat : greenLineMat);
      line.position.set(b.x, b.h / 2 - 2.2, b.z);
      sculptureGroup.add(line);

      if (b.gold) {
        const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 10), redDotMat);
        dot.position.set(b.x, b.h - 2.05, b.z);
        sculptureGroup.add(dot);
      }
    });

    const waveLines = [];
    const segCount = 64;
    const ribbonCount = 9;
    for (let r = 0; r < ribbonCount; r++) {
      const positions = new Float32Array(segCount * 3);
      const zOffset = -4.5 + r * 1.1;
      for (let i = 0; i < segCount; i++) {
        positions[i * 3] = (i / (segCount - 1) - 0.5) * 18;
        positions[i * 3 + 1] = -2.2;
        positions[i * 3 + 2] = zOffset;
      }
      const geo = new THREE.BufferGeometry();
      geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const mat = new THREE.LineBasicMaterial({
        color: r % 3 === 0 ? 0xb8863b : 0x1b4332,
        transparent: true,
        opacity: 0.14 + (r / ribbonCount) * 0.12
      });
      const line = new THREE.Line(geo, mat);
      sculptureGroup.add(line);
      waveLines.push({ geo, index: r });
    }

    const dustCount = 120;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount; i++) {
      dustPositions[i * 3] = (Math.random() - 0.5) * 24;
      dustPositions[i * 3 + 1] = (Math.random() - 0.5) * 14;
      dustPositions[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    const dustGeo = new THREE.BufferGeometry();
    dustGeo.setAttribute('position', new THREE.BufferAttribute(dustPositions, 3));
    const dust = new THREE.Points(
      dustGeo,
      new THREE.PointsMaterial({ color: 0xb8863b, size: 0.08, transparent: true, opacity: 0.45 })
    );
    sculptureGroup.add(dust);

    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };
    let scrollProgress = 0;

    const onPointerMove = (e) => {
      targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    const onScroll = () => {
      const maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };
    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onResize);

    const clock = new THREE.Clock();
    let frameId = 0;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      currentMouse.x += (targetMouse.x - currentMouse.x) * 0.04;
      currentMouse.y += (targetMouse.y - currentMouse.y) * 0.04;

      sculptureGroup.rotation.y = -0.22 + scrollProgress * 0.85 + currentMouse.x * 0.12;
      sculptureGroup.rotation.x = currentMouse.y * 0.05;
      sculptureGroup.position.x = 2.5 - scrollProgress * 5.0;
      sculptureGroup.position.y = -0.5 + Math.sin(scrollProgress * Math.PI) * 0.8;

      camera.position.z = 18 - scrollProgress * 3.5;
      camera.lookAt(0, 0.5, 0);

      waveLines.forEach(({ geo, index }) => {
        const attr = geo.getAttribute('position');
        for (let i = 0; i < segCount; i++) {
          const x = attr.getX(i);
          attr.setY(
            i,
            -2.25 +
              Math.sin(x * 0.45 + t * 0.9 + index * 0.5) * 0.22 +
              Math.cos(x * 0.22 - t * 0.6) * 0.14
          );
        }
        attr.needsUpdate = true;
      });

      dust.rotation.y = t * 0.025;
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
    };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none -z-10 opacity-85" />;
}
