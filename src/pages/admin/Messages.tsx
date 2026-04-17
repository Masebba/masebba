import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/admin/DataTable';
import { EmptyState } from '../../components/admin/EmptyState';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { ContactMessage } from '../../types';
import { EyeIcon, TrashIcon, MessageSquareIcon } from 'lucide-react';
import { useMessages } from '../../lib/hooks/useMessages';

export function Messages() {
  const [filter, setFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [messageToDelete, setMessageToDelete] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { messages, loading, updateMessage, deleteMessage } = useMessages();

  const filteredMessages = messages.filter((m) => filter === 'all' || m.status === filter);

  const handleViewMessage = async (msg: ContactMessage) => {
    setSelectedMessage(msg);
    setIsViewModalOpen(true);
    if (msg.status === 'unread') {
      try {
        await updateMessage(msg.id, 'read');
      } catch (error) {
        console.error('Error updating message status:', error);
      }
    }
  };

  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    setIsProcessing(true);
    try {
      const result = await deleteMessage(messageToDelete);
      if (result?.error) throw new Error(result.error);
      setMessageToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting message:', error);
      alert('Failed to delete message.');
    } finally {
      setIsProcessing(false);
    }
  };

  const columns = [
    { header: 'Name', accessor: 'name' as keyof ContactMessage, className: 'font-medium text-main' },
    { header: 'Email', accessor: 'email' as keyof ContactMessage },
    { header: 'Status', cell: (item: ContactMessage) => <StatusBadge status={item.status} /> },
    { header: 'Date', cell: (item: ContactMessage) => new Date(item.createdAt).toLocaleDateString() },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item: ContactMessage) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => handleViewMessage(item)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" title="View Message" disabled={isProcessing}>
            <EyeIcon className="w-4 h-4" />
          </button>
          <button onClick={() => { setMessageToDelete(item.id); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded" title="Delete Message" disabled={isProcessing}>
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Contact Messages</h1>
          <p className="text-muted mt-1">View inquiries from your contact form.</p>
        </div>
        <div className="flex bg-surface rounded-md p-1 border border-border">
          <button onClick={() => setFilter('all')} className={`px-3 py-1 text-sm font-medium rounded ${filter === 'all' ? 'bg-background shadow-sm text-main' : 'text-muted'}`}>All</button>
          <button onClick={() => setFilter('unread')} className={`px-3 py-1 text-sm font-medium rounded ${filter === 'unread' ? 'bg-background shadow-sm text-main' : 'text-muted'}`}>Unread</button>
          <button onClick={() => setFilter('read')} className={`px-3 py-1 text-sm font-medium rounded ${filter === 'read' ? 'bg-background shadow-sm text-main' : 'text-muted'}`}>Read</button>
        </div>
      </div>

      <Card padding="none" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={filteredMessages}
          keyExtractor={(item) => item.id}
          loading={loading}
          loadingRows={6}
          emptyState={
            <EmptyState
              icon={MessageSquareIcon}
              title="No messages found"
              description={filter === 'all' ? "You haven't received any messages yet." : `No ${filter} messages.`}
            />
          }
        />
      </Card>

      <Modal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} title="Message Details">
        {selectedMessage && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 border-b border-border pb-4">
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">From</p>
                <p className="text-main font-medium">{selectedMessage.name}</p>
                <p className="text-muted text-sm">{selectedMessage.email}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider mb-1">Date</p>
                <p className="text-main text-sm">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted uppercase tracking-wider mb-2">Message</p>
              <div className="bg-surface p-4 rounded-lg text-main whitespace-pre-wrap">{selectedMessage.message}</div>
            </div>
            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>Close</Button>
              <Button variant="primary" onClick={() => (window.location.href = `mailto:${selectedMessage.email}`)}>Reply via Email</Button>
            </div>
          </div>
        )}
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteMessage}
        title="Delete Message"
        message="Are you sure you want to delete this message? This action cannot be undone."
      />
    </div>
  );
}
