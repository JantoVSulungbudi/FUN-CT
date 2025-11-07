import { state } from './main.js';

export function initializeUI(state, sceneElements) {
    // Get UI elements
    const scanSpeedSlider = document.getElementById('scan-speed');
    const slicePositionSlider = document.getElementById('slice-position');
    const objectDensitySlider = document.getElementById('object-density');
    const chamberTransparencySlider = document.getElementById('chamber-transparency');
    const startScanBtn = document.getElementById('start-scan-btn');
    const resetBtn = document.getElementById('reset-btn');
    const modeScanBtn = document.getElementById('mode-scan');
    const modeReconstructBtn = document.getElementById('mode-reconstruct');
    
    const scanSpeedValue = document.getElementById('scan-speed-value');
    const slicePositionValue = document.getElementById('slice-position-value');
    const objectDensityValue = document.getElementById('object-density-value');
    const chamberTransparencyValue = document.getElementById('chamber-transparency-value');
    const currentAngleDisplay = document.getElementById('current-angle');
    const xrayIntensityDisplay = document.getElementById('xray-intensity');
    const detectedSignalDisplay = document.getElementById('detected-signal');
    const scanProgressBar = document.getElementById('scan-progress-bar');
    const sliceDisplay = document.getElementById('slice-display');
    const physicsExplanation = document.getElementById('physics-explanation');
    const sinogramAngleDisplay = document.getElementById('sinogram-angle');
    const projectionCountDisplay = document.getElementById('projection-count');
    
    // Update UI values
    scanSpeedSlider.addEventListener('input', function() {
        scanSpeedValue.textContent = this.value;
    });
    
    slicePositionSlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        slicePositionValue.textContent = value + '%';
        
        // Update slice plane position
        const sliceY = 0.5 + (value / 100) * 4;
        sceneElements.slicePlane.position.y = sliceY;
        
        // Update reconstruction visibility based on slice
        if (state.currentMode === 'reconstruct') {
            updateReconstructionSlice(value, sceneElements);
        }
    });
    
    objectDensitySlider.addEventListener('input', function() {
        objectDensityValue.textContent = this.value;
    });
    
    // Update chamber transparency
    chamberTransparencySlider.addEventListener('input', function() {
        const value = parseInt(this.value);
        chamberTransparencyValue.textContent = value + '%';
        
        // Update chamber material transparency (invert value for alpha)
        sceneElements.chamberMat.alpha = 1 - (value / 100);
    });
    
    // Mode switching
    modeScanBtn.addEventListener('click', function() {
        state.currentMode = 'scan';
        modeScanBtn.classList.add('active-mode');
        modeReconstructBtn.classList.remove('active-mode');
        physicsExplanation.textContent = "Simulasi ini menunjukkan bagaimana sinar-X melewati objek dengan kepadatan berbeda untuk membuat gambar proyeksi.";
        
        // Show/hide appropriate elements
        sceneElements.slicePlane.isVisible = false;
        sceneElements.reconstructionVolume.isVisible = false;
        sceneElements.scannerAssembly.setEnabled(true);
        
        resetSimulation(state, sceneElements);
    });
    
    modeReconstructBtn.addEventListener('click', function() {
        state.currentMode = 'reconstruct';
        modeReconstructBtn.classList.add('active-mode');
        modeScanBtn.classList.remove('active-mode');
        physicsExplanation.textContent = "Tampilan ini menunjukkan proses rekonstruksi 3D dari data proyeksi yang diperoleh.";
        
        // Show/hide appropriate elements
        sceneElements.slicePlane.isVisible = true;
        sceneElements.reconstructionVolume.isVisible = true;
        sceneElements.scannerAssembly.setEnabled(false);
        
        resetSimulation(state, sceneElements);
    });
    
    // Start scan
    startScanBtn.addEventListener('click', function() {
        if (!state.isScanning) {
            state.isScanning = true;
            state.scanProgress = 0;
            state.totalScanTime = 0;
            startScanBtn.textContent = "Hentikan Pemindaian";
            state.reconstructionData = [];
            state.projectionCount = 0;
            clearSinogram(state);
        } else {
            state.isScanning = false;
            startScanBtn.textContent = "Mulai Pemindaian";
        }
    });
    
    // Reset simulation
    resetBtn.addEventListener('click', function() {
        resetSimulation(state, sceneElements);
    });
    
    // Store UI elements in state for other modules to use
    state.ui = {
        currentAngleDisplay,
        xrayIntensityDisplay,
        detectedSignalDisplay,
        scanProgressBar,
        sliceDisplay,
        sinogramAngleDisplay,
        projectionCountDisplay,
        startScanBtn
    };
    
    // Store sliders for physics module
    state.sliders = {
        scanSpeed: scanSpeedSlider,
        objectDensity: objectDensitySlider
    };
    
    return {
        scanSpeedSlider,
        objectDensitySlider,
        chamberTransparencySlider
    };
}

function updateReconstructionSlice(slicePercent, sceneElements) {
    const alpha = 0.1 + (slicePercent / 100) * 0.3;
    sceneElements.reconstructionVolume.material.alpha = alpha;
}

function clearSinogram(state) {
    state.sinogramCtx.fillStyle = 'black';
    state.sinogramCtx.fillRect(0, 0, state.sinogramWidth, state.sinogramHeight);
    state.ui.projectionCountDisplay.textContent = "0";
    state.ui.sinogramAngleDisplay.textContent = "0°";
}

function resetSimulation(state, sceneElements) {
    state.isScanning = false;
    state.currentAngle = 0;
    state.scanProgress = 0;
    state.totalScanTime = 0;
    state.ui.startScanBtn.textContent = "Mulai Pemindaian";
    sceneElements.scannerAssembly.rotation.y = 0;
    state.ui.scanProgressBar.style.width = "0%";
    state.ui.sliceDisplay.textContent = "Sudut: 0°/360°";
    state.ui.currentAngleDisplay.textContent = "0°";
    state.reconstructionData = [];
    state.projectionCount = 0;
    clearSinogram(state);
    
    // Reset object positions and scales
    sceneElements.cylinder.position.x = 0.8;
    sceneElements.cylinder.position.z = 0;
    sceneElements.cylinder.scaling = new BABYLON.Vector3(1, 1, 1);
    
    sceneElements.block.position.x = -0.8;
    sceneElements.block.position.z = 0.8;
    sceneElements.block.scaling = new BABYLON.Vector3(1, 1, 1);
    
    // Reset sinogram data
    for (let i = 0; i < 180; i++) {
        state.sinogramData[i] = new Array(state.sinogramWidth).fill(0);
    }
}