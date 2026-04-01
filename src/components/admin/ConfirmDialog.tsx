import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangleIcon } from 'lucide-react';
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDestructive?: boolean;
}
export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDestructive = true
}: ConfirmDialogProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col items-center text-center pt-4 pb-6">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center mb-4 ${isDestructive ? 'bg-red-100 text-red-600' : 'bg-primary/10 text-primary'}`}>
          
          <AlertTriangleIcon className="w-6 h-6" />
        </div>
        <p className="text-muted mb-8">{message}</p>
        <div className="flex gap-4 w-full justify-center">
          <Button variant="outline" onClick={onClose} className="flex-1">
            {cancelText}
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`flex-1 ${isDestructive ? 'bg-red-600 hover:bg-red-700 text-white' : ''}`}>
            
            {confirmText}
          </Button>
        </div>
      </div>
    </Modal>);

}