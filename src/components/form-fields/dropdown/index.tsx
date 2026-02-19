import {Autocomplete, Grid, InputAdornment, TextField} from "@mui/material";
import {Controller} from "react-hook-form";
import {DropdownProps, FormDropdownProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";

export function Dropdown<T extends object>(props: DropdownProps<T>) {
  const {translate} = useTranslate();
  const hasCustomRender = !!props.renderOption;
  const hasValue = !!props.value;

  function getOptionLabel(option: T) {
    if (props.buildLabel) {
      return props.buildLabel(option);
    }
    return String(option[props.uniqueKey]);
  }

  function isOptionEqualToValue(option: T, value: T) {
    return option[props.uniqueKey] === value[props.uniqueKey];
  }

  return (
    <Autocomplete
      value={props.value ?? null}
      onChange={(_, newValue) => props.onChange?.(newValue)}
      options={props.options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      disabled={props.disabled}
      renderOption={
        hasCustomRender
          ? (htmlProps, option) => (
              <li {...htmlProps} key={String(option[props.uniqueKey])}>
                {props.renderOption!(option)}
              </li>
            )
          : undefined
      }
      renderInput={({InputProps, inputProps, ...rest}) => (
        <TextField
          {...rest}
          slotProps={{
            input: {
              ...InputProps,
              ...(hasCustomRender && hasValue
                ? {
                    startAdornment: <InputAdornment position="start">{props.renderOption!(props.value!)}</InputAdornment>,
                  }
                : {}),
            },
            htmlInput: {
              ...inputProps,
              ...(hasCustomRender && hasValue ? {style: {color: "transparent", caretColor: "transparent"}} : {}),
            },
          }}
          label={props.label ? translate(props.label) : undefined}
          error={!!props.error}
          helperText={props.error}
        />
      )}
      fullWidth
    />
  );
}

export function FormDropdown<T extends object>(props: FormDropdownProps<T>) {
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
          <Dropdown<T>
            {...props}
            onChange={(v) => {
              onChange(v);
              props.additionalOnChange?.(v);
            }}
            value={value}
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
