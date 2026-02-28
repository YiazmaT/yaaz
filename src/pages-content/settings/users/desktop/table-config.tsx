import {Box, Chip} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn, ImagePreviewColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {User} from "../types";
import {UsersTableConfigProps} from "./types";

export function useUsersTableConfig(props: UsersTableConfigProps) {
  const {translate} = useTranslate();

  function generateConfig(): DataTableColumn<User>[] {
    return [
      {
        field: "image",
        headerKey: "users.fields.image",
        width: "60px",
        render: (row) => <ImagePreviewColumn image={row.image} alt={row.name} />,
      },
      {
        field: "name",
        headerKey: "users.fields.name",
        width: "30%",
        render: (row) => row.name,
      },
      {
        field: "login",
        headerKey: "users.fields.login",
        width: "30%",
        render: (row) => (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!row.active && <Chip label={translate("users.inactive")} size="small" color="error" />}
            {row.login}
          </Box>
        ),
      },
      {
        field: "admin",
        headerKey: "users.fields.role",
        width: "15%",
        align: "center",
        render: (row) => {
          if (row.owner) return <Chip label={translate("users.owner")} size="small" color="warning" />;
          if (row.admin) return <Chip label={translate("users.admin")} size="small" color="primary" />;
          return <Chip label={translate("users.user")} size="small" />;
        },
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "150px",
        align: "center",
        render: (row) => (
          <ActionsColumn
            row={row}
            onView={props.onView}
            onEdit={props.onEdit}
            hideEdit={(r) => !r.active || (r.owner && r.id !== props.currentUserId)}
            customActions={[
              {
                icon: (r) =>
                  r.active ? (
                    <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                  ) : (
                    <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
                  ),
                tooltip: (r) => translate(r.active ? "users.tooltipDeactivate" : "users.tooltipActivate"),
                onClick: props.onToggleActive,
                hidden: (r) => r.owner,
              },
            ]}
          />
        ),
      },
    ];
  }

  return {generateConfig};
}
