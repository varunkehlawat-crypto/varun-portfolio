'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js';

interface ThreeSceneProps {
  className?: string;
}

export default function ThreeScene({ className }: ThreeSceneProps) {
  const mountRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const mount = mountRef.current;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* ── Renderer ── */
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x070A14, 1);
    mount.appendChild(renderer.domElement);

    /* ── Scene & Camera ── */
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070A14, 0.11);

    const camera = new THREE.PerspectiveCamera(52, mount.clientWidth / mount.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 4.4);

    /* ── OrbitControls ── */
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.rotateSpeed = 0.6;
    controls.minPolarAngle = Math.PI * 0.28;
    controls.maxPolarAngle = Math.PI * 0.72;
    controls.autoRotate = !reduceMotion;
    controls.autoRotateSpeed = 0.9;

    /* ── Neural icosahedron group ── */
    const group = new THREE.Group();
    scene.add(group);

    const geo = new THREE.IcosahedronGeometry(1.25, 1);

    // Cyan wireframe shell
    const wire = new THREE.LineSegments(
      new THREE.WireframeGeometry(geo),
      new THREE.LineBasicMaterial({ color: 0x35E4FF, transparent: true, opacity: 0.55 })
    );
    group.add(wire);

    // Violet vertex dots
    const nodes = new THREE.Points(
      geo,
      new THREE.PointsMaterial({ color: 0xA277FF, size: 0.085, sizeAttenuation: true })
    );
    group.add(nodes);

    // Dark core mesh
    const core = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.1, 1),
      new THREE.MeshBasicMaterial({ color: 0x0e1b3a, transparent: true, opacity: 0.5 })
    );
    group.add(core);

    // Outer halo wireframe
    const halo = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.6, 1),
      new THREE.MeshBasicMaterial({ color: 0x112233, transparent: true, opacity: 0.12, wireframe: true })
    );
    group.add(halo);

    /* ── Starfield ── */
    const STAR = Math.min(1800, mount.clientWidth < 640 ? 900 : 1800);
    const sGeo = new THREE.BufferGeometry();
    const pos = new Float32Array(STAR * 3);
    const col = new Float32Array(STAR * 3);
    const cA = new THREE.Color(0x35E4FF);   // cyan
    const cB = new THREE.Color(0xA277FF);   // violet
    const cW = new THREE.Color(0xdfe8ff);   // white-blue

    for (let i = 0; i < STAR; i++) {
      const r = THREE.MathUtils.randFloat(6, 26);
      const t = Math.random() * Math.PI * 2;
      const ph = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(ph) * Math.cos(t);
      pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(t);
      pos[i * 3 + 2] = r * Math.cos(ph);

      const c = Math.random() < 0.5 ? cW : (Math.random() < 0.5 ? cA : cB);
      col[i * 3]     = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    sGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    sGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));

    const stars = new THREE.Points(
      sGeo,
      new THREE.PointsMaterial({ size: 0.06, sizeAttenuation: true, vertexColors: true, transparent: true, opacity: 0.9 })
    );
    scene.add(stars);

    /* ── Bloom post-processing ── */
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    const bloom = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      0.9, 0.55, 0.18
    );
    composer.addPass(bloom);
    composer.addPass(new OutputPass());

    /* ── Mouse parallax ── */
    const mouse = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      mouse.x = e.clientX / window.innerWidth - 0.5;
      mouse.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', onMouse, { passive: true });

    /* ── Scroll influence ── */
    let scrollN = 0;
    const onScroll = () => {
      scrollN = window.scrollY / Math.max(1, document.body.scrollHeight - window.innerHeight);
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    /* ── Resize ── */
    const onResize = () => {
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      composer.setSize(mount.clientWidth, mount.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    };
    window.addEventListener('resize', onResize);

    /* ── Animation ── */
    const clock = new THREE.Clock();
    let animId: number;
    let running = true;

    const onVisibility = () => {
      running = !document.hidden;
      if (running) tick();
    };
    document.addEventListener('visibilitychange', onVisibility);

    const tick = () => {
      if (!running) return;
      animId = requestAnimationFrame(tick);
      const t = clock.getElapsedTime();

      if (!reduceMotion) {
        group.rotation.y += 0.0016 + scrollN * 0.006;
        group.rotation.x = Math.sin(t * 0.25) * 0.14 + mouse.y * 0.35;
        group.rotation.z = mouse.x * 0.12;
        group.position.y = Math.sin(t * 0.5) * 0.06 - scrollN * 0.6;
        const s = 1 - scrollN * 0.18;
        group.scale.setScalar(s);

        halo.rotation.y -= 0.0022;

        stars.rotation.y = t * 0.01 + mouse.x * 0.08;
        stars.rotation.x = mouse.y * 0.06;

        bloom.strength = 0.9 + Math.sin(t * 0.8) * 0.12;
      }

      controls.update();
      composer.render();
    };
    tick();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', onMouse);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibility);
      controls.dispose();
      renderer.dispose();
      composer.dispose();
      if (mount.contains(renderer.domElement)) mount.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className={className} style={{ width: '100%', height: '100%' }} />;
}
