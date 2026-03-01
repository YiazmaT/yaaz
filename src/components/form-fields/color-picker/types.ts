import {FormInputProps} from "@/src/@types/global-types";

export interface ColorPickerProps {
  value?: string;
  onChange?: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export interface FormColorPickerProps extends FormInputProps, ColorPickerProps {}
