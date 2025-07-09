import React, { useEffect, useState, useCallback } from 'react';
import { Unity, useUnityContext } from 'react-unity-webgl';
import './App.css';

// Unity Game Component
const UnityGame = ({ walletAddress, onLog, onGameEvent, securityStatus }) => {
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

  // 🎯 SIMPLE MIRROR: Handle Unity's ReadyToWalletAddress event - EXACTLY like test button (UNCHANGED)
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

  // Handle Game Over event (UNCHANGED)
  const handleGameOver = useCallback(() => {
    onLog('🎮 Game Over received from Unity', 'info');
    onGameEvent('gameover');
  }, [onLog, onGameEvent]);

  // ✅ Set up Unity event listeners - EXACTLY like the old working system (UNCHANGED)
  useEffect(() => {
    addEventListener('ReadyToWalletAddress', handleReadyToWalletAddress);
    addEventListener('GameOver', handleGameOver);

    return () => {
      removeEventListener('ReadyToWalletAddress', handleReadyToWalletAddress);
      removeEventListener('GameOver', handleGameOver);
    };
  }, [addEventListener, removeEventListener, handleReadyToWalletAddress, handleGameOver]);

  // Log Unity status (ENHANCED)
  useEffect(() => {
    onLog(`🎮 Unity Provider: ${unityProvider ? 'Ready' : 'Loading...'}`, 'info');
    onLog(`📊 Loading Progress: ${Math.round(loadingProgression * 100)}%`, 'progress');
    onLog(`🎯 Game Loaded: ${isLoaded}`, 'info');
    onLog(`🛡️ Security Status: ${securityStatus.level}`, securityStatus.level === 'secure' ? 'success' : 'warning');
  }, [unityProvider, loadingProgression, isLoaded, onLog, securityStatus]);

  // Game loaded event (UNCHANGED)
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

  // Test wallet communication - ORIGINAL working version (UNCHANGED)
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
      {/* Performance Overlay (ENHANCED) */}
      {isLoaded && (
        <div className="performance-overlay">
          <div>FPS: {performanceData.fps}</div>
          <div>RAM: {performanceData.memory}MB</div>
          <div>Load: {performanceData.loadTime}ms</div>
          {walletAddress && <div>Wallet: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</div>}
          <div className={gameFullyLoaded ? 'status-ready' : 'status-waiting'}>
            {gameFullyLoaded ? '✅ Simple Mirror Success!' : '⏳ Waiting for Unity'}
          </div>
          <div className={`status-${securityStatus.level}`}>
            {securityStatus.level === 'secure' ? '🛡️ Secured' : 
             securityStatus.level === 'warning' ? '⚠️ Warning' : '🔓 Dev Mode'}
          </div>
        </div>
      )}

      {/* Loading Overlay (ENHANCED) */}
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
            <div style={{ 
              fontSize: '12px', 
              color: securityStatus.level === 'secure' ? '#60a5fa' : '#fbbf24', 
              marginTop: '10px' 
            }}>
              🛡️ Security: {securityStatus.level}
            </div>
          </div>
        </div>
      )}

      {/* Unity Canvas (ENHANCED with security border) */}
      <Unity 
        unityProvider={unityProvider}
        className="unity-canvas"
        style={{
          width: 1024,
          height: 768,
          border: `3px solid ${
            securityStatus.level === 'secure' ? '#60a5fa' : 
            securityStatus.level === 'warning' ? '#fbbf24' : '#FF8C00'
          }`,
          borderRadius: "8px",
          background: "#000"
        }}
      />

      {/* Game Controls (ENHANCED) */}
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
            <span className={`text-${securityStatus.level === 'secure' ? 'blue' : 'yellow'}-400`}>
              🛡️ Security: {securityStatus.level}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component with Enhanced Security
