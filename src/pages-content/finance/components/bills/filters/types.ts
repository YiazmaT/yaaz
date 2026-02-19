export interface BillsFilters {
  categoryId?: string;
  valueFrom?: string;
  valueTo?: string;
  dueDateFrom?: string;
  dueDateTo?: string;
  status?: string;
  [key: string]: string | undefined;
}

export interface BillsFiltersProps {
  onFilterChange: (filters: BillsFilters) => void;
}

export interface BillsFilterFormValues {
  categoryId: string;
  valueFrom: string;
  valueTo: string;
  dueDateFrom: string;
  dueDateTo: string;
  status: string;
}

export type BillStatusOption = {value: string; label: string; color: "warning" | "success" | "error"};
