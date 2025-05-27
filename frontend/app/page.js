'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
// import io from 'socket.io-client'; // Socket.io not used in current setup, can be added later
import { AlertTriangle, ShieldCheck, ShieldOff, Zap, ListChecks, Loader2, Terminal, Activity, Eye } from 'lucide-react'; // Added Activity, Eye

// API base URL - now using Next.js proxy
const API_BASE_URL = '/api';

export default function DashboardPage() {
  const [latestAlert, setLatestAlert] = useState(null);
  const [logs, setLogs] = useState([]);
  const [detectionStatus, setDetectionStatus] = useState('Idle');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isLoadingAlert, setIsLoadingAlert] = useState(true);
  const [error, setError] = useState(null);

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/logs`);
      setLogs(response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))); // Sort logs by newest first
      setError(null);
    } catch (err) {
      console.error('Error fetching logs:', err);
      setError('Failed to load historical logs. Backend might be unavailable.');
      setLogs([]);
    }
    setIsLoadingLogs(false);
  };

  const pollAlerts = async () => {
    // setIsLoadingAlert(true); // Only set true on initial load
    try {
      const response = await axios.get(`${API_BASE_URL}/latest-alert`);
      if (response.data && response.data.id) {
        // Only update if the alert is new or different
        if (!latestAlert || latestAlert.id !== response.data.id) {
          setLatestAlert(response.data);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Error polling for alerts:', err);
      // Avoid setting error if it's just a poll failing, could be transient
    }
    setIsLoadingAlert(false); // Ensure this is set false after first attempt
  };

  useEffect(() => {
    fetchLogs();
    pollAlerts(); // Initial poll
    const intervalId = setInterval(pollAlerts, 3000); // Poll more frequently
    return () => {
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array means this runs once on mount and cleans up on unmount


  const handleTriggerDetection = async () => {
    setDetectionStatus('Scanning Network...');
    setError(null);
    try {
      const response = await axios.post(`${API_BASE_URL}/trigger-detection`);
      setDetectionStatus(response.data.message || 'Scan initiated. Monitoring for threats...');
      // After triggering, immediately poll for new alerts/logs to reflect changes
      setTimeout(() => { // Add a small delay to allow backend to process
        pollAlerts();
        fetchLogs();
      }, 1500);
    } catch (err) {
      console.error('Error triggering detection:', err);
      const errorMessage = err.response?.data?.message || 'Failed to trigger detection. Backend might be offline or unresponsive.';
      setDetectionStatus(`Scan Failed: ${errorMessage}`);
      setError(errorMessage);
    }
    // Reset status after a while if no other update, or let backend events update it
    // setTimeout(() => setDetectionStatus('Idle'), 10000);
  };

  const getSeverityStyles = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'critical': return { text: 'text-error', border: 'border-error', bg: 'bg-error/20', pillBg: 'bg-error', pillText: 'text-white' };
      case 'high': return { text: 'text-warning', border: 'border-warning', bg: 'bg-warning/20', pillBg: 'bg-warning', pillText: 'text-black' };
      case 'medium': return { text: 'text-yellow-400', border: 'border-yellow-400', bg: 'bg-yellow-400/20', pillBg: 'bg-yellow-400', pillText: 'text-black' };
      case 'low': return { text: 'text-blue-400', border: 'border-blue-400', bg: 'bg-blue-400/20', pillBg: 'bg-blue-400', pillText: 'text-white' };
      default: return { text: 'text-gray-400', border: 'border-gray-500', bg: 'bg-gray-700/20', pillBg: 'bg-gray-500', pillText: 'text-white' };
    }
  };

  return (
    <div className="space-y-8 font-mono"> {/* Removed bg-dynamic-gradient from here */}
      {error && (
        <div className="bg-error/30 border border-error text-text-primary px-4 py-3 rounded-md relative shadow-md animate-pulse" role="alert">
          <strong className="font-bold text-glow">SYSTEM ALERT: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {/* Live Alert Section - Enhanced Styling */}
      <section className="bg-dark-surface/80 backdrop-blur-sm p-6 rounded-xl shadow-xl border border-dark-border card-hover-effect animate-subtle-float">
        <h2 className="text-2xl font-semibold text-glow mb-4 flex items-center">
          <Activity size={28} className="mr-3 text-accent-glow" /> Live Threat Feed
        </h2>
        {isLoadingAlert ? (
          <div className="flex items-center text-text-secondary">
            <Loader2 size={24} className="animate-spin mr-2 text-accent-glow" /> Initializing live threat matrix...
          </div>
        ) : latestAlert ? (
          <div className={`border-l-4 p-4 rounded-md ${getSeverityStyles(latestAlert.severity).bg} ${getSeverityStyles(latestAlert.severity).border}`}>
            <div className="flex justify-between items-start">
              <div>
                <p className={`font-bold text-lg ${getSeverityStyles(latestAlert.severity).text}`}>{latestAlert.type}</p>
                <p className="text-sm text-text-secondary">
                  {new Date(latestAlert.timestamp).toLocaleString()} | Source: {latestAlert.source_ip}
                </p>
              </div>
              <span className={`px-3 py-1 text-xs font-semibold rounded-full ${getSeverityStyles(latestAlert.severity).pillBg} ${getSeverityStyles(latestAlert.severity).pillText}`}>
                {latestAlert.severity?.toUpperCase()}
              </span>
            </div>
            {latestAlert.details && <p className="mt-2 text-sm text-text-primary whitespace-pre-wrap">{latestAlert.details}</p>}
          </div>
        ) : (
          <div className="flex items-center text-success">
            <ShieldCheck size={24} className="mr-2" /> System Nominal. All channels clear.
          </div>
        )}
      </section>

      {/* Manual Control Panel - Enhanced Styling */}
      <section className="bg-dark-surface/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-dark-border card-hover-effect">
        <h2 className="text-xl font-semibold text-text-primary mb-4 flex items-center">
          <Terminal size={24} className="mr-3 text-accent-glow" /> System Operations Console
        </h2>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <button
            onClick={handleTriggerDetection}
            disabled={detectionStatus.includes('Scanning')}
            className="px-6 py-3 bg-accent-glow text-black font-bold rounded-lg hover:bg-opacity-80 hover:shadow-glow-md transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed flex items-center text-sm shadow-md active:scale-95 w-full sm:w-auto"
          >
            {detectionStatus.includes('Scanning') ? (
              <Loader2 size={20} className="animate-spin mr-2" />
            ) : (
              <Zap size={20} className="mr-2" />
            )}
            Initiate Network Sweep
          </button>
          <p className="text-text-secondary italic text-sm">
            Status: <span className={`font-semibold ${detectionStatus.includes('Failed') ? 'text-error' : detectionStatus.includes('Scanning') ? 'text-warning animate-pulse' : 'text-success'}`}>{detectionStatus}</span>
          </p>
        </div>
      </section>

      {/* Logs Section - Enhanced Styling */}
      <section className="bg-dark-surface/80 backdrop-blur-sm p-6 rounded-xl shadow-lg border border-dark-border card-hover-effect">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-text-primary flex items-center">
            <ListChecks size={24} className="mr-3 text-accent-glow" /> Historical Event Log
          </h2>
          <button onClick={fetchLogs} className="text-xs text-accent-glow hover:underline p-1 rounded flex items-center disabled:opacity-50" disabled={isLoadingLogs}>
            {isLoadingLogs ? <Loader2 size={16} className="animate-spin mr-1" /> : <Eye size={16} className="mr-1" />} Refresh Logs
          </button>
        </div>
        {isLoadingLogs && logs.length === 0 ? (
          <div className="flex items-center text-text-secondary">
            <Loader2 size={24} className="animate-spin mr-2 text-accent-glow" /> Loading event archives...
          </div>
        ) : logs.length > 0 ? (
          <div className="overflow-x-auto max-h-[500px] rounded-lg border border-dark-border scrollbar-thin scrollbar-thumb-dark-border scrollbar-track-dark-surface">
            <table className="w-full text-sm text-left text-text-secondary">
              <thead className="text-xs text-text-primary uppercase bg-dark-surface sticky top-0 z-10 backdrop-blur-sm">
                <tr>
                  <th scope="col" className="px-4 py-3">Timestamp</th>
                  <th scope="col" className="px-4 py-3">Event Type</th>
                  <th scope="col" className="px-4 py-3">Severity</th>
                  <th scope="col" className="px-4 py-3">Source IP</th>
                  <th scope="col" className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-border/50">
                {logs.map((log) => (
                  <tr key={log.id} className={`hover:bg-accent-secondary/20 transition-colors duration-150 ${getSeverityStyles(log.severity).bg}`}>
                    <td className="px-4 py-3 whitespace-nowrap">{new Date(log.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-3">{log.type}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 text-xs font-bold rounded-full ${getSeverityStyles(log.severity).pillBg} ${getSeverityStyles(log.severity).pillText}`}>
                        {log.severity?.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono">{log.source_ip}</td>
                    <td className="px-4 py-3 text-xs max-w-xs truncate hover:whitespace-normal hover:max-w-none" title={log.details}>{log.details || 'N/A'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex items-center text-text-secondary border border-dashed border-dark-border p-6 rounded-lg justify-center">
            <ShieldOff size={24} className="mr-2" /> No historical events recorded or system is initializing.
          </div>
        )}
      </section>
    </div>
  );
}