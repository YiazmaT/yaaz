import {Chip} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreviewColumn, ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import {Client} from "../types";
import {ClientsTableConfigProps} from "./types";
import {formatCPF, formatCNPJ} from "@/src/utils/cpf-cnpj";

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
        width: "120px",
        align: "center",
        render: (row) => (
          <ActionsColumn
            row={row}
            onView={props.onView}
            onEdit={props.onEdit}
            onDelete={props.onDelete}
          />
        ),
      },
    ];
  }

  return {generateConfig};
}
