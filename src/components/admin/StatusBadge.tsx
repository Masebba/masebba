import React from 'react';
type StatusType = 'draft' | 'published' | 'read' | 'unread' | 'replied';
interface StatusBadgeProps {
  status: StatusType;
}
export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<StatusType, string> = {
    draft: 'bg-gray-100 text-gray-700 border-gray-200',
    published: 'bg-green-100 text-green-700 border-green-200',
    read: 'bg-blue-100 text-blue-700 border-blue-200',
    unread: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    replied: 'bg-purple-100 text-purple-700 border-purple-200'
  };
  const labels: Record<StatusType, string> = {
    draft: 'Draft',
    published: 'Published',
    read: 'Read',
    unread: 'Unread',
    replied: 'Replied'
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
      
      {labels[status]}
    </span>);

}