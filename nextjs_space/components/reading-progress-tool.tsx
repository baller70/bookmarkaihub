
'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Book, RotateCcw, Clock, Check, Play } from 'lucide-react';
import { toast } from 'sonner';

interface ReadingProgressToolProps {
  bookmarkId: string;
}

interface ReadingProgress {
  id: string;
  scrollPosition: number;
  currentSection: string | null;
  estimatedTimeLeft: number;
  totalSections: number;
  completedSections: number;
  lastReadAt: string;
}

export function ReadingProgressTool({ bookmarkId }: ReadingProgressToolProps) {
  const [progress, setProgress] = useState<ReadingProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProgress();
  }, [bookmarkId]);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/reading-progress/${bookmarkId}`);
      if (response.ok) {
        const data = await response.json();
        setProgress(data);
      }
    } catch (error) {
      console.error('Error fetching reading progress:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (updates: Partial<ReadingProgress>) => {
    try {
      const response = await fetch(`/api/reading-progress/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scrollPosition: updates.scrollPosition ?? progress?.scrollPosition ?? 0,
          currentSection: updates.currentSection ?? progress?.currentSection,
          estimatedTimeLeft: updates.estimatedTimeLeft ?? progress?.estimatedTimeLeft ?? 0,
          totalSections: updates.totalSections ?? progress?.totalSections ?? 1,
          completedSections: updates.completedSections ?? progress?.completedSections ?? 0,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setProgress(data);
        toast.success('Progress updated');
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  };

  const resetProgress = async () => {
    if (!confirm('Are you sure you want to reset your reading progress?')) return;

    try {
      const response = await fetch(`/api/reading-progress/${bookmarkId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setProgress(null);
        toast.success('Progress reset');
      }
    } catch (error) {
      console.error('Error resetting progress:', error);
      toast.error('Failed to reset progress');
    }
  };

  const markAsRead = () => {
    updateProgress({
      scrollPosition: 100,
      completedSections: progress?.totalSections || 1,
    });
  };

  const resumeReading = () => {
    toast.success('Opening bookmark to resume reading...');
    // In a real implementation, this would navigate to the bookmark with scroll position
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const completionPercentage = progress
    ? Math.round((progress.completedSections / progress.totalSections) * 100)
    : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Book className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900">READING PROGRESS</h3>
        </div>
        {progress && (
          <Button variant="outline" size="sm" onClick={resetProgress}>
            <RotateCcw className="h-4 w-4 mr-1" />
            RESET
          </Button>
        )}
      </div>

      {!progress ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Book className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600 mb-4">No reading progress tracked yet</p>
          <Button
            onClick={() =>
              updateProgress({
                scrollPosition: 0,
                completedSections: 0,
                totalSections: 1,
                estimatedTimeLeft: 10,
              })
            }
          >
            <Play className="h-4 w-4 mr-2" />
            START TRACKING
          </Button>
        </div>
      ) : (
        <>
          {/* Progress Overview */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700 font-medium">OVERALL PROGRESS</span>
                <span className="text-2xl font-bold text-blue-600">{completionPercentage}%</span>
              </div>
              <Progress value={completionPercentage} className="h-3" />
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Completed Sections</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {progress.completedSections} / {progress.totalSections}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Estimated Time Left</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {progress.estimatedTimeLeft} min
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Current Position */}
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">CURRENT POSITION</p>
                <p className="font-medium text-gray-900">
                  {progress.scrollPosition.toFixed(1)}% through the content
                </p>
                {progress.currentSection && (
                  <p className="text-sm text-gray-600 mt-1">
                    Section: {progress.currentSection}
                  </p>
                )}
              </div>
              <Button size="sm" onClick={resumeReading}>
                <Play className="h-4 w-4 mr-2" />
                RESUME
              </Button>
            </div>
          </div>

          {/* Last Read */}
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Clock className="h-4 w-4" />
            <span>
              Last read {new Date(progress.lastReadAt).toLocaleDateString()} at{' '}
              {new Date(progress.lastReadAt).toLocaleTimeString()}
            </span>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button className="flex-1" onClick={markAsRead} disabled={completionPercentage === 100}>
              <Check className="h-4 w-4 mr-2" />
              MARK AS READ
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() =>
                updateProgress({
                  completedSections: Math.min(
                    progress.completedSections + 1,
                    progress.totalSections
                  ),
                  scrollPosition: Math.min(
                    ((progress.completedSections + 1) / progress.totalSections) * 100,
                    100
                  ),
                })
              }
              disabled={completionPercentage === 100}
            >
              COMPLETE SECTION
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
