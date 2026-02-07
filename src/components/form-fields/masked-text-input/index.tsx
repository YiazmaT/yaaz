import {Grid, TextField} from "@mui/material";
import {Controller} from "react-hook-form";
import {FormMaskedTextInputProps, MaskedTextInputProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";

function applyMask(value: string, mask: string): string {
  const digits = value.replace(/\D/g, "");
  let result = "";
  let digitIndex = 0;

  for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
    if (mask[i] === "9") {
      result += digits[digitIndex];
      digitIndex++;
    } else {
      result += mask[i];
    }
  }

  return result;
}

export function MaskedTextInput(props: MaskedTextInputProps) {
  const {translate} = useTranslate();

  function handleChange(rawValue: string) {
    const masked = applyMask(rawValue, props.mask);
    props.onChange && props.onChange(masked);
  }

  return (
    <TextField
      variant="outlined"
      label={translate(props.label)}
      value={props.value}
      onChange={(e) => handleChange(e.target.value)}
      size="medium"
      error={!!props.error}
      helperText={props.error}
      fullWidth
      disabled={props.disabled}
    />
  );
}

export function FormMaskedTextInput(props: FormMaskedTextInputProps) {
  const formContext = useFormContext();
  const grid = typeof props.grid === "boolean" ? props.grid : true;
  const isDisabled = props.disabled ?? formContext.formType === "details";

  function hasError() {
    const err = props.errors ? props.errors : formContext.errors;
    if (err) {
      if (err[props.fieldName]?.message) return err[props.fieldName]?.message as string;
    }
    return "";
  }

  const controller = (
    <Controller
      name={props.fieldName}
      control={props.control ? props.control : formContext.control}
      render={({field: {value, onChange}}) => {
        const o = onChange;
        return (
          <MaskedTextInput
            {...props}
            onChange={(v) => {
              o(v);
              props.additionalOnChange && props.additionalOnChange(v);
            }}
            value={value}
            fullWidth={typeof props.fullWidth === "boolean" ? props.fullWidth : true}
            error={hasError()}
            disabled={isDisabled}
          />
        );
      }}
    />
  );

  if (grid) return <Grid size={props.size ?? 12}>{controller}</Grid>;

  return controller;
}
