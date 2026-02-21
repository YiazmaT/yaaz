import {ProductsFilters} from "../../types";

export interface ProductsFiltersProps {
  onFilterChange: (filters: ProductsFilters) => void;
}
