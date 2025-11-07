import { state } from './main.js';
import { getSceneElements } from './scene.js';

let sceneElements;
let scanSpeedSlider, objectDensitySlider;

export function initializePhysics(state, scene, sinogramCtx) {
    sceneElements = getSceneElements();
    
    // Get UI sliders
    scanSpeedSlider = document.getElementById('scan-speed');
    objectDensitySlider = document.getElementById('object-density');
    
    return {
        update
    };
}

export function update() {
    const dt = state.engine.getDeltaTime() / 1000; // Convert to seconds
    state.totalScanTime += dt;
    
    if (state.isScanning && state.currentMode === 'scan') {
        // Get scan speed from UI
        const scanSpeed = parseInt(scanSpeedSlider.value);
        
        // Update scanner rotation
        state.currentAngle += dt * scanSpeed * 10;
        if (state.currentAngle >= 360) {
            state.currentAngle = 0;
            state.scanProgress = 100;
            state.isScanning = false;
            state.ui.startScanBtn.textContent = "Mulai Pemindaian";
        } else {
            state.scanProgress = (state.currentAngle / 360) * 100;
        }
        
        sceneElements.scannerAssembly.rotation.y = (state.currentAngle * Math.PI) / 180;
        
        // Update X-ray beam position and orientation
        const xrayBeam = sceneElements.scannerAssembly.getChildren()[2]; // X-ray beam is the third child
        xrayBeam.position.x = Math.cos((state.currentAngle * Math.PI) / 180) * 5;
        xrayBeam.position.z = Math.sin((state.currentAngle * Math.PI) / 180) * 5;
        xrayBeam.rotation.y = (state.currentAngle * Math.PI) / 180 + Math.PI / 2;
        
        // Calculate and display attenuation
        const attenuation = calculateAverageAttenuation(state.currentAngle);
        const detectedSignal = (0.3 + (1 - attenuation) * 0.7) * 100;
        
        state.ui.currentAngleDisplay.textContent = Math.round(state.currentAngle) + "°";
        state.ui.xrayIntensityDisplay.textContent = "100%";
        state.ui.detectedSignalDisplay.textContent = Math.round(detectedSignal) + "%";
        
        // Update progress bar and slice display
        state.ui.scanProgressBar.style.width = state.scanProgress + "%";
        state.ui.sliceDisplay.textContent = "Sudut: " + Math.round(state.currentAngle) + "°/360°";
        
        // Update sinogram every 2 degrees
        if (Math.round(state.currentAngle) % 2 === 0 && Math.round(state.currentAngle) !== 0) {
            updateSinogram(Math.round(state.currentAngle));
        }
        
        // Store reconstruction data (simplified)
        if (Math.round(state.currentAngle) % 10 === 0) {
            state.reconstructionData.push({
                angle: state.currentAngle,
                attenuation: attenuation
            });
        }
    }
}

// Calculate if a point is inside cylinder
function isPointInCylinder(x, z, cx, cz, radius) {
    return (x - cx) * (x - cx) + (z - cz) * (z - cz) <= radius * radius;
}

// Calculate if a point is inside block
function isPointInBlock(x, z, bx, bz, width, depth) {
    return x >= bx - width/2 && x <= bx + width/2 && 
           z >= bz - depth/2 && z <= bz + depth/2;
}

// Simulate X-ray attenuation through objects for a specific detector position
function calculateAttenuationForDetectorPosition(angle, detectorPos) {
    const angleRad = (angle * Math.PI) / 180;
    const density = parseInt(objectDensitySlider.value);
    
    // Calculate ray from source to detector pixel
    const sourceX = 5 * Math.cos(angleRad);
    const sourceZ = 5 * Math.sin(angleRad);
    
    // Detector position along the detector array (-1 to 1)
    const detectorOffset = (detectorPos - 0.5) * 2; // Convert to -1 to 1 range
    const detectorX = -5 * Math.cos(angleRad) - Math.sin(angleRad) * detectorOffset * 2.5;
    const detectorZ = -5 * Math.sin(angleRad) + Math.cos(angleRad) * detectorOffset * 2.5;
    
    // Sample points along the ray
    const samples = 50;
    let totalAttenuation = 0;
    
    for (let i = 0; i < samples; i++) {
        const t = i / (samples - 1);
        const x = sourceX * (1 - t) + detectorX * t;
        const z = sourceZ * (1 - t) + detectorZ * t;
        
        // Check if point is inside objects (using current positions and scales)
        const cylinderRadius = 0.6 * sceneElements.cylinder.scaling.x;
        if (isPointInCylinder(x, z, sceneElements.cylinder.position.x, sceneElements.cylinder.position.z, cylinderRadius)) {
            totalAttenuation += 0.9 * (density / 5); // Higher attenuation for more contrast
        }
        
        const blockHalfWidth = 0.5 * sceneElements.block.scaling.x;
        const blockHalfDepth = 0.5 * sceneElements.block.scaling.z;
        if (isPointInBlock(x, z, sceneElements.block.position.x, sceneElements.block.position.z, blockHalfWidth * 2, blockHalfDepth * 2)) {
            totalAttenuation += 0.8 * (density / 5); // Higher attenuation for more contrast
        }
    }
    
    return Math.min(1, totalAttenuation / samples);
}

// Update sinogram display
function updateSinogram(angle) {
    const row = Math.floor(angle / 2); // 180 rows for 360 degrees
    
    if (row >= 0 && row < 180) {
        for (let col = 0; col < state.sinogramWidth; col++) {
            const detectorPos = col / state.sinogramWidth;
            const attenuation = calculateAttenuationForDetectorPosition(angle, detectorPos);
            state.sinogramData[row][col] = attenuation;
            
            const intensity = Math.floor(255 * (1 - attenuation));
            state.sinogramCtx.fillStyle = `rgb(${intensity}, ${intensity}, ${intensity})`;
            state.sinogramCtx.fillRect(col, row, 1, 1);
        }
        
        state.projectionCount++;
        state.ui.projectionCountDisplay.textContent = state.projectionCount;
        state.ui.sinogramAngleDisplay.textContent = Math.round(angle) + "°";
    }
}

// Calculate average attenuation for display
function calculateAverageAttenuation(angle) {
    let total = 0;
    const samples = 10;
    
    for (let i = 0; i < samples; i++) {
        const detectorPos = i / samples;
        total += calculateAttenuationForDetectorPosition(angle, detectorPos);
    }
    
    return total / samples;
}