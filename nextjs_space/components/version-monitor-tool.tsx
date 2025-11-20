'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GitBranch, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface VersionMonitorToolProps {
  bookmarkId: string;
}

interface VersionSnapshot {
  id: string;
  contentHash: string;
  changesSummary: string | null;
  majorChange: boolean;
  diffSize: number;
  createdAt: string;
}

export function VersionMonitorTool({ bookmarkId }: VersionMonitorToolProps) {
  const [snapshots, setSnapshots] = useState<VersionSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [taking, setTaking] = useState(false);

  useEffect(() => {
    fetchSnapshots();
  }, [bookmarkId]);

  const fetchSnapshots = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/version-monitor/${bookmarkId}`);
      if (response.ok) {
        const data = await response.json();
        setSnapshots(data);
      }
    } catch (error) {
      console.error('Error fetching snapshots:', error);
    } finally {
      setLoading(false);
    }
  };

  const takeSnapshot = async () => {
    try {
      setTaking(true);
      // In a real implementation, this would fetch the current page content
      const mockContent = `Content snapshot taken at ${new Date().toISOString()}`;
      
      const response = await fetch(`/api/version-monitor/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: mockContent }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.message === 'No changes detected') {
          toast.info('No changes detected');
        } else {
          toast.success('Snapshot created');
        }
        fetchSnapshots();
      }
    } catch (error) {
      console.error('Error taking snapshot:', error);
      toast.error('Failed to create snapshot');
    } finally {
      setTaking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <GitBranch className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">VERSION MONITOR</h3>
        </div>
        <Button size="sm" onClick={takeSnapshot} disabled={taking}>
          <RefreshCw className={`h-4 w-4 mr-1 ${taking ? 'animate-spin' : ''}`} />
          TAKE SNAPSHOT
        </Button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
        <p>Track changes to this page over time. Major changes will be highlighted.</p>
      </div>

      {/* Snapshots Timeline */}
      {snapshots.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <GitBranch className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No snapshots yet</p>
          <p className="text-sm text-gray-500 mt-1">Take a snapshot to start tracking changes</p>
        </div>
      ) : (
        <div className="space-y-3">
          {snapshots.map((snapshot, idx) => (
            <div key={snapshot.id} className="bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-start gap-3">
                {/* Timeline Indicator */}
                <div className="flex flex-col items-center">
                  <div className={`w-3 h-3 rounded-full ${snapshot.majorChange ? 'bg-red-500' : 'bg-green-500'}`} />
                  {idx < snapshots.length - 1 && (
                    <div className="w-0.5 h-full bg-gray-300 mt-1" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {snapshot.majorChange && (
                      <Badge variant="destructive" className="text-xs">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        MAJOR CHANGE
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(snapshot.createdAt).toLocaleString()}
                    </span>
                  </div>
                  
                  <p className="text-sm text-gray-700">{snapshot.changesSummary || 'Snapshot taken'}</p>
                  
                  {snapshot.diffSize > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Changed: {snapshot.diffSize} characters
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
