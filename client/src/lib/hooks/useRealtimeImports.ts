'use client';

import { useState, useEffect } from 'react';
import io from 'socket.io-client';
import { ImportLog } from '@/lib/types';

export function useRealtimeImports(apiUrl: string) {
  const [imports, setImports] = useState<ImportLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let socket: any = null;
    let pollInterval: NodeJS.Timeout | null = null;

    const fetchImports = async () => {
      try {
        const response = await fetch(`${apiUrl}/api/imports/history`);
        if (response.ok) {
          const result = await response.json();
          setImports(result.data?.imports || result.data || []);
          setError(null);
        } else {
          setError('Failed to fetch imports');
        }
      } catch (err) {
        console.error('Error fetching imports:', err);
        setError('Failed to fetch imports');
      } finally {
        setLoading(false);
      }
    };

    const startPolling = () => {
      if (pollInterval) return;
      console.log('Starting polling fallback');
      pollInterval = setInterval(fetchImports, 5000);
      fetchImports();
    };

    try {
      socket = io(apiUrl, {
        transports: ['websocket', 'polling'],
        timeout: 5000,
      });

      socket.on('connect', () => {
        console.log('Connected to WebSocket');
        setLoading(false);
      });

      socket.on('import-completed', (data: ImportLog) => {
        console.log('Import completed:', data);
        fetchImports();
      });

      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket');
        startPolling();
      });

      socket.on('error', (err: Error) => {
        console.error('WebSocket error:', err);
        setError(err.message);
        startPolling();
      });
    } catch (err) {
      console.error('Failed to connect to WebSocket:', err);
      startPolling();
    }

    fetchImports();

    return () => {
      if (socket) {
        socket.disconnect();
      }
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [apiUrl]);

  return { imports, loading, error };
}