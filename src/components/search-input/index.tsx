"use client";
import {useEffect, useState} from "react";
import {InputAdornment, TextField, useTheme} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import {useTranslate} from "@/src/contexts/translation-context";
import {SearchInputProps} from "./types";

const DEBOUNCE_MS = parseInt(process.env.NEXT_PUBLIC_SEARCH_DEBOUNCE_MS || "1000");

export function SearchInput(props: SearchInputProps) {
  const [value, setValue] = useState("");
  const {translate} = useTranslate();
  const theme = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => {
      props.onSearch(value);
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [value]);

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
  }

  return (
    <TextField
      size="small"
      placeholder={translate("global.search")}
      value={value}
      onChange={handleChange}
      fullWidth={props.fullWidth}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{color: theme.palette.grey[400]}} />
            </InputAdornment>
          ),
        },
      }}
      sx={{
        "& .MuiOutlinedInput-root": {
          backgroundColor: "white",
          border: "1px solid transparent",
          backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.divider}, ${theme.palette.divider})`,
          backgroundOrigin: "border-box",
          backgroundClip: "padding-box, border-box",
          borderRadius: 1,
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "& fieldset": {
            border: "none",
          },
          "&:hover": {
            backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
          },
          "&.Mui-focused": {
            backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
          },
        },
        ...props.sx,
      }}
    />
  );
}
