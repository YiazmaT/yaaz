import {Grid, TextField} from "@mui/material";
import {Controller} from "react-hook-form";
import {CurrencyInputProps, FormCurrencyInputProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";

function parseToString(inputValue: string): string {
  const digits = inputValue.replace(/\D/g, "");
  const asInteger = parseInt(digits, 10) || 0;
  return (asInteger / 100).toString();
}

export function CurrencyInput(props: CurrencyInputProps) {
  const {translate} = useTranslate();
  const formatCurrency = useFormatCurrency();
  const value = props.value ?? "0";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseToString(e.target.value);
    props.onChange && props.onChange(newValue);
  }

  return (
    <TextField
      variant="outlined"
      label={props.label ? translate(props.label) : undefined}
      value={formatCurrency(value)}
      onChange={handleChange}
      size="medium"
      error={!!props.error}
      helperText={props.error}
      fullWidth={props.fullWidth}
      disabled={props.disabled}
      slotProps={{htmlInput: {inputMode: "numeric"}}}
    />
  );
}

export function FormCurrencyInput(props: FormCurrencyInputProps) {
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
        return (
          <CurrencyInput
            {...props}
            onChange={(v) => {
              onChange(v);
              props.additionalOnChange && props.additionalOnChange(String(v));
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
