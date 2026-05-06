import { useState, useEffect } from 'react';
import { LiveKitRoom, VideoConference } from '@livekit/components-react';
import '@livekit/components-styles';

const LiveVideoRoom = ({ token, roomName, onManualLeave, onDisconnected }) => {
  const [permissionError, setPermissionError] = useState(null);
  const [requested, setRequested] = useState(false);
  const serverUrl = import.meta.env.VITE_LIVEKIT_URL || 'wss://edusafe-vhg57t0e.livekit.cloud';

  const requestPermissions = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      setPermissionError(null);
      setRequested(true);
    } catch (err) {
      console.error('Permission error:', err);
      if (err.name === 'NotAllowedError') {
        setPermissionError('Camera/Microphone access denied. Please allow permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setPermissionError('No camera or microphone found on your device.');
      } else {
        setPermissionError('Could not access camera/microphone. Please check your settings.');
      }
    }
  };

  if (!requested && !permissionError) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-emerald-300 mb-4">🔒 Camera & Microphone Required</h2>
          <p className="text-gray-300 mb-6">This class needs access to your camera and microphone to participate.</p>
          <button
            onClick={requestPermissions}
            className="px-6 py-3 rounded-full bg-gradient-to-r from-emerald-600 to-cyan-600 text-white font-bold shadow-neon-emerald hover:scale-105 transition"
          >
            Allow Camera & Mic
          </button>
          <button
            onClick={onManualLeave}
            className="mt-3 px-6 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            Cancel & Leave
          </button>
        </div>
      </div>
    );
  }

  if (permissionError) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center">
        <div className="bg-black/80 backdrop-blur-xl rounded-2xl border border-red-500/30 p-8 text-center max-w-md">
          <h2 className="text-2xl font-bold text-red-400 mb-4">⚠️ Permission Error</h2>
          <p className="text-gray-300 mb-6">{permissionError}</p>
          <button
            onClick={() => {
              setPermissionError(null);
              setRequested(false);
            }}
            className="px-6 py-2 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 transition"
          >
            Try Again
          </button>
          <button
            onClick={onManualLeave}
            className="ml-3 px-6 py-2 rounded-full bg-gray-700 text-white hover:bg-gray-600 transition"
          >
            Leave Class
          </button>
        </div>
      </div>
    );
  }

  // Permissions granted → show video room with control bar at the TOP
  return (
    <div className="fixed inset-0 z-50 bg-black">
      <style>{`
        .lk-control-bar {
          position: absolute !important;
          top: 20px !important;
          bottom: auto !important;
          left: 50% !important;
          transform: translateX(-50%) !important;
          background: rgba(0,0,0,0.7) !important;
          backdrop-filter: blur(8px) !important;
          border-radius: 40px !important;
          padding: 8px 16px !important;
          z-index: 20 !important;
        }
      `}</style>
      <LiveKitRoom
        token={token}
        serverUrl={serverUrl}
        connect={true}
        onDisconnected={() => onDisconnected && onDisconnected()}
        className="w-full h-full"
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
};

export default LiveVideoRoom;