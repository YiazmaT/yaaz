import {ReactNode} from "react";
import {CoreTableColumn} from "@/src/components/core-table/types";

export type DataTableColumn<T = any> = CoreTableColumn<T>;

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
