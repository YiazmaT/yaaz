import {FormControl, FormControlLabel, FormHelperText, FormLabel, Grid, Radio, RadioGroup as MuiRadioGroup} from "@mui/material";
import {Controller} from "react-hook-form";
import {RadioGroupProps, FormRadioGroupProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";

export function RadioGroup(props: RadioGroupProps) {
  const {translate} = useTranslate();

  return (
    <FormControl error={!!props.error} disabled={props.disabled}>
      {props.label && <FormLabel>{translate(props.label)}</FormLabel>}
      <MuiRadioGroup
        value={props.value ?? ""}
        onChange={(event) => props.onChange?.(event.target.value)}
        sx={{flexDirection: "column"}}
      >
        {props.options.map((option) => (
          <FormControlLabel
            key={option.value}
            value={option.value}
            control={<Radio />}
            label={translate(option.label)}
          />
        ))}
      </MuiRadioGroup>
      {props.error && <FormHelperText>{props.error}</FormHelperText>}
    </FormControl>
  );
}

export function FormRadioGroup(props: FormRadioGroupProps) {
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
          <RadioGroup
            {...props}
            value={value}
            onChange={(v) => {
              onChange(v);
              props.additionalOnChange?.(v);
            }}
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
