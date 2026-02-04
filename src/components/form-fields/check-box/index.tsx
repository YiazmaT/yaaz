import {Checkbox as BaseCheckbox, FormControl, FormControlLabel, FormHelperText, Grid} from "@mui/material";
import {Controller} from "react-hook-form";
import {CheckBoxProps, FormCheckBoxProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";

export function CheckBox(props: CheckBoxProps) {
  const {translate} = useTranslate();

  return (
    <FormControl error={props.error !== ""}>
      <FormControlLabel
        checked={props.value}
        onChange={(event: any) => props.onChange?.(event.target.checked)}
        label={translate(props.label ?? "")}
        control={<BaseCheckbox />}
        disabled={props.disabled}
      />
      {props.error && <FormHelperText>{props.error}</FormHelperText>}
    </FormControl>
  );
}

export function FormCheckBox(props: FormCheckBoxProps) {
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
          <CheckBox
            {...props}
            value={value}
            onChange={(v) => {
              o(v);
              props.additionalOnChange && props.additionalOnChange(v);
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
