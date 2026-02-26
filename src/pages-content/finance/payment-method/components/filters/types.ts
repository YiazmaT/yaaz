import {PaymentMethodFilters} from "../../types";

export interface PaymentMethodFiltersProps {
  onFilterChange: (filters: PaymentMethodFilters) => void;
}
