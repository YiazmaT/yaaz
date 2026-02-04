import {FormInputProps} from "@/src/@types/global-types";

export interface RadioOption {
  value: any;
  label: string;
}

export interface RadioGroupProps {
  value?: any;
  onChange?: (value: any) => void;
  label?: string;
  options: RadioOption[];
  disabled?: boolean;
  error?: string;
}

export interface FormRadioGroupProps extends FormInputProps, RadioGroupProps {}
