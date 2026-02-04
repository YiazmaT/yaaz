import {FormInputProps} from "@/src/@types/global-types";

export interface DecimalInputProps {
  value?: string | null;
  onChange?: (value: string) => void;
  label?: string;
  fullWidth?: boolean;
  error?: string;
  disabled?: boolean;
}

export interface FormDecimalInputProps extends FormInputProps, DecimalInputProps {}
