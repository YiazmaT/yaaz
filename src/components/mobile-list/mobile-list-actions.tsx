"use client";
import {Box, IconButton, useTheme} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import {MobileListActionsProps} from "./types";

export function MobileListActions<T = any>(props: MobileListActionsProps<T>) {
  const theme = useTheme();

  function handleView(e: React.MouseEvent) {
    e.stopPropagation();
    if (props.onView) {
      props.onView(props.row);
    }
  }

  function handleEdit(e: React.MouseEvent) {
    e.stopPropagation();
    if (props.onEdit) {
      props.onEdit(props.row);
    }
  }

  function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (props.onDelete) {
      props.onDelete(props.row);
    }
  }

  return (
    <Box sx={{display: "flex", gap: 1}}>
      {props.onView && (
        <IconButton size="small" onClick={handleView} sx={{color: theme.palette.info.main}}>
          <VisibilityOutlinedIcon fontSize="small" />
        </IconButton>
      )}
      {props.onEdit && !props.hideEdit && (
        <IconButton size="small" onClick={handleEdit} sx={{color: theme.palette.warning.main}}>
          <EditOutlinedIcon fontSize="small" />
        </IconButton>
      )}
      {props.onDelete && (
        <IconButton size="small" onClick={handleDelete} sx={{color: theme.palette.error.main}}>
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
