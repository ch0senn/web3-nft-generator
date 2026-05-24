// ========================================
// MAIN APPLICATION - Integration
// ========================================

let physicsEngine = null;
let renderer3d = null;
let videoRecorder = null;
let frameCapture = null;
let nftMinter = null;
let galleryManager = null;
let walletManager = null;

const simulationState = {
    gravity: 50,
    particles: 100,
    velocity: 20,
    rotationSpeed: 3,
    color: '#00ff88',
    isRecording: false
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 CryptoVerse Initializing...');
    initializePhysicsEngine();
    initializeRenderer();
    initializeControls();
    initializeRecording();
    initializeMinting();
    initializeWalletUI();
    setupNavigation();
    console.log('✅ CryptoVerse Ready!');
});

function initializePhysicsEngine() {
    physicsEngine = new PhysicsEngine();
    physicsEngine.createParticleBodies(simulationState.particles);
}

function initializeRenderer() {
    const canvas = document.getElementById('canvas3d');
    if (!canvas) return;
    renderer3d = new Renderer3D('canvas3d', physicsEngine);
    renderer3d.updateParticles(simulationState.particles);
    renderer3d.setParticleColor(simulationState.color);
}

function initializeControls() {
    const gravitySlider = document.getElementById('gravitySlider');
    if (gravitySlider) {
        gravitySlider.addEventListener('input', (e) => {
            simulationState.gravity = e.target.value;
            document.getElementById('gravityValue').textContent = e.target.value;
            physicsEngine.setGravity(e.target.value);
        });
    }

    const particleSlider = document.getElementById('particleSlider');
    if (particleSlider) {
        particleSlider.addEventListener('input', (e) => {
            simulationState.particles = e.target.value;
            document.getElementById('particleValue').textContent = e.target.value;
            renderer3d.updateParticles(parseInt(e.target.value));
        });
    }

    const colorSwatches = document.querySelectorAll('.color-swatch');
    colorSwatches.forEach(swatch => {
        swatch.addEventListener('click', (e) => {
            const color = e.target.getAttribute('data-color');
            simulationState.color = color;
            renderer3d.setParticleColor(color);
        });
    });
}

function initializeRecording() {
    const canvas = document.getElementById('canvas3d');
    videoRecorder = new VideoRecorder(canvas, 30);
    frameCapture = new FrameCapture(canvas);
    const recordBtn = document.getElementById('recordBtn');
    if (recordBtn) recordBtn.addEventListener('click', toggleRecording);
    const captureBtn = document.getElementById('captureBtn');
    if (captureBtn) captureBtn.addEventListener('click', () => frameCapture.captureFrame());
}

function toggleRecording() {
    const recordBtn = document.getElementById('recordBtn');
    if (!simulationState.isRecording) {
        simulationState.isRecording = true;
        videoRecorder.startRecording();
        recordBtn.textContent = 'Stop Recording';
        recordBtn.recordingInterval = setInterval(() => videoRecorder.captureFrame(), 1000 / 30);
    } else {
        simulationState.isRecording = false;
        clearInterval(recordBtn.recordingInterval);
        videoRecorder.stopRecording();
        recordBtn.textContent = 'Record Animation';
    }
}

function initializeMinting() {
    nftMinter = new NFTMinter();
    galleryManager = new NFTGalleryManager('galleryGrid');
    const mintBtn = document.getElementById('mintBtn');
    if (mintBtn) mintBtn.addEventListener('click', mintNFT);
}

async function mintNFT() {
    if (!walletManager || !walletManager.isConnected()) {
        alert('Please connect your wallet first!');
        return;
    }
    try {
        const frameData = frameCapture.getFrameData();
        const properties = {
            name: `CryptoVerse NFT #${Date.now()}`,
            description: 'Generated from physics simulation',
            gravity: simulationState.gravity,
            particles: simulationState.particles,
            velocity: simulationState.velocity,
            color: simulationState.color
        };
        const metadataURI = await nftMinter.createMetadata(frameData, properties);
        const nftInfo = await nftMinter.mintNFT(metadataURI);
        if (nftInfo) {
            galleryManager.addNFT(nftInfo);
            alert(`✅ NFT Minted!\n\nToken ID: ${nftInfo.tokenId}`);
        }
    } catch (error) {
        console.error('Minting error:', error);
        alert('Error minting NFT: ' + error.message);
    }
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            document.querySelector(targetId)?.scrollIntoView({ behavior: 'smooth' });
        });
    });
    document.getElementById('createBtn')?.addEventListener('click', () => {
        document.querySelector('#studio')?.scrollIntoView({ behavior: 'smooth' });
    });
}

window.CryptoVerse = {
    physicsEngine, renderer3d, videoRecorder, nftMinter, galleryManager,
    simulationState, resetSimulation: () => console.log('Reset')
};

console.log('CryptoVerse loaded:', window.CryptoVerse);