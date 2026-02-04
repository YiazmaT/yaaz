import {FormInputProps} from "@/src/@types/global-types";

export interface DatePickerProps {
  value?: string | null;
  onChange?: (value: string) => void;
  label?: string;
  fullWidth?: boolean;
  error?: string;
  disabled?: boolean;
  maxDate?: string;
  minDate?: string;
}

export interface FormDatePickerProps extends FormInputProps, DatePickerProps {}
