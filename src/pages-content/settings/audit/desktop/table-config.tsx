import {Typography} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {useTranslate} from "@/src/contexts/translation-context";
import {formatDate} from "@/src/utils/format-date";
import {UserInfo} from "@/src/components/user-info";
import {AUDIT_MODULES} from "../constants";
import {AuditLog} from "../types";

export function useAuditTableConfig(module?: string, action?: string) {
  const {translate} = useTranslate();
  const actionConfig = module && action ? AUDIT_MODULES[module]?.actions.find((a) => a.action === action) : null;
  const extraColumns = actionConfig?.columnsFactory?.(translate) ?? [];

  function generateConfig(): DataTableColumn<AuditLog>[] {
    const baseColumns: DataTableColumn<AuditLog>[] = [
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
        width: "18%",
        render: (row) => (
          <Typography variant="body2" sx={{fontFamily: "monospace", fontSize: "0.75rem", color: "text.secondary"}}>
            {row.route ?? "-"}
          </Typography>
        ),
      },
    ];

    return [...baseColumns, ...extraColumns];
  }

  return {generateConfig};
}
