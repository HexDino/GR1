"use client";

import { useState, useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { 
  PlusIcon, 
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
  ArrowsUpDownIcon,
  ArrowPathIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dosageForm: string;
  strength?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export default function AdminMedicine() {
  const { user, isLoading: userLoading } = usePermissions();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Medicine>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentMedicine, setCurrentMedicine] = useState<Medicine | null>(null);
  const [dosageFormFilter, setDosageFormFilter] = useState('all');
  
  const [formData, setFormData] = useState({
    name: '',
    genericName: '',
    dosageForm: 'tablet',
    strength: '',
    description: '',
  });

  const dosageForms = [
    'tablet', 'capsule', 'liquid', 'injection', 'cream', 
    'ointment', 'drops', 'inhaler', 'patch', 'powder'
  ];

  useEffect(() => {
    fetchMedicines();
  }, []);

  const fetchMedicines = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/medicines');
      if (!response.ok) {
        throw new Error('Failed to fetch medicines');
      }
      const data = await response.json();
      if (data.success) {
        setMedicines(data.medicines);
      } else {
        setError(data.message || 'Failed to fetch medicines');
      }
    } catch (error) {
      setError('An error occurred while fetching medicines');
      console.error(error);
      // For development, mock some data
      setMedicines([
        {
          id: '1',
          name: 'Paracetamol',
          genericName: 'Acetaminophen',
          dosageForm: 'tablet',
          strength: '500mg',
          description: 'Pain reliever and fever reducer',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          name: 'Amoxicillin',
          genericName: 'Amoxicillin',
          dosageForm: 'capsule',
          strength: '250mg',
          description: 'Antibiotic',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          name: 'Ibuprofen',
          genericName: 'Ibuprofen',
          dosageForm: 'tablet',
          strength: '200mg',
          description: 'NSAID pain reliever',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Medicine) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddMedicine = () => {
    setCurrentMedicine(null);
    setFormData({
      name: '',
      genericName: '',
      dosageForm: 'tablet',
      strength: '',
      description: '',
    });
    setIsModalOpen(true);
  };

  const handleEditMedicine = (medicine: Medicine) => {
    setCurrentMedicine(medicine);
    setFormData({
      name: medicine.name,
      genericName: medicine.genericName || '',
      dosageForm: medicine.dosageForm,
      strength: medicine.strength || '',
      description: medicine.description || '',
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const isEdit = currentMedicine !== null;
      const url = isEdit 
        ? `/api/admin/medicines/${currentMedicine.id}` 
        : '/api/admin/medicines';
      
      const response = await fetch(url, {
        method: isEdit ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save medicine');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh medicines list
        fetchMedicines();
        setIsModalOpen(false);
      } else {
        setError(result.message || 'Failed to save medicine');
      }
    } catch (error) {
      console.error('Error saving medicine:', error);
      setError('An error occurred while saving the medicine');
    }
  };

  const handleDeleteMedicine = async (id: string) => {
    if (!confirm('Are you sure you want to delete this medicine?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/medicines/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete medicine');
      }
      
      const result = await response.json();
      
      if (result.success) {
        // Remove from local state
        setMedicines(medicines.filter(med => med.id !== id));
      } else {
        setError(result.message || 'Failed to delete medicine');
      }
    } catch (error) {
      console.error('Error deleting medicine:', error);
      setError('An error occurred while deleting the medicine');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Filter and sort medicines
  const filteredAndSortedMedicines = medicines
    .filter(medicine => 
      (medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (medicine.genericName?.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (medicine.description?.toLowerCase().includes(searchTerm.toLowerCase())))
      && (dosageFormFilter === 'all' || medicine.dosageForm === dosageFormFilter)
    )
    .sort((a, b) => {
      const aValue = a[sortField] || '';
      const bValue = b[sortField] || '';
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

  if (userLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-indigo-700">
            Medicine Management
          </h1>
          <p className="text-gray-600 mt-1">
            Manage all medicines in the system
          </p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchMedicines}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
            title="Refresh data"
          >
            <ArrowPathIcon className="h-5 w-5" />
            <span>Refresh</span>
          </button>
          <button
            onClick={handleAddMedicine}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 flex-1 md:flex-none"
          >
            <PlusIcon className="h-5 w-5" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 md:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 transition-all"
                placeholder="Search by name, generic name, or description..."
              />
            </div>
          </div>

          {/* Dosage Form Filter */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
              </div>
              <select
                value={dosageFormFilter}
                onChange={(e) => setDosageFormFilter(e.target.value)}
                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-10 p-2.5 appearance-none transition-all"
              >
                <option value="all">All Dosage Forms</option>
                {dosageForms.map(form => (
                  <option key={form} value={form}>
                    {form.charAt(0).toUpperCase() + form.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-center gap-3">
          <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      {/* Medicines Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('name')}
                >
                  <div className="flex items-center">
                    Name
                    {sortField === 'name' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? 
                          <ChevronLeftIcon className="h-4 w-4 rotate-90" /> : 
                          <ChevronRightIcon className="h-4 w-4 -rotate-90" />
                        }
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('genericName')}
                >
                  <div className="flex items-center">
                    Generic Name
                    {sortField === 'genericName' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? 
                          <ChevronLeftIcon className="h-4 w-4 rotate-90" /> : 
                          <ChevronRightIcon className="h-4 w-4 -rotate-90" />
                        }
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('dosageForm')}
                >
                  <div className="flex items-center">
                    Dosage Form
                    {sortField === 'dosageForm' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? 
                          <ChevronLeftIcon className="h-4 w-4 rotate-90" /> : 
                          <ChevronRightIcon className="h-4 w-4 -rotate-90" />
                        }
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('strength')}
                >
                  <div className="flex items-center">
                    Strength
                    {sortField === 'strength' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? 
                          <ChevronLeftIcon className="h-4 w-4 rotate-90" /> : 
                          <ChevronRightIcon className="h-4 w-4 -rotate-90" />
                        }
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={() => handleSort('updatedAt')}
                >
                  <div className="flex items-center">
                    Last Updated
                    {sortField === 'updatedAt' && (
                      <span className="ml-1">
                        {sortDirection === 'asc' ? 
                          <ChevronLeftIcon className="h-4 w-4 rotate-90" /> : 
                          <ChevronRightIcon className="h-4 w-4 -rotate-90" />
                        }
                      </span>
                    )}
                  </div>
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                    <p className="mt-2 text-sm text-gray-500">Loading medicines...</p>
                  </td>
                </tr>
              ) : filteredAndSortedMedicines.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    <p className="text-lg font-medium">No medicines found</p>
                    <p className="mt-1 text-sm">Try changing your search criteria or add a new medicine.</p>
                  </td>
                </tr>
              ) : (
                filteredAndSortedMedicines.map((medicine) => (
                  <tr key={medicine.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-indigo-700">{medicine.name}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-700">{medicine.genericName || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-medium rounded-full bg-blue-100 text-blue-800 capitalize">
                        {medicine.dosageForm}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-700">{medicine.strength || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-gray-700">{formatDate(medicine.updatedAt)}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end space-x-3">
                        <button
                          onClick={() => handleEditMedicine(medicine)}
                          className="text-indigo-600 hover:text-indigo-900 transition-colors"
                        >
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteMedicine(medicine.id)}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Medicine Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 md:p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {currentMedicine ? 'Edit Medicine' : 'Add New Medicine'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="genericName" className="block text-sm font-medium text-gray-700 mb-1">
                  Generic Name
                </label>
                <input
                  type="text"
                  id="genericName"
                  name="genericName"
                  value={formData.genericName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="dosageForm" className="block text-sm font-medium text-gray-700 mb-1">
                  Dosage Form *
                </label>
                <select
                  id="dosageForm"
                  name="dosageForm"
                  required
                  value={formData.dosageForm}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent appearance-none"
                >
                  {dosageForms.map(form => (
                    <option key={form} value={form}>
                      {form.charAt(0).toUpperCase() + form.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="strength" className="block text-sm font-medium text-gray-700 mb-1">
                  Strength
                </label>
                <input
                  type="text"
                  id="strength"
                  name="strength"
                  value={formData.strength}
                  onChange={handleInputChange}
                  placeholder="e.g., 500mg, 250ml"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  {currentMedicine ? 'Update' : 'Add'} Medicine
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
} 