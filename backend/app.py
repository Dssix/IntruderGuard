from flask import Flask, jsonify, request
from flask_cors import CORS
import subprocess
import pandas as pd
import os
import threading

# Initialize Flask application
app = Flask(__name__)
CORS(app) # Enable CORS for all routes

# Define directory paths
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DATA_DIR = os.path.join(BASE_DIR, 'data')

# --- Helper Functions ---
def run_script(script_name, args=[]):
    """Runs a Python script in a non-blocking way and returns its process.
    
    Args:
        script_name: Name of the Python script to run
        args: List of command-line arguments to pass to the script
        
    Returns:
        subprocess.Popen object or None if an error occurs
    """
    try:
        script_path = os.path.join(BASE_DIR, script_name)
        python_executable = os.path.join(BASE_DIR, '.venv', 'Scripts', 'python.exe')
        if not os.path.exists(python_executable):
            # Fallback to system python if venv python not found, though this should not happen in a correct setup
            python_executable = 'python'
        process = subprocess.Popen([python_executable, script_path] + args, cwd=BASE_DIR, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
        return process
    except Exception as e:
        print(f"Error running script {script_name}: {e}")
        return None

# --- API Endpoints ---

@app.route('/trigger-detection', methods=['POST'])
def trigger_detection():
    """Triggers the live packet capture and prediction scripts.
    
    This endpoint runs t18.py to capture network packets and then predict_new.py
    to analyze the captured data for potential intrusions.
    
    Returns:
        JSON response with status and message
    """
    print("Attempting to trigger detection...")
    # 1. Run t18.py to capture live data
    t18_process = run_script('t18.py')
    if t18_process:
        t18_stdout, t18_stderr = t18_process.communicate() # Wait for t18.py to finish
        print(f"t18.py stdout: {t18_stdout}")
        if t18_stderr:
            print(f"t18.py stderr: {t18_stderr}")
            # return jsonify({'status': 'error', 'message': 'Error during packet capture.', 'details': t18_stderr}), 500
        # Check if live_data.csv was created
        live_data_path = os.path.join(DATA_DIR, 'live_data.csv')
        if not os.path.exists(live_data_path):
            print(f"Error: {live_data_path} not found after t18.py execution.")
            return jsonify({'status': 'error', 'message': 'Packet capture script did not produce live_data.csv.'}), 500
        print(f"t18.py finished, {live_data_path} should exist.")
    else:
        return jsonify({'status': 'error', 'message': 'Failed to start packet capture script.'}), 500

    # 2. Run predict_new.py to process live_data.csv
    predict_process = run_script('predict_new.py')
    if predict_process:
        predict_stdout, predict_stderr = predict_process.communicate() # Wait for predict_new.py
        print(f"predict_new.py stdout: {predict_stdout}")
        if predict_stderr:
            print(f"predict_new.py stderr: {predict_stderr}")
            # return jsonify({'status': 'error', 'message': 'Error during prediction.', 'details': predict_stderr}), 500
        # Check if live_predictions.csv was created
        live_predictions_path = os.path.join(DATA_DIR, 'live_predictions.csv')
        if not os.path.exists(live_predictions_path):
            print(f"Error: {live_predictions_path} not found after predict_new.py execution.")
            return jsonify({'status': 'error', 'message': 'Prediction script did not produce live_predictions.csv.'}), 500
        print(f"predict_new.py finished, {live_predictions_path} should exist.")
        return jsonify({'status': 'success', 'message': 'Detection cycle completed. Check logs for results.', 'output': predict_stdout}), 200
    else:
        return jsonify({'status': 'error', 'message': 'Failed to start prediction script.'}), 500

@app.route('/latest-alert', methods=['GET'])
def get_latest_alert():
    """Returns the most recent prediction or a summary.
    
    This endpoint reads the latest entry from live_predictions.csv and formats it
    as an alert for the frontend.
    
    Returns:
        JSON response with alert information or error message
    """
    live_predictions_path = os.path.join(DATA_DIR, 'live_predictions.csv')
    try:
        if os.path.exists(live_predictions_path):
            df = pd.read_csv(live_predictions_path)
            if not df.empty:
                # Convert to a more frontend-friendly format if needed
                # For now, return the last entry as a mock alert
                latest_entry = df.iloc[-1].to_dict()
                alert = {
                    'id': latest_entry.get('id', str(df.index[-1])),
                    'timestamp': pd.Timestamp.now().isoformat(), # Use current time as file doesn't have it
                    'type': 'Anomaly Detected' if latest_entry.get('predicted_class') == 1 else ('Uncertain' if latest_entry.get('predicted_class') == -1 else 'Normal'),
                    'severity': 'High' if latest_entry.get('predicted_class') == 1 else ('Medium' if latest_entry.get('predicted_class') == -1 else 'Low'),
                    'source_ip': latest_entry.get('src_ip', 'N/A'), # Assuming src_ip is in your csv
                    'details': f"Intrusion probability: {latest_entry.get('intrusion_prob', 0):.2f}"
                }
                return jsonify(alert), 200
            else:
                return jsonify({'message': 'No predictions available yet.'}), 404
        else:
            return jsonify({'message': 'Prediction file not found. Run detection first.'}), 404
    except Exception as e:
        print(f"Error reading latest alert: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/logs', methods=['GET'])
def get_logs():
    """Returns historical logs (content of live_predictions.csv for now).
    
    This endpoint reads all entries from live_predictions.csv and formats them
    as logs for the frontend.
    
    Returns:
        JSON response with logs array or error message
    """
    live_predictions_path = os.path.join(DATA_DIR, 'live_predictions.csv')
    try:
        if os.path.exists(live_predictions_path):
            df = pd.read_csv(live_predictions_path)
            # Transform data for frontend if necessary
            logs = []
            for index, row in df.iterrows():
                logs.append({
                    'id': str(index), # Use index as ID
                    'timestamp': pd.Timestamp.now().isoformat(), # Placeholder, ideally from data
                    'type': 'Anomaly' if row.get('predicted_class') == 1 else ('Uncertain' if row.get('predicted_class') == -1 else 'Normal'),
                    'severity': 'High' if row.get('predicted_class') == 1 else ('Medium' if row.get('predicted_class') == -1 else 'Low'),
                    'source_ip': row.get('src_ip', 'N/A'),
                    'details': f"Prob: {row.get('intrusion_prob', 0):.2f}, Raw Class: {row.get('predicted_class')}"
                })
            return jsonify(logs), 200
        else:
            return jsonify([]), 200 # Return empty list if no logs
    except Exception as e:
        print(f"Error reading logs: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

if __name__ == '__main__':
    # Ensure data directory exists
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR)
    app.run(debug=True, port=5000)