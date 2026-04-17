import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { DataTable } from '../../components/admin/DataTable';
import { EmptyState } from '../../components/admin/EmptyState';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { BlogPost } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, FileTextIcon } from 'lucide-react';
import { useBlogPosts } from '../../lib/hooks/useBlogPosts';

export function BlogPosts() {
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { posts, loading, deletePost } = useBlogPosts();

  const handleDeletePost = async () => {
    if (!postToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deletePost(postToDelete);
      if (result?.error) throw new Error(result.error);
      setPostToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post.');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns = [
    {
      header: 'Title',
      accessor: 'title' as keyof BlogPost,
      className: 'w-1/2 font-medium text-main',
    },
    { header: 'Status', cell: (item: BlogPost) => <StatusBadge status={item.status} /> },
    { header: 'Date', cell: (item: BlogPost) => new Date(item.createdAt).toLocaleDateString() },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item: BlogPost) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => navigate(`/admin/blog/edit/${item.id}`)} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" disabled={isDeleting}>
            <EditIcon className="w-4 h-4" />
          </button>
          <button onClick={() => { setPostToDelete(item.id); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded" disabled={isDeleting}>
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
          <h1 className="text-2xl font-bold text-main">Blog Posts</h1>
          <p className="text-muted mt-1">Manage your articles and writings.</p>
        </div>
        <Button className="gap-2" onClick={() => navigate('/admin/blog/new')}>
          <PlusIcon className="w-4 h-4" />
          New Post
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={posts}
          keyExtractor={(item) => item.id}
          loading={loading}
          loadingRows={6}
          emptyState={
            <EmptyState
              icon={FileTextIcon}
              title="No blog posts yet"
              description="Start sharing your thoughts and expertise."
              actionLabel="Create First Post"
              onAction={() => navigate('/admin/blog/new')}
            />
          }
        />
      </Card>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeletePost}
        title="Delete Blog Post"
        message="Are you sure you want to delete this post? This action cannot be undone."
      />
    </div>
  );
}
