import {Grid, TextField} from "@mui/material";
import {Controller} from "react-hook-form";
import {DateTimePickerProps, FormDateTimePickerProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";

export function DateTimePicker(props: DateTimePickerProps) {
  const {translate} = useTranslate();
  const value = props.value ?? "";

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    props.onChange && props.onChange(e.target.value);
  }

  return (
    <TextField
      variant="outlined"
      type="datetime-local"
      label={props.label ? translate(props.label) : undefined}
      value={value}
      onChange={handleChange}
      size="medium"
      error={!!props.error}
      helperText={props.error}
      fullWidth={props.fullWidth}
      disabled={props.disabled}
      slotProps={{
        inputLabel: {shrink: true},
        htmlInput: {
          max: props.maxDate,
          min: props.minDate,
        },
      }}
    />
  );
}

export function FormDateTimePicker(props: FormDateTimePickerProps) {
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
          <DateTimePicker
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
