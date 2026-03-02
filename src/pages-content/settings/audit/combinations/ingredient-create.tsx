import {Box, Typography} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {AuditLog, AuditTranslateFn} from "../types";

const FIELDS: {labelKey: string; getValue: (c: any) => any}[] = [
  {labelKey: "ingredients.fields.code", getValue: (c) => c?.code},
  {labelKey: "ingredients.fields.name", getValue: (c) => c?.name},
  {labelKey: "ingredients.fields.description", getValue: (c) => c?.description},
  {labelKey: "ingredients.fields.unitOfMeasure", getValue: (c) => c?.unity_of_measure?.unity},
  {labelKey: "ingredients.fields.minStock", getValue: (c) => c?.min_stock},
];

export function getIngredientCreateColumns(translate: AuditTranslateFn): DataTableColumn<AuditLog>[] {
  return [
    {
      field: "ingredient",
      headerKey: "global.ingredients",
      width: "auto",
      render: (row) => {
        const c = row.content;
        return (
          <Box sx={{display: "flex", gap: 1.5, alignItems: "flex-start", py: 0.5}}>
            <ImagePreview url={c?.image} width={52} height={52} alt={c?.name ?? ""} borderRadius={6} />
            <Box sx={{display: "flex", flexDirection: "column", gap: 0.25}}>
              {FIELDS.map((field) => (
                <Box key={field.labelKey} sx={{display: "flex", gap: 0.5, alignItems: "baseline"}}>
                  <Typography variant="caption" color="text.secondary" sx={{flexShrink: 0}}>
                    {translate(field.labelKey)}:
                  </Typography>
                  <Typography variant="caption" fontWeight={500}>
                    {field.getValue(c) ?? "-"}
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

  return (
    <Box sx={{display: "flex", gap: 1.5, alignItems: "flex-start", py: 0.5}}>
      <ImagePreview url={content?.image} width={52} height={52} alt={content?.name ?? ""} borderRadius={6} />
      <Box sx={{display: "flex", flexDirection: "column", gap: 0.25}}>
        {FIELDS.map((field) => (
          <Box key={field.labelKey} sx={{display: "flex", gap: 0.5, alignItems: "baseline"}}>
            <Typography variant="caption" color="text.secondary" sx={{flexShrink: 0}}>
              {translate(field.labelKey)}:
            </Typography>
            <Typography variant="caption" fontWeight={500}>
              {field.getValue(content) ?? "-"}
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}
