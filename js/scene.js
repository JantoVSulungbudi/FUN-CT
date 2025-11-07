import { initializeScene } from './scene.js';
import { initializeUI } from './ui.js';
import { initializePhysics } from './physics.js';

// Global state
export const state = {
    isScanning: false,
    currentAngle: 0,
    scanProgress: 0,
    totalScanTime: 0,
    currentMode: 'scan',
    reconstructionData: [],
    sinogramData: new Array(180),
    projectionCount: 0,
    isObjectControlActive: false,
    selectedObject: null,
    isDragging: false
};

// Initialize sinogram data
for (let i = 0; i < 180; i++) {
    state.sinogramData[i] = new Array(360).fill(0);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Get the canvas and loading element
    const canvas = document.getElementById('renderCanvas');
    const loading = document.getElementById('loading');
    
    // Set up sinogram canvas
    const sinogramCanvas = document.getElementById('sinogram-canvas');
    const sinogramCtx = sinogramCanvas.getContext('2d');
    const sinogramWidth = sinogramCanvas.width = 360;
    const sinogramHeight = sinogramCanvas.height = 180;
    
    // Initialize sinogram with black background
    sinogramCtx.fillStyle = 'black';
    sinogramCtx.fillRect(0, 0, sinogramWidth, sinogramHeight);
    
    // Create the Babylon.js engine
    const engine = new BABYLON.Engine(canvas, true, {
        preserveDrawingBuffer: true,
        stencil: true
    });
    
    // Initialize modules
    const scene = initializeScene(engine, canvas);
    const ui = initializeUI(state, scene);
    const physics = initializePhysics(state, scene, sinogramCtx);
    
    // Store references for other modules to use
    state.scene = scene;
    state.engine = engine;
    state.sinogramCtx = sinogramCtx;
    state.sinogramWidth = sinogramWidth;
    state.sinogramHeight = sinogramHeight;
    
    // Run the engine
    engine.runRenderLoop(function() {
        scene.render();
        physics.update();
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        engine.resize();
    });
    
    // Hide loading message after a short delay
    setTimeout(function() {
        loading.style.display = 'none';
    }, 2000);
});