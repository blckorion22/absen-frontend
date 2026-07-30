'use client';

import React, { ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, AlertCircle } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
  sortable?: boolean;
}

interface TableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string | number;
  isLoading?: boolean;
  emptyMessage?: string;
  emptyIcon?: ReactNode;
  onRowClick?: (item: T) => void;
  className?: string;
  pagination?: {
    currentPage: number;
    lastPage: number;
    total: number;
    onPageChange: (page: number) => void;
  };
}

function Table<T>({
  columns,
  data,
  keyExtractor,
  isLoading,
  emptyMessage = 'Tidak ada data',
  emptyIcon,
  onRowClick,
  className,
  pagination,
}: TableProps<T>) {
  if (isLoading) {
    return (
      <div className="table-container">
        <table className="table-base">
          <thead className="table-header">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="table-header-cell">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              <tr key={i}>
                {columns.map((col) => (
                  <td key={col.key} className="table-cell">
                    <div className="skeleton h-4 w-3/4" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="table-container">
        <table className="table-base">
          <thead className="table-header">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className="table-header-cell">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
        </table>
        <div className="empty-state">
          {emptyIcon || <AlertCircle className="empty-state-icon" />}
          <p className="text-gray-500 text-sm">{emptyMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="table-container">
        <table className={cn('table-base', className)}>
          <thead className="table-header">
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={cn('table-header-cell', col.className)}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="table-body">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn(
                  'transition-colors',
                  onRowClick && 'cursor-pointer hover:bg-gray-50'
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className={cn('table-cell', col.className)}>
                    {col.render ? col.render(item) : (item as Record<string, unknown>)[col.key] as ReactNode}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination && pagination.lastPage > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            Halaman {pagination.currentPage} dari {pagination.lastPage} ({pagination.total} data)
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="btn-ghost p-2 disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(pagination.lastPage, 5) }).map((_, i) => {
              let pageNum: number;
              if (pagination.lastPage <= 5) {
                pageNum = i + 1;
              } else if (pagination.currentPage <= 3) {
                pageNum = i + 1;
              } else if (pagination.currentPage >= pagination.lastPage - 2) {
                pageNum = pagination.lastPage - 4 + i;
              } else {
                pageNum = pagination.currentPage - 2 + i;
              }
              return (
                <button
                  key={pageNum}
                  onClick={() => pagination.onPageChange(pageNum)}
                  className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                    pagination.currentPage === pageNum
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.lastPage}
              className="btn-ghost p-2 disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Table;
