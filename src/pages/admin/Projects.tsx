import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DataTable } from '../../components/admin/DataTable';
import { EmptyState } from '../../components/admin/EmptyState';
import { ProjectForm } from '../../components/admin/ProjectForm';
import { ConfirmDialog } from '../../components/admin/ConfirmDialog';
import { Project } from '../../types';
import {
  PlusIcon,
  EditIcon,
  TrashIcon,
  BriefcaseIcon,
  StarIcon } from
'lucide-react';
import { useProjects } from '../../lib/hooks/useProjects';
import { Spinner } from '../../components/ui/Spinner';
export function Projects() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);
  const [, setIsSubmitting] = useState(false);
  const { projects, loading, addProject, updateProject, deleteProject } =
  useProjects();
  const handleSaveProject = async (data: Partial<Project>) => {
    setIsSubmitting(true);
    try {
      if (editingProject) {
        await updateProject(editingProject.id, data);
      } else {
        await addProject(data as Omit<Project, 'id' | 'createdAt'>);
      }
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project. Check console for details.');
    } finally {
      setIsSubmitting(false);
    }
  };
  const handleDeleteProject = async () => {
    if (projectToDelete) {
      setIsSubmitting(true);
      try {
        await deleteProject(projectToDelete);
        setProjectToDelete(null);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Failed to delete project.');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const columns = [
  {
    header: 'Title',
    accessor: 'title' as keyof Project
  },
  {
    header: 'Category',
    accessor: 'category' as keyof Project
  },
  {
    header: 'Featured',
    cell: (item: Project) =>
    item.isFeatured ?
    <StarIcon className="w-4 h-4 text-yellow-500 fill-current" /> :

    '-'

  },
  {
    header: 'Actions',
    className: 'text-right',
    cell: (item: Project) =>
    <div className="flex justify-end gap-2">
          <button
        onClick={() => {
          setEditingProject(item);
          setIsModalOpen(true);
        }}
        className="p-1.5 text-blue-600 hover:bg-blue-50 rounded">
        
            <EditIcon className="w-4 h-4" />
          </button>
          <button
        onClick={() => {
          setProjectToDelete(item.id);
          setIsDeleteModalOpen(true);
        }}
        className="p-1.5 text-red-600 hover:bg-red-50 rounded">
        
            <TrashIcon className="w-4 h-4" />
          </button>
        </div>

  }];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-main">Projects</h1>
          <p className="text-muted mt-1">Manage your portfolio projects.</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => {
            setEditingProject(null);
            setIsModalOpen(true);
          }}>
          
          <PlusIcon className="w-4 h-4" />
          Add Project
        </Button>
      </div>

      <Card padding="none" className="overflow-hidden">
        {loading ?
        <div className="flex justify-center items-center p-12">
            <Spinner size="lg" />
          </div> :

        <DataTable
          columns={columns}
          data={projects}
          keyExtractor={(item) => item.id}
          emptyState={
          <EmptyState
            icon={BriefcaseIcon}
            title="No projects yet"
            description="Get started by adding your first portfolio project."
            actionLabel="Add Project"
            onAction={() => {
              setEditingProject(null);
              setIsModalOpen(true);
            }} />

          } />

        }
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProject ? 'Edit Project' : 'Add New Project'}>
        
        <ProjectForm
          initialData={editingProject || undefined}
          onSubmit={handleSaveProject}
          onCancel={() => setIsModalOpen(false)} />
        
      </Modal>

      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteProject}
        title="Delete Project"
        message="Are you sure you want to delete this project? This action cannot be undone." />
      
    </div>);

}