"use client";
import {Box, Tooltip, useTheme} from "@mui/material";
import ImageOutlinedIcon from "@mui/icons-material/ImageOutlined";
import {ImagePreviewProps} from "./types";

export function ImagePreview(props: ImagePreviewProps) {
  const theme = useTheme();
  const borderRadius = props.borderRadius ?? 0.5;

  if (!props.url) {
    return (
      <Box
        sx={{
          width: props.width,
          height: props.height,
          borderRadius,
          backgroundColor: theme.palette.grey[300],
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <ImageOutlinedIcon sx={{color: theme.palette.grey[500], fontSize: Math.min(props.width, props.height) * 0.5}} />
      </Box>
    );
  }

  return (
    <Tooltip
      title={<Box component="img" src={props.url} alt={props.alt} sx={{maxWidth: 200, maxHeight: 200, objectFit: "contain"}} />}
      placement="right"
      slotProps={{tooltip: {sx: {backgroundColor: "transparent"}}}}
    >
      <Box
        component="img"
        src={props.url}
        alt={props.alt}
        sx={{
          width: props.width,
          height: props.height,
          borderRadius,
          objectFit: "cover",
          flexShrink: 0,
          cursor: "pointer",
        }}
      />
    </Tooltip>
  );
}
