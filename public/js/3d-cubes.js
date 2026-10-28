/**
 * DigitalSnove — Why Choose Us 3D Floating Isometric Cubes
 * Pure 3D Canvas / Three.js Code Animation — High-Definition & Enlarged
 */
(function() {
  const container = document.getElementById('why-choose-cubes-canvas');
  if (!container || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();

  // Perspective camera with isometric angle, brought closer for larger display
  const aspect = container.clientWidth / container.clientHeight;
  const camera = new THREE.PerspectiveCamera(42, aspect, 0.1, 1000);
  camera.position.set(14, 12, 16);
  camera.lookAt(0, 0.5, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.innerHTML = '';
  container.appendChild(renderer.domElement);

  // Vibrant Lights
  const ambientLight = new THREE.AmbientLight(0x0a193b, 1.8);
  scene.add(ambientLight);

  const cyanLight = new THREE.PointLight(0x00f2fe, 4.5, 50);
  cyanLight.position.set(8, 12, 8);
  scene.add(cyanLight);

  const purpleLight = new THREE.PointLight(0x8b5cf6, 4.5, 50);
  purpleLight.position.set(-8, -5, -6);
  scene.add(purpleLight);

  const cubesGroup = new THREE.Group();
  scene.add(cubesGroup);

  // Enlarged Cube Configurations matching the approved reference design
  const cubeConfigs = [
    { size: 4.6, pos: [0, 1.4, 0], color: 0x00d2ff, emissive: 0x0077b6, speed: 1.1, phase: 0 },
    { size: 3.6, pos: [-4.4, -1.2, 2.0], color: 0x0096c7, emissive: 0x03045e, speed: 1.0, phase: 1.5 },
    { size: 3.4, pos: [3.8, -1.4, 2.4], color: 0x7209b7, emissive: 0x3f37c9, speed: 1.3, phase: 2.5 },
    { size: 2.6, pos: [-2.4, 4.6, -2.6], color: 0x00b4d8, emissive: 0x023e8a, speed: 1.2, phase: 3.2 },
    { size: 2.2, pos: [3.2, 3.8, -2.2], color: 0x4895ef, emissive: 0x4361ee, speed: 1.4, phase: 4.1 },
    { size: 1.8, pos: [5.2, 0.8, -3.2], color: 0x560bad, emissive: 0x3a0ca3, speed: 1.5, phase: 5.0 },
    { size: 1.5, pos: [-4.8, 2.0, -1.6], color: 0x4cc9f0, emissive: 0x4895ef, speed: 1.6, phase: 0.8 },
  ];

  const cubeMeshes = [];

  cubeConfigs.forEach(cfg => {
    const geo = new THREE.BoxGeometry(cfg.size, cfg.size, cfg.size);

    // Glowing translucent cyber glass material
    const mat = new THREE.MeshPhongMaterial({
      color: cfg.color,
      emissive: cfg.emissive,
      emissiveIntensity: 0.55,
      specular: 0x00f2fe,
      shininess: 100,
      transparent: true,
      opacity: 0.85,
    });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);

    // Glowing outer edges wireframe
    const edgesGeo = new THREE.EdgesGeometry(geo);
    const edgesMat = new THREE.LineBasicMaterial({
      color: 0x00f2fe,
      transparent: true,
      opacity: 0.85,
      linewidth: 2
    });
    const edges = new THREE.LineSegments(edgesGeo, edgesMat);
    mesh.add(edges);

    cubesGroup.add(mesh);
    cubeMeshes.push({ mesh, initialY: cfg.pos[1], speed: cfg.speed, phase: cfg.phase });
  });

  // Cyber Grid Floor lines (Enlarged and Glowing)
  const gridHelper = new THREE.GridHelper(22, 22, 0x00e5ff, 0x12254e);
  gridHelper.position.y = -5.0;
  scene.add(gridHelper);

  // Mouse tilt interaction with smooth damping
  let mouseX = 0;
  let mouseY = 0;
  let targetRotX = 0;
  let targetRotY = 0;

  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) - 0.5;
    mouseY = (e.clientY / window.innerHeight) - 0.5;
  }, { passive: true });

  // Animation Loop with 60fps smooth easing
  let clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const time = clock.getElapsedTime();

    // Smooth hover tilt damping
    targetRotY = mouseX * 0.4;
    targetRotX = mouseY * 0.3;
    cubesGroup.rotation.y += (targetRotY - cubesGroup.rotation.y) * 0.05;
    cubesGroup.rotation.x += (targetRotX - cubesGroup.rotation.x) * 0.05;

    // Gentle floating oscillations for individual cubes
    cubeMeshes.forEach(item => {
      item.mesh.position.y = item.initialY + Math.sin(time * item.speed + item.phase) * 0.35;
      item.mesh.rotation.y = Math.sin(time * 0.4 + item.phase) * 0.08;
    });

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
