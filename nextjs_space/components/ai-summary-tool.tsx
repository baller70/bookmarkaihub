'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface AISummaryToolProps {
  bookmarkId: string;
  bookmarkTitle: string;
  bookmarkUrl: string;
}

interface AISummary {
  id: string;
  summaryType: string;
  content: string;
  keyPoints: string[];
  actionItems: string[];
  discussionQuestions: string[];
  generatedAt: string;
}

const SUMMARY_TYPES = [
  { value: 'TLDR', label: 'TL;DR Summary' },
  { value: 'KEY_POINTS', label: 'Key Points' },
  { value: 'ACTION_ITEMS', label: 'Action Items' },
  { value: 'DISCUSSION_QUESTIONS', label: 'Discussion Questions' },
  { value: 'FULL_SUMMARY', label: 'Full Summary' },
];

export function AISummaryTool({ bookmarkId, bookmarkTitle, bookmarkUrl }: AISummaryToolProps) {
  const [summaries, setSummaries] = useState<AISummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [selectedType, setSelectedType] = useState('TLDR');

  useEffect(() => {
    fetchSummaries();
  }, [bookmarkId]);

  const fetchSummaries = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/ai-summary/${bookmarkId}`);
      if (response.ok) {
        const data = await response.json();
        setSummaries(data);
      }
    } catch (error) {
      console.error('Error fetching summaries:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async () => {
    try {
      setGenerating(true);
      const response = await fetch(`/api/ai-summary/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ summaryType: selectedType }),
      });

      if (response.ok) {
        toast.success('Summary generated successfully');
        fetchSummaries();
      }
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to generate summary');
    } finally {
      setGenerating(false);
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
          <Sparkles className="h-5 w-5 text-purple-600" />
          <h3 className="font-semibold text-gray-900">AI SUMMARY & INSIGHTS</h3>
        </div>
      </div>

      {/* Generation Controls */}
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100 space-y-3">
        <Select value={selectedType} onValueChange={setSelectedType}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SUMMARY_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button onClick={generateSummary} disabled={generating} className="w-full">
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              GENERATING...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              GENERATE {SUMMARY_TYPES.find(t => t.value === selectedType)?.label}
            </>
          )}
        </Button>
      </div>

      {/* Summaries List */}
      {summaries.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No AI summaries yet</p>
          <p className="text-sm text-gray-500 mt-1">Generate insights from your bookmark content</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summaries.map((summary) => (
            <div key={summary.id} className="bg-white rounded-lg border border-gray-200 p-4 space-y-3">
              {/* Header */}
              <div className="flex items-center justify-between">
                <Badge variant="secondary">
                  {SUMMARY_TYPES.find(t => t.value === summary.summaryType)?.label || summary.summaryType}
                </Badge>
                <span className="text-xs text-gray-500">
                  {new Date(summary.generatedAt).toLocaleDateString()}
                </span>
              </div>

              {/* Content */}
              <div className="prose prose-sm max-w-none">
                {summary.content && (
                  <div className="text-gray-700 whitespace-pre-wrap">{summary.content}</div>
                )}

                {summary.keyPoints.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-semibold text-gray-900 mb-2">KEY POINTS:</h4>
                    <ul className="space-y-1">
                      {summary.keyPoints.map((point, idx) => (
                        <li key={idx} className="text-gray-700">{point}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.actionItems.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-semibold text-gray-900 mb-2">ACTION ITEMS:</h4>
                    <ul className="space-y-1">
                      {summary.actionItems.map((item, idx) => (
                        <li key={idx} className="text-gray-700">{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.discussionQuestions.length > 0 && (
                  <div className="mt-3">
                    <h4 className="font-semibold text-gray-900 mb-2">DISCUSSION QUESTIONS:</h4>
                    <ul className="space-y-1">
                      {summary.discussionQuestions.map((question, idx) => (
                        <li key={idx} className="text-gray-700">{question}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
