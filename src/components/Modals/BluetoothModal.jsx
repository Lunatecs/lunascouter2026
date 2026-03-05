import React, { useState, useEffect, useRef, useCallback } from 'react';

// The specific Service GUID requested
const SERVICE_GUID = "d6035ed0-8f10-11e2-9e96-0800200c9a69";

export default function BluetoothModal({ show, onClose, data }) {
  // Connection State
  const [port, setPort] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [reader, setReader] = useState(null);
  const [writer, setWriter] = useState(null);
  
  // Data State
  const [logs, setLogs] = useState([]);
  const [statusMsg, setStatusMsg] = useState("Ready to connect");
  const [statusType, setStatusType] = useState("neutral"); // neutral, success, error

  // Refs for managing streams and scrolling
  const logsEndRef = useRef(null);
  const keepReadingRef = useRef(false);
  const portRef = useRef(null); // Keep a ref to the port for cleanup access
  const readerRef = useRef(null);
  const writerRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  // Helper to add logs
  const addLog = useCallback((type, message) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit', fractionalSecondDigits: 3 });
    setLogs(prev => [...prev, { id: Date.now() + Math.random(), type, message, timestamp }]);
  }, []);

  // 2. Read Loop
  const readLoop = async (currentPort) => {
    const textDecoder = new TextDecoderStream();
    // Pipe the port data to the decoder
    const readableStreamClosed = currentPort.readable.pipeTo(textDecoder.writable);
    const newReader = textDecoder.readable.getReader();
    setReader(newReader);
    readerRef.current = newReader;
    setIsReading(true);

    try {
      while (keepReadingRef.current && currentPort.readable) {
        const { value, done } = await newReader.read();
        if (done) {
          // Reader has been canceled.
          break;
        }
        if (value) {
          addLog('rx', value);
        }
      }
    } catch (error) {
      console.error("Read error:", error);
      addLog('error', `Read Error: ${error.message}`);
    } finally {
      newReader.releaseLock();
      setIsReading(false);
    }
  };

  // 3. Disconnect Function
  // Defined before useEffect so it can be used there
  const disconnectDevice = useCallback(async () => {
    try {
      keepReadingRef.current = false; // Stop the read loop
      
      if (readerRef.current) {
        await readerRef.current.cancel();
        readerRef.current = null;
        setReader(null);
      }
      
      if (writerRef.current) {
        writerRef.current.releaseLock();
        writerRef.current = null;
        setWriter(null);
      }

      if (portRef.current) {
        await portRef.current.close();
        portRef.current = null;
      }
      
      setPort(null);
      setIsConnected(false);
      setStatusMsg("Disconnected");
      setStatusType("neutral");
      addLog('system', 'Disconnected.');
    } catch (error) {
      console.error("Disconnect error:", error);
      addLog('error', `Disconnect Error: ${error.message}`);
    }
  }, [addLog]);

  // 1. Connect Function
  const connectToDevice = async () => {
    try {
      setStatusMsg("Requesting device...");
      
      // Request the port with the specific RFCOMM GUID filter
      const selectedPort = await navigator.serial.requestPort({
        filters: [{ bluetoothServiceClassId: SERVICE_GUID }]
      });

      setStatusMsg("Opening port...");
      
      // Open port - baudRate is required by API but ignored for Bluetooth RFCOMM
      await selectedPort.open({ baudRate: 9600 });
      
      portRef.current = selectedPort;
      setPort(selectedPort);
      setIsConnected(true);
      setStatusMsg("Connected");
      setStatusType("success");
      addLog('system', 'Connected to device.');

      // Setup Writer
      const textEncoder = new TextEncoderStream();
      const writableStreamClosed = textEncoder.readable.pipeTo(selectedPort.writable);
      const newWriter = textEncoder.writable.getWriter();
      setWriter(newWriter);
      writerRef.current = newWriter;

      // Start Reading
      keepReadingRef.current = true;
      readLoop(selectedPort);

    } catch (error) {
      console.error(error);
      setStatusMsg(`Connection failed: ${error.message}`);
      setStatusType("error");
      addLog('error', `Connection failed: ${error.message}`);
    }
  };

  // 4. Send Data
  const handleSend = async () => {
    if (!writer || !data) return;
    
    try {
      // Convert data to JSON string and append newline
      const payload = JSON.stringify(data);
      const dataToSend = payload + "\n"; 
      
      await writer.write(dataToSend);
      addLog('tx', `Sent ${payload.length} bytes`);
    } catch (error) {
      addLog('error', `Send Error: ${error.message}`);
    }
  };

  // Reset state when modal opens/closes
  useEffect(() => {
    if (show) {
      setLogs([]);
      setStatusMsg("Ready to connect");
      setStatusType("neutral");
      // Check browser support
      if (!("serial" in navigator)) {
        setStatusMsg("Web Serial API is not supported in this browser.");
        setStatusType("error");
      }
    } else {
        // Cleanup on close
        // We use the ref-based disconnect to avoid closure staleness
        disconnectDevice();
    }
  }, [show, disconnectDevice]);


  if (!show) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{textAlign:'left', maxWidth: '600px', display: 'flex', flexDirection: 'column', height: '80vh'}}>
        <h3 style={{marginTop:0}}>Bluetooth Transmission</h3>
        
        <div style={{marginBottom: 16, padding: '8px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px'}}>
             <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px'}}>
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%', 
                    background: statusType === 'success' ? '#10b981' : statusType === 'error' ? '#ef4444' : '#64748b'
                }} />
                <span style={{fontSize: '14px', fontFamily: 'monospace'}}>{statusMsg}</span>
             </div>
             
             {!isConnected ? (
                <button onClick={connectToDevice} className="btn" style={{width: '100%'}}>
                   Connect to Device
                </button>
             ) : (
                 <div style={{display: 'flex', gap: '8px'}}>
                    <button onClick={handleSend} className="btn" style={{flex: 1}}>
                       Send Data
                    </button>
                    <button onClick={disconnectDevice} className="btn small" style={{width: 'auto'}}>
                       Disconnect
                    </button>
                 </div>
             )}
        </div>

        {/* Console Output */}
        <div style={{
            flex: 1, 
            overflowY: 'auto', 
            background: '#0f172a', 
            padding: '12px', 
            borderRadius: '4px',
            fontFamily: 'monospace',
            fontSize: '12px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
        }}>
          {logs.length === 0 && (
            <div style={{color: '#64748b', textAlign: 'center', marginTop: '20px'}}>
              Waiting for connection...
            </div>
          )}
          
          {logs.map((log) => (
            <div key={log.id} style={{
              color: log.type === 'tx' ? '#93c5fd' : 
                     log.type === 'rx' ? '#6ee7b7' : 
                     log.type === 'error' ? '#f87171' : '#94a3b8',
              display: 'flex',
              gap: '8px'
            }}>
              <span style={{opacity: 0.5}}>{log.timestamp}</span>
              <span style={{wordBreak: 'break-all'}}>{log.message}</span>
            </div>
          ))}
          <div ref={logsEndRef} />
        </div>

        <div style={{marginTop: 16, display: 'flex', justifyContent: 'flex-end'}}>
             <button onClick={onClose} className="btn small">Close</button>
        </div>
      </div>
    </div>
  );
}
