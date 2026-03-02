import {Box, IconButton, Tooltip, Typography} from "@mui/material";
import VisibilityOutlinedIcon from "@mui/icons-material/VisibilityOutlined";
import {DataTableColumn} from "@/src/components/data-table/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {formatDate} from "@/src/utils/format-date";
import {UserInfo} from "@/src/components/user-info";
import {AuditLog} from "../types";
import {AuditTableConfigProps} from "./types";

export function useAuditTableConfig(props: AuditTableConfigProps) {
  const {translate} = useTranslate();

  function generateConfig(): DataTableColumn<AuditLog>[] {
    return [
      {
        field: "create_date",
        headerKey: "audit.fields.date",
        width: "160px",
        render: (row) => (
          <Typography variant="body2" sx={{fontFamily: "monospace", fontSize: "0.8rem"}}>
            {formatDate(row.create_date, true)}
          </Typography>
        ),
      },
      {
        field: "user_name",
        headerKey: "audit.fields.user",
        width: "18%",
        render: (row) => <UserInfo user={row.user} />,
      },
      {
        field: "route",
        headerKey: "audit.fields.route",
        width: "auto",
        render: (row) => (
          <Typography variant="body2" sx={{fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary"}}>
            {row.route ?? "-"}
          </Typography>
        ),
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "80px",
        align: "center",
        render: (row) => (
          <Box sx={{display: "flex", justifyContent: "center"}}>
            <Tooltip title={translate("global.actions.view")}>
              <IconButton
                size="small"
                onClick={(e) => {
                  e.stopPropagation();
                  props.onView(row);
                }}
              >
                <VisibilityOutlinedIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Box>
        ),
      },
    ];
  }

  return {generateConfig};
}
