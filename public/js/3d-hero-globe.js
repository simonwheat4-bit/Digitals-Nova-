/**
 * DigitalSnove — Hero 3D Holographic Globe
 * Pure 3D Canvas / Three.js Code Animation
 */
(function() {
  const container = document.getElementById('hero-globe-canvas-container');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.z = 24;

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  // Group for all globe elements
  const globeGroup = new THREE.Group();
  scene.add(globeGroup);

  // 1. Core Sphere Wireframe (Latitude & Longitude grid)
  const sphereGeo = new THREE.SphereGeometry(8.2, 36, 36);
  const wireframeMat = new THREE.MeshBasicMaterial({
    color: 0x00d2ff,
    wireframe: true,
    transparent: true,
    opacity: 0.22
  });
  const sphereWire = new THREE.Mesh(sphereGeo, wireframeMat);
  globeGroup.add(sphereWire);

  // 2. Inner Glowing Atmosphere Sphere
  const innerGeo = new THREE.SphereGeometry(8.0, 32, 32);
  const innerMat = new THREE.MeshBasicMaterial({
    color: 0x0a2560,
    transparent: true,
    opacity: 0.4
  });
  const innerSphere = new THREE.Mesh(innerGeo, innerMat);
  globeGroup.add(innerSphere);

  // 3. Dot Matrix / Continents Particle Shell
  const particleCount = 1200;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const cyanColor = new THREE.Color(0x00f2fe);
  const blueColor = new THREE.Color(0x3b82f6);
  const purpleColor = new THREE.Color(0x8b5cf6);

  for (let i = 0; i < particleCount; i++) {
    // Distribute on sphere surface
    const phi = Math.acos(-1 + (2 * i) / particleCount);
    const theta = Math.sqrt(particleCount * Math.PI) * phi;
    const r = 8.35 + (Math.random() * 0.15);

    const x = r * Math.cos(theta) * Math.sin(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(phi);

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    // Gradient colors from cyan to blue to purple
    const mixRatio = Math.random();
    const c = mixRatio < 0.6 ? cyanColor : (mixRatio < 0.85 ? blueColor : purpleColor);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMat = new THREE.PointsMaterial({
    size: 0.18,
    vertexColors: true,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending
  });

  const particleMesh = new THREE.Points(particleGeo, particleMat);
  globeGroup.add(particleMesh);

  // 4. Orbital Cyber Rings
  function createOrbitalRing(radius, tube, color, rotX, rotY) {
    const ringGeo = new THREE.TorusGeometry(radius, tube, 8, 80);
    const ringMat = new THREE.MeshBasicMaterial({
      color: color,
      transparent: true,
      opacity: 0.35,
      blending: THREE.AdditiveBlending
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = rotX;
    ring.rotation.y = rotY;
    return ring;
  }

  const ring1 = createOrbitalRing(10.2, 0.04, 0x00f2fe, Math.PI / 3, Math.PI / 6);
  const ring2 = createOrbitalRing(11.0, 0.03, 0x8b5cf6, -Math.PI / 4, Math.PI / 5);
  globeGroup.add(ring1);
  globeGroup.add(ring2);

  // 5. Interactive Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  let targetX = 0;
  let targetY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  // Animation Loop
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const elapsedTime = clock.getElapsedTime();

    // Constant smooth globe rotation
    globeGroup.rotation.y += 0.004;
    sphereWire.rotation.y += 0.002;
    particleMesh.rotation.y += 0.004;

    // Rings rotation
    ring1.rotation.z += 0.003;
    ring2.rotation.z -= 0.002;

    // Gentle mouse easing
    targetX += (mouseX - targetX) * 0.05;
    targetY += (mouseY - targetY) * 0.05;
    globeGroup.rotation.x = targetY * 0.4 + 0.15;
    globeGroup.position.x = targetX * 1.5;

    // Subtle breathing pulse
    const scale = 1 + Math.sin(elapsedTime * 1.5) * 0.015;
    particleMesh.scale.set(scale, scale, scale);

    renderer.render(scene, camera);
  }
  animate();

  // Responsive resize
  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();
