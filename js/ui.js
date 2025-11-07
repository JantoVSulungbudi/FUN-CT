import { state } from './main.js';

// Scene elements
let scene, camera, light, dirLight;
let cylinder, block, gantry, xraySource, detector, xrayBeam;
let scannerAssembly, slicePlane, reconstructionVolume;
let cylinderMat, blockMat, chamberMat;

export function initializeScene(engine, canvas) {
    // Create the scene
    scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.05, 0.1, 0.15);
    
    // Setup camera
    setupCamera(canvas);
    
    // Setup lighting
    setupLighting();
    
    // Setup materials
    setupMaterials();
    
    // Create 3D objects
    createScanner();
    createObjects();
    createScannerAssembly();
    createVisualizationElements();
    
    // Setup object manipulation
    setupObjectManipulation();
    
    return scene;
}

function setupCamera(canvas) {
    camera = new BABYLON.ArcRotateCamera(
        "camera", 
        -Math.PI / 2, 
        Math.PI / 2.5, 
        12, 
        new BABYLON.Vector3(0, 2, 0), 
        scene
    );
    
    // Camera controls
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 25;
    camera.wheelPrecision = 50;
}

function setupLighting() {
    light = new BABYLON.HemisphericLight(
        "light", 
        new BABYLON.Vector3(0, 1, 0), 
        scene
    );
    light.intensity = 0.7;
    
    dirLight = new BABYLON.DirectionalLight(
        "dirLight", 
        new BABYLON.Vector3(-1, -2, -1), 
        scene
    );
    dirLight.position = new BABYLON.Vector3(10, 10, 10);
    dirLight.intensity = 0.5;
}

function setupMaterials() {
    cylinderMat = new BABYLON.StandardMaterial("cylinderMat", scene);
    cylinderMat.diffuseColor = new BABYLON.Color3(0.9, 0.4, 0.4);
    cylinderMat.alpha = 0.9;
    
    blockMat = new BABYLON.StandardMaterial("blockMat", scene);
    blockMat.diffuseColor = new BABYLON.Color3(0.95, 0.85, 0.3);
    blockMat.specularColor = new BABYLON.Color3(0.5, 0.5, 0.3);
    blockMat.alpha = 0.9;
    
    const xraySourceMat = new BABYLON.StandardMaterial("xraySourceMat", scene);
    xraySourceMat.diffuseColor = new BABYLON.Color3(0.3, 0.8, 1.0);
    xraySourceMat.emissiveColor = new BABYLON.Color3(0.1, 0.4, 0.8);
    
    const detectorMat = new BABYLON.StandardMaterial("detectorMat", scene);
    detectorMat.diffuseColor = new BABYLON.Color3(0.3, 0.8, 0.4);
    detectorMat.emissiveColor = new BABYLON.Color3(0.1, 0.3, 0.1);
    
    const xrayBeamMat = new BABYLON.StandardMaterial("xrayBeamMat", scene);
    xrayBeamMat.diffuseColor = new BABYLON.Color3(0.8, 0.9, 1.0);
    xrayBeamMat.emissiveColor = new BABYLON.Color3(0.5, 0.7, 1.0);
    xrayBeamMat.alpha = 0.6;
    
    chamberMat = new BABYLON.StandardMaterial("chamberMat", scene);
    chamberMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4);
    chamberMat.alpha = 0.2;
}

function createScanner() {
    // Create CT scanner gantry (semi-transparent chamber)
    gantry = BABYLON.MeshBuilder.CreateCylinder(
        "gantry", 
        {diameter: 10, height: 6, tessellation: 64}, 
        scene
    );
    gantry.material = chamberMat;
    gantry.position.y = 3;
    
    // Create opening in gantry
    const gantryHole = BABYLON.MeshBuilder.CreateCylinder(
        "gantryHole", 
        {diameter: 6, height: 6.2, tessellation: 64}, 
        scene
    );
    gantryHole.material = new BABYLON.StandardMaterial("holeMat", scene);
    gantryHole.material.diffuseColor = new BABYLON.Color3(0.1, 0.1, 0.2);
    gantryHole.material.alpha = 0.1;
    gantryHole.position.y = 3;
}

