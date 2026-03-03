import {Box, Divider, Typography} from "@mui/material";
import {DataTableColumn} from "@/src/components/data-table/types";
import {ImagePreview} from "@/src/components/image-preview";
import {useTranslate} from "@/src/contexts/translation-context";
import {AuditLog, AuditTranslateFn} from "../types";
import {formatAuditValue} from "../utils";

const FIELDS: {
  labelKey: string;
  getBeforeValue: (before: any) => any;
  getAfterValue: (after: any) => any;
  isChanged: (before: any, after: any) => boolean;
}[] = [
  {
    labelKey: "ingredients.fields.code",
    getBeforeValue: (b) => `$${b?.code}`,
    getAfterValue: (a) => `$${a?.code}`,
    isChanged: (b, a) => b?.code !== a?.code,
  },
  {
    labelKey: "ingredients.fields.name",
    getBeforeValue: (b) => b?.name,
    getAfterValue: (a) => a?.name,
    isChanged: (b, a) => b?.name !== a?.name,
  },
  {
    labelKey: "ingredients.fields.description",
    getBeforeValue: (b) => b?.description,
    getAfterValue: (a) => a?.description,
    isChanged: (b, a) => b?.description !== a?.description,
  },
  {
    labelKey: "ingredients.fields.unitOfMeasure",
    getBeforeValue: (b) => b?.unity_of_measure?.unity ?? b?.unit_of_measure_id,
    getAfterValue: (a) => a?.unity_of_measure?.unity ?? a?.unit_of_measure_id,
    isChanged: (b, a) => b?.unit_of_measure_id !== a?.unit_of_measure_id,
  },
  {
    labelKey: "ingredients.fields.minStock",
    getBeforeValue: (b) => b?.min_stock,
    getAfterValue: (a) => a?.min_stock,
    isChanged: (b, a) => String(b?.min_stock) !== String(a?.min_stock),
  },
  {
    labelKey: "global.active",
    getBeforeValue: (b) => b?.active,
    getAfterValue: (a) => a?.active,
    isChanged: (b, a) => b?.active !== a?.active,
  },
];

export function getIngredientEditColumns(translate: AuditTranslateFn): DataTableColumn<AuditLog>[] {
  return [
    {
      field: "before",
      headerKey: "audit.fields.before",
      width: "auto",
      render: (row) => <FieldsPanel content={row.content} side="before" translate={translate} />,
    },
    {
      field: "after",
      headerKey: "audit.fields.after",
      width: "auto",
      render: (row) => <FieldsPanel content={row.content} side="after" translate={translate} />,
    },
  ];
}

export function IngredientEditContent(props: {content: any}) {
  const {translate} = useTranslate();

  return (
    <Box sx={{display: "flex", flexDirection: "column", gap: 1.5}}>
      <Box>
        <Typography variant="caption" color="error.main" fontWeight={600} sx={{mb: 0.5, display: "block"}}>
          {translate("audit.fields.before")}
        </Typography>
        <FieldsPanel content={props.content} side="before" translate={translate} />
      </Box>
      <Divider />
      <Box>
        <Typography variant="caption" color="success.main" fontWeight={600} sx={{mb: 0.5, display: "block"}}>
          {translate("audit.fields.after")}
        </Typography>
        <FieldsPanel content={props.content} side="after" translate={translate} />
      </Box>
    </Box>
  );
}

function FieldsPanel(props: {content: any; side: "before" | "after"; translate: AuditTranslateFn}) {
  const before = props.content?.before;
  const after = props.content?.after;
  const data = props.side === "before" ? before : after;
  const highlightColor = props.side === "before" ? "error" : "success";
  const imageChanged = before?.image !== after?.image;

  return (
    <Box sx={{display: "flex", gap: 1.5, alignItems: "flex-start", py: 0.5}}>
      <Box
        sx={{
          border: "2px solid",
          borderColor: imageChanged ? `${highlightColor}.main` : "transparent",
          borderRadius: "8px",
          flexShrink: 0,
        }}
      >
        <ImagePreview url={data?.image} width={52} height={52} alt={data?.name ?? ""} borderRadius={6} />
      </Box>
      <Box sx={{display: "flex", flexDirection: "column", gap: 0.25}}>
        {FIELDS.map((field) => {
          const changed = field.isChanged(before, after);
          const value = props.side === "before" ? field.getBeforeValue(data) : field.getAfterValue(data);
          return (
            <Box key={field.labelKey} sx={{display: "flex", gap: 0.5, alignItems: "baseline"}}>
              <Typography variant="caption" color="text.secondary" sx={{flexShrink: 0}}>
                {props.translate(field.labelKey)}:
              </Typography>
              <Typography variant="caption" fontWeight={changed ? 700 : 500} color={changed ? `${highlightColor}.main` : "text.primary"}>
                {formatAuditValue(value, props.translate)}
              </Typography>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
