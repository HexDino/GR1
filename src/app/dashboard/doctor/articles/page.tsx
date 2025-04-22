"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MagnifyingGlassIcon, PlusIcon } from '@heroicons/react/24/outline';

interface Article {
  id: string;
  title: string;
  summary: string;
  image: string;
  category: string;
  publishDate: string;
  status: 'published' | 'draft';
  views: number;
  comments: number;
}

export default function Articles() {
  const [articles, setArticles] = useState<Article[]>([
    {
      id: '1',
      title: 'Understanding Heart Disease: Prevention and Treatment',
      summary: 'Learn about the latest approaches to preventing and treating cardiovascular conditions.',
      image: '/doctors/doctor-1.jpg',
      category: 'Cardiology',
      publishDate: '01/15/2023',
      status: 'published',
      views: 1245,
      comments: 23
    },
    {
      id: '2',
      title: 'Diabetes Management: New Insights',
      summary: 'Discover the most recent developments in diabetes care and management strategies.',
      image: '/doctors/doctor-2.jpg',
      category: 'Endocrinology',
      publishDate: '01/10/2023',
      status: 'published',
      views: 892,
      comments: 15
    },
    {
      id: '3',
      title: 'Mental Health During the Pandemic',
      summary: 'How to maintain psychological wellbeing during challenging times.',
      image: '/doctors/doctor-3.jpg',
      category: 'Psychiatry',
      publishDate: '01/05/2023',
      status: 'published',
      views: 1532,
      comments: 31
    },
    {
      id: '4',
      title: 'Advances in Cancer Immunotherapy',
      summary: 'A draft discussing promising new immunotherapy approaches for cancer treatment.',
      image: '/doctors/doctor-1.jpg',
      category: 'Oncology',
      publishDate: '',
      status: 'draft',
      views: 0,
      comments: 0
    },
    {
      id: '5',
      title: 'Pediatric Nutrition Guidelines',
      summary: 'Updated guidelines for optimal nutrition in children and adolescents.',
      image: '/doctors/doctor-2.jpg',
      category: 'Pediatrics',
      publishDate: '12/28/2022',
      status: 'published',
      views: 745,
      comments: 12
    }
  ]);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all');
  
  // Filtered articles based on search and status
  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      article.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ? true : article.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">My Articles</h1>
          <p className="text-gray-600">Manage your medical articles and publications</p>
        </div>
        
        <Link 
          href="/dashboard/doctor/articles/new" 
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          New Article
        </Link>
      </div>
      
      {/* Search and filters */}
      <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
            placeholder="Search articles..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="inline-flex rounded-md shadow-sm">
          <button
            type="button"
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 text-sm font-medium rounded-l-md border ${
              statusFilter === 'all'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('published')}
            className={`px-4 py-2 text-sm font-medium border-t border-b ${
              statusFilter === 'published'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Published
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('draft')}
            className={`px-4 py-2 text-sm font-medium rounded-r-md border ${
              statusFilter === 'draft'
                ? 'bg-purple-600 text-white border-purple-600'
                : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
            }`}
          >
            Draft
          </button>
        </div>
      </div>
      
      {/* Articles grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => (
          <div key={article.id} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="relative h-48">
              <Image
                src={article.image}
                alt={article.title}
                fill
                className="object-cover"
              />
              <div className="absolute top-2 right-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  article.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {article.status.charAt(0).toUpperCase() + article.status.slice(1)}
                </span>
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <span className="text-white text-xs font-medium">
                  {article.category}
                </span>
              </div>
            </div>
            
            <div className="p-4">
              <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                {article.summary}
              </p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {article.views}
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                    {article.comments}
                  </div>
                </div>
                
                {article.publishDate && (
                  <div>
                    {article.publishDate}
                  </div>
                )}
              </div>
              
              <div className="mt-4 pt-4 border-t flex justify-between">
                <Link 
                  href={`/dashboard/doctor/articles/${article.id}`}
                  className="text-sm font-medium text-purple-600 hover:text-purple-800"
                >
                  Edit
                </Link>
                <Link 
                  href={`/dashboard/doctor/articles/${article.id}/preview`}
                  className="text-sm font-medium text-purple-600 hover:text-purple-800"
                >
                  Preview
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {filteredArticles.length === 0 && (
        <div className="text-center py-12 bg-white rounded-xl shadow-sm">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No articles found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by creating a new article or try a different search.
          </p>
          <div className="mt-6">
            <Link
              href="/dashboard/doctor/articles/new"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
            >
              <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
              New Article
            </Link>
          </div>
        </div>
      )}
    </div>
  );
} 