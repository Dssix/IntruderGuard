'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { AlertTriangle, ShieldCheck, ShieldOff, Zap, ListChecks, Loader2, Terminal } from 'lucide-react';

// API base URL - now using Next.js proxy
const API_BASE_URL = '/api';

export default function DashboardPage() {
  const [latestAlert, setLatestAlert] = useState(null);
  const [logs, setLogs] = useState([]);
  const [detectionStatus, setDetectionStatus] = useState('Idle');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingAlert, setIsLoadingAlert] = useState(true);
  const [error, setError] = useState(null);

  // Fetch logs and poll alerts functions moved to top-level
  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/logs`);
      setLogs(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load historical logs. Backend might be unavailable.');
      setLogs([]);
    }
    setIsLoadingLogs(false);
  };

  const pollAlerts = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/latest-alert`);
      if (response.data && response.data.id) {
        setLatestAlert(response.data);
      }
      setError(null);
    } catch (err) {
      console.error('Error polling for alerts:', err);
    }
    setIsLoadingAlert(false);
  };

  // useEffect to fetch logs and poll alerts on mount
  useEffect(() => {
    fetchLogs();
    pollAlerts();
    const intervalId = setInterval(pollAlerts, 5000);
    return () => {
      clearInterval(intervalId);
    };
  }, []);


  const handleTriggerDetection = async () => {
    setDetectionStatus('Scanning...');
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/trigger-detection`); // Path is now relative to /api
      setDetectionStatus(response.data.message || 'Scan initiated. Check logs for updates.');
      // After triggering, poll for new alerts/logs to reflect changes
      pollAlerts();
      fetchLogs(); // Re-fetch logs to see if new predictions are there
    } catch (err) {
      console.error('Error triggering detection:', err);
      console.error('Full error object:', err); // Added for detailed logging
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('Error response data:', err.response.data); // Added for detailed logging
        console.error('Error response status:', err.response.status);
        console.error('Error response headers:', err.response.headers);
      } else if (err.request) {
        // The request was made but no response was received
        console.error('Error request data:', err.request); // Added for detailed logging
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('Error message:', err.message); // Added for detailed logging
      }
      const errorMessage = err.response?.data?.message || 'Failed to trigger detection. Backend might be unavailable.';
      setDetectionStatus(`Scan Failed: ${errorMessage}`);
      setError(errorMessage);
    }
    // Status will be updated by backend or subsequent polls, or reset if needed
    // setTimeout(() => setDetectionStatus('Idle'), 7000); // Reset status after a while if no other update
  };

  const getSeverityClass = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return 'text-red-400 border-red-400';
      case 'high': return 'text-orange-400 border-orange-400';
      case 'medium': return 'text-yellow-400 border-yellow-400';
      case 'low': return 'text-blue-400 border-blue-400';
      default: return 'text-gray-400 border-gray-400';
    }
  };

  return (
    <div className="space-y-8 font-mono">
      {error && (
        <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-md relative shadow-md" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Live Alert Section */}
      <section className="bg-dark-surface p-6 rounded-lg shadow-xl border border-accent-glow animate-pulse">
        <h2 className="text-2xl font-semibold text-accent-glow mb-4 flex items-center">
          <Zap size={28} className="mr-3" /> Live Threat Status
        </h2>
        {isLoadingAlert ? (
          <div className="flex items-center text-text-secondary">
            <Loader2 size={24} className="animate-spin mr-2" /> Initializing live feed...
          </div>
        ) : latestAlert ? (
          <div className={`border-l-4 p-4 rounded-md bg-opacity-20 ${getSeverityClass(latestAlert.severity)} bg-gray-700`}>
            <div className="flex justify-between items-start">
              <div>
                <p className="font-bold text-lg">{latestAlert.type}</p>
                <p className="text-sm text-text-secondary">
                  {new Date(latestAlert.timestamp).toLocaleString()} - Source: {latestAlert.source_ip}
                </p>
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getSeverityClass(latestAlert.severity).replace('border-', 'bg-').replace('text-', 'text-black ')}`}>
                {latestAlert.severity}
              </span>
            </div>
            {latestAlert.details && <p className="mt-2 text-sm">{latestAlert.details}</p>}
          </div>
        ) : (
          <div className="flex items-center text-green-400">
            <ShieldCheck size={24} className="mr-2" /> System Secure. No active threats.
          </div>
        )}
      </section>

      {/* Manual Control Panel */}
      <section className="bg-dark-surface p-6 rounded-lg shadow-lg border border-dark-border">
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
          <Terminal size={24} className="mr-3" /> Manual System Control
        </h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={handleTriggerDetection}
            disabled={detectionStatus === 'Scanning...'}
            className="px-6 py-2 bg-accent-glow text-black font-semibold rounded-md hover:bg-opacity-80 hover:shadow-glow-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {detectionStatus === 'Scanning...' ? (
              <Loader2 size={20} className="animate-spin mr-2" />
            ) : (
              <Zap size={20} className="mr-2" />
            )}
            Trigger Manual Scan
          </button>
          <p className="text-text-secondary italic">
            Status: <span className={`${detectionStatus.includes('Failed') ? 'text-red-400' : detectionStatus === 'Scanning...' ? 'text-yellow-400' : 'text-green-400'}`}>{detectionStatus}</span>
          </p>
        </div>
      </section>

      {/* Logs Section */}
      <section className="bg-dark-surface p-6 rounded-lg shadow-lg border border-dark-border">
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
          <ListChecks size={24} className="mr-3" /> Historical Intrusion Logs
        </h2>
        {isLoadingLogs ? (
          <div className="flex items-center text-text-secondary">
            <Loader2 size={24} className="animate-spin mr-2" /> Loading logs...
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto max-h-96">
            <table className="w-full text-sm text-left text-text-secondary">
              <thead className="text-xs text-text-primary uppercase bg-gray-700 bg-opacity-40">
                <tr>
                  <th scope="col" className="px-6 py-3">Timestamp</th>
                  <th scope="col" className="px-6 py-3">Type</th>
                  <th scope="col" className="px-6 py-3">Severity</th>
                  <th scope="col" className="px-6 py-3">Source IP</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className={`border-b border-dark-border hover:bg-gray-700 hover:bg-opacity-20 ${getSeverityClass(log.severity)}`}>
                    <td className="px-6 py-4 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-6 py-4">{log.type}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${getSeverityClass(log.severity).replace('border-', 'bg-').replace('text-', 'text-black ')}`}>
                        {log.severity}
                      </span>
                    </td>
                    <td className="px-6 py-4">{log.source_ip}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center text-text-secondary">
            <ShieldOff size={24} className="mr-2" /> No historical logs found or unable to load.
          </div>
        )}
      </section>
    </div>
  );
}