import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useEditorStore } from '@/store/use-editor-store';
import { useAuth } from './use-auth';

// Define the events we expect based on implementation notes
interface ServerToClientEvents {
  'user-joined': (data: { userId: string, username: string }) => void;
  'user-left': (data: { userId: string }) => void;
  'code-change': (data: { fileId: string, content: string, userId: string }) => void;
  'cursor-move': (data: { userId: string, position: any }) => void;
  'user-typing': (data: { userId: string }) => void;
  'user-stopped-typing': (data: { userId: string }) => void;
  'terminal-output': (data: { text: string, type: 'info'|'error'|'success'|'system' }) => void;
}

interface ClientToServerEvents {
  'join-room': (data: { roomId: string, userId: string }) => void;
  'leave-room': (data: { roomId: string, userId: string }) => void;
  'code-change': (data: { roomId: string, fileId: string, content: string, userId: string }) => void;
  'cursor-move': (data: { roomId: string, userId: string, position: any }) => void;
  'user-typing': (data: { roomId: string, userId: string }) => void;
  'user-stopped-typing': (data: { roomId: string, userId: string }) => void;
  'run-code': (data: { roomId: string, fileId: string }) => void;
}

export function useWebSocket(roomId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeTypers, setActiveTypers] = useState<Set<string>>(new Set());
  const socketRef = useRef<Socket<ServerToClientEvents, ClientToServerEvents> | null>(null);
  const { user } = useAuth();
  const { updateFileContent, addTerminalOutput } = useEditorStore();

  useEffect(() => {
    if (!roomId || !user) return;

    // Connect to same origin via our API server path
    const socket = io({
      path: '/api/socket.io',
      reconnectionDelayMax: 10000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      setIsConnected(true);
      socket.emit('join-room', { roomId, userId: user.id });
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('code-change', ({ fileId, content, userId }) => {
      if (userId !== user.id) {
        updateFileContent(fileId, content);
      }
    });

    socket.on('user-typing', ({ userId }) => {
      setActiveTypers(prev => new Set(prev).add(userId));
    });

    socket.on('user-stopped-typing', ({ userId }) => {
      setActiveTypers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });
    });

    socket.on('terminal-output', (data) => {
      addTerminalOutput(data);
    });

    return () => {
      socket.emit('leave-room', { roomId, userId: user.id });
      socket.disconnect();
    };
  }, [roomId, user]);

  const emitCodeChange = (fileId: string, content: string) => {
    if (socketRef.current && roomId && user) {
      socketRef.current.emit('code-change', { roomId, fileId, content, userId: user.id });
    }
  };

  const emitTyping = (isTyping: boolean) => {
    if (socketRef.current && roomId && user) {
      socketRef.current.emit(isTyping ? 'user-typing' : 'user-stopped-typing', { roomId, userId: user.id });
    }
  };

  const emitRunCode = (fileId: string) => {
    if (socketRef.current && roomId && user) {
      socketRef.current.emit('run-code', { roomId, fileId });
      addTerminalOutput({ text: `Executing file...`, type: 'system' });
    }
  };

  return {
    isConnected,
    activeTypers,
    emitCodeChange,
    emitTyping,
    emitRunCode
  };
}
