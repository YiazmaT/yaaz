"use client";
import {Box, CircularProgress, useTheme} from "@mui/material";
import Image from "next/image";
import {LoaderProps} from "./types";

export function Loader(props: LoaderProps) {
  const theme = useTheme();
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const size = props.size ?? 80;
  const iconSize = Math.round(size * 0.6);

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        ...props.sx,
      }}
    >
      <Image src="/assets/icon.png" alt="" width={iconSize} height={iconSize} style={{borderRadius: "100%"}} />
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="loader_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={primaryColor} />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress
        disableShrink
        sx={{
          position: "absolute",
          "svg circle": {stroke: "url(#loader_gradient)"},
        }}
        size={size}
        thickness={2}
      />
    </Box>
  );
}
