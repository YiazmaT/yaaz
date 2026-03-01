"use client";
import {Box, Chip} from "@mui/material";
import ToggleOnIcon from "@mui/icons-material/ToggleOn";
import ToggleOffIcon from "@mui/icons-material/ToggleOff";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ActionsColumn} from "@/src/components/data-columns";
import {useTranslate} from "@/src/contexts/translation-context";
import {UnityOfMeasure} from "../types";
import {UnityOfMeasureTableConfigProps} from "./types";
import {useAbility} from "@casl/react";
import {AbilityContext} from "@/src/contexts/ability-context";

export function useUnityOfMeasureTableConfig(props: UnityOfMeasureTableConfigProps) {
  const {translate} = useTranslate();
  const ability = useAbility(AbilityContext);
  const canEdit = ability.can("edit", "stock.unity_of_measure");
  const canDelete = ability.can("delete", "stock.unity_of_measure");

  function generateConfig(): DataTableColumn<UnityOfMeasure>[] {
    return [
      {
        field: "unity",
        headerKey: "unityOfMeasure.fields.unity",
        render: (row) => (
          <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
            {!row.active && <Chip label={translate("unityOfMeasure.inactive")} size="small" color="error" />}
            {row.unity}
          </Box>
        ),
      },
      {
        field: "actions",
        headerKey: "global.actions.label",
        width: "140px",
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
                tooltip: (r) => translate(r.active ? "unityOfMeasure.tooltipDeactivate" : "unityOfMeasure.tooltipActivate"),
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
