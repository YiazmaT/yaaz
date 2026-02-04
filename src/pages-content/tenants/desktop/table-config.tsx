import {Box} from "@mui/material";
import moment from "moment";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreviewColumn, ActionsColumn} from "@/src/components/data-columns";
import {Tenant} from "../types";
import {TenantsTableConfigProps} from "./types";

export function useTenantsTableConfig(props: TenantsTableConfigProps) {
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
        width: "30%",
      },
      {
        field: "primary_color",
        headerKey: "tenants.fields.primaryColor",
        width: "15%",
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
        width: "15%",
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
        field: "creation_date",
        headerKey: "tenants.fields.creationDate",
        width: "20%",
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
