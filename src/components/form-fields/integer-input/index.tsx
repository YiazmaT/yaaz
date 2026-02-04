import {useState, useEffect} from "react";
import {Grid, IconButton, InputAdornment, TextField} from "@mui/material";
import {Controller} from "react-hook-form";
import {IntegerInputProps, FormIntegerInputProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";
import {KeyboardArrowUp, KeyboardArrowDown} from "@mui/icons-material";

function formatBrazilian(value: number | null | undefined): string {
  if (value === null || value === undefined) return "0";
  if (isNaN(value)) return "0";
  return value.toLocaleString("pt-BR");
}

function parseToNumber(value: string): number {
  const filtered = value.replace(/\D/g, "");
  const num = parseInt(filtered, 10);
  if (isNaN(num)) return 0;
  return num;
}

export function IntegerInput(props: IntegerInputProps) {
  const [localValue, setLocalValue] = useState(formatBrazilian(props.value));
  const {translate} = useTranslate();

  useEffect(() => {
    setLocalValue(formatBrazilian(props.value));
  }, [props.value]);

  function updateValue(newValue: number) {
    const safeValue = Math.max(0, newValue);
    props.onChange && props.onChange(safeValue);
    setLocalValue(formatBrazilian(safeValue));
  }

  function handleStep(step: number) {
    const currentNum = parseToNumber(localValue);
    updateValue(currentNum + step);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const filtered = e.target.value.replace(/\D/g, "");
    setLocalValue(filtered);
  }

  function handleBlur() {
    const parsed = parseToNumber(localValue);
    updateValue(parsed);
  }

  return (
    <TextField
      variant="outlined"
      label={props.label ? translate(props.label) : undefined}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      size="medium"
      error={!!props.error}
      helperText={props.error}
      fullWidth={props.fullWidth}
      disabled={props.disabled}
      slotProps={{
        htmlInput: {inputMode: "numeric"},
        input: {
          endAdornment: !props.disabled && (
            <InputAdornment position="end" sx={{flexDirection: "column", ml: 0}}>
              <IconButton size="small" onClick={() => handleStep(1)} sx={{p: 0, height: "18px"}}>
                <KeyboardArrowUp fontSize="small" />
              </IconButton>
              <IconButton size="small" onClick={() => handleStep(-1)} sx={{p: 0, height: "18px"}}>
                <KeyboardArrowDown fontSize="small" />
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

export function FormIntegerInput(props: FormIntegerInputProps) {
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
          <IntegerInput
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
