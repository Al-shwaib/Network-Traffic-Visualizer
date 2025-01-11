from scapy.all import sniff
from flask import Flask, render_template, jsonify
import json
import logging
import threading
import queue
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
packet_queue = queue.Queue()

def packet_callback(packet):
    try:
        packet_info = {
            "source": packet.src if hasattr(packet, 'src') else "unknown",
            "destination": packet.dst if hasattr(packet, 'dst') else "unknown",
            "type": packet.__class__.__name__,
            "size": len(packet),
            "time": datetime.now().isoformat(),
        }
        packet_queue.put(packet_info)
        return packet_info
    except Exception as e:
        logger.error(f"خطأ في معالجة الحزمة: {str(e)}")
        return None

def start_packet_capture():
    try:
        sniff(prn=packet_callback, store=0, count=0)
    except Exception as e:
        logger.error(f"خطأ في بدء التقاط الحزم: {str(e)}")

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/packets', methods=['GET'])
def get_packets():
    packets = []
    while not packet_queue.empty():
        try:
            packets.append(packet_queue.get_nowait())
        except queue.Empty:
            break
    return jsonify(packets)

if __name__ == "__main__":
    logger.info("بدء تشغيل NetViz...")
    
    capture_thread = threading.Thread(target=start_packet_capture)
    capture_thread.daemon = True
    capture_thread.start()
    
    app.run(host='0.0.0.0', port=5000, debug=False)
