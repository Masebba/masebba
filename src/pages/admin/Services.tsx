import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/admin/DataTable';
import { EmptyState } from '../../components/admin/EmptyState';
import { ServiceForm } from '../../components/admin/ServiceForm';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Service } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, LayoutGridIcon } from 'lucide-react';
import { useServices } from '../../lib/hooks/useServices';

export function AdminServices() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [serviceToDelete, setServiceToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { services, loading, addService, updateService, deleteService } = useServices();

  const handleSaveService = async (data: Partial<Service>) => {
    setIsSubmitting(true);
    try {
      const result = editingService ? await updateService(editingService.id, data) : await addService(data as Omit<Service, 'id'>);
      if (result?.error) throw new Error(result.error);
      setIsModalOpen(false);
      setEditingService(null);
    } catch (error) {
      console.error('Error saving service:', error);
      alert('Failed to save service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteService = async () => {
    if (!serviceToDelete) return;

    setIsSubmitting(true);
    try {
      const result = await deleteService(serviceToDelete);
      if (result?.error) throw new Error(result.error);
      setServiceToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting service:', error);
      alert('Failed to delete service.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    { header: 'Order', accessor: 'order' as keyof Service, className: 'w-16 text-center' },
    { header: 'Title', accessor: 'title' as keyof Service, className: 'font-medium text-main' },
    { header: 'Icon', accessor: 'icon' as keyof Service },
    { header: 'Visible', cell: (item: Service) => (item.isVisible ? 'Yes' : 'No') },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item: Service) => (
        <div className="flex justify-end gap-2">
          <button onClick={() => { setEditingService(item); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" disabled={isSubmitting}>
            <EditIcon className="w-4 h-4" />
          </button>
          <button onClick={() => { setServiceToDelete(item.id); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded" disabled={isSubmitting}>
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
          <h1 className="text-2xl font-bold text-main">Services</h1>
          <p className="text-muted mt-1">Manage the services you offer.</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditingService(null); setIsModalOpen(true); }}>
          <PlusIcon className="w-4 h-4" />
          Add Service
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={services}
          keyExtractor={(item) => item.id}
          loading={loading}
          loadingRows={5}
          emptyState={
            <EmptyState
              icon={LayoutGridIcon}
              title="No services yet"
              description="Add your first service offering."
              actionLabel="Add Service"
              onAction={() => { setEditingService(null); setIsModalOpen(true); }}
            />
          }
        />
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingService ? 'Edit Service' : 'Add New Service'}>
        <ServiceForm initialData={editingService || undefined} onSubmit={handleSaveService} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteService}
        title="Delete Service"
        message="Are you sure you want to delete this service? This action cannot be undone."
      />
    </div>
  );
}
