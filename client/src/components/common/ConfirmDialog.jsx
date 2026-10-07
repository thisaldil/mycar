import { useState } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { toast } from './Toast';

export function ConfirmDialog({ open, onClose, onConfirm, title = 'Are you sure?', message, confirmLabel = 'Delete', tone = 'danger' }) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirm();
      onClose();
    } catch (err) {
      toast.error(err.message || 'That did not work. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
      <>
          <Button variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant={tone === 'danger' ? 'danger' : 'primary'} onClick={handleConfirm} loading={loading} data-autofocus>
            {confirmLabel}
          </Button>
        </>
      }>
      
      <p className="text-sm text-ink-soft">{message}</p>
    </Modal>);

}