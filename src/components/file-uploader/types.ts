export interface FileUploaderProps {
  value: File | null;
  onChange: (file: File | null) => void;
  accept?: string;
  width?: string | number;
  height?: string | number;
  disabled?: boolean;
  uploading?: boolean;
}
