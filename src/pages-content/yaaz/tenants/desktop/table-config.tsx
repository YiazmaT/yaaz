import {Box, IconButton, Tooltip, Typography} from "@mui/material";
import moment from "moment";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreviewColumn, ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CancelIcon from "@mui/icons-material/Cancel";
import ForwardToInboxIcon from "@mui/icons-material/ForwardToInbox";
import {Tenant} from "../types";
import {TenantsTableConfigProps} from "./types";

export function useTenantsTableConfig(props: TenantsTableConfigProps) {
  const {translate} = useTranslate();

  function generateConfig(): DataTableColumn<Tenant>[] {
    return [
      {
        field: "logo",
        headerKey: "tenants.fields.logo",
        width: "60px",
        render: (row) => <ImagePreviewColumn image={row.logo} alt={row.name} />,
      },
      {
        field: "name",
        headerKey: "tenants.fields.name",
        width: "20%",
      },
      {
        field: "primary_color",
        headerKey: "tenants.fields.primaryColor",
        width: "12%",
        render: (row) =>
          row.primary_color ? (
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
              <Box sx={{width: 20, height: 20, borderRadius: 1, backgroundColor: row.primary_color, border: "1px solid #ccc"}} />
              {row.primary_color}
            </Box>
          ) : (
            "-"
          ),
      },
      {
        field: "secondary_color",
        headerKey: "tenants.fields.secondaryColor",
        width: "12%",
        render: (row) =>
          row.secondary_color ? (
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
              <Box sx={{width: 20, height: 20, borderRadius: 1, backgroundColor: row.secondary_color, border: "1px solid #ccc"}} />
              {row.secondary_color}
            </Box>
          ) : (
            "-"
          ),
      },
      {
        field: "owner",
        headerKey: "tenants.fields.owner",
        width: "20%",
        render: (row) =>
          row.owner ? (
            <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
              <ImagePreviewColumn image={row.owner.image} alt={row.owner.name} />
              <Box>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {row.owner.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {row.owner.login}
                </Typography>
              </Box>
            </Box>
          ) : (
            "-"
          ),
      },
      {
        field: "pending_password",
        headerKey: "users.fields.verified",
        width: "100px",
        align: "center",
        render: (row) =>
          !row.owner ? null : row.owner.pending_password ? (
            <Box sx={{display: "flex", alignItems: "center", justifyContent: "center", gap: 0.5}}>
              <Tooltip title={translate("users.tooltipResendEmail")}>
                <IconButton size="small" onClick={(e) => {e.stopPropagation(); props.onResendEmail(row);}}>
                  <ForwardToInboxIcon fontSize="small" color="action" />
                </IconButton>
              </Tooltip>
              <Tooltip title={translate("users.fields.pendingPassword")}>
                <CancelIcon sx={{color: "error.main"}} fontSize="small" />
              </Tooltip>
            </Box>
          ) : (
            <Tooltip title={translate("users.fields.verified")}>
              <CheckCircleIcon sx={{color: "success.main"}} fontSize="small" />
            </Tooltip>
          ),
      },
      {
        field: "creation_date",
        headerKey: "tenants.fields.creationDate",
        width: "12%",
        render: (row) => moment(row.creation_date).format("DD/MM/YYYY"),
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "120px",
        align: "center",
        render: (row) => <ActionsColumn row={row} onView={props.onView} onEdit={props.onEdit} />,
      },
    ];
  }

  return {generateConfig};
}
