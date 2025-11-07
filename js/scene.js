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
    
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 8;
    camera.upperRadiusLimit = 25;
    camera.wheelPrecision = 50;
}

function setupLighting() {
    light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;
    
    dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
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
    
    chamberMat = new BABYLON.StandardMaterial("chamberMat", scene);
    chamberMat.diffuseColor = new BABYLON.Color3(0.3, 0.3, 0.4);
    chamberMat.alpha = 0.2;
}

function createScanner() {
    gantry = BABYLON.MeshBuilder.CreateCylinder("gantry", 
        {diameter: 10, height: 6, tessellation: 64}, scene);
    gantry.material = chamberMat;
    gantry.position.y = 3;
}

function createObjects() {
    cylinder = BABYLON.MeshBuilder.CreateCylinder("cylinder", 
        {diameter: 1.2, height: 2, tessellation: 32}, scene);
    cylinder.material = cylinderMat;
    cylinder.position.y = 2.5;
    cylinder.position.x = 0.8;
    
    block = BABYLON.MeshBuilder.CreateBox("block", 
        {width: 1, height: 1.5, depth: 1}, scene);
    block.material = blockMat;
    block.position.y = 2;
    block.position.x = -0.8;
    block.position.z = 0.8;
}

function createScannerAssembly() {
    const xraySource = BABYLON.MeshBuilder.CreateSphere("xraySource", 
        {diameter: 0.5, segments: 16}, scene);
    xraySource.position.x = 5;
    xraySource.position.y = 3;
    
    const detector = BABYLON.MeshBuilder.CreateBox("detector", 
        {width: 5, height: 4, depth: 0.2}, scene);
    detector.position.x = -5;
    detector.position.y = 3;
    
    const xrayBeam = BABYLON.MeshBuilder.CreateCylinder("xrayBeam", 
        {diameter: 0.1, height: 10}, scene);
    xrayBeam.position.y = 3;
    
    scannerAssembly = new BABYLON.TransformNode("scannerAssembly", scene);
    xraySource.parent = scannerAssembly;
    detector.parent = scannerAssembly;
    xrayBeam.parent = scannerAssembly;
}

function createVisualizationElements() {
    slicePlane = BABYLON.MeshBuilder.CreatePlane("slicePlane", 
        {width: 6, height: 6}, scene);
    slicePlane.position.y = 2.5;
    slicePlane.isVisible = false;
    
    reconstructionVolume = BABYLON.MeshBuilder.CreateBox("reconstructionVolume", 
        {width: 6, height: 5, depth: 6}, scene);
    reconstructionVolume.position.y = 2.5;
    reconstructionVolume.isVisible = false;
}

function setupObjectManipulation() {
    // ... your object manipulation code ...
}

// MAKE SURE THIS EXPORT EXISTS
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
