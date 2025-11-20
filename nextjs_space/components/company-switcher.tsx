'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, ChevronDown, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

interface Company {
  id: string;
  name: string;
  logo: string | null;
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

  useEffect(() => {
    fetchCompaniesAndActive();
  }, []);

  const fetchCompaniesAndActive = async () => {
    try {
      setLoading(true);
      
      // Fetch all companies
      const companiesRes = await fetch('/api/companies');
      if (companiesRes.ok) {
        const companiesData = await companiesRes.json();
        setCompanies(companiesData);
      }

      // Fetch active company
      const activeRes = await fetch('/api/companies/active');
      if (activeRes.ok) {
        const activeData = await activeRes.json();
        setActiveCompany(activeData);
      }
    } catch (error) {
      console.error('Error fetching companies:', error);
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
        // Reload the page to update data
        router.refresh();
      }
    } catch (error) {
      console.error('Error switching company:', error);
      toast.error('Failed to switch company');
    }
  };

  if (loading || !activeCompany) {
    return (
      <div className="flex items-center gap-2 p-2 text-sm text-gray-500">
        <Building2 className="w-4 h-4" />
        Loading...
      </div>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between h-auto p-3 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <div className="flex items-center gap-3">
            {activeCompany.logo ? (
              <img
                src={activeCompany.logo}
                alt={activeCompany.name}
                className="w-8 h-8 rounded object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex flex-col items-start">
              <span className="font-semibold text-sm uppercase">{activeCompany.name}</span>
              <span className="text-xs text-gray-500">
                {companies.length} {companies.length === 1 ? 'company' : 'companies'}
              </span>
            </div>
          </div>
          <ChevronDown className="w-4 h-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="start" className="w-64">
        <div className="px-2 py-1.5 text-xs uppercase text-gray-500 font-semibold">
          Your Companies
        </div>

        {companies.map((company) => (
          <DropdownMenuItem
            key={company.id}
            onClick={() => switchCompany(company.id)}
            className={`flex items-center gap-3 p-3 cursor-pointer ${
              company.id === activeCompany.id ? 'bg-gray-100 dark:bg-gray-800' : ''
            }`}
          >
            {company.logo ? (
              <img
                src={company.logo}
                alt={company.name}
                className="w-8 h-8 rounded object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="flex flex-col flex-1">
              <span className="font-medium text-sm uppercase">{company.name}</span>
              {company._count && (
                <span className="text-xs text-gray-500">
                  {company._count.bookmarks} bookmarks
                </span>
              )}
            </div>
            {company.id === activeCompany.id && (
              <div className="w-2 h-2 rounded-full bg-green-500" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={() => router.push('/settings?tab=companies')}
          className="flex items-center gap-2 p-3 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span className="uppercase">Add Company</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push('/settings?tab=companies')}
          className="flex items-center gap-2 p-3 cursor-pointer"
        >
          <Settings className="w-4 h-4" />
          <span className="uppercase">Manage Companies</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
