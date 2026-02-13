import {Box, Chip} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreviewColumn, ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import {Client} from "../types";
import {ClientsTableConfigProps} from "./types";
import {formatCPF, formatCNPJ} from "@/src/utils/cpf-cnpj";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";

export function useClientsTableConfig(props: ClientsTableConfigProps) {
  const {translate} = useTranslate();

  function generateConfig(): DataTableColumn<Client>[] {
    return [
      {
        field: "image",
        headerKey: "clients.fields.image",
        width: "60px",
        render: (row) => <ImagePreviewColumn image={row.image} alt={row.name} />,
      },
      {
        field: "name",
        headerKey: "clients.fields.name",
        width: "20%",
        render: (row) => (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!row.active && <Chip label={translate("clients.inactive")} size="small" color="error" />}
            {row.name}
          </Box>
        ),
      },
      {
        field: "description",
        headerKey: "clients.fields.description",
        width: "15%",
        render: (row) => row.description || "-",
      },
      {
        field: "email",
        headerKey: "clients.fields.email",
        width: "15%",
        render: (row) => row.email || "-",
      },
      {
        field: "phone",
        headerKey: "clients.fields.phone",
        width: "15%",
        render: (row) => row.phone || "-",
      },
      {
        field: "cpf",
        headerKey: "clients.fields.cpfCnpj",
        width: "10%",
        render: (row) => {
          if (row.isCompany && row.cnpj) return formatCNPJ(row.cnpj);
          if (!row.isCompany && row.cpf) return formatCPF(row.cpf);
          return "-";
        },
      },
      {
        field: "isCompany",
        headerKey: "clients.fields.type",
        width: "10%",
        align: "center",
        render: (row) => (
          <Chip
            label={row.isCompany ? translate("clients.company") : translate("clients.person")}
            size="small"
            color={row.isCompany ? "primary" : "default"}
            variant="outlined"
          />
        ),
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
            hideEdit={(r) => !r.active}
            onDelete={props.onDelete}
            customActions={[
              {
                icon: (r) =>
                  r.active ? (
                    <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                  ) : (
                    <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
                  ),
                tooltip: (r) => translate(r.active ? "clients.tooltipDeactivate" : "clients.tooltipActivate"),
                onClick: props.onToggleActive,
              },
            ]}
          />
        ),
      },
    ];
  }

  return {generateConfig};
}
