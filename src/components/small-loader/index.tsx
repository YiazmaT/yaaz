"use client";
import {Box, CircularProgress} from "@mui/material";
import {primaryColor, secondaryColor} from "@/src/theme";

interface SmallLoaderProps {
  size?: number;
}

export function SmallLoader(props: SmallLoaderProps) {
  const size = props.size ?? 20;

  return (
    <Box sx={{display: "flex", alignItems: "center", justifyContent: "center"}}>
      <svg width={0} height={0}>
        <defs>
          <linearGradient id="small_loader_gradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={secondaryColor} />
            <stop offset="100%" stopColor={primaryColor} />
          </linearGradient>
        </defs>
      </svg>
      <CircularProgress disableShrink sx={{"svg circle": {stroke: "url(#small_loader_gradient)"}}} size={size} thickness={3} />
    </Box>
  );
}
