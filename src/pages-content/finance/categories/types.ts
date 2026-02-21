export interface FinanceCategory {
  id: string;
  name: string;
  active: boolean;
}

export interface CategoriesFilters {
  showInactives?: boolean;
}
