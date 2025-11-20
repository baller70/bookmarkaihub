'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { TrendingDown, TrendingUp, DollarSign, Bell } from 'lucide-react';
import { toast } from 'sonner';

interface PriceTrackerToolProps {
  bookmarkId: string;
}

interface PriceTracker {
  id: string;
  currentPrice: number;
  originalPrice: number;
  currency: string;
  availability: string;
  priceHistory: Array<{ date: string; price: number }>;
  lowestPrice: number | null;
  highestPrice: number | null;
  alertOnDrop: boolean;
  alertThreshold: number | null;
  lastChecked: string;
}

export function PriceTrackerTool({ bookmarkId }: PriceTrackerToolProps) {
  const [tracker, setTracker] = useState<PriceTracker | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    currentPrice: '',
    currency: 'USD',
    availability: 'IN_STOCK',
    alertOnDrop: true,
    alertThreshold: '',
  });

  useEffect(() => {
    fetchTracker();
  }, [bookmarkId]);

  const fetchTracker = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/price-tracker/${bookmarkId}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setTracker(data);
          setFormData({
            currentPrice: data.currentPrice.toString(),
            currency: data.currency,
            availability: data.availability,
            alertOnDrop: data.alertOnDrop,
            alertThreshold: data.alertThreshold?.toString() || '',
          });
        } else {
          setShowForm(true);
        }
      }
    } catch (error) {
      console.error('Error fetching tracker:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.currentPrice || isNaN(Number(formData.currentPrice))) {
      toast.error('Valid price is required');
      return;
    }

    try {
      const response = await fetch(`/api/price-tracker/${bookmarkId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPrice: Number(formData.currentPrice),
          currency: formData.currency,
          availability: formData.availability,
          alertOnDrop: formData.alertOnDrop,
          alertThreshold: formData.alertThreshold ? Number(formData.alertThreshold) : null,
        }),
      });

      if (response.ok) {
        toast.success('Price tracker updated');
        setShowForm(false);
        fetchTracker();
      }
    } catch (error) {
      console.error('Error updating tracker:', error);
      toast.error('Failed to update tracker');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  const priceDiff = tracker ? tracker.currentPrice - tracker.originalPrice : 0;
  const priceDiffPercent = tracker ? ((priceDiff / tracker.originalPrice) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <DollarSign className="h-5 w-5 text-green-600" />
          <h3 className="font-semibold text-gray-900">PRICE TRACKER</h3>
        </div>
        {tracker && (
          <Button size="sm" variant="outline" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'CANCEL' : 'UPDATE PRICE'}
          </Button>
        )}
      </div>

      {!tracker && !showForm ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
          <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No price tracking yet</p>
          <Button className="mt-4" onClick={() => setShowForm(true)}>
            START TRACKING
          </Button>
        </div>
      ) : (
        <>
          {/* Form */}
          {showForm && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Input
                  type="number"
                  placeholder="Price"
                  value={formData.currentPrice}
                  onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                />
                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="JPY">JPY</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Select value={formData.availability} onValueChange={(v) => setFormData({ ...formData, availability: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="IN_STOCK">In Stock</SelectItem>
                  <SelectItem value="OUT_OF_STOCK">Out of Stock</SelectItem>
                  <SelectItem value="LIMITED">Limited</SelectItem>
                  <SelectItem value="DISCONTINUED">Discontinued</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Alert on Price Drop</label>
                <Switch
                  checked={formData.alertOnDrop}
                  onCheckedChange={(v) => setFormData({ ...formData, alertOnDrop: v })}
                />
              </div>

              {formData.alertOnDrop && (
                <Input
                  type="number"
                  placeholder="Alert threshold (optional)"
                  value={formData.alertThreshold}
                  onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
                />
              )}

              <Button onClick={handleSubmit} className="w-full">
                SAVE TRACKING
              </Button>
            </div>
          )}

          {/* Price Overview */}
          {tracker && !showForm && (
            <>
              <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg p-4 border border-green-100">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-gray-600">CURRENT PRICE</span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${
                    priceDiff > 0 ? 'text-red-600' : priceDiff < 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {priceDiff > 0 ? <TrendingUp className="h-4 w-4" /> : priceDiff < 0 ? <TrendingDown className="h-4 w-4" /> : null}
                    {priceDiff !== 0 && `${priceDiffPercent}%`}
                  </span>
                </div>
                <div className="text-3xl font-bold text-gray-900">
                  {tracker.currency} {tracker.currentPrice.toFixed(2)}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  Original: {tracker.currency} {tracker.originalPrice.toFixed(2)}
                </div>
              </div>

              {/* Price Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">LOWEST</p>
                  <p className="text-lg font-bold text-green-600">
                    {tracker.lowestPrice?.toFixed(2) || '-'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">HIGHEST</p>
                  <p className="text-lg font-bold text-red-600">
                    {tracker.highestPrice?.toFixed(2) || '-'}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 border border-gray-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">STATUS</p>
                  <p className="text-xs font-semibold text-gray-900">
                    {tracker.availability.replace('_', ' ')}
                  </p>
                </div>
              </div>

              {/* Alert Status */}
              {tracker.alertOnDrop && (
                <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Bell className="h-4 w-4 text-blue-600" />
                  <span className="text-sm text-blue-800">
                    Price alerts enabled{tracker.alertThreshold && ` (threshold: ${tracker.currency} ${tracker.alertThreshold})`}
                  </span>
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  );
}
