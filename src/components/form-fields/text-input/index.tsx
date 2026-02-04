import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import {Grid, IconButton, TextField} from "@mui/material";
import {useState} from "react";
import {Controller} from "react-hook-form";
import {FormTextInputProps, TextInputProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";

export function TextInput(props: TextInputProps) {
  const [showPassword, setShowPassword] = useState(false);
  const {translate} = useTranslate();

  function togglePasswordVisibility() {
    setShowPassword((value) => !value);
  }

  return (
    <TextField
      variant="outlined"
      label={translate(props.label)}
      value={props.value}
      onChange={(e) => props.onChange && props.onChange(e.target.value)}
      size="medium"
      error={!!props.error}
      helperText={props.error}
      fullWidth
      disabled={props.disabled}
      type={props.isPassword ? (showPassword ? "text" : "password") : "text"}
      {...(props.isPassword && {
        InputProps: {
          endAdornment: (
            <IconButton onClick={togglePasswordVisibility} size="small">
              {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
            </IconButton>
          ),
        },
      })}
      {...(props.multiline && {multiline: true, rows: 5})}
    />
  );
}

export function FormTextInput(props: FormTextInputProps) {
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
          <TextInput
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