function App() {
  const [logs, setLogs] = useState([]);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState('idle');
  const [systemInfo, setSystemInfo] = useState({});
  const [walletAddress, setWalletAddress] = useState(null);
  const [securityStatus, setSecurityStatus] = useState({
    level: 'checking',
    message: 'Checking security...',
    originVerified: false,
    tokenVerified: false
  });

  // 🛡️ ENHANCED PHASE 1: Security configuration
  const getSecurityConfig = () => {
    const isDev = process.env.NODE_ENV === 'development';
    const currentOrigin = window.location.origin;
    
    // Base configuration
    const config = {
      // Production domains
      production: [
        'https://swarm-resistance-frontend-dev.vercel.app',
        'https://uwp-dev-q7a.vercel.app',
        'https://www.cryptomeda.tech',
        'https://cryptomeda.tech'
      ],
      // Development domains
      development: [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:8080',
        'http://127.0.0.1:3000',
        'http://127.0.0.1:5173'
      ],
      // Custom domains from environment variables
      custom: []
    };

    // Add custom domains from environment variables
    if (process.env.REACT_APP_ALLOWED_DOMAINS) {
      const customDomains = process.env.REACT_APP_ALLOWED_DOMAINS.split(',').map(d => d.trim());
      config.custom = customDomains;
    }

    // Combine all allowed domains
    const allowedDomains = [
      ...config.production,
      ...(isDev ? config.development : []),
      ...config.custom
    ];

    return {
      allowedDomains,
      isDev,
      currentOrigin,
      securityEnabled: !isDev || process.env.REACT_APP_ENABLE_SECURITY === 'true'
    };
  };

  // 🛡️ ENHANCED PHASE 1: Security verification
  const verifySecurityContext = useCallback(() => {
    const securityConfig = getSecurityConfig();
    const urlParams = new URLSearchParams(window.location.search);
    
    // Get security parameters
    const originParam = urlParams.get('origin');
    const tokenParam = urlParams.get('token');
    
    let securityLevel = 'insecure';
    let message = 'Security check failed';
    let originVerified = false;
    let tokenVerified = false;

    // Check if security is enabled
    if (!securityConfig.securityEnabled) {
      securityLevel = 'development';
      message = 'Development mode - security disabled';
      originVerified = true;
      tokenVerified = true;
    } else {
      // Verify origin parameter
      if (originParam && securityConfig.allowedDomains.includes(originParam)) {
        originVerified = true;
      }
      
      // Verify token (simple timestamp-based verification)
      if (tokenParam) {
        try {
          const decoded = atob(tokenParam);
          const [origin, timestamp] = decoded.split(':');
          const age = Date.now() - parseInt(timestamp);
          
          // Token valid for 1 hour
          if (age < 60 * 60 * 1000 && origin === originParam) {
            tokenVerified = true;
          }
        } catch (error) {
          console.warn('Invalid token format');
        }
      }
      
      // Determine security level
      if (originVerified && tokenVerified) {
        securityLevel = 'secure';
        message = 'Security verification passed';
      } else if (originVerified) {
        securityLevel = 'warning';
        message = 'Origin verified but token missing/invalid';
      } else {
        securityLevel = 'insecure';
        message = 'Unauthorized access detected';
      }
    }

    const status = {
      level: securityLevel,
      message,
      originVerified,
      tokenVerified,
      details: {
        originParam,
        tokenParam: tokenParam ? 'present' : 'missing',
        allowedDomains: securityConfig.allowedDomains,
        securityEnabled: securityConfig.securityEnabled
      }
    };

    setSecurityStatus(status);
    addLog(`🛡️ Security Status: ${message}`, 
      securityLevel === 'secure' ? 'success' : 
      securityLevel === 'warning' ? 'warning' : 'error');
    
    return status;
  }, []);

  // 🛡️ ENHANCED PHASE 1: Wallet parameter extraction with security
  useEffect(() => {
    const securityStatus = verifySecurityContext();
    
    const urlParams = new URLSearchParams(window.location.search);
    const address = urlParams.get('wallet');
    
    if (address) {
      // Basic wallet address validation
      const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
      
      if (isValidAddress) {
        // Only set wallet if security check passed or in development
        if (securityStatus.level === 'secure' || securityStatus.level === 'development') {
          setWalletAddress(address);
          addLog(`🔗 Wallet address received: ${address}`, 'success');
        } else {
          addLog(`🚫 Wallet blocked due to security check: ${address}`, 'warning');
        }
      } else {
        addLog(`❌ Invalid wallet address format: ${address}`, 'error');
      }
    } else {
      addLog('ℹ️ No wallet parameter provided', 'info');
    }
  }, [verifySecurityContext]);

  // Enhanced logging (UNCHANGED)
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

  // Gather system info (ENHANCED)
  useEffect(() => {
    const info = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language,
      cookieEnabled: navigator.cookieEnabled,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: navigator.deviceMemory || 'Unknown',
      connection: navigator.connection?.effectiveType || 'Unknown',
      referrer: document.referrer || 'none',
      origin: window.location.origin
    };
    
    setSystemInfo(info);
    addLog('🖥️ System information gathered', 'info');
    addLog(`🌐 Origin: ${info.origin}`, 'info');
    addLog(`🔗 Referrer: ${info.referrer}`, 'info');
  }, [addLog]);

  // Game event handler (UNCHANGED)
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

  // 🛡️ ENHANCED PHASE 1: Message handler with enhanced security
  useEffect(() => {
    const handleMessage = (event) => {
      const securityConfig = getSecurityConfig();
      
      // Enhanced security check
      if (securityConfig.securityEnabled) {
        if (!securityConfig.allowedDomains.includes(event.origin)) {
          addLog(`🚫 Message blocked from unauthorized origin: ${event.origin}`, 'error');
          return;
        }
      }
      
      addLog(`📥 Message received from ${event.origin}`, 'info');
      
      if (event.data.type === 'SET_WALLET_ADDRESS') {
        const address = event.data.address;
        const isValidAddress = /^0x[a-fA-F0-9]{40}$/.test(address);
        
        if (isValidAddress) {
          setWalletAddress(address);
          addLog(`🔗 Wallet updated via secure postMessage: ${address}`, 'success');
        } else {
          addLog(`❌ Invalid wallet address: ${address}`, 'error');
        }
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [addLog]);

  // Test Unity files (UNCHANGED)
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

  // Start game (ENHANCED)
  const startGame = () => {
    addLog('🚀 Starting Unity WebGL with enhanced security...', 'info');
    addLog(`🛡️ Security Level: ${securityStatus.level}`, 
      securityStatus.level === 'secure' ? 'success' : 'warning');
    setGameStarted(true);
    setGameState('loading');
  };

  return (
    <div className="app">
      {/* Header (ENHANCED) */}
      <header className="app-header">
        <h1>🎮 MedaShooter - Web3 Game</h1>
        <p>Development Environment - Enhanced Security ✅</p>
        {walletAddress && (
          <div className="wallet-info">
            Connected: {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}
            <span style={{ 
              color: securityStatus.level === 'secure' ? '#60a5fa' : '#fbbf24', 
              marginLeft: '10px' 
            }}>
              {securityStatus.level === 'secure' ? '🛡️' : 
               securityStatus.level === 'warning' ? '⚠️' : '🔓'}
            </span>
          </div>
        )}
      </header>

      {/* Status Dashboard (ENHANCED) */}
      <div className="dashboard">
        <div className="status-card">
          <h3>🎯 Game Status</h3>
          <div className="status-grid">
            <span>State:</span><span className={`status-${gameState}`}>{gameState.toUpperCase()}</span>
            <span>Started:</span><span>{gameStarted ? 'Yes' : 'No'}</span>
            <span>Wallet:</span><span>{walletAddress ? 'Connected' : 'Not Connected'}</span>
            <span>Security:</span><span className={`text-${
              securityStatus.level === 'secure' ? 'blue' : 
              securityStatus.level === 'warning' ? 'yellow' : 'red'
            }-400`}>
              {securityStatus.level === 'secure' ? 'Secure 🛡️' : 
               securityStatus.level === 'warning' ? 'Warning ⚠️' : 
               securityStatus.level === 'development' ? 'Dev Mode 🔓' : 'Insecure 🚫'}
            </span>
          </div>
        </div>

        <div className="status-card">
          <h3>🛡️ Security Info</h3>
          <div className="status-grid">
            <span>Level:</span><span className={`text-${
              securityStatus.level === 'secure' ? 'green' : 
              securityStatus.level === 'warning' ? 'yellow' : 'red'
            }-400`}>{securityStatus.level.toUpperCase()}</span>
            <span>Origin:</span><span>{securityStatus.originVerified ? '✅' : '❌'}</span>
            <span>Token:</span><span>{securityStatus.tokenVerified ? '✅' : '❌'}</span>
            <span>Message:</span><span className="text-sm">{securityStatus.message}</span>
          </div>
        </div>
      </div>

      {/* Controls (UNCHANGED) */}
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

      {/* Unity Game (ENHANCED) */}
      {gameStarted && (
        <div className="game-section">
          <UnityGame 
            walletAddress={walletAddress}
            onLog={addLog} 
            onGameEvent={handleGameEvent}
            securityStatus={securityStatus}
          />
        </div>
      )}

      {/* Debug Console (UNCHANGED) */}
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