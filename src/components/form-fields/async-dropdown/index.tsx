import {useState, useCallback, useRef} from "react";
import {
  Box,
  ClickAwayListener,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Paper,
  Popper,
  TextField,
  Typography,
} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import ClearIcon from "@mui/icons-material/Clear";
import {Controller} from "react-hook-form";
import {SmallLoader} from "@/src/components/small-loader";
import {AsyncDropdownProps, FormAsyncDropdownProps} from "./types";
import {useTranslate} from "@/src/contexts/translation-context";
import {useFormContext} from "@/src/contexts/form-context";

const PAGE_SIZE = 10;

export function AsyncDropdown<T extends object>(props: AsyncDropdownProps<T>) {
  const [options, setOptions] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [open, setOpen] = useState(false);
  const {translate} = useTranslate();
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const pageRef = useRef(1);
  const totalRef = useRef(0);
  const anchorRef = useRef<HTMLDivElement | null>(null);

  const debounceMs = props.debounceMs ?? parseInt(process.env.NEXT_PUBLIC_SEARCH_DEBOUNCE_MS || "300");

  function getOptionLabel(option: T) {
    if (props.buildLabel) {
      return props.buildLabel(option);
    }
    return String(option[props.uniqueKey]);
  }

  const fetchOptions = useCallback(
    async (search: string, page: number) => {
      const isFirstPage = page === 1;
      if (isFirstPage) setLoading(true);
      else setLoadingMore(true);
      try {
        const extraParams = props.extraQueryParams ? `&${props.extraQueryParams}` : "";
        const response = await fetch(
          `${props.apiRoute}?search=${encodeURIComponent(search)}&page=${page}&limit=${PAGE_SIZE}${extraParams}`,
        );
        if (response.ok) {
          const json = await response.json();
          const result = json.data !== undefined ? json.data : json;
          const newData: T[] = result.data || [];
          totalRef.current = result.total ?? 0;
          pageRef.current = page;
          if (isFirstPage) {
            setOptions(newData);
          } else {
            setOptions((prev) => [...prev, ...newData]);
          }
        }
      } finally {
        if (isFirstPage) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [props.apiRoute, props.extraQueryParams],
  );

  function handleScroll(event: React.UIEvent<HTMLUListElement>) {
    const el = event.currentTarget;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 50;
    if (nearBottom && !loading && !loadingMore && options.length < totalRef.current) {
      fetchOptions(inputValue, pageRef.current + 1);
    }
  }

  function handleInputChange(value: string) {
    setInputValue(value);

    if (debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
    }

    debounceTimeout.current = setTimeout(() => {
      pageRef.current = 1;
      totalRef.current = 0;
      fetchOptions(value, 1);
    }, debounceMs);
  }

  function handleSelect(option: T) {
    props.onChange?.(option);
    setInputValue("");
    setOpen(false);
  }

  function handleClear(e: React.MouseEvent) {
    e.stopPropagation();
    props.onChange?.(null);
    setInputValue("");
    setOptions([]);
    pageRef.current = 1;
    totalRef.current = 0;
  }

  function handleOpen() {
    if (props.disabled) return;
    setOpen(true);
    if (options.length === 0) {
      fetchOptions("", 1);
    }
  }

  function handleClose() {
    setOpen(false);
    setInputValue("");
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      handleClose();
    }
  }

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (open) handleClose();
    else handleOpen();
  }

  return (
    <ClickAwayListener onClickAway={handleClose}>
      <Box ref={anchorRef}>
        <TextField
          value={open ? inputValue : props.value ? getOptionLabel(props.value) : ""}
          onChange={(e) => handleInputChange(e.target.value)}
          onClick={handleOpen}
          onKeyDown={handleKeyDown}
          label={props.label ? translate(props.label) : undefined}
          error={!!props.error}
          helperText={props.error}
          disabled={props.disabled}
          fullWidth
          slotProps={{
            input: {
              startAdornment: props.startAdornment ? <InputAdornment position="start">{props.startAdornment}</InputAdornment> : undefined,
              endAdornment: (
                <InputAdornment position="end">
                  {loading && <SmallLoader size={20} />}
                  {!loading && props.value && !props.disabled && (
                    <IconButton size="small" onClick={handleClear} edge="end">
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  )}
                  <IconButton size="small" onClick={handleToggle} edge="end" disabled={props.disabled}>
                    <ArrowDropDownIcon
                      sx={{
                        transform: open ? "rotate(180deg)" : "none",
                        transition: "transform 0.2s",
                      }}
                    />
                  </IconButton>
                </InputAdornment>
              ),
            },
          }}
        />
        <Popper
          open={open}
          anchorEl={anchorRef.current}
          placement="bottom-start"
          sx={{width: anchorRef.current?.clientWidth, zIndex: 1301}}
        >
          <Paper elevation={8} sx={{mt: 0.5}}>
            <Box
              component="ul"
              onScroll={handleScroll}
              sx={{
                listStyle: "none",
                m: 0,
                p: "8px 0",
                maxHeight: "40vh",
                overflow: "auto",
              }}
            >
              {options.map((option) => (
                <MenuItem
                  key={String(option[props.uniqueKey])}
                  onClick={() => handleSelect(option)}
                  selected={props.value?.[props.uniqueKey] === option[props.uniqueKey]}
                >
                  {props.renderOption ? props.renderOption(option) : getOptionLabel(option)}
                </MenuItem>
              ))}
              {loadingMore && (
                <Box sx={{display: "flex", justifyContent: "center", py: 1}}>
                  <CircularProgress size={20} />
                </Box>
              )}
              {options.length === 0 && !loading && (
                <Typography sx={{py: 1, px: 2, color: "text.secondary"}}>
                  {translate("global.noDataFound")}
                </Typography>
              )}
            </Box>
          </Paper>
        </Popper>
      </Box>
    </ClickAwayListener>
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
