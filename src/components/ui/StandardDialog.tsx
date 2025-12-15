import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from './dialog';
import { Button } from './button';

interface StandardDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  defaultFooter?: {
    cancelLabel?: string;
    submitLabel?: string;
    onCancel?: () => void;
    onSubmit?: () => void;
    submitVariant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  };
  className?: string;
  maxHeight?: string;
  scrollable?: boolean;
}

/**
 * StandardDialog - A centralized dialog component with consistent design scheme
 * 
 * Usage:
 * <StandardDialog
 *   trigger={<Button>Open</Button>}
 *   title="Dialog Title"
 *   footer={<Button>Save</Button>}
 * >
 *   <div>Content here</div>
 * </StandardDialog>
 */
export function StandardDialog({
  open,
  onOpenChange,
  trigger,
  title,
  children,
  footer,
  defaultFooter,
  className = '',
  maxHeight = 'max-h-[90vh]',
  scrollable = true,
}: StandardDialogProps) {
  const dialogContentClass = `p-0 gap-0 large-dialog bg-white ${maxHeight} ${className}`;
  const scrollableContainerClass = scrollable 
    ? 'flex-1 overflow-y-auto dialog-content-scrollable min-h-0 bg-white' 
    : 'bg-white';
  const bodyClass = scrollable
    ? 'px-6 pb-1'
    : 'px-6 pb-1';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className={dialogContentClass}>
        <div className={scrollableContainerClass}>
          <DialogHeader className="px-6 pt-4 pb-3 bg-white">
            <DialogTitle className="text-gray-700">{title}</DialogTitle>
          </DialogHeader>
          <div className={bodyClass}>
            <div className="space-y-4 py-4">{children}</div>
          </div>
          {(footer || defaultFooter) && (
            <div className="flex justify-end gap-2 px-6 py-2 border-t bg-white flex-shrink-0">
              {footer || (
                <>
                  {defaultFooter?.onCancel && (
                    <Button
                      variant="outline"
                      onClick={defaultFooter.onCancel}
                      className="py-1"
                    >
                      {defaultFooter.cancelLabel || 'Cancel'}
                    </Button>
                  )}
                  {defaultFooter?.onSubmit && (
                    <Button
                      variant={defaultFooter.submitVariant || 'default'}
                      onClick={defaultFooter.onSubmit}
                      className="py-1"
                    >
                      {defaultFooter.submitLabel || 'Submit'}
                    </Button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