function createObjects() {
    // Create smaller objects: cylinder and block
    cylinder = BABYLON.MeshBuilder.CreateCylinder(
        "cylinder", 
        {diameter: 1.2, height: 2, tessellation: 32},
        scene
    );
    cylinder.material = cylinderMat;
    cylinder.position.y = 2.5;
    cylinder.position.x = 0.8;
    
    block = BABYLON.MeshBuilder.CreateBox(
        "block", 
        {width: 1, height: 1.5, depth: 1},
        scene
    );
    block.material = blockMat;
    block.position.y = 2;
    block.position.x = -0.8;
    block.position.z = 0.8;
}

function createScannerAssembly() {
    // Create X-ray source
    const xraySource = BABYLON.MeshBuilder.CreateSphere(
        "xraySource", 
        {diameter: 0.5, segments: 16}, 
        scene
    );
    xraySource.material = scene.getMaterialByName("xraySourceMat");
    xraySource.position.x = 5;
    xraySource.position.y = 3;
    
    // Create detector
    const detector = BABYLON.MeshBuilder.CreateBox(
        "detector", 
        {width: 5, height: 4, depth: 0.2},
        scene
    );
    detector.material = scene.getMaterialByName("detectorMat");
    detector.position.x = -5;
    detector.position.y = 3;
    
    // Create X-ray beam
    const xrayBeam = BABYLON.MeshBuilder.CreateCylinder(
        "xrayBeam", 
        {diameter: 0.1, height: 10},
        scene
    );
    xrayBeam.material = scene.getMaterialByName("xrayBeamMat");
    xrayBeam.position.y = 3;
    
    // Group scanner components
    scannerAssembly = new BABYLON.TransformNode("scannerAssembly", scene);
    xraySource.parent = scannerAssembly;
    detector.parent = scannerAssembly;
    xrayBeam.parent = scannerAssembly;
}

function createVisualizationElements() {
    // Create cross-section plane
    slicePlane = BABYLON.MeshBuilder.CreatePlane(
        "slicePlane", 
        {width: 6, height: 6}, 
        scene
    );
    const sliceMat = new BABYLON.StandardMaterial("sliceMat", scene);
    sliceMat.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.9);
    sliceMat.alpha = 0.3;
    slicePlane.material = sliceMat;
    slicePlane.position.y = 2.5;
    slicePlane.isVisible = false;
    
    // Create reconstruction volume
    reconstructionVolume = BABYLON.MeshBuilder.CreateBox(
        "reconstructionVolume", 
        {width: 6, height: 5, depth: 6}, 
        scene
    );
    const volumeMat = new BABYLON.StandardMaterial("volumeMat", scene);
    volumeMat.diffuseColor = new BABYLON.Color3(0.1, 0.3, 0.6);
    volumeMat.alpha = 0.2;
    reconstructionVolume.material = volumeMat;
    reconstructionVolume.position.y = 2.5;
    reconstructionVolume.isVisible = false;
}

