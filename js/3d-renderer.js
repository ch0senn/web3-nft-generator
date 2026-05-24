// ========================================
// 3D RENDERER - Three.js + Physics
// ========================================

class Renderer3D {
    constructor(canvasId, physicsEngine) {
        this.canvas = document.getElementById(canvasId);
        this.physicsEngine = physicsEngine;
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.particles = [];
        this.particleColor = '#00ff88';
        this.rotationSpeed = 0.03;
        
        this.init();
        this.setupPhysics();
    }

    init() {
        // Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0a0e27);
        this.scene.fog = new THREE.Fog(0x0a0e27, 100, 200);

        // Camera
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        this.camera.position.set(0, 5, 15);
        this.camera.lookAt(0, 0, 0);

        // Renderer
        this.renderer = new THREE.WebGLRenderer({ 
            canvas: this.canvas, 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;

        // Lighting
        this.setupLighting();

        // Handle resize
        window.addEventListener('resize', () => this.onWindowResize());

        // Start animation loop
        this.animate();
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x00ff88, 0.4);
        this.scene.add(ambientLight);

        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xff006e, 0.8);
        directionalLight.position.set(10, 10, 10);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);

        // Point lights for neon effect
        const pointLight1 = new THREE.PointLight(0x00d9ff, 1);
        pointLight1.position.set(-10, 5, 10);
        this.scene.add(pointLight1);

        const pointLight2 = new THREE.PointLight(0xffbe0b, 1);
        pointLight2.position.set(10, 5, -10);
        this.scene.add(pointLight2);
    }

    setupPhysics() {
        // Create boundaries in physics world
        this.physicsEngine.createBoundaries();
        
        // Create initial particles
        this.updateParticles(100);
    }

    updateParticles(count) {
        // Remove old particles from scene
        this.particles.forEach(mesh => this.scene.remove(mesh));
        
        // Reset physics bodies
        this.physicsEngine.reset();
        this.physicsEngine.createParticleBodies(count);
        
        // Create new mesh particles
        this.particles = [];
        const geometry = new THREE.IcosahedronGeometry(0.2, 4);
        
        this.physicsEngine.bodies.forEach((body, index) => {
            const material = new THREE.MeshStandardMaterial({
                color: this.particleColor,
                emissive: this.particleColor,
                emissiveIntensity: 0.5,
                metalness: 0.7,
                roughness: 0.2,
                wireframe: false
            });

            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            mesh.userData.physicsBody = body;
            
            this.scene.add(mesh);
            this.particles.push(mesh);
        });

        // Add connector lines
        this.updateConnectors();
    }

    updateConnectors() {
        // Remove old connectors
        this.scene.children = this.scene.children.filter(child => 
            !child.userData.isConnector
        );

        // Create new connectors
        const geometry = new THREE.BufferGeometry();
        const positions = [];
        
        for (let i = 0; i < this.particles.length; i++) {
            for (let j = i + 1; j < Math.min(i + 4, this.particles.length); j++) {
                positions.push(
                    this.particles[i].position.x, this.particles[i].position.y, this.particles[i].position.z,
                    this.particles[j].position.x, this.particles[j].position.y, this.particles[j].position.z
                );
            }
        }

        if (positions.length > 0) {
            geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(positions), 3));
            
            const material = new THREE.LineBasicMaterial({
                color: this.particleColor,
                transparent: true,
                opacity: 0.3,
                linewidth: 2
            });

            const lines = new THREE.LineSegments(geometry, material);
            lines.userData.isConnector = true;
            this.scene.add(lines);
        }
    }

    setParticleColor(color) {
        this.particleColor = color;
        
        this.particles.forEach(mesh => {
            if (mesh.material instanceof THREE.MeshStandardMaterial) {
                mesh.material.color.set(color);
                mesh.material.emissive.set(color);
            }
        });

        // Update ambient light
        this.scene.children.forEach(child => {
            if (child instanceof THREE.AmbientLight) {
                child.color.set(color);
            }
        });
    }

    setRotationSpeed(speed) {
        this.rotationSpeed = speed / 10;
    }

    animate() {
        requestAnimationFrame(() => this.animate());

        // Update physics
        this.physicsEngine.step();

        // Update particle positions from physics
        this.particles.forEach((mesh, index) => {
            const body = this.physicsEngine.bodies[index];
            if (body) {
                mesh.position.copy(body.position);
                mesh.quaternion.copy(body.quaternion);
            }
        });

        // Rotate scene for visual effect
        this.scene.rotation.y += this.rotationSpeed * 0.01;

        // Update connectors
        if (this.particles.length > 0 && Math.random() < 0.1) {
            this.updateConnectors();
        }

        this.renderer.render(this.scene, this.camera);
    }

    onWindowResize() {
        const width = this.canvas.offsetWidth;
        const height = this.canvas.offsetHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    captureFrame() {
        return this.renderer.domElement.toDataURL('image/png');
    }

    getScene() {
        return this.scene;
    }

    getRenderer() {
        return this.renderer;
    }
}

// Export for use in other modules
window.Renderer3D = Renderer3D;