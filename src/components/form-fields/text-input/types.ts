import {FormInputProps} from "@/src/@types/global-types";

export interface TextInputProps {
  value?: string;
  onChange?: (value: any) => void;
  label?: string;
  fullWidth?: boolean;
  error?: string;
  isPassword?: boolean;
  multiline?: boolean;
  disabled?: boolean;
}

export interface FormTextInputProps extends FormInputProps, TextInputProps {}
