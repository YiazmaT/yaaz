import {ReactNode} from "react";

export interface CoreTableColumn<T = any> {
  field: keyof T | string;
  headerKey: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T, index: number) => ReactNode;
  hideOnMobile?: boolean;
}

export interface CoreTableProps<T = any> {
  data: T[];
  columns: CoreTableColumn<T>[];
  loading?: boolean;
  onRowClick?: (row: T) => void;
  emptyMessageKey?: string;
  footerRow?: ReactNode;
}
