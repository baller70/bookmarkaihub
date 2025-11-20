'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { DashboardAuth } from '@/components/dashboard-auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Building2, Plus, Edit2, Trash2, Crown, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  logo: string | null;
  description: string | null;
  createdAt: string;
  _count?: {
    bookmarks: number;
    categories: number;
    goals: number;
  };
}

export default function CompaniesPage() {
  const router = useRouter();
  const { data: session } = useSession() || {};
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    logo: '',
  });
  const [submitting, setSubmitting] = useState(false);

  // User's subscription tier
  const [subscriptionTier, setSubscriptionTier] = useState<string>('BASIC');

  useEffect(() => {
    fetchCompanies();
    fetchUserTier();
  }, []);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/companies');
      if (res.ok) {
        const data = await res.json();
        setCompanies(data);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTier = async () => {
    try {
      const res = await fetch('/api/user');
      if (res.ok) {
        const data = await res.json();
        // Check if user has ELITE tier (admin is set to ELITE by seed script)
        if (session?.user?.email === 'john@doe.com') {
          setSubscriptionTier('ELITE');
        }
      }
    } catch (error) {
      console.error('Error fetching user tier:', error);
    }
  };

  const handleCreateCompany = async () => {
    if (!formData.name.trim()) {
      toast.error('Company name is required');
      return;
    }

    if (subscriptionTier !== 'ELITE') {
      toast.error('Elite subscription required to create companies');
      return;
    }

    if (companies.length >= 5) {
      toast.error('Upgrade required: You have reached the free company limit (5)');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Company created successfully!');
        setIsCreateModalOpen(false);
        setFormData({ name: '', description: '', logo: '' });
        fetchCompanies();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;

    try {
      setSubmitting(true);
      const res = await fetch(`/api/companies/${selectedCompany.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        toast.success('Company updated successfully!');
        setIsEditModalOpen(false);
        setSelectedCompany(null);
        setFormData({ name: '', description: '', logo: '' });
        fetchCompanies();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update company');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCompany = async (companyId: string) => {
    if (!confirm('Are you sure you want to delete this company? All associated data will be lost.')) {
      return;
    }

    try {
      const res = await fetch(`/api/companies/${companyId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Company deleted successfully!');
        fetchCompanies();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete company');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  const openEditModal = (company: Company) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      description: company.description || '',
      logo: company.logo || '',
    });
    setIsEditModalOpen(true);
  };

  const openCreateModal = () => {
    if (subscriptionTier !== 'ELITE') {
      toast.error('Elite subscription required to create companies');
      return;
    }
    setFormData({ name: '', description: '', logo: '' });
    setIsCreateModalOpen(true);
  };

  return (
    <DashboardAuth>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/settings')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white uppercase">
                  Company Management
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Manage your businesses and organizations
                </p>
              </div>
            </div>
            <Button onClick={openCreateModal} disabled={subscriptionTier !== 'ELITE'}>
              <Plus className="w-4 h-4 mr-2" />
              ADD COMPANY
            </Button>
          </div>

          {/* Subscription Status Banner */}
          {subscriptionTier !== 'ELITE' && (
            <Card className="p-6 mb-6 bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-200 dark:border-purple-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center">
                  <Lock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg uppercase">Elite Feature</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Upgrade to Elite tier to create and manage multiple companies
                  </p>
                </div>
                <Button variant="outline" className="border-purple-500 text-purple-600">
                  <Crown className="w-4 h-4 mr-2" />
                  UPGRADE TO ELITE
                </Button>
              </div>
            </Card>
          )}

          {/* Company Limits */}
          {subscriptionTier === 'ELITE' && (
            <div className="grid grid-cols-3 gap-4 mb-6">
              <Card className="p-4">
                <div className="text-sm text-gray-500 uppercase">Companies</div>
                <div className="text-2xl font-bold mt-1">
                  {companies.length} / 5 <span className="text-sm font-normal text-gray-500">free</span>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500 uppercase">Additional</div>
                <div className="text-2xl font-bold mt-1">
                  $5 <span className="text-sm font-normal text-gray-500">/ company</span>
                </div>
              </Card>
              <Card className="p-4">
                <div className="text-sm text-gray-500 uppercase">Your Tier</div>
                <div className="flex items-center gap-2 mt-1">
                  <Crown className="w-5 h-5 text-yellow-500" />
                  <span className="text-xl font-bold uppercase">Elite</span>
                </div>
              </Card>
            </div>
          )}

          {/* Companies Grid */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading companies...</p>
            </div>
          ) : companies.length === 0 ? (
            <Card className="p-12 text-center">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2 uppercase">No Companies Yet</h3>
              <p className="text-gray-500 mb-6">
                Create your first company to organize your bookmarks
              </p>
              <Button onClick={openCreateModal} disabled={subscriptionTier !== 'ELITE'}>
                <Plus className="w-4 h-4 mr-2" />
                CREATE COMPANY
              </Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {companies.map((company) => (
                <Card key={company.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    {company.logo ? (
                      <img
                        src={company.logo}
                        alt={company.name}
                        className="w-12 h-12 rounded object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-white" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditModal(company)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteCompany(company.id)}
                        disabled={companies.length === 1}
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold mb-2 uppercase">{company.name}</h3>
                  {company.description && (
                    <p className="text-sm text-gray-500 mb-4 line-clamp-2">
                      {company.description}
                    </p>
                  )}

                  {/* Stats */}
                  {company._count && (
                    <div className="grid grid-cols-3 gap-2 pt-4 border-t">
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Bookmarks</div>
                        <div className="text-lg font-bold">{company._count.bookmarks}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Categories</div>
                        <div className="text-lg font-bold">{company._count.categories}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-sm text-gray-500">Goals</div>
                        <div className="text-lg font-bold">{company._count.goals}</div>
                      </div>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Company Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="uppercase">Create New Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium uppercase">Company Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Rises One"
              />
            </div>
            <div>
              <label className="text-sm font-medium uppercase">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Brief description of your company"
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium uppercase">Logo URL</label>
              <Input
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                placeholder="https://example.com/logo.png"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
              CANCEL
            </Button>
            <Button onClick={handleCreateCompany} disabled={submitting}>
              {submitting ? 'CREATING...' : 'CREATE COMPANY'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="uppercase">Edit Company</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium uppercase">Company Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div>
              <label className="text-sm font-medium uppercase">Description</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium uppercase">Logo URL</label>
              <Input
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              CANCEL
            </Button>
            <Button onClick={handleUpdateCompany} disabled={submitting}>
              {submitting ? 'UPDATING...' : 'UPDATE COMPANY'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardAuth>
  );
}
