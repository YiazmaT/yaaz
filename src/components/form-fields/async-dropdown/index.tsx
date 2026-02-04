import {useState, useCallback, useRef} from "react";
import {Autocomplete, Grid, TextField} from "@mui/material";
import {Controller} from "react-hook-form";
import {SmallLoader} from "@/src/components/small-loader";
import {AsyncDropdownProps, FormAsyncDropdownProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";

export function AsyncDropdown<T extends object>(props: AsyncDropdownProps<T>) {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const {translate} = useTranslate();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const debounceMs = props.debounceMs ?? parseInt(process.env.NEXT_PUBLIC_SEARCH_DEBOUNCE_MS || "300");

  function getOptionLabel(option: T) {
    if (props.buildLabel) {
      return props.buildLabel(option);
    }
    return String(option[props.uniqueKey]);
  }

  function isOptionEqualToValue(option: T, value: T) {
    return option[props.uniqueKey] === value[props.uniqueKey];
  }

  const fetchOptions = useCallback(
    async (search: string) => {
      setLoading(true);
      try {
        const extraParams = props.extraQueryParams ? `&${props.extraQueryParams}` : "";
        const response = await fetch(`${props.apiRoute}?search=${encodeURIComponent(search)}&limit=10${extraParams}`);
        if (response.ok) {
          const result = await response.json();
          setOptions(result.data || []);
        }
      } finally {
        setLoading(false);
      }
    },
    [props.apiRoute, props.extraQueryParams],
  );

  function handleInputChange(_: React.SyntheticEvent, newInputValue: string, reason: string) {
    setInputValue(newInputValue);

    if (reason !== "input") {
      return;
    }

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      fetchOptions(newInputValue);
    }, debounceMs);
  }

  function handleChange(_: React.SyntheticEvent, newValue: T | null) {
    props.onChange?.(newValue);
    setInputValue("");
    if (inputValue) setOptions([]);
  }

  function handleOpen() {
    if (options.length === 0) {
      fetchOptions("");
    }
  }

  return (
    <Autocomplete
      value={props.value ?? null}
      onChange={handleChange}
      onOpen={handleOpen}
      inputValue={inputValue}
      onInputChange={handleInputChange}
      options={options}
      getOptionLabel={getOptionLabel}
      isOptionEqualToValue={isOptionEqualToValue}
      disabled={props.disabled}
      loading={loading}
      filterOptions={(x) => x}
      renderOption={
        props.renderOption
          ? ({key, ...restProps}, option) => (
              <li key={key} {...restProps}>
                {props.renderOption!(option)}
              </li>
            )
          : undefined
      }
      renderInput={(params) => (
        <TextField
          {...params}
          label={props.label ? translate(props.label) : undefined}
          error={!!props.error}
          helperText={props.error}
          slotProps={{
            input: {
              ...params.InputProps,
              endAdornment: (
                <>
                  {loading && <SmallLoader />}
                  {params.InputProps.endAdornment}
                </>
              ),
            },
          }}
        />
      )}
      fullWidth
    />
  );
}

export function FormAsyncDropdown<T extends object>(props: FormAsyncDropdownProps<T>) {
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
          <AsyncDropdown<T>
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
