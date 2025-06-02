"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import {
  CurrencyDollarIcon,
  ArrowPathIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  CalendarIcon,
  DocumentTextIcon,
  BanknotesIcon,
  CreditCardIcon,
  ExclamationTriangleIcon,
  StarIcon,
  FunnelIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PresentationChartLineIcon,
  UserIcon,
  ArrowTrendingUpIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

// Fetcher function for SWR
const fetcher = (url: string) => fetch(url).then(res => {
  if (!res.ok) throw new Error("An error occurred while fetching the data.");
  return res.json();
});

interface Transaction {
  id: string;
  date: string;
  patient: string;
  doctor: string;
  amount: number;
  type: 'PAYMENT' | 'REFUND' | 'INSURANCE';
  status: 'COMPLETED' | 'PENDING' | 'FAILED' | 'REFUNDED';
  method: 'CREDIT_CARD' | 'DEBIT_CARD' | 'BANK_TRANSFER' | 'CASH' | 'INSURANCE';
}

export default function FinanceManagement() {
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading state for better UX
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Fetch financial data from API
  const { 
    data: financeData, 
    error: financeError, 
    isLoading: financeLoading,
    mutate: refreshFinanceData
  } = useSWR(
    '/api/admin/finance/stats',
    fetcher,
    {
      revalidateOnFocus: false,
      refreshInterval: 300000, // 5 minutes
    }
  );

  // Fetch transactions from API
  const { 
    data: transactionsData, 
    error: transactionsError, 
    isLoading: transactionsLoading,
    mutate: refreshTransactions
  } = useSWR(
    `/api/admin/finance/transactions?type=${typeFilter}&status=${statusFilter}&page=${currentPage}&limit=${itemsPerPage}&sort=${sortField}&direction=${sortDirection}`,
    fetcher,
    {
      revalidateOnFocus: false,
    }
  );

  // Get financial stats from API or use defaults
  const financialStats = financeData?.stats || {
    totalRevenue: 0,
    pendingPayments: 0,
    totalRefunds: 0,
    monthlyGrowth: 0,
    completedTransactions: 0,
    pendingTransactions: 0,
    averageTransaction: 0
  };

  // Get transactions from API
  const transactions = transactionsData?.transactions || [];
  const pagination = transactionsData?.pagination || {
    total: 0,
    totalPages: 1,
    currentPage: 1,
    hasNext: false,
    hasPrev: false
  };

  // Calculate current transactions based on pagination
  const currentTransactions = transactions;
  const totalTransactions = pagination.total;
  const totalPages = pagination.totalPages;

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'FAILED':
        return 'bg-red-100 text-red-800';
      case 'REFUNDED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return 'bg-blue-100 text-blue-800';
      case 'REFUND':
        return 'bg-purple-100 text-purple-800';
      case 'INSURANCE':
        return 'bg-indigo-100 text-indigo-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'CREDIT_CARD':
      case 'DEBIT_CARD':
        return <CreditCardIcon className="h-4 w-4 text-gray-500" />;
      case 'BANK_TRANSFER':
        return <BanknotesIcon className="h-4 w-4 text-gray-500" />;
      case 'CASH':
        return <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />;
      case 'INSURANCE':
        return <DocumentTextIcon className="h-4 w-4 text-gray-500" />;
      default:
        return <CurrencyDollarIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Financial Management
          </h1>
          <p className="text-gray-600 mt-1">
            Track and manage all financial transactions
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button
            onClick={() => refreshFinanceData()}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center"
          >
            <ArrowPathIcon className="h-5 w-5 mr-2" />
            Refresh
          </button>
          <Link
            href="/dashboard/admin/reports"
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors flex items-center"
          >
            <PresentationChartLineIcon className="h-5 w-5 mr-2" />
            Financial Reports
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Revenue</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(financialStats.totalRevenue)}</h3>
            </div>
            <div className="p-3 rounded-full bg-emerald-100 text-emerald-600">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-emerald-600">
            <ArrowTrendingUpIcon className="h-4 w-4 mr-1" />
            <span>+{financialStats.monthlyGrowth}% from last month</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Pending Payments</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(financialStats.pendingPayments)}</h3>
            </div>
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <span>{financialStats.pendingTransactions} pending transactions</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Refunds</p>
              <h3 className="text-2xl font-bold text-gray-900">{formatCurrency(financialStats.totalRefunds)}</h3>
            </div>
            <div className="p-3 rounded-full bg-purple-100 text-purple-600">
              <CurrencyDollarIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <span>2.5% of total revenue</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Completed Transactions</p>
              <h3 className="text-2xl font-bold text-gray-900">{financialStats.completedTransactions}</h3>
            </div>
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <CreditCardIcon className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-2 flex items-center text-sm text-gray-600">
            <span>Avg. {formatCurrency(financialStats.averageTransaction)} per transaction</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-md p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Type Filter */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
              </div>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              >
                <option value="all">All Transaction Types</option>
                <option value="PAYMENT">Payment</option>
                <option value="REFUND">Refund</option>
                <option value="INSURANCE">Insurance</option>
              </select>
            </div>
          </div>

          {/* Status Filter */}
          <div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <FunnelIcon className="w-5 h-5 text-gray-400" />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
              >
                <option value="all">All Statuses</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
                <option value="REFUNDED">Refunded</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading || financeLoading || transactionsLoading ? (
        <div className="bg-white rounded-xl shadow-md p-12 mb-6 flex justify-center items-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
              <StarIconSolid className="w-6 h-6 text-blue-600 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse" />
            </div>
            <p className="text-gray-600 font-medium">Loading financial data...</p>
          </div>
        </div>
      ) : financeError || transactionsError ? (
        <div className="bg-white rounded-xl shadow-md p-12 mb-6">
          <div className="text-center">
            <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Error Loading Financial Data</h3>
            <p className="text-gray-600 mb-6">There was an error loading the financial data. Please try again later.</p>
            <button
              onClick={() => refreshFinanceData()}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Transactions Table */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th 
                      onClick={() => handleSort('date')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Date</span>
                        {sortField === 'date' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('id')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Transaction ID</span>
                        {sortField === 'id' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th 
                      onClick={() => handleSort('patient')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Patient</span>
                        {sortField === 'patient' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    <th 
                      onClick={() => handleSort('amount')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Amount</span>
                        {sortField === 'amount' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th 
                      onClick={() => handleSort('status')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    >
                      <div className="flex items-center space-x-1">
                        <span>Status</span>
                        {sortField === 'status' && (
                          sortDirection === 'asc' ? 
                            <ArrowUpIcon className="h-4 w-4" /> : 
                            <ArrowDownIcon className="h-4 w-4" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-6 py-4 whitespace-nowrap text-center text-gray-500">
                        No transactions found matching your criteria.
                      </td>
                    </tr>
                  ) : (
                    currentTransactions.map((transaction: Transaction) => (
                      <tr key={transaction.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatDate(transaction.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {transaction.id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-8 w-8">
                              <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                <UserIcon className="h-4 w-4 text-green-600" />
                              </div>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{transaction.patient}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {transaction.doctor}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={transaction.type === 'REFUND' ? 'text-red-600' : 'text-green-600'}>
                            {transaction.type === 'REFUND' ? '- ' : ''}
                            {formatCurrency(transaction.amount)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeColor(transaction.type)}`}>
                            {transaction.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transaction.status)}`}>
                            {transaction.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            {getMethodIcon(transaction.method)}
                            <span className="ml-1">{transaction.method.replace('_', ' ')}</span>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between bg-white px-4 py-3 rounded-xl shadow-md">
            <div className="flex items-center">
              <p className="text-sm text-gray-700">
                Showing <span className="font-medium">{currentTransactions.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}</span> to{' '}
                <span className="font-medium">{Math.min(currentPage * itemsPerPage, totalTransactions)}</span> of{' '}
                <span className="font-medium">{totalTransactions}</span> results
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === 1
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                <ChevronLeftIcon className="h-5 w-5" />
                Previous
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to show appropriate page numbers
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                      currentPage === pageNum
                        ? 'z-10 bg-blue-600 text-white'
                        : 'text-gray-700 bg-white hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages || totalPages === 0}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                  currentPage === totalPages || totalPages === 0
                    ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                    : 'text-gray-700 bg-white hover:bg-gray-50'
                }`}
              >
                Next
                <ChevronRightIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
} 