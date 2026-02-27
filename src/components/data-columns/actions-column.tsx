import {Box, IconButton, Tooltip} from "@mui/material";
import {Visibility, Edit, Delete} from "@mui/icons-material";
import {useTranslate} from "@/src/contexts/translation-context";
import {ActionsColumnProps} from "./types";

export function ActionsColumn<T>(props: ActionsColumnProps<T>) {
  const {translate} = useTranslate();

  const showEdit = props.onEdit && !props.hideEdit?.(props.row);
  const showDelete = props.onDelete && !props.hideDelete?.(props.row);

  return (
    <Box sx={{display: "flex", gap: 0.5, justifyContent: "center"}}>
      {props.customActions?.map((action, index) => {
        if (action.hidden?.(props.row)) return null;
        const icon = typeof action.icon === "function" ? action.icon(props.row) : action.icon;
        const tooltip = typeof action.tooltip === "function" ? action.tooltip(props.row) : action.tooltip;
        return (
          <Tooltip key={index} title={tooltip}>
            <IconButton size="small" onClick={() => action.onClick(props.row)}>
              {icon}
            </IconButton>
          </Tooltip>
        );
      })}
      {props.onView && (
        <Tooltip title={translate("global.actions.view")}>
          <IconButton size="small" onClick={() => props.onView?.(props.row)}>
            <Visibility fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showEdit && (
        <Tooltip title={translate("global.actions.edit")}>
          <IconButton size="small" onClick={() => props.onEdit?.(props.row)}>
            <Edit fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
      {showDelete && (
        <Tooltip title={translate("global.actions.delete")}>
          <IconButton size="small" onClick={() => props.onDelete?.(props.row)}>
            <Delete fontSize="small" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
