import {ReactNode} from "react";

export interface ImagePreviewColumnProps {
  image?: string | null;
  alt: string;
}

export interface CustomAction<T> {
  icon: ReactNode | ((row: T) => ReactNode);
  tooltip: string | ((row: T) => string);
  onClick: (row: T) => void;
  hidden?: (row: T) => boolean;
}

export interface ActionsColumnProps<T> {
  row: T;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  hideEdit?: (row: T) => boolean;
  onDelete?: (row: T) => void;
  customActions?: CustomAction<T>[];
}

export interface TableButtonProps {
  onClick: () => void;
  children: ReactNode;
  color?: string;
  minWidth?: number;
}