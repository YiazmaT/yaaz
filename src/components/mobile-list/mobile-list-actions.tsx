"use client";
import {Box, IconButton} from "@mui/material";
import {Visibility, Edit, Delete} from "@mui/icons-material";
import {MobileListActionsProps} from "./types";

export function MobileListActions<T = any>(props: MobileListActionsProps<T>) {
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
        <IconButton size="small" onClick={handleView}>
          <Visibility fontSize="small" />
        </IconButton>
      )}
      {props.onEdit && !props.hideEdit && (
        <IconButton size="small" onClick={handleEdit}>
          <Edit fontSize="small" />
        </IconButton>
      )}
      {props.onDelete && (
        <IconButton size="small" onClick={handleDelete}>
          <Delete fontSize="small" />
        </IconButton>
      )}
    </Box>
  );
}
