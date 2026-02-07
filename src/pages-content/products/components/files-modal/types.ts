export interface FilesModalProps {
  open: boolean;
  onClose: () => void;
  productId: string;
  productName: string;
  files: string[];
  maxFileSizeMb: number;
  onFilesChange: (files: string[]) => void;
}
