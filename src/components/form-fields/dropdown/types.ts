import {FormInputProps} from "@/src/@types/global-types";

export interface DropdownProps<T extends object> {
  value?: T | null;
  onChange?: (value: T | null) => void;
  options: T[];
  uniqueKey: keyof T;
  label?: string;
  error?: string;
  buildLabel?: (option: T) => string;
  disabled?: boolean;
}

export interface FormDropdownProps<T extends object> extends Omit<FormInputProps, "additionalOnChange">, DropdownProps<T> {
  additionalOnChange?: (v: T | null) => void;
}
