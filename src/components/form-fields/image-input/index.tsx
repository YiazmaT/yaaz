import AddPhotoAlternateIcon from "@mui/icons-material/AddPhotoAlternate";
import {Box, FormHelperText, Grid, Typography} from "@mui/material";
import {useRef, useState, useEffect} from "react";
import {Controller} from "react-hook-form";
import {FormImageInputProps, ImageInputProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";
import {flexGenerator} from "@/src/utils/flex-generator";

export function ImageInput(props: ImageInputProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [sizeError, setSizeError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const {translate} = useTranslate();
  const size = props.imageSize ?? 150;
  const maxFileSizeMB = props.maxFileSizeMB ?? 5;

  useEffect(() => {
    if (props.value instanceof File) {
      const url = URL.createObjectURL(props.value);
      setPreview(url);
      return () => URL.revokeObjectURL(url);
    } else if (typeof props.value === "string") {
      setPreview(props.value);
    } else {
      setPreview(null);
    }
  }, [props.value]);

  function handleClick() {
    if (props.disabled) return;
    inputRef.current?.click();
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] ?? null;
    if (file) {
      const fileSizeMB = file.size / (1024 * 1024);
      if (fileSizeMB > maxFileSizeMB) {
        setSizeError(translate("global.errors.fileTooLarge").replace("{{maxSize}}", maxFileSizeMB.toString()));
        e.target.value = "";
        return;
      }
      setSizeError(null);
    }
    props.onChange?.(file);
  }

  return (
    <Box>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleChange}
        style={{display: "none"}}
      />
      <Box
        onClick={handleClick}
        sx={{
          width: size,
          height: size,
          border: props.error || sizeError ? "2px dashed error.main" : "2px dashed",
          borderColor: props.error || sizeError ? "error.main" : "grey.400",
          borderRadius: 2,
          cursor: props.disabled ? "default" : "pointer",
          overflow: "hidden",
          opacity: props.disabled ? 0.5 : 1,
          ...flexGenerator("c.center.center"),
          ...(!props.disabled && {
            "&:hover": {
              borderColor: props.error || sizeError ? "error.main" : "primary.main",
              backgroundColor: "action.hover",
            },
          }),
        }}
      >
        {preview ? (
          <Box
            component="img"
            src={preview}
            alt="Preview"
            sx={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <Box sx={{...flexGenerator("c.center.center"), color: "grey.500"}}>
            <AddPhotoAlternateIcon sx={{fontSize: size * 0.3}} />
            {props.label && (
              <Typography variant="caption" sx={{mt: 1}}>
                {translate(props.label)}
              </Typography>
            )}
          </Box>
        )}
      </Box>
      {(props.error || sizeError) && (
        <FormHelperText error>{sizeError || props.error}</FormHelperText>
      )}
    </Box>
  );
}

export function FormImageInput(props: FormImageInputProps) {
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
          <ImageInput
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

  if (grid) return <Grid size={props.size ?? 12} sx={{display: "flex", justifyContent: "center"}}>{controller}</Grid>;

  return controller;
}
