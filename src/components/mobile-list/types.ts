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
  hideEdit?: (row: T) => boolean;
  onDelete?: (row: T) => void;
  hideSearch?: boolean;
  filters?: Record<string, string | undefined>;
}

export interface MobileListActionsProps<T = any> {
  row: T;
  onView?: (row: T) => void;
  onEdit?: (row: T) => void;
  hideEdit?: boolean;
  onDelete?: (row: T) => void;
}

export interface ApiResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
