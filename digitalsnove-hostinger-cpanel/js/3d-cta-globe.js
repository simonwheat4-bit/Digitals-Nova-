/**
 * DigitalSnove — CTA Banner 3D Rotating Cyber Earth
 * Pure 3D Canvas / Three.js Code Animation
 */
(function() {
  const container = document.getElementById('cta-globe-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 0, 24);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);

  const earthGroup = new THREE.Group();
  earthGroup.position.set(0, 0, 0);
  scene.add(earthGroup);

  // 1. Digital Wireframe Sphere (comfortably fits container, zero bottom cut)
  const sphereGeo = new THREE.SphereGeometry(6.5, 32, 32);
  const sphereMat = new THREE.MeshBasicMaterial({
    color: 0x00d2ff,
    wireframe: true,
    transparent: true,
    opacity: 0.28
  });
  const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
  earthGroup.add(sphereMesh);

  // 2. Inner Glow Mesh
  const glowGeo = new THREE.SphereGeometry(6.3, 24, 24);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0x0b256d,
    transparent: true,
    opacity: 0.5
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  earthGroup.add(glowMesh);

  // 3. Network Connection Nodes & Vertices
  const nodeCount = 550;
  const nodeGeo = new THREE.BufferGeometry();
  const nodePositions = new Float32Array(nodeCount * 3);
  const nodeColors = new Float32Array(nodeCount * 3);

  const cyan = new THREE.Color(0x00f2fe);
  const electric = new THREE.Color(0x3b82f6);
  const purple = new THREE.Color(0xa855f7);

  for (let i = 0; i < nodeCount; i++) {
    const phi = Math.acos(-1 + (2 * i) / nodeCount);
    const theta = Math.sqrt(nodeCount * Math.PI) * phi;
    const r = 6.6 + (Math.random() * 0.2);

    nodePositions[i * 3] = r * Math.cos(theta) * Math.sin(phi);
    nodePositions[i * 3 + 1] = r * Math.sin(theta) * Math.sin(phi);
    nodePositions[i * 3 + 2] = r * Math.cos(phi);

    const c = Math.random() < 0.7 ? cyan : (Math.random() < 0.9 ? electric : purple);
    nodeColors[i * 3] = c.r;
    nodeColors[i * 3 + 1] = c.g;
    nodeColors[i * 3 + 2] = c.b;
  }

  nodeGeo.setAttribute('position', new THREE.BufferAttribute(nodePositions, 3));
  nodeGeo.setAttribute('color', new THREE.BufferAttribute(nodeColors, 3));

  const nodeMat = new THREE.PointsMaterial({
    size: 0.22,
    vertexColors: true,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending
  });

  const nodePoints = new THREE.Points(nodeGeo, nodeMat);
  earthGroup.add(nodePoints);

  // 4. Connected Network Lines across key points
  const lineGeo = new THREE.BufferGeometry();
  const lineCount = 120;
  const linePositions = new Float32Array(lineCount * 6);

  for (let i = 0; i < lineCount; i++) {
    const idx1 = Math.floor(Math.random() * nodeCount);
    const idx2 = Math.floor(Math.random() * nodeCount);

    linePositions[i * 6] = nodePositions[idx1 * 3];
    linePositions[i * 6 + 1] = nodePositions[idx1 * 3 + 1];
    linePositions[i * 6 + 2] = nodePositions[idx1 * 3 + 2];

    linePositions[i * 6 + 3] = nodePositions[idx2 * 3];
    linePositions[i * 6 + 4] = nodePositions[idx2 * 3 + 1];
    linePositions[i * 6 + 5] = nodePositions[idx2 * 3 + 2];
  }

  lineGeo.setAttribute('position', new THREE.BufferAttribute(linePositions, 3));
  const lineMat = new THREE.LineBasicMaterial({
    color: 0x00f2fe,
    transparent: true,
    opacity: 0.25,
    blending: THREE.AdditiveBlending
  });
  const networkLines = new THREE.LineSegments(lineGeo, lineMat);
  earthGroup.add(networkLines);

  // Mouse Parallax
  let mouseX = 0;
  let mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  // Animation Loop
  function animate() {
    requestAnimationFrame(animate);

    earthGroup.rotation.y += 0.005;
    sphereMesh.rotation.y += 0.003;
    networkLines.rotation.y += 0.005;

    earthGroup.rotation.x = mouseY * 0.12;
    earthGroup.rotation.z = mouseX * 0.12;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });
})();
