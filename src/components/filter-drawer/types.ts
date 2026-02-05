import {ReactNode} from "react";

export interface FilterDrawerProps {
  children: ReactNode;
  hasActiveFilters: boolean;
  onClear: () => void;
  showActionButtons?: boolean;
  onApply?: () => void;
  translationPrefix?: string;
}
