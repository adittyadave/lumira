import * as THREE from 'three';

export function initThreeScene() {
    const container = document.getElementById('hero');
    if (!container) return;

    // Remove existing canvas if any
    const oldCanvas = document.getElementById('particleCanvas');
    if (oldCanvas) oldCanvas.remove();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    const canvas = renderer.domElement;
    canvas.id = 'threeCanvas';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '1';
    canvas.style.pointerEvents = 'none';
    
    container.insertBefore(canvas, container.firstChild);

    // Particle system settings
    const SEPARATION = 1, AMOUNTX = 120, AMOUNTY = 120;
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
            positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2;
            positions[i + 1] = 0;
            positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2;

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
        size: 0.12,
        vertexColors: true,
        transparent: true,
        opacity: 0.7,
        blending: THREE.AdditiveBlending,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    camera.position.z = 18;
    camera.position.y = 7;
    camera.rotation.x = -Math.PI / 8;

    let mouseX = 0;
    let mouseY = 0;
    let targetMouseX = 0;
    let targetMouseY = 0;
    let time = 0;

    window.addEventListener('mousemove', (event) => {
        targetMouseX = (event.clientX / window.innerWidth - 0.5) * 2;
        targetMouseY = (event.clientY / window.innerHeight - 0.5) * 2;
    });

    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    function animate() {
        requestAnimationFrame(animate);
        time += 0.008; // Slower time for more meditative rhythm

        // Smooth mouse movement
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;

        const positionsSet = particles.geometry.attributes.position.array;
        const scalesSet = particles.geometry.attributes.scale.array;

        let i = 0, j = 0;
        for (let ix = 0; ix < AMOUNTX; ix++) {
            for (let iy = 0; iy < AMOUNTY; iy++) {
                 // Reduced amplitude and frequency for subtler waves
                const waveX = Math.sin((ix + time * 1.5) * 0.18) * 0.65;
                const waveY = Math.sin((iy + time * 1.5) * 0.28) * 0.65;
                
                positionsSet[i + 1] = waveX + waveY;
                // Subtler scale pulse
                scalesSet[j] = (waveX + waveY) * 0.15 + 1.1;

                i += 3;
                j++;
            }
        }

        particles.geometry.attributes.position.needsUpdate = true;
        particles.geometry.attributes.scale.needsUpdate = true;

        // Perspective shift
        camera.position.x += (mouseX * 6 - camera.position.x) * 0.04;
        camera.position.y += (-mouseY * 3 + 7 - camera.position.y) * 0.04;
        camera.lookAt(new THREE.Vector3(0, 0, 0));

        // Subtle particle rotation
        particles.rotation.y = mouseX * 0.08;
        particles.rotation.x = mouseY * 0.08;

        renderer.render(scene, camera);
    }

    animate();
}
