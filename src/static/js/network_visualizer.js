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

    setInterval(fetchPackets, 1000);
    setInterval(updateTransferRate, 1000);

    animate();
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function formatBytes(bytes) {
    if (bytes === 0) return '0 بايت';
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function addNode(ip, type) {
    if (!nodes.has(ip)) {
        const geometry = new THREE.SphereGeometry(1, 32, 32);
        const material = new THREE.MeshPhongMaterial({
            color: type === 'source' ? 0x00ff88 : 0xff3366,
            emissive: type === 'source' ? 0x003311 : 0x330011
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
    const source = addNode(sourceIp, 'source');
    const dest = addNode(destIp, 'destination');
    
    const points = [];
    points.push(source.position);
    points.push(dest.position);
    
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
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

function updateCounter() {
    document.getElementById('packetCount').textContent = nodes.size;
}

function updateDataSize() {
    document.getElementById('dataSize').textContent = formatBytes(totalDataSize);
}

function updateTransferRate() {
    const rate = totalDataSize - lastDataSize;
    document.getElementById('transferRate').textContent = formatBytes(rate) + '/ثانية';
    lastDataSize = totalDataSize;
}

function addToRecentPackets(source, dest, size) {
    const list = document.getElementById('packets-list');
    const item = document.createElement('div');
    item.className = 'packet-item';
    item.innerHTML = `${source} → ${dest} (${formatBytes(size)})`;
    
    list.insertBefore(item, list.firstChild);
    if (list.children.length > 10) {
        list.removeChild(list.lastChild);
    }
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

function toggleRotation() {
    isRotating = !isRotating;
}

function resetView() {
    camera.position.z = 50;
    camera.position.x = 0;
    camera.position.y = 0;
    camera.lookAt(scene.position);
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

function updatePacketsList(packets) {
    const packetsList = document.getElementById('packets-list');
    const packetsDetailed = document.getElementById('packets-detailed');
    const packetsSummary = document.getElementById('packets-summary');
    
    packetsList.innerHTML = '';
    packets.forEach(packet => {
        const packetElement = createBasicPacketElement(packet);
        packetsList.appendChild(packetElement);
    });

    packetsDetailed.innerHTML = packets.map(packet => `
        <div class="packet-item">
            <div class="packet-detail">
                <span class="detail-label">المصدر</span>
                <span class="detail-value">${packet.source}</span>
                <span class="detail-label">نوع الجهاز</span>
                <span class="detail-value">${getDeviceType(packet.source)}</span>
            </div>
            <div class="packet-detail">
                <span class="detail-label">الوجهة</span>
                <span class="detail-value">${packet.destination}</span>
                <span class="detail-label">نوع الجهاز</span>
                <span class="detail-value">${getDeviceType(packet.destination)}</span>
            </div>
            <div class="packet-detail">
                <span class="detail-label">البروتوكول</span>
                <span class="detail-value">${packet.type || 'غير معروف'}</span>
                <span class="detail-label">حجم البيانات</span>
                <span class="detail-value">${formatBytes(packet.size)}</span>
                <span class="detail-label">التوقيت</span>
                <span class="detail-value">${new Date(packet.time).toLocaleTimeString()}</span>
            </div>
        </div>
    `).join('');

    // تحديث عرض الملخص
    const summary = calculatePacketsSummary(packets);
    packetsSummary.innerHTML = `
        <div class="summary-item">
            <span class="summary-label">إجمالي الأجهزة النشطة</span>
            <span class="summary-value">${summary.uniqueDevices}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">إجمالي حجم البيانات</span>
            <span class="summary-value">${formatBytes(summary.totalSize)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">متوسط حجم الحزمة</span>
            <span class="summary-value">${formatBytes(summary.averageSize)}</span>
        </div>
        <div class="summary-item">
            <span class="summary-label">البروتوكولات المستخدمة</span>
            <span class="summary-value">${summary.protocols.join(', ')}</span>
        </div>
    `;
}

function createBasicPacketElement(packet) {
    const packetElement = document.createElement('div');
    packetElement.className = 'packet-item';
    
    const connectionLine = document.createElement('div');
    connectionLine.className = 'connection-line';
    
    const source = document.createElement('span');
    source.className = 'source';
    source.textContent = packet.source;
    
    const arrow = document.createElement('span');
    arrow.className = 'arrow';
    arrow.textContent = '→';
    
    const destination = document.createElement('span');
    destination.className = 'destination';
    destination.textContent = packet.destination;
    
    connectionLine.appendChild(source);
    connectionLine.appendChild(arrow);
    connectionLine.appendChild(destination);
    
    const details = document.createElement('div');
    details.className = 'details';
    details.textContent = `(${formatBytes(packet.size)}) ${packet.protocol}`;
    
    packetElement.appendChild(connectionLine);
    packetElement.appendChild(details);
    
    return packetElement;
}

function calculatePacketsSummary(packets) {
    const devices = new Set();
    let totalSize = 0;
    const protocols = new Set();

    packets.forEach(packet => {
        devices.add(packet.source);
        devices.add(packet.destination);
        totalSize += packet.size;
        if (packet.type) protocols.add(packet.type);
    });

    return {
        uniqueDevices: devices.size,
        totalSize: totalSize,
        averageSize: Math.round(totalSize / packets.length),
        protocols: Array.from(protocols)
    };
}

function getDeviceType(mac) {
    const prefix = mac.substring(0, 8).toUpperCase();
    const deviceTypes = {
        // Apple Devices
        '00:CD:FE': 'آيفون',
        '00:A0:40': 'آيباد',
        '00:03:93': 'ماك بوك',
        
        // Samsung Devices
        '00:07:AB': 'هاتف سامسونج',
        '84:25:DB': 'تابلت سامسونج',
        'DC:2C:6E': 'هاتف سامسونج',
        
        // Computer Manufacturers
        'CA:A5:7B': 'كمبيوتر محمول',
        '00:1A:A0': 'كمبيوتر ديل',
        '00:24:E8': 'كمبيوتر لينوفو',
        '00:10:FA': 'كمبيوتر آبل',
        '00:21:6A': 'كمبيوتر إتش بي',
        
        // Network Devices
        '00:1A:2F': 'راوتر سيسكو',
        '00:18:4D': 'راوتر نتجير',
        '00:40:96': 'راوتر تي بي لينك',
        'DC:FE:07': 'راوتر دي لينك',
        
        // Smart Home Devices
        'B8:27:EB': 'راسبيري باي',
        '00:17:88': 'أجهزة فيليبس الذكية',
        'F0:B4:29': 'أجهزة جوجل الذكية',
        '44:00:49': 'أجهزة أمازون الذكية',
        
        // Gaming Consoles
        '7C:BB:8A': 'بلايستيشن',
        '00:50:F2': 'إكس بوكس',
        '98:B6:E9': 'نينتندو سويتش',
        
        // Smart TVs
        '00:27:1C': 'تلفاز سامسونج الذكي',
        '00:1E:C0': 'تلفاز إل جي الذكي',
        '00:05:CD': 'تلفاز سوني الذكي',
        
        // Printers
        '00:17:A4': 'طابعة إتش بي',
        '00:00:74': 'طابعة إبسون',
        '00:22:58': 'طابعة كانون',
        
        // Security Cameras
        '00:80:F0': 'كاميرا مراقبة',
        'B0:C5:54': 'كاميرا دي لينك',
        '00:0F:00': 'كاميرا نتجير',
        
        // Other Devices
        '00:1F:00': 'جهاز بلوتوث',
        '00:0C:29': 'جهاز افتراضي',
        '00:60:52': 'جهاز شبكة',
        '00:A0:C9': 'جهاز ذكي'
    };
    
    for (const [key, value] of Object.entries(deviceTypes)) {
        if (prefix.startsWith(key)) return value;
    }
    return 'جهاز غير معروف';
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-filter').forEach(button => {
        button.addEventListener('click', () => {
            const view = button.dataset.view;
            
            document.querySelectorAll('.btn-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
            
            document.querySelectorAll('.view-basic, .view-detailed, .view-summary').forEach(view => {
                view.classList.remove('active');
            });
            document.querySelector(`.view-${view}`).classList.add('active');
        });
    });
});

init();
