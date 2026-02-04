import {FormInputProps} from "@/src/@types/global-types";

export interface IntegerInputProps {
  value?: number | null;
  onChange?: (value: number) => void;
  label?: string;
  fullWidth?: boolean;
  error?: string;
  disabled?: boolean;
}

export interface FormIntegerInputProps extends FormInputProps, IntegerInputProps {}
