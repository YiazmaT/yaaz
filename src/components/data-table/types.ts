import {ReactNode} from "react";

export interface DataTableColumn<T = any> {
  field: keyof T | string;
  headerKey: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => ReactNode;
  hideOnMobile?: boolean;
}

export interface DataTableProps<T = any> {
  apiRoute: string;
  columns: DataTableColumn<T>[];
  rowsPerPageOptions?: number[];
  defaultRowsPerPage?: number;
  onRowClick?: (row: T) => void;
  footerLeftContent?: ReactNode;
  hideSearch?: boolean;
  filters?: Record<string, string | undefined>;
  renderOpositeSearch?: ReactNode;
}

export interface ApiResponse<T = any> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}
