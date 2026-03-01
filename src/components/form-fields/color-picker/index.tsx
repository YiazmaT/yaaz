"use client";
import {Box, Grid, InputAdornment, Popover, TextField} from "@mui/material";
import {useEffect, useRef, useState} from "react";
import {HexColorPicker} from "react-colorful";
import {Controller} from "react-hook-form";
import {ColorPickerProps, FormColorPickerProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";

export function ColorPicker(props: ColorPickerProps) {
  const [rawInput, setRawInput] = useState(props.value || "");
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const {translate} = useTranslate();
  const lastExternalValue = useRef(props.value);

  useEffect(() => {
    if (props.value !== lastExternalValue.current) {
      lastExternalValue.current = props.value;
      setRawInput(props.value || "");
    }
  }, [props.value]);

  const pickerColor = isValidHex(rawInput) ? rawInput : "#000000";

  function handleSwatchClick(e: React.MouseEvent<HTMLElement>) {
    if (props.disabled) return;
    setAnchorEl(e.currentTarget);
  }

  function handlePickerChange(color: string) {
    setRawInput(color);
    lastExternalValue.current = color;
    props.onChange?.(color);
  }

  function handleTextChange(e: React.ChangeEvent<HTMLInputElement>) {
    const val = e.target.value;
    setRawInput(val);
    const normalized = normalizeHex(val);
    if (isValidHex(normalized)) {
      lastExternalValue.current = normalized;
      props.onChange?.(normalized);
    } else if (val === "" || val === "#") {
      lastExternalValue.current = "";
      props.onChange?.("");
    }
  }

  return (
    <>
      <TextField
        label={props.label ? translate(props.label) : undefined}
        value={rawInput}
        onChange={handleTextChange}
        error={!!props.error}
        helperText={props.error}
        disabled={props.disabled}
        fullWidth
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Box
                  onClick={handleSwatchClick}
                  sx={{
                    width: 24,
                    height: 24,
                    borderRadius: 1,
                    border: "1px solid",
                    borderColor: "divider",
                    backgroundColor: isValidHex(rawInput) ? rawInput : "transparent",
                    cursor: props.disabled ? "default" : "pointer",
                    flexShrink: 0,
                    transition: "background-color 0.15s",
                  }}
                />
              </InputAdornment>
            ),
          },
        }}
      />
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{vertical: "bottom", horizontal: "left"}}
        transformOrigin={{vertical: "top", horizontal: "left"}}
        slotProps={{paper: {sx: {p: 2}}}}
      >
        <HexColorPicker color={pickerColor} onChange={handlePickerChange} />
      </Popover>
    </>
  );
}

export function FormColorPicker(props: FormColorPickerProps) {
  const formContext = useFormContext();
  const grid = typeof props.grid === "boolean" ? props.grid : true;
  const isDisabled = props.disabled ?? formContext.formType === "details";

  function hasError() {
    const err = props.errors ?? formContext.errors;
    if (err?.[props.fieldName]?.message) return err[props.fieldName]?.message as string;
    return "";
  }

  const controller = (
    <Controller
      name={props.fieldName}
      control={props.control ?? formContext.control}
      render={({field: {value, onChange}}) => (
        <ColorPicker
          {...props}
          value={value}
          onChange={(v) => {
            onChange(v);
            props.additionalOnChange?.(v);
          }}
          error={hasError()}
          disabled={isDisabled}
        />
      )}
    />
  );

  if (grid) return <Grid size={props.size ?? 12}>{controller}</Grid>;

  return controller;
}

function isValidHex(value: string) {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

function normalizeHex(value: string) {
  const v = value.trim();
  return v.startsWith("#") ? v : `#${v}`;
}
