import {FormInputProps} from "@/src/@types/global-types";

export type ImageInputValue = File | string | null;

export interface ImageInputProps {
  value?: ImageInputValue;
  onChange?: (value: ImageInputValue) => void;
  label?: string;
  error?: string;
  imageSize?: number;
  disabled?: boolean;
}

export interface FormImageInputProps extends Omit<FormInputProps, "additionalOnChange">, ImageInputProps {
  additionalOnChange?: (v: ImageInputValue) => void;
}
