import * as THREE from 'three';

class ThreeBackground {
  constructor() {
    this.container = document.getElementById('three-bg-container');
    if (!this.container) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.container.appendChild(this.renderer.domElement);

    this.mouse = { x: 0, y: 0 };
    this.targetMouse = { x: 0, y: 0 };
    this.time = 0;

    this.init();
    this.addParticles();
    this.animate();
    this.handleResize();
    this.handleMouseMove();
  }

  init() {
    this.camera.position.z = 15;
    this.camera.position.y = 5;
    this.camera.rotation.x = -Math.PI / 6;
  }

  addParticles() {
    // Grid settings
    const SEPARATION = 1, AMOUNTX = 100, AMOUNTY = 100;
    const numParticles = AMOUNTX * AMOUNTY;

    const positions = new Float32Array(numParticles * 3);
    const colors = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    const color1 = new THREE.Color(0xDBE64C); // Spring
    const color2 = new THREE.Color(0x1E488F); // Nuit Blanche
    const tempColor = new THREE.Color();

    let i = 0, j = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2; // x
        positions[i + 1] = 0; // y (will be displaced in animate)
        positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2; // z

        // Gradient colors based on position
        tempColor.lerpColors(color1, color2, (ix / AMOUNTX));
        colors[i] = tempColor.r;
        colors[i + 1] = tempColor.g;
        colors[i + 2] = tempColor.b;

        scales[j] = 1;

        i += 3;
        j++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const material = new THREE.PointsMaterial({
      size: 0.1,
      vertexColors: true,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });

    this.particles = new THREE.Points(geometry, material);
    this.scene.add(this.particles);
  }

  handleResize() {
    window.addEventListener('resize', () => {
      this.camera.aspect = window.innerWidth / window.innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(window.innerWidth, window.innerHeight);
    });
  }

  handleMouseMove() {
    window.addEventListener('mousemove', (e) => {
      this.targetMouse.x = (e.clientX / window.innerWidth - 0.5) * 2;
      this.targetMouse.y = (e.clientY / window.innerHeight - 0.5) * 2;
    });
  }

  animate() {
    requestAnimationFrame(this.animate.bind(this));

    this.time += 0.02;

    // Smooth mouse movement
    this.mouse.x += (this.targetMouse.x - this.mouse.x) * 0.05;
    this.mouse.y += (this.targetMouse.y - this.mouse.y) * 0.05;

    const positions = this.particles.geometry.attributes.position.array;
    const scales = this.particles.geometry.attributes.scale.array;

    let i = 0, j = 0;
    const AMOUNTX = 100, AMOUNTY = 100;

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        // Wave logic: Sinusoidal displacement
        const waveX = Math.sin((ix + this.time) * 0.3) * 1.5;
        const waveY = Math.sin((iy + this.time) * 0.5) * 1.5;
        
        // Combine waves for a fluid surface
        positions[i + 1] = waveX + waveY;

        // Dynamic scaling based on wave height
        scales[j] = (waveX + waveY) * 0.5 + 1.5;

        i += 3;
        j++;
      }
    }

    this.particles.geometry.attributes.position.needsUpdate = true;
    this.particles.geometry.attributes.scale.needsUpdate = true;

    // Camera perspective shift (Parallax)
    this.camera.position.x += (this.mouse.x * 5 - this.camera.position.x) * 0.05;
    this.camera.position.z = 15 + Math.sin(this.time * 0.1) * 2; // Subtle pulsing depth
    this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // Subtle rotation based on mouse
    this.particles.rotation.y = this.mouse.x * 0.1;
    this.particles.rotation.x = this.mouse.y * 0.1;

    this.renderer.render(this.scene, this.camera);
  }
}

export const initThreeBackground = () => {
  new ThreeBackground();
};
