import {FormInputProps} from "@/src/@types/global-types";

export interface AsyncDropdownProps<T extends object> {
  value?: T | null;
  onChange?: (value: T | null) => void;
  apiRoute: string;
  uniqueKey: keyof T;
  label?: string;
  error?: string;
  buildLabel?: (option: T) => string;
  renderOption?: (option: T) => React.ReactNode;
  startAdornment?: React.ReactNode;
  disabled?: boolean;
  debounceMs?: number;
  extraQueryParams?: string;
}

export interface FormAsyncDropdownProps<T extends object> extends Omit<FormInputProps, "additionalOnChange">, AsyncDropdownProps<T> {
  additionalOnChange?: (v: T | null) => void;
}
