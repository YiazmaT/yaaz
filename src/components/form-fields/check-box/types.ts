import {FormInputProps} from "@/src/@types/global-types";

export interface CheckBoxProps {
  value?: boolean;
  onChange?: (value: any) => void;
  label?: string;
  disabled?: boolean;
  error?: string;
}

export interface FormCheckBoxProps extends FormInputProps, CheckBoxProps {}
