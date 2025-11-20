export type ModalProps = {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  closeOnEsc?: boolean;
  closeOnBackdrop?: boolean;
  zIndex?: number; // allow override for special cases
  className?: string;
  contentClassName?: string;
};
