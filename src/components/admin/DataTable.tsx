import React from 'react';
import { Skeleton } from '../ui/Skeleton';

export interface Column<T> {
  header: string;
  accessor?: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (item: T) => string;
  emptyState?: React.ReactNode;
  loading?: boolean;
  loadingRows?: number;
}

export function DataTable<T>({ columns, data, keyExtractor, emptyState, loading = false, loadingRows = 4 }: DataTableProps<T>) {
  if (loading) {
    return (
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-surface border-b border-border">
              {columns.map((col, index) => (
                <th key={index} className={`px-6 py-4 text-sm font-semibold text-main ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: loadingRows }).map((_, rowIndex) => (
              <tr key={rowIndex} className="border-b border-border">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className={`px-6 py-4 ${col.className || ''}`}>
                    <Skeleton variant="text" width={colIndex === 0 ? '60%' : '100%'} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (data.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-surface border-b border-border">
            {columns.map((col, index) => (
              <th key={index} className={`px-6 py-4 text-sm font-semibold text-main ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={keyExtractor(item)} className="border-b border-border hover:bg-surface/50 transition-colors">
              {columns.map((col, colIndex) => (
                <td key={colIndex} className={`px-6 py-4 text-sm text-muted ${col.className || ''}`}>
                  {col.cell ? col.cell(item) : String(item[col.accessor as keyof T])}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && !emptyState && (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-muted">
                No data available.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
