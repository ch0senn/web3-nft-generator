// ========================================
// PHYSICS ENGINE - Cannon.js Integration
// ========================================

class PhysicsEngine {
    constructor() {
        this.world = new CANNON.World();
        this.world.gravity.set(0, -9.82, 0);
        this.world.defaultContactMaterial.friction = 0.3;
        this.bodies = [];
        this.constraints = [];
        
        this.gravity = 9.82;
        this.isRunning = true;
    }

    setGravity(value) {
        this.gravity = (value / 50) * 20;
        this.world.gravity.set(0, -this.gravity, 0);
    }

    createParticleBodies(count, position = { x: 0, y: 5, z: 0 }) {
        this.bodies = [];
        
        for (let i = 0; i < count; i++) {
            const radius = 0.2;
            const sphereShape = new CANNON.Sphere(radius);
            const body = new CANNON.Body({
                mass: 1,
                shape: sphereShape,
                linearDamping: 0.3,
                angularDamping: 0.3
            });

            // Random initial velocity
            const velocity = Math.random() * 10 + 5;
            const angle = Math.random() * Math.PI * 2;
            body.velocity.set(
                Math.cos(angle) * velocity,
                Math.random() * 5 + 5,
                Math.sin(angle) * velocity
            );

            // Set position with slight randomization
            body.position.set(
                position.x + (Math.random() - 0.5) * 2,
                position.y + (Math.random() - 0.5) * 2,
                position.z + (Math.random() - 0.5) * 2
            );

            this.world.addBody(body);
            this.bodies.push(body);
        }
    }

    setVelocity(value) {
        const vel = (value / 50) * 20;
        this.bodies.forEach(body => {
            const currentVel = body.velocity.length();
            if (currentVel > 0) {
                const scale = vel / currentVel;
                body.velocity.scale(scale, body.velocity);
            }
        });
    }

    createConstraints(count) {
        // Clear existing constraints
        this.constraints.forEach(c => this.world.removeConstraint(c));
        this.constraints = [];

        // Create random constraints between particles
        for (let i = 0; i < Math.min(count, this.bodies.length * 0.3); i++) {
            const bodyA = this.bodies[Math.floor(Math.random() * this.bodies.length)];
            const bodyB = this.bodies[Math.floor(Math.random() * this.bodies.length)];
            
            if (bodyA !== bodyB) {
                const constraint = new CANNON.PointToPointConstraint(
                    bodyA,
                    new CANNON.Vec3(0, 0, 0),
                    bodyB,
                    new CANNON.Vec3(0, 0, 0)
                );
                this.world.addConstraint(constraint);
                this.constraints.push(constraint);
            }
        }
    }

    createBoundaries() {
        // Floor
        const floorShape = new CANNON.Plane();
        const floorBody = new CANNON.Body({ mass: 0, shape: floorShape });
        floorBody.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
        floorBody.position.set(0, -10, 0);
        this.world.addBody(floorBody);

        // Walls
        const wallMaterial = new CANNON.Material('wall');
        const walls = [
            { pos: [10, 0, 0], rot: [0, 0, 1] },  // Right
            { pos: [-10, 0, 0], rot: [0, 0, 1] }, // Left
            { pos: [0, 0, 10], rot: [1, 0, 0] },  // Back
            { pos: [0, 0, -10], rot: [1, 0, 0] }  // Front
        ];

        walls.forEach(wall => {
            const wallShape = new CANNON.Plane();
            const wallBody = new CANNON.Body({ mass: 0, shape: wallShape, material: wallMaterial });
            const axis = wall.rot;
            wallBody.quaternion.setFromAxisAngle(
                new CANNON.Vec3(...axis),
                Math.PI / 2
            );
            wallBody.position.set(...wall.pos);
            this.world.addBody(wallBody);
        });
    }

    step(deltaTime = 1 / 60) {
        if (this.isRunning) {
            this.world.step(1 / 60, deltaTime, 3);
        }
    }

    getBodyPositions() {
        return this.bodies.map(body => ({
            x: body.position.x,
            y: body.position.y,
            z: body.position.z,
            quaternion: {
                x: body.quaternion.x,
                y: body.quaternion.y,
                z: body.quaternion.z,
                w: body.quaternion.w
            }
        }));
    }

    pause() {
        this.isRunning = false;
    }

    resume() {
        this.isRunning = true;
    }

    reset() {
        this.bodies.forEach(body => this.world.removeBody(body));
        this.bodies = [];
        this.constraints.forEach(c => this.world.removeConstraint(c));
        this.constraints = [];
    }
}

// Export for use in other modules
window.PhysicsEngine = PhysicsEngine;