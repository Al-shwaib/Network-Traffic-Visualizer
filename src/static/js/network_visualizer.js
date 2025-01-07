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

function createNode(ip) {
    if (!nodes.has(ip)) {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: getNodeColor(ip),
            shininess: 100
        });
        const node = new THREE.Mesh(geometry, material);
        
        node.position.x = (Math.random() - 0.5) * 50;
        node.position.y = (Math.random() - 0.5) * 50;
        node.position.z = (Math.random() - 0.5) * 50;
        
        scene.add(node);
        nodes.set(ip, node);
        updateCounter();
    }
    return nodes.get(ip);
}

function addConnection(sourceIp, destIp, size) {
    const sourceNode = createNode(sourceIp);
    const destNode = createNode(destIp);
    
    const points = [];
    points.push(sourceNode.position);
    points.push(destNode.position);
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: getConnectionColor(size),
        opacity: 0.6,
        transparent: true
    });
    
    const line = new THREE.Line(geometry, material);
    scene.add(line);
    connections.push(line);

    totalDataSize += size;
    updateDataSize();
    addToRecentPackets(sourceIp, destIp, size);
}

function getNodeColor(ip) {
    if (ip.startsWith('192.168.')) return 0x4CAF50;
    if (ip.startsWith('10.')) return 0x2196F3;
    if (ip.startsWith('172.')) return 0x9C27B0;
    return 0xFF9800;
}

function getConnectionColor(size) {
    if (size < 1000) return 0x4CAF50;
    if (size < 10000) return 0xFFC107;
    return 0xF44336;
}

function updateCounter() {
    // TO DO: implement updateCounter function
}

function updateDataSize() {
    // TO DO: implement updateDataSize function
}

function addToRecentPackets(sourceIp, destIp, size) {
    // TO DO: implement addToRecentPackets function
}

async function fetchPackets() {
    try {
        const response = await fetch('/api/packets');
        const newPackets = await response.json();
        
        if (Array.isArray(newPackets) && newPackets.length > 0) {
            allPackets = [...allPackets, ...newPackets];
            if (allPackets.length > 50) {
                allPackets = allPackets.slice(-50);
            }
            
            newPackets.forEach(packet => {
                if (packet.source && packet.destination) {
                    addConnection(packet.source, packet.destination, packet.size);
                }
            });
        }
        
        updatePacketsList(allPackets);
        
    } catch (error) {
        console.error('Error fetching packets:', error);
    }
}

function updatePacketsList(packets) {
    const packetsList = document.getElementById('packets-list');
    const packetsDetailed = document.getElementById('packets-detailed');
    const packetsSummary = document.getElementById('packets-summary');
    
    packetsList.innerHTML = '';
    packets.forEach(packet => {
        const packetElement = document.createElement('div');
        packetElement.className = 'packet-item';
        packetElement.innerHTML = `${packet.source} → ${packet.destination}`;
        packetsList.appendChild(packetElement);
    });

    packetsDetailed.innerHTML = packets.map(packet => `
        <div class="packet-item">
            <div class="packet-detail">
                <span class="label">Source:</span>
                <span class="value">${packet.source} (${getDeviceType(packet.source)})</span>
            </div>
            <div class="packet-detail">
                <span class="label">Destination:</span>
                <span class="value">${packet.destination} (${getDeviceType(packet.destination)})</span>
            </div>
            <div class="packet-detail">
                <span class="label">Size:</span>
                <span class="value">${formatBytes(packet.size)}</span>
            </div>
            <div class="packet-detail">
                <span class="label">Time:</span>
                <span class="value">${new Date(packet.timestamp).toLocaleTimeString()}</span>
            </div>
        </div>
    `).join('');

    const summary = calculatePacketsSummary(packets);
    packetsSummary.innerHTML = `
        <div class="summary-item">
            <span class="label">Total Packets:</span>
            <span class="value">${summary.totalPackets}</span>
        </div>
        <div class="summary-item">
            <span class="label">Total Data:</span>
            <span class="value">${formatBytes(summary.totalSize)}</span>
        </div>
        <div class="summary-item">
            <span class="label">Active Nodes:</span>
            <span class="value">${summary.activeNodes}</span>
        </div>
    `;
}

function calculatePacketsSummary(packets) {
    const uniqueNodes = new Set();
    let totalSize = 0;
    
    packets.forEach(packet => {
        uniqueNodes.add(packet.source);
        uniqueNodes.add(packet.destination);
        totalSize += packet.size;
    });
    
    return {
        totalPackets: packets.length,
        totalSize: totalSize,
        activeNodes: uniqueNodes.size
    };
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getDeviceType(ip) {
    if (ip.startsWith('192.168.')) return 'Local Device';
    if (ip.startsWith('10.')) return 'Internal Server';
    if (ip.startsWith('172.')) return 'Virtual Machine';
    return 'External Device';
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-filter').forEach(button => {
        button.addEventListener('click', () => {
            const viewType = button.dataset.view;
            
            document.querySelectorAll('.btn-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            document.querySelectorAll('.view-basic, .view-detailed, .view-summary').forEach(view => {
                view.classList.remove('active');
            });
            document.querySelector(`.view-${viewType}`).classList.add('active');
        });
    });
});

setInterval(fetchPackets, 1000);
setInterval(updateTransferRate, 1000);

init();
animate();