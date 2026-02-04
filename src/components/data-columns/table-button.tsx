"use client";
import {Box, useTheme} from "@mui/material";
import {TableButtonProps} from "./types";

export function TableButton(props: TableButtonProps) {
  const theme = useTheme();

  return (
    <Box
      component="button"
      onClick={props.onClick}
      sx={{
        cursor: "pointer",
        border: "2px solid transparent",
        borderRadius: 1,
        padding: "6px 12px",
        minWidth: props.minWidth ?? 60,
        fontSize: "0.875rem",
        fontWeight: 500,
        color: props.color ?? "inherit",
        backgroundColor: "white",
        backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.divider}, ${theme.palette.divider})`,
        backgroundOrigin: "border-box",
        backgroundClip: "padding-box, border-box",
        boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
        transition: "all 0.2s ease",
        "&:hover": {
          backgroundImage: `linear-gradient(white, white), linear-gradient(135deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
        },
      }}
    >
      {props.children}
    </Box>
  );
}
