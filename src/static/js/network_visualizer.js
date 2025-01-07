let scene, camera, renderer;
let nodes = new Map();
let connections = [];
let totalDataSize = 0;
let lastDataSize = 0;
let isRotating = true;

let allPackets = [];

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x1a1a1a);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 50;

    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas').appendChild(renderer.domElement);

    const light = new THREE.PointLight(0xffffff, 1, 100);
    light.position.set(0, 0, 50);
    scene.add(light);

    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);

    window.addEventListener('resize', onWindowResize, false);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    if (isRotating) {
        camera.position.x = Math.sin(Date.now() * 0.0005) * 50;
        camera.position.z = Math.cos(Date.now() * 0.0005) * 50;
        camera.lookAt(scene.position);
    }
    
    renderer.render(scene, camera);
}

init();
animate();