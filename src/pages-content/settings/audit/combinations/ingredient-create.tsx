import {Box, Typography} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {AuditLog} from "../types";

export function getIngredientCreateColumns(): DataTableColumn<AuditLog>[] {
  const {translate} = useTranslate();

  return [
    {
      field: "ingredient",
      headerKey: "global.ingredients",
      width: "320px",
      render: (row) => {
        const c = row.content;
        const fields = [
          {label: translate("ingredients.fields.code"), value: c?.code},
          {label: translate("ingredients.fields.name"), value: c?.name},
          {label: translate("ingredients.fields.description"), value: c?.description},
          {label: translate("ingredients.fields.unitOfMeasure"), value: c?.unity_of_measure?.unity},
          {label: translate("ingredients.fields.minStock"), value: c?.min_stock},
        ];
        return (
          <Box sx={{display: "flex", gap: 1.5, alignItems: "flex-start", py: 0.5}}>
            <ImagePreview url={c?.image} width={52} height={52} alt={c?.name ?? ""} borderRadius={6} />
            <Box sx={{display: "flex", flexDirection: "column", gap: 0.25}}>
              {fields.map((field) => (
                <Box key={field.label} sx={{display: "flex", gap: 0.5, alignItems: "baseline"}}>
                  <Typography variant="caption" color="text.secondary" sx={{flexShrink: 0}}>
                    {field.label}:
                  </Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {field.value ?? "-"}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Box>
        );
      },
    },
  ];
}

export function IngredientCreateContent({content}: {content: any}) {
  const {translate} = useTranslate();

  const fields = [
    {label: translate("ingredients.fields.code"), value: content?.code},
    {label: translate("ingredients.fields.name"), value: content?.name},
    {label: translate("ingredients.fields.description"), value: content?.description},
    {label: translate("ingredients.fields.unitOfMeasure"), value: content?.unity_of_measure?.unity},
    {label: translate("ingredients.fields.minStock"), value: content?.min_stock},
  ];

  return (
    <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>
      <ImagePreview url={content?.image} width={80} height={80} alt={content?.name ?? ""} borderRadius={8} />
      {fields.map((field) => (
        <Box key={field.label}>
          <Typography variant="caption" color="text.secondary">
            {field.label}
          </Typography>
          <Typography variant="body2" fontWeight={500}>
            {field.value ?? "-"}
          </Typography>
        </Box>
      ))}
    </Box>
  );
}
