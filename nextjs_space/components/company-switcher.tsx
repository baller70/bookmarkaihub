'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  ChevronDown, 
  Plus, 
  Settings, 
  Pencil, 
  Trash2, 
  Upload, 
  X,
  Check,
  ImageIcon,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Image from 'next/image';

interface Company {
  id: string;
  name: string;
  logo: string | null;
  description?: string | null;
  _count?: {
    bookmarks: number;
    categories: number;
  };
}

export function CompanySwitcher() {
  const router = useRouter();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [activeCompany, setActiveCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [showManageModal, setShowManageModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Form states
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newCompanyLogo, setNewCompanyLogo] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editLogo, setEditLogo] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const editFileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchCompaniesAndActive();
  }, []);

  const fetchCompaniesAndActive = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const companiesRes = await fetch('/api/companies');
      if (!companiesRes.ok) {
        const errorData = await companiesRes.json();
        throw new Error(errorData.error || 'Failed to fetch companies');
      }
      const companiesData = await companiesRes.json();
      setCompanies(companiesData);

      const activeRes = await fetch('/api/companies/active');
      if (!activeRes.ok) {
        const errorData = await activeRes.json();
        throw new Error(errorData.error || 'Failed to fetch active company');
      }
      const activeData = await activeRes.json();
      setActiveCompany(activeData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      setError(error instanceof Error ? error.message : 'Failed to load companies');
      toast.error('Failed to load companies. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const switchCompany = async (companyId: string) => {
    try {
      const res = await fetch('/api/companies/active', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId }),
      });

      if (res.ok) {
        const company = await res.json();
        setActiveCompany(company);
        toast.success(`Switched to ${company.name}`);
        // Full page reload to ensure all data is refreshed for the new company
        window.location.reload();
      }
    } catch (error) {
      console.error('Error switching company:', error);
      toast.error('Failed to switch company');
    }
  };

  const handleLogoUpload = async (file: File, isEdit: boolean = false) => {
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Image must be less than 2MB');
      return;
    }

    setUploading(true);
    try {
      // Convert to base64 for simplicity (in production, use cloud storage)
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        if (isEdit) {
          setEditLogo(base64);
        } else {
          setNewCompanyLogo(base64);
        }
        setUploading(false);
      };
      reader.onerror = () => {
        toast.error('Failed to read image');
        setUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error uploading logo:', error);
      toast.error('Failed to upload logo');
      setUploading(false);
    }
  };

  const handleCreateCompany = async () => {
    if (!newCompanyName.trim()) {
      toast.error('Company name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch('/api/companies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newCompanyName.trim(),
          logo: newCompanyLogo,
        }),
      });

      if (res.ok) {
        toast.success('Company created successfully');
        setShowCreateModal(false);
        setNewCompanyName('');
        setNewCompanyLogo(null);
        fetchCompaniesAndActive();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to create company');
      }
    } catch (error) {
      console.error('Error creating company:', error);
      toast.error('Failed to create company');
    } finally {
      setSaving(false);
    }
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setEditName(company.name);
    setEditLogo(company.logo);
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    if (!editingCompany || !editName.trim()) {
      toast.error('Company name is required');
      return;
    }

    setSaving(true);
    try {
      const res = await fetch(`/api/companies/${editingCompany.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editName.trim(),
          logo: editLogo,
        }),
      });

      if (res.ok) {
        toast.success('Company updated successfully');
        setShowEditModal(false);
        setEditingCompany(null);
        fetchCompaniesAndActive();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to update company');
      }
    } catch (error) {
      console.error('Error updating company:', error);
      toast.error('Failed to update company');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCompany = async () => {
    if (!companyToDelete) return;

    try {
      const res = await fetch(`/api/companies/${companyToDelete.id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Company deleted');
        setShowDeleteDialog(false);
        setCompanyToDelete(null);
        fetchCompaniesAndActive();
      } else {
        const data = await res.json();
        toast.error(data.error || 'Failed to delete company');
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      toast.error('Failed to delete company');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-3 text-sm text-gray-500 dark:text-gray-400">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span>Loading...</span>
      </div>
    );
  }

  if (error || !activeCompany) {
    return (
      <div className="p-3">
        <div className="flex items-center gap-2 text-sm text-red-500 mb-2">
          <AlertTriangle className="w-4 h-4" />
          <span>{error || 'No company found'}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => setShowCreateModal(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          CREATE COMPANY
        </Button>
      </div>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-between h-auto p-3 hover:bg-gray-100 dark:hover:bg-slate-800"
          >
            <div className="flex items-center gap-3">
              {activeCompany.logo ? (
                <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 flex-shrink-0">
                  <Image
                    src={activeCompany.logo}
                    alt={activeCompany.name}
                    width={36}
                    height={36}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-4 h-4 text-white" />
                </div>
              )}
              <div className="flex flex-col items-start min-w-0">
                <span className="font-semibold text-sm text-gray-900 dark:text-white truncate max-w-[120px]">
                  {activeCompany.name}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {companies.length} {companies.length === 1 ? 'company' : 'companies'}
                </span>
              </div>
            </div>
            <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="start" className="w-72">
          <div className="px-3 py-2 text-xs uppercase text-gray-500 dark:text-gray-400 font-semibold tracking-wider">
            Your Companies
          </div>

          <div className="max-h-[240px] overflow-y-auto">
            {companies.map((company) => (
              <DropdownMenuItem
                key={company.id}
                onClick={() => switchCompany(company.id)}
                className={cn(
                  "flex items-center gap-3 p-3 cursor-pointer",
                  company.id === activeCompany.id && "bg-blue-50 dark:bg-blue-900/20"
                )}
              >
                {company.logo ? (
                  <div className="w-9 h-9 rounded-lg overflow-hidden bg-gray-100 dark:bg-slate-700 flex-shrink-0">
                    <Image
                      src={company.logo}
                      alt={company.name}
                      width={36}
                      height={36}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                )}
                <div className="flex flex-col flex-1 min-w-0">
                  <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                    {company.name}
                  </span>
                  {company._count && (
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {company._count.bookmarks} bookmarks
                    </span>
                  )}
                </div>
                {company.id === activeCompany.id && (
                  <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator />

          <DropdownMenuItem
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 p-3 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span className="uppercase text-sm font-medium">Add Company</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            onClick={() => setShowManageModal(true)}
            className="flex items-center gap-2 p-3 cursor-pointer"
          >
            <Settings className="w-4 h-4" />
            <span className="uppercase text-sm font-medium">Manage Companies</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Manage Companies Modal */}
      <Dialog open={showManageModal} onOpenChange={setShowManageModal}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="uppercase flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Manage Companies
            </DialogTitle>
            <DialogDescription>
              View, edit, and manage all your companies
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {companies.map((company) => (
                <div
                  key={company.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border transition-all",
                    company.id === activeCompany?.id 
                      ? "border-blue-300 bg-blue-50/50 dark:border-blue-700 dark:bg-blue-900/20" 
                      : "border-gray-200 dark:border-slate-700 hover:border-gray-300 dark:hover:border-slate-600"
                  )}
                >
                  {company.logo ? (
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-gray-100 dark:bg-slate-700 flex-shrink-0">
                      <Image
                        src={company.logo}
                        alt={company.name}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 dark:text-white truncate">
                        {company.name}
                      </span>
                      {company.id === activeCompany?.id && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold uppercase bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {company._count?.bookmarks || 0} bookmarks • {company._count?.categories || 0} categories
                    </p>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditCompany(company)}
                      className="h-8 w-8 p-0"
                    >
                      <Pencil className="h-3.5 w-3.5 text-gray-500" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setCompanyToDelete(company);
                        setShowDeleteDialog(true);
                      }}
                      disabled={companies.length <= 1}
                      className="h-8 w-8 p-0 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <Trash2 className={cn(
                        "h-3.5 w-3.5",
                        companies.length <= 1 ? "text-gray-300" : "text-red-500"
                      )} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => {
                setShowManageModal(false);
                setShowCreateModal(true);
              }}
              className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create New Company
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Create Company Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="uppercase">Create Company</DialogTitle>
            <DialogDescription>
              Add a new company to organize your bookmarks
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div 
                  className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all",
                    newCompanyLogo 
                      ? "bg-gray-100 dark:bg-slate-700" 
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {newCompanyLogo ? (
                    <Image
                      src={newCompanyLogo}
                      alt="Logo preview"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <ImageIcon className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {newCompanyLogo ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  {newCompanyLogo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setNewCompanyLogo(null)}
                      className="w-full mt-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0])}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Recommended: Square image, max 2MB
              </p>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="company-name">Company Name</Label>
              <Input
                id="company-name"
                value={newCompanyName}
                onChange={(e) => setNewCompanyName(e.target.value)}
                placeholder="Enter company name"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateCompany()}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateCompany} 
              disabled={saving || !newCompanyName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Create Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Company Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="uppercase">Edit Company</DialogTitle>
            <DialogDescription>
              Update company name and logo
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label>Company Logo</Label>
              <div className="flex items-center gap-4">
                <div 
                  className={cn(
                    "w-16 h-16 rounded-xl flex items-center justify-center overflow-hidden cursor-pointer transition-all",
                    editLogo 
                      ? "bg-gray-100 dark:bg-slate-700" 
                      : "bg-gradient-to-br from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                  )}
                  onClick={() => editFileInputRef.current?.click()}
                >
                  {editLogo ? (
                    <Image
                      src={editLogo}
                      alt="Logo preview"
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 className="w-6 h-6 text-white" />
                  )}
                </div>
                <div className="flex-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => editFileInputRef.current?.click()}
                    disabled={uploading}
                    className="w-full"
                  >
                    {uploading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4 mr-2" />
                    )}
                    {editLogo ? 'Change Logo' : 'Upload Logo'}
                  </Button>
                  {editLogo && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditLogo(null)}
                      className="w-full mt-1 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  ref={editFileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleLogoUpload(e.target.files[0], true)}
                  className="hidden"
                />
              </div>
            </div>

            {/* Company Name */}
            <div className="space-y-2">
              <Label htmlFor="edit-company-name">Company Name</Label>
              <Input
                id="edit-company-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter company name"
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveEdit} 
              disabled={saving || !editName.trim()}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Company</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{companyToDelete?.name}</strong>? 
              This will permanently remove all bookmarks, categories, and data associated with this company.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setCompanyToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCompany}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete Company
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
