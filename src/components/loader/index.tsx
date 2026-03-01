"use client";
import {Box, CircularProgress, useTheme} from "@mui/material";
import {useTenant, useYaazUser} from "@/src/contexts/tenant-context";
import {LoaderProps} from "./types";

const DEFAULT_LOGO = "/assets/icon.png";

export function Loader(props: LoaderProps) {
  const theme = useTheme();
  const {tenant} = useTenant();
  const {yaazUser} = useYaazUser();
  const primaryColor = theme.palette.primary.main;
  const secondaryColor = theme.palette.secondary.main;
  const size = props.size ?? 80;
  const iconSize = Math.round(size * 0.6);
  const logo = yaazUser ? DEFAULT_LOGO : tenant?.logo || DEFAULT_LOGO;

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
      <Box
        component="img"
        src={logo}
        alt=""
        sx={{width: iconSize, height: iconSize, borderRadius: "100%", objectFit: "contain"}}
      />
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