function setupObjectManipulation() {
    // Variables for object manipulation
    let originalPointerX, originalPointerY;
    let originalObjectX, originalObjectZ;
    
    // Keyboard event listeners for object control
    scene.onKeyboardObservable.add((kbInfo) => {
        switch (kbInfo.type) {
            case BABYLON.KeyboardEventTypes.KEYDOWN:
                if (kbInfo.event.key === 'o' || kbInfo.event.key === 'O') {
                    state.isObjectControlActive = true;
                    document.getElementById('object-control-indicator').classList.add('key-active');
                }
                break;
            case BABYLON.KeyboardEventTypes.KEYUP:
                if (kbInfo.event.key === 'o' || kbInfo.event.key === 'O') {
                    state.isObjectControlActive = false;
                    document.getElementById('object-control-indicator').classList.remove('key-active');
                    
                    // Reset material if object was selected
                    if (state.selectedObject === cylinder) {
                        cylinderMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
                    } else if (state.selectedObject === block) {
                        blockMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
                    }
                    
                    state.selectedObject = null;
                    state.isDragging = false;
                }
                break;
        }
    });
    
    // Set up pointer events for object manipulation
    scene.onPointerObservable.add((pointerInfo) => {
        switch (pointerInfo.type) {
            case BABYLON.PointerEventTypes.POINTERDOWN:
                if (state.isObjectControlActive && pointerInfo.pickInfo.hit && 
                    (pointerInfo.pickInfo.pickedMesh === cylinder || 
                     pointerInfo.pickInfo.pickedMesh === block)) {
                    state.selectedObject = pointerInfo.pickInfo.pickedMesh;
                    state.isDragging = true;
                    
                    // Store original positions
                    originalPointerX = scene.pointerX;
                    originalPointerY = scene.pointerY;
                    originalObjectX = state.selectedObject.position.x;
                    originalObjectZ = state.selectedObject.position.z;
                    
                    // Change material to indicate selection
                    if (state.selectedObject === cylinder) {
                        cylinderMat.emissiveColor = new BABYLON.Color3(0.3, 0, 0);
                    } else {
                        blockMat.emissiveColor = new BABYLON.Color3(0.3, 0.3, 0);
                    }
                }
                break;
                
            case BABYLON.PointerEventTypes.POINTERUP:
                if (state.isDragging) {
                    state.isDragging = false;
                    
                    // Only reset material if object control is no longer active
                    if (!state.isObjectControlActive) {
                        if (state.selectedObject === cylinder) {
                            cylinderMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
                        } else {
                            blockMat.emissiveColor = new BABYLON.Color3(0, 0, 0);
                        }
                    }
                    
                    state.selectedObject = null;
                }
                break;
                
            case BABYLON.PointerEventTypes.POINTERMOVE:
                if (state.isObjectControlActive && state.isDragging && state.selectedObject) {
                    // Calculate movement delta
                    const deltaX = (scene.pointerX - originalPointerX) * 0.1;
                    const deltaZ = (scene.pointerY - originalPointerY) * 0.1;
                    
                    // Update object position
                    state.selectedObject.position.x = originalObjectX + deltaX;
                    state.selectedObject.position.z = originalObjectZ - deltaZ;
                    
                    // Constrain object to within scanner bounds
                    const maxDistance = 2.5;
                    const distanceFromCenter = Math.sqrt(
                        state.selectedObject.position.x * state.selectedObject.position.x + 
                        state.selectedObject.position.z * state.selectedObject.position.z
                    );
                    
                    if (distanceFromCenter > maxDistance) {
                        const scale = maxDistance / distanceFromCenter;
                        state.selectedObject.position.x *= scale;
                        state.selectedObject.position.z *= scale;
                    }
                }
                break;
                
            case BABYLON.PointerEventTypes.POINTERWHEEL:
                if (state.isObjectControlActive && pointerInfo.pickInfo.hit && 
                    (pointerInfo.pickInfo.pickedMesh === cylinder || 
                     pointerInfo.pickInfo.pickedMesh === block)) {
                    const delta = pointerInfo.event.wheelDelta;
                    const scaleFactor = delta > 0 ? 1.1 : 0.9;
                    
                    // Scale the object
                    pointerInfo.pickInfo.pickedMesh.scaling.x *= scaleFactor;
                    pointerInfo.pickInfo.pickedMesh.scaling.y *= scaleFactor;
                    pointerInfo.pickInfo.pickedMesh.scaling.z *= scaleFactor;
                    
                    // Constrain scaling to reasonable limits
                    const minScale = 0.3;
                    const maxScale = 3.0;
                    
                    pointerInfo.pickInfo.pickedMesh.scaling.x = Math.max(minScale, 
                        Math.min(maxScale, pointerInfo.pickInfo.pickedMesh.scaling.x));
                    pointerInfo.pickInfo.pickedMesh.scaling.y = Math.max(minScale, 
                        Math.min(maxScale, pointerInfo.pickInfo.pickedMesh.scaling.y));
                    pointerInfo.pickInfo.pickedMesh.scaling.z = Math.max(minScale, 
                        Math.min(maxScale, pointerInfo.pickInfo.pickedMesh.scaling.z));
                }
                break;
        }
    });
}

// Getters for scene elements
export function getSceneElements() {
    return {
        scene,
        cylinder,
        block,
        gantry,
        scannerAssembly,
        slicePlane,
        reconstructionVolume,
        cylinderMat,
        blockMat,
        chamberMat
    };
}