from scapy.all import sniff, IP, TCP, UDP
import pandas as pd
import time
import signal
import sys
import os

# Initialize global variables
packet_count = 0
start_time = None
packet_data = []

# Define the duration for packet capture (in seconds)
DURATION = 10

# Define the output file path
OUTPUT_FILE = "data/live_data.csv"

# Ensure data directory exists
def ensure_data_dir():
    """Ensures that the data directory exists.
    
    Creates the 'data' directory if it doesn't exist to store CSV files.
    """
    os.makedirs("data", exist_ok=True)

# Signal handler for graceful termination
def signal_handler(sig, frame):
    """Handles termination signals to save captured data before exiting.
    
    Args:
        sig: Signal number
        frame: Current stack frame
    """
    print("\nCapture interrupted. Saving data...")
    save_to_csv()
    sys.exit(0)

# Process each captured packet
def process_packet(packet):
    """Processes each captured packet to extract relevant features.
    
    This function extracts network features from each packet including:
    - Protocol type (TCP, UDP, ICMP)
    - Source and destination IPs
    - Source and destination ports
    - Packet size
    - TCP flags (if applicable)
    
    Args:
        packet: The captured network packet
        
    Returns:
        True to continue capturing, False to stop
    """
    global packet_count, start_time, packet_data
    
    # Initialize start time on first packet
    if start_time is None:
        start_time = time.time()
    
    # Check if duration exceeded
    elapsed = time.time() - start_time
    if elapsed > DURATION:
        print(f"\nCapture duration ({DURATION}s) reached. Saving data...")
        save_to_csv()
        return False
    
    # Extract basic IP information if present
    if IP in packet:
        src_ip = packet[IP].src
        dst_ip = packet[IP].dst
        proto = packet[IP].proto
        service = "other"
        flag = "OTH"
        src_bytes = 0
        dst_bytes = 0
        
        # Extract protocol-specific information
        if TCP in packet:
            service = "tcp"
            sport = packet[TCP].sport
            dport = packet[TCP].dport
            
            # Determine TCP flag
            if packet[TCP].flags & 0x02:  # SYN
                if packet[TCP].flags & 0x10:  # ACK
                    flag = "S1"
                else:
                    flag = "S0"
            elif packet[TCP].flags & 0x01:  # FIN
                flag = "SF"
            elif packet[TCP].flags & 0x04:  # RST
                flag = "REJ"
            elif packet[TCP].flags & 0x10:  # ACK
                flag = "S2"
            elif packet[TCP].flags & 0x08:  # PSH
                flag = "RSTO"
            else:
                flag = "OTH"
                
            # Calculate bytes
            src_bytes = len(packet[TCP].payload)
            dst_bytes = 0
            
        elif UDP in packet:
            service = "udp"
            sport = packet[UDP].sport
            dport = packet[UDP].dport
            src_bytes = len(packet[UDP].payload)
            dst_bytes = 0
        else:
            # Other IP protocols
            sport = 0
            dport = 0
        
        # Create a record for this packet
        record = {
            "duration": round(elapsed, 4),
            "protocol_type": service,
            "service": service,
            "flag": flag,
            "src_bytes": src_bytes,
            "dst_bytes": dst_bytes,
            "land": 1 if src_ip == dst_ip and sport == dport else 0,
            "wrong_fragment": 0,
            "urgent": 0,
            "hot": 0,
            "num_failed_logins": 0,
            "logged_in": 0,
            "num_compromised": 0,
            "root_shell": 0,
            "su_attempted": 0,
            "num_root": 0,
            "num_file_creations": 0,
            "num_shells": 0,
            "num_access_files": 0,
            "num_outbound_cmds": 0,
            "is_host_login": 0,
            "is_guest_login": 0,
            "count": 1,
            "srv_count": 1,
            "same_srv_rate": 1.0,
            "diff_srv_rate": 0.0,
            "srv_diff_host_rate": 0.0,
            "dst_host_count": 1,
            "dst_host_srv_count": 1,
            "dst_host_same_srv_rate": 1.0,
            "dst_host_diff_srv_rate": 0.0,
            "dst_host_same_src_port_rate": 0.0,
            "dst_host_srv_diff_host_rate": 0.0,
            "dst_host_serror_rate": 0.0,
            "dst_host_srv_serror_rate": 0.0,
            "dst_host_rerror_rate": 0.0,
            "dst_host_srv_rerror_rate": 0.0,
            "src_ip": src_ip,
            "dst_ip": dst_ip,
            "src_port": sport,
            "dst_port": dport
        }
        
        packet_data.append(record)
        packet_count += 1
        
        # Print progress
        if packet_count % 10 == 0:
            sys.stdout.write(f"\rCaptured {packet_count} packets... ({int(elapsed)}s/{DURATION}s)")
            sys.stdout.flush()
    
    return True

# Save captured data to CSV
def save_to_csv():
    """Saves the captured packet data to a CSV file.
    
    Converts the packet_data list to a DataFrame and saves it to the
    specified output file path.
    """
    global packet_data
    
    if not packet_data:
        print("No packets captured.")
        return
    
    # Create DataFrame and save to CSV
    df = pd.DataFrame(packet_data)
    ensure_data_dir()
    df.to_csv(OUTPUT_FILE, index=False)
    
    print(f"\nSaved {len(packet_data)} packets to {OUTPUT_FILE}")

# Wrapper for prn callback
def prn_callback_wrapper(packet):
    """Wrapper for the prn callback to ensure its return value (True/False) is not printed."""
    process_packet(packet)
    # Implicitly returns None, Scapy's prn argument is usually for side effects.

# Main function to start packet capture
def capture_packets(duration=None):
    """Starts the packet capture process.
    
    Args:
        duration: Optional override for capture duration in seconds
    """
    global DURATION, packet_count, start_time, packet_data
    
    # Reset global variables
    packet_count = 0
    start_time = None
    packet_data = []
    
    # Override duration if specified
    if duration is not None:
        DURATION = duration
    
    # Register signal handler
    signal.signal(signal.SIGINT, signal_handler)
    
    print(f"Starting packet capture for {DURATION} seconds...")
    print("Press Ctrl+C to stop early.")
    
    # Start packet sniffing
    sniff(prn=prn_callback_wrapper, store=0, stop_filter=lambda p: not process_packet(p))

# Execute if run directly
if __name__ == "__main__":
    # Allow command-line override of duration
    if len(sys.argv) > 1:
        try:
            DURATION = int(sys.argv[1])
        except ValueError:
            print(f"Invalid duration: {sys.argv[1]}. Using default: {DURATION}s")
    
    capture_packets()