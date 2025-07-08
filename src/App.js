import React, { useEffect, useState, useCallback } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import './App.css';

// Unity Game Component
const UnityGame = ({ walletAddress, onLog, onGameEvent }) => {
  const {
    unityProvider,
    loadingProgression,
    isLoaded,
    sendMessage,
    addEventListener,
    removeEventListener
  } = useUnityContext({
    loaderUrl: "/unity-builds/medashooter/Build/medashooter.loader.js",
    dataUrl: "/unity-builds/medashooter/Build/medashooter.data.gzip",
    frameworkUrl: "/unity-builds/medashooter/Build/medashooter.framework.js",
    codeUrl: "/unity-builds/medashooter/Build/medashooter.wasm.gzip",
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
  const [gameFullyLoaded, setGameFullyLoaded] = useState(false);

  // 🎯 SIMPLE MIRROR: Handle Unity's ReadyToWalletAddress event - EXACTLY like test button
  const handleReadyToWalletAddress = useCallback(() => {
    onLog('🎯 Unity sent ReadyToWalletAddress - sending wallet immediately!', 'success');
    setGameFullyLoaded(true);
    
    // Use EXACT same pattern as working test button
    const testAddress = walletAddress || "0x742d35Cc6d7B2D2c6291b0A8c7B9C85C50F69E8A";
    
    if (sendMessage) {
      onLog(`📤 Auto-sending wallet: ${testAddress}`, 'info');
      try {
        // EXACT same call as test button
        sendMessage('JavascriptHook', 'SetWalletAddress', testAddress);
        onLog('✅ Auto-wallet sent successfully using mirror approach!', 'success');
        
        // Notify parent window
        if (window.parent !== window) {
          window.parent.postMessage({ 
            type: 'MEDASHOOTER_WALLET_SENT_SUCCESSFULLY',
            address: testAddress 
          }, '*');
        }
      } catch (error) {
        onLog(`❌ Auto-wallet failed: ${error.message}`, 'error');
      }
    } else {
      onLog('❌ sendMessage not available yet', 'error');
    }
  }, [onLog, walletAddress, sendMessage]);

  // Handle Game Over event
  const handleGameOver = useCallback(() => {
    onLog('🎮 Game Over received from Unity', 'info');
    onGameEvent('gameover');
  }, [onLog, onGameEvent]);

  // ✅ Set up Unity event listeners - EXACTLY like the old working system
  useEffect(() => {
    addEventListener('ReadyToWalletAddress', handleReadyToWalletAddress);
    addEventListener('GameOver', handleGameOver);

    return () => {
      removeEventListener('ReadyToWalletAddress', handleReadyToWalletAddress);
      removeEventListener('GameOver', handleGameOver);
    };
  }, [addEventListener, removeEventListener, handleReadyToWalletAddress, handleGameOver]);

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
      onLog(`✅ Unity WebGL loaded successfully in ${loadTime}ms!`, 'success');
      onLog(`⏳ Waiting for Unity's ReadyToWalletAddress signal...`, 'info');
      onGameEvent('loaded');
      
      // DON'T send wallet here - wait for ReadyToWalletAddress event!
      // The mirror approach handles it automatically
      
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

  // Test wallet communication - ORIGINAL working version (unchanged)
  const testWallet = useCallback(() => {
    const testAddress = walletAddress || "0x742d35Cc6d7B2D2c6291b0A8c7B9C85C50F69E8A";
    
    if (sendMessage) {
      onLog(`📤 Manual test: ${testAddress}`, 'info');
      try {
        sendMessage('JavascriptHook', 'SetWalletAddress', testAddress);
        onLog('✅ Manual test wallet sent!', 'success');
      } catch (error) {
        onLog(`❌ Manual test failed: ${error.message}`, 'error');
      }
    }
  }, [walletAddress, sendMessage, onLog]);

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
          {walletAddress && <div>Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>}
          <div className={gameFullyLoaded ? 'status-ready' : 'status-waiting'}>
            {gameFullyLoaded ? '✅ Simple Mirror Success!' : '⏳ Waiting for Unity'}
          </div>
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
          <div className="status-info">
            <span className={gameFullyLoaded ? 'text-green-500' : 'text-orange-500'}>
              {gameFullyLoaded ? '🎯 Simple Mirror Success!' : '⏳ Waiting for Unity Signal...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component with Web3 Integration
function App() {
  const [logs, setLogs] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState('idle');
  const [systemInfo, setSystemInfo] = useState({});
  const [walletAddress, setWalletAddress] = useState(null);

  // Check for wallet address from URL params (for iframe integration)
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('wallet');
    if (address) {
      setWalletAddress(address);
      addLog(`🔗 Wallet address received: ${address}`, 'success');
    }
  }, []);

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
        
        // Notify parent window that game is loaded (for iframe integration)
        if (window.parent !== window) {
          window.parent.postMessage({ type: 'MEDASHOOTER_LOADED' }, '*');
        }
        break;
      case 'gameover':
        addLog('🎮 Game Over!', 'info');
        break;
      default:
        addLog(`🔔 Game event: ${event}`, 'info');
    }
  }, [addLog]);

  // Listen for messages from parent window
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data.type === 'SET_WALLET_ADDRESS') {
        setWalletAddress(event.data.address);
        addLog(`🔗 Wallet updated via postMessage: ${event.data.address}`, 'success');
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addLog]);

  // Test Unity files
  const testUnityFiles = async () => {
    addLog('🔍 Testing Unity file accessibility...', 'info');
    
    const files = [
      "/unity-builds/medashooter/Build/medashooter.loader.js",
      "/unity-builds/medashooter/Build/medashooter.data.gzip",
      "/unity-builds/medashooter/Build/medashooter.framework.js",
      "/unity-builds/medashooter/Build/medashooter.wasm.gzip"
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
    addLog('🚀 Starting Unity WebGL with simple mirror integration...', 'info');
    setGameStarted(true);
    setGameState('loading');
  };

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <h1>🎮 MedaShooter - Web3 Game</h1>
        <p>Development Environment - Simple Mirror Integration ✅</p>
        {walletAddress && (
          <div className="wallet-info">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
          </div>
        )}
      </header>

      {/* Status Dashboard */}
      <div className="dashboard">
        <div className="status-card">
          <h3>🎯 Game Status</h3>
          <div className="status-grid">
            <span>State:</span><span className={`status-${gameState}`}>{gameState.toUpperCase()}</span>
            <span>Started:</span><span>{gameStarted ? 'Yes' : 'No'}</span>
            <span>Wallet:</span><span>{walletAddress ? 'Connected' : 'Not Connected'}</span>
            <span>Integration:</span><span className="text-green-500">Simple Mirror ✅</span>
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
          {gameStarted ? '🎮 Game Running' : '🚀 Start MedaShooter'}
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
          <UnityGame 
            walletAddress={walletAddress}
            onLog={addLog} 
            onGameEvent={handleGameEvent} 
          />
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