# IntruderGuard - Network Intrusion Detection System

This project consists of a Python backend for network traffic analysis and intrusion detection, and a Next.js frontend for displaying alerts and system status.

## Project Structure

```
IntruderGuard/
├── backend/            # Python Flask backend and machine learning scripts
│   ├── data/           # CSV files, pickled models
│   ├── app.py          # Main Flask application
│   ├── requirements.txt # Python dependencies
│   └── ... (other .py scripts)
├── frontend/           # Next.js frontend application
│   ├── app/            # Next.js app directory (pages, layout)
│   ├── public/         # Static assets
│   ├── package.json    # Node.js dependencies
│   ├── next.config.mjs # Next.js configuration
│   └── ... (other config files)
└── README.md           # This file
```

## Prerequisites

*   Python 3.7+ and pip
*   Node.js (v18.x or later recommended) and npm/yarn
*   **Npcap** (for Windows) or **libpcap** (for Linux/macOS) for packet capture by Scapy.

### Npcap Installation (Windows Only)
Npcap is required for low-level network packet capture. Download and install it from the official site:
- [Npcap Download Page](https://nmap.org/npcap/)
- During installation, ensure you check the box for **"Install Npcap in WinPcap API-compatible Mode"**.
- After installation, you may need to restart your computer.

If you encounter issues with Scapy or packet capture, ensure Npcap is installed and your terminal/IDE is running as administrator.

## Setup and Running

### 1. Backend Setup

Navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment (recommended):
```bash
python -m venv venv
```

Activate the virtual environment:
*   Windows:
    ```bash
    .\venv\Scripts\activate
    ```
*   macOS/Linux:
    ```bash
    source venv/bin/activate
    ```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

**Note on Scapy and Npcap:**
If you encounter issues with Scapy, ensure Npcap (or WinPcap) is installed correctly on Windows. You might need to run your terminal/IDE as an administrator for packet capture to work.

### 2. Frontend Setup

Navigate to the frontend directory (from the project root):
```bash
cd frontend
```

Install Node.js dependencies:
```bash
npm install
# or
yarn install
```

### 3. Running the Application

**a. Start the Backend Server:**

In your terminal with the backend virtual environment activated and in the `backend` directory, run:
```bash
python app.py
```
The backend server will typically start on `http://localhost:5000`.

**b. Start the Frontend Development Server:**

In a new terminal, navigate to the `frontend` directory and run:
```bash
npm run dev
# or
yarn dev
```
The frontend development server will typically start on `http://localhost:3000`.

Open your browser and go to `http://localhost:3000` to view the IntruderGuard Tactical Interface.

## How it Works

1.  The **frontend** provides a user interface to trigger manual scans and view live alerts and historical logs.
2.  When a "Manual Scan" is triggered from the frontend:
    *   A POST request is sent to the backend's `/api/trigger-detection` endpoint (proxied by Next.js).
    *   The backend Flask app runs `t18.py` to capture live network packets and save them to `backend/data/live_data.csv`.
    *   Then, it runs `predict_new.py` which loads the captured data, applies a pre-trained machine learning model (`decision_tree_model.pkl` and `scaler.pkl`) to predict intrusions, and saves predictions to `backend/data/live_predictions.csv`.
3.  The frontend periodically polls the backend's `/api/latest-alert` endpoint to get the most recent threat information and `/api/logs` to display historical data, both sourced from `live_predictions.csv`.

## Backend Scripts Overview

(Located in the `backend` directory)

*   `app.py`: Flask application serving the API for the frontend.
*   `t18.py`: Captures live network traffic using Scapy and saves it to `live_data.csv`.
*   `predict_new.py`: Loads `live_data.csv`, uses the trained model (`decision_tree_model.pkl`, `scaler.pkl`) to make predictions, and saves them to `live_predictions.csv`.
*   `DesisionTreeModel.py` (likely a typo, should be `DecisionTreeModel.py`): Script for training the Decision Tree model (uses `Train_data.csv`, saves `decision_tree_model.pkl` and `scaler.pkl`). Not directly run by the live app but used for model generation.
*   `train_new.py`: Another script likely for training or retraining the model using `Combined_Train.csv`.
*   `label_normal.py`: Processes `live_data.csv` to create `normal_live_data.csv` (purpose might be for baseline creation or specific labeling).
*   `merge_dataset.py`: Merges `Train_data.csv` and `normal_live_data.csv` into `Combined_Train.csv`.

## Frontend Components

(Located in the `frontend` directory)

*   `app/page.js`: Main dashboard page component.
*   `app/layout.js`: Root layout for the application.
*   `tailwind.config.js`, `globals.css`: Styling configurations.
*   `next.config.mjs`: Next.js configuration, including API proxy.

## Troubleshooting

*   **CORS errors:** Ensure `Flask-CORS` is installed and initialized in `backend/app.py`. The Next.js proxy in `frontend/next.config.mjs` should also help mitigate this during development.
*   **Packet capture issues (Scapy):** Ensure Npcap/WinPcap/libpcap is installed. On Windows, you might need to run the backend script or your IDE with administrator privileges.
*   **File not found errors in backend scripts:** Verify all Python scripts in the `backend` directory correctly reference files within the `backend/data/` subdirectory (e.g., `data/live_data.csv` instead of `live_data.csv`). This should have been addressed in previous steps.
*   **Python/Node versions:** Ensure you are using compatible versions as specified in prerequisites.