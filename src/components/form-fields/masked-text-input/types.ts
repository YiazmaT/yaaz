import {FormInputProps} from "@/src/@types/global-types";

export interface MaskedTextInputProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  fullWidth?: boolean;
  error?: string;
  disabled?: boolean;
  mask: string;
}

export interface FormMaskedTextInputProps extends FormInputProps, MaskedTextInputProps {}
