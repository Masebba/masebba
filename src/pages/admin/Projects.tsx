import React, { useMemo, useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/admin/DataTable';
import { EmptyState } from '../../components/admin/EmptyState';
import { ProjectForm } from '../../components/admin/ProjectForm';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Project } from '../../types';
import { PlusIcon, EditIcon, TrashIcon, BriefcaseIcon, StarIcon, ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { useProjects } from '../../lib/hooks/useProjects';

export function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { projects, loading, addProject, updateProject, deleteProject, moveProjectOrder, moveProjectHomeOrder, setProjectHomeVisibility } = useProjects();

  const homeProjects = useMemo(
    () => [...projects].filter((project) => project.showOnHome).sort((a, b) => (a.homeOrder ?? 0) - (b.homeOrder ?? 0) || (a.order ?? 0) - (b.order ?? 0)),
    [projects],
  );

  const handleSaveProject = async (data: Partial<Project>) => {
    setIsSubmitting(true);
    try {
      const result = editingProject ? await updateProject(editingProject.id, data) : await addProject(data as Omit<Project, 'id' | 'createdAt'>);
      if (result?.error) throw new Error(result.error);
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteProject = async () => {
    if (!projectToDelete) return;

    setIsSubmitting(true);
    try {
      const result = await deleteProject(projectToDelete);
      if (result?.error) throw new Error(result.error);
      setProjectToDelete(null);
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting project:', error);
      alert('Failed to delete project.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Order',
      cell: (item: Project) => {
        const index = projects.findIndex((project) => project.id === item.id);
        return (
          <div className="flex items-center gap-2">
            <span className="font-semibold text-main w-8">{(item.order ?? index) + 1}</span>
            <div className="flex flex-col">
              <button type="button" onClick={() => moveProjectOrder(item.id, -1)} disabled={index <= 0 || isSubmitting} className="p-1 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move project up"><ArrowUpIcon className="w-4 h-4" /></button>
              <button type="button" onClick={() => moveProjectOrder(item.id, 1)} disabled={index < 0 || index >= projects.length - 1 || isSubmitting} className="p-1 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move project down"><ArrowDownIcon className="w-4 h-4" /></button>
            </div>
          </div>
        );
      },
    },
    { header: 'Title', accessor: 'title' as keyof Project },
    { header: 'Category', accessor: 'category' as keyof Project },
    {
      header: 'Home',
      cell: (item: Project) => {
        const homeIndex = homeProjects.findIndex((project) => project.id === item.id);
        const isOnHome = Boolean(item.showOnHome);

        return (
          <div className="flex items-center gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-main">
              <input type="checkbox" checked={isOnHome} onChange={(e) => setProjectHomeVisibility(item.id, e.target.checked)} className="rounded border-border text-primary focus:ring-primary" disabled={isSubmitting} />
              Show
            </label>

            {isOnHome ? (
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-primary">#{(item.homeOrder ?? homeIndex) + 1}</span>
                <button type="button" onClick={() => moveProjectHomeOrder(item.id, -1)} disabled={homeIndex <= 0 || isSubmitting} className="p-1 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move home project up"><ArrowUpIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => moveProjectHomeOrder(item.id, 1)} disabled={homeIndex < 0 || homeIndex >= homeProjects.length - 1 || isSubmitting} className="p-1 rounded hover:bg-surface disabled:opacity-30 disabled:cursor-not-allowed" aria-label="Move home project down"><ArrowDownIcon className="w-4 h-4" /></button>
              </div>
            ) : (
              <span className="text-xs text-muted">Hidden</span>
            )}
          </div>
        );
      },
    },
    {
      header: 'Featured',
      cell: (item: Project) =>
        item.isFeatured ? (
          <span className="inline-flex items-center gap-1 text-yellow-600 font-medium"><StarIcon className="w-4 h-4 fill-current" /> Badge</span>
        ) : (
          '-'
        ),
    },
    {
      header: 'Actions',
      className: 'text-right',
      cell: (item: Project) => (
        <div className="flex justify-end gap-2">
          <button type="button" onClick={() => { setEditingProject(item); setIsModalOpen(true); }} className="p-1.5 text-blue-600 hover:bg-blue-50 rounded" disabled={isSubmitting}><EditIcon className="w-4 h-4" /></button>
          <button type="button" onClick={() => { setProjectToDelete(item.id); setIsDeleteModalOpen(true); }} className="p-1.5 text-red-600 hover:bg-red-50 rounded" disabled={isSubmitting}><TrashIcon className="w-4 h-4" /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Projects</h1>
          <p className="text-muted mt-1">Manage portfolio projects, gallery images, home display order, and portfolio order.</p>
        </div>
        <Button className="gap-2" onClick={() => { setEditingProject(null); setIsModalOpen(true); }} disabled={isSubmitting}>
          <PlusIcon className="w-4 h-4" /> Add Project
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        <DataTable
          columns={columns}
          data={projects}
          keyExtractor={(item) => item.id}
          loading={loading}
          loadingRows={5}
          emptyState={<EmptyState icon={BriefcaseIcon} title="No projects yet" description="Get started by adding your first portfolio project." actionLabel="Add Project" onAction={() => { setEditingProject(null); setIsModalOpen(true); }} />}
        />
      </Card>

      <div className="text-xs text-muted">Home projects are selected with the checkbox and ordered with the arrows. Portfolio order uses the first column arrows.</div>

      <Modal isOpen={isModalOpen} onClose={() => { if (!isSubmitting) setIsModalOpen(false); }} title={editingProject ? 'Edit Project' : 'Add New Project'}>
        <ProjectForm initialData={editingProject || undefined} onSubmit={handleSaveProject} onCancel={() => setIsModalOpen(false)} />
      </Modal>

      <ConfirmDialog isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={handleDeleteProject} title="Delete Project" message="Are you sure you want to delete this project? This action cannot be undone." />
    </div>
  );
}
