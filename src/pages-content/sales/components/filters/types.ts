export interface SalesFilters {
  dateFrom?: string;
  dateTo?: string;
  valueFrom?: string;
  valueTo?: string;
  [key: string]: string | undefined;
}

export interface SalesFiltersProps {
  onFilterChange: (filters: SalesFilters) => void;
}

export interface SalesFilterFormValues {
  dateFrom: string;
  dateTo: string;
  valueFrom: string;
  valueTo: string;
}
