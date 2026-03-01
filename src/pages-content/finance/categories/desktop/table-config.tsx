import {Box, Chip} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {CategoriesTableConfigProps} from "./types";
import { FinanceCategory } from "../types";
import {useAbility} from "@casl/react";
import {AbilityContext} from "@/src/contexts/ability-context";

export function useCategoriesTableConfig(props: CategoriesTableConfigProps) {
  const {translate} = useTranslate();
  const ability = useAbility(AbilityContext);
  const canEdit = ability.can("edit", "finance.categories");
  const canDelete = ability.can("delete", "finance.categories");

  function generateConfig(): DataTableColumn<FinanceCategory>[] {
    return [
      {
        field: "name",
        headerKey: "finance.categories.fields.name",
        width: "70%",
        render: (row) => (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!row.active && <Chip label={translate("finance.categories.inactive")} size="small" color="error" />}
            {row.name}
          </Box>
        ),
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "100px",
        align: "center",
        render: (row) => (
          <ActionsColumn
            row={row}
            onEdit={canEdit ? props.onEdit : undefined}
            hideEdit={(r) => !r.active}
            onDelete={canDelete ? props.onDelete : undefined}
            customActions={[
              {
                icon: (r) =>
                  r.active ? (
                    <ToggleOnIcon sx={{color: "success.main"}} fontSize="small" />
                  ) : (
                    <ToggleOffIcon sx={{color: "grey.400"}} fontSize="small" />
                  ),
                tooltip: (r) => translate(r.active ? "finance.categories.tooltipDeactivate" : "finance.categories.tooltipActivate"),
                onClick: props.onToggleActive,
                hidden: () => !canEdit,
              },
            ]}
          />
        ),
      },
    ];
  }

  return {generateConfig};
}
