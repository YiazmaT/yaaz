import {FormInputProps} from "@/src/@types/global-types";

export interface CurrencyInputProps {
  value?: string | null;
  onChange?: (value: string) => void;
  label?: string;
  fullWidth?: boolean;
  error?: string;
  errorAsIcon?: boolean;
  disabled?: boolean;
}

export interface FormCurrencyInputProps extends FormInputProps, CurrencyInputProps {}
