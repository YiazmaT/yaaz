import {ReactNode} from "react";

export interface MobileListProps<T = any> {
  title: string;
  apiRoute: string;
  renderRow: (row: T, actions: ReactNode) => ReactNode;
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  onRowClick?: (row: T) => void;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  hideSearch?: boolean;
}

export interface MobileListActionsProps<T = any> {
  row: T;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export interface ApiResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
