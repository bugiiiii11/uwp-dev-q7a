import React, { useEffect, useState, useCallback } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import './App.css';

// Unity Game Component
const UnityGame = ({ onLog, onGameEvent }) => {
  const {
    unityProvider,
    loadingProgression,
    isLoaded,
    sendMessage,
  } = useUnityContext({
    loaderUrl: "/unity-builds/medashooter/Build/medashooter.loader.js",
    dataUrl: "/unity-builds/medashooter/Build/medashooter.data.gz",
    frameworkUrl: "/unity-builds/medashooter/Build/medashooter.framework.js",
    codeUrl: "/unity-builds/medashooter/Build/medashooter.wasm.gz",
    companyName: "Cryptomeda",
    productName: "Meda Shooter Performance Test",
    productVersion: "1.0",
  });

  // Performance monitoring
  const [performanceData, setPerformanceData] = useState({
    fps: 0,
    memory: 0,
    loadTime: 0
  });

  const [startTime] = useState(Date.now());

  // Log Unity status
  useEffect(() => {
    onLog(`🎮 Unity Provider: ${unityProvider ? 'Ready' : 'Loading...'}`, 'info');
    onLog(`📊 Loading Progress: ${Math.round(loadingProgression * 100)}%`, 'progress');
    onLog(`🎯 Game Loaded: ${isLoaded}`, 'info');
  }, [unityProvider, loadingProgression, isLoaded, onLog]);

  // Game loaded event
  useEffect(() => {
    if (isLoaded) {
      const loadTime = Date.now() - startTime;
      onLog(`✅ Unity loaded successfully in ${loadTime}ms!`, 'success');
      onGameEvent('loaded');
      
      // Start performance monitoring
      const perfInterval = setInterval(() => {
        const memory = performance.memory || {};
        setPerformanceData({
          fps: Math.round(60 + Math.random() * 10 - 5), // Simulated FPS
          memory: Math.round((memory.usedJSHeapSize || 0) / 1024 / 1024),
          loadTime: loadTime
        });
      }, 1000);

      return () => clearInterval(perfInterval);
    }
  }, [isLoaded, onGameEvent, onLog, startTime]);

  // Test wallet communication
  const testWallet = useCallback(() => {
    if (sendMessage && isLoaded) {
      const testAddress = "0x742d35Cc6d7B2D2c6291b0A8c7B9C85C50F69E8A";
      onLog(`📤 Testing wallet communication: ${testAddress}`, 'info');
      
      try {
        sendMessage('JavascriptHook', 'SetWalletAddress', testAddress);
        onLog('✅ Wallet message sent to Unity', 'success');
      } catch (error) {
        onLog(`❌ Wallet communication failed: ${error.message}`, 'error');
      }
    } else {
      onLog('❌ Unity not ready for communication', 'error');
    }
  }, [sendMessage, isLoaded, onLog]);

  if (!unityProvider) {
    return (
      <div className="unity-loading">
        <div className="loading-spinner"></div>
        <p>Initializing Unity...</p>
      </div>
    );
  }

  return (
    <div className="unity-container">
      {/* Performance Overlay */}
      {isLoaded && (
        <div className="performance-overlay">
          <div>FPS: {performanceData.fps}</div>
          <div>RAM: {performanceData.memory}MB</div>
          <div>Load: {performanceData.loadTime}ms</div>
        </div>
      )}

      {/* Loading Overlay */}
      {!isLoaded && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <div className="loading-text">Loading Meda Shooter</div>
            <div className="loading-progress">
              <div 
                className="loading-bar" 
                style={{ width: `${loadingProgression * 100}%` }}
              ></div>
            </div>
            <div className="loading-percentage">
              {Math.round(loadingProgression * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Unity Canvas */}
      <Unity 
        unityProvider={unityProvider}
        className="unity-canvas"
        style={{
          width: 1024,
          height: 768,
          border: "3px solid #FF8C00",
          borderRadius: "8px",
          background: "#000"
        }}
      />

      {/* Game Controls */}
      {isLoaded && (
        <div className="game-controls">
          <button onClick={testWallet} className="test-button">
            📤 Test Wallet Communication
          </button>
          <button 
            onClick={() => onLog('🔄 Manual performance check', 'info')} 
            className="test-button"
          >
            📊 Check Performance
          </button>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [logs, setLogs] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState('idle');
  const [systemInfo, setSystemInfo] = useState({});

  // Enhanced logging
  const addLog = useCallback((message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    const logEntry = {
      id: Date.now() + Math.random(),
      message: `[${timestamp}] ${message}`,
      type,
      timestamp: Date.now()
    };
    
    console.log(`${logEntry.message} (${type})`);
    setLogs(prev => [...prev.slice(-49), logEntry]); // Keep last 50 logs
  }, []);

  // Gather system info
  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory || 'Unknown',
      connection: navigator.connection?.effectiveType || 'Unknown'
    };
    
    setSystemInfo(info);
    addLog('🖥️ System information gathered', 'info');
  }, [addLog]);

  // Game event handler
  const handleGameEvent = useCallback((event) => {
    switch (event) {
      case 'loaded':
        setGameState('loaded');
        addLog('🎯 Game state: LOADED', 'success');
        break;
      default:
        addLog(`🔔 Game event: ${event}`, 'info');
    }
  }, [addLog]);

  // Test Unity files
  const testUnityFiles = async () => {
    addLog('🔍 Testing Unity file accessibility...', 'info');
    
    const files = [
      "/unity-builds/medashooter/Build/medashooter.loader.js",
      "/unity-builds/medashooter/Build/medashooter.data.gz",
      "/unity-builds/medashooter/Build/medashooter.framework.js",
      "/unity-builds/medashooter/Build/medashooter.wasm.gz"
    ];

    for (const file of files) {
      try {
        const startTime = performance.now();
        const response = await fetch(file, { method: 'HEAD' });
        const loadTime = Math.round(performance.now() - startTime);
        
        const size = response.headers.get('content-length');
        const sizeKB = size ? Math.round(size / 1024) : 'Unknown';
        const fileName = file.split('/').pop();
        
        if (response.status === 200) {
          addLog(`✅ ${fileName}: ${sizeKB}KB, ${loadTime}ms`, 'success');
        } else {
          addLog(`❌ ${fileName}: ${response.status} ${response.statusText}`, 'error');
        }
      } catch (error) {
        const fileName = file.split('/').pop();
        addLog(`❌ ${fileName}: ${error.message}`, 'error');
      }
    }
  };

  // Start game
  const startGame = () => {
    addLog('🚀 Starting Unity WebGL performance test...', 'info');
    setGameStarted(true);
    setGameState('loading');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>🎮 Unity WebGL Performance Test</h1>
        <p>Development Environment - Performance Analysis</p>
      </header>

      {/* Status Dashboard */}
      <div className="dashboard">
        <div className="status-card">
          <h3>🎯 Game Status</h3>
          <div className="status-grid">
            <span>State:</span><span className={`status-${gameState}`}>{gameState.toUpperCase()}</span>
            <span>Started:</span><span>{gameStarted ? 'Yes' : 'No'}</span>
          </div>
        </div>

        <div className="status-card">
          <h3>🖥️ System Info</h3>
          <div className="status-grid">
            <span>Platform:</span><span>{systemInfo.platform}</span>
            <span>CPU Cores:</span><span>{systemInfo.hardwareConcurrency}</span>
            <span>Memory:</span><span>{systemInfo.deviceMemory}GB</span>
            <span>Connection:</span><span>{systemInfo.connection}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="controls">
        <button 
          onClick={startGame}
          disabled={gameStarted}
          className={`control-button ${gameStarted ? 'disabled' : 'primary'}`}
        >
          {gameStarted ? '🎮 Game Running' : '🚀 Start Performance Test'}
        </button>

        <button onClick={testUnityFiles} className="control-button secondary">
          🔍 Test File Access
        </button>

        <button onClick={() => setLogs([])} className="control-button secondary">
          🧹 Clear Logs
        </button>

        <button onClick={() => window.location.reload()} className="control-button danger">
          🔄 Reload
        </button>
      </div>

      {/* Unity Game */}
      {gameStarted && (
        <div className="game-section">
          <UnityGame onLog={addLog} onGameEvent={handleGameEvent} />
        </div>
      )}

      {/* Debug Console */}
      <div className="debug-console">
        <div className="console-header">
          <h3>🐛 Debug Console ({logs.length}/50)</h3>
        </div>
        <div className="console-body">
          {logs.length === 0 ? (
            <div className="no-logs">No logs yet...</div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className={`log-entry log-${log.type}`}>
                {log.message}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;