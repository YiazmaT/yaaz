"use client";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Box, Button, Card, CardContent, Grid, Typography} from "@mui/material";
import WarningAmberOutlinedIcon from "@mui/icons-material/WarningAmberOutlined";
import {FormContextProvider} from "@/src/contexts/form-context";
import {FormDropdown} from "@/src/components/form-fields/dropdown";
import {FormDatePicker} from "@/src/components/form-fields/date-picker";
import {useTranslate} from "@/src/contexts/translation-context";
import {AUDIT_MODULES} from "../../constants";
import {AuditActionOption, AuditModuleOption} from "../../types";
import {AuditFiltersProps} from "./types";
import {AuditFilterFormValues, getOneYearAgo, getToday, useAuditFilterFormConfig} from "./form-config";

const MODULE_OPTIONS: AuditModuleOption[] = Object.entries(AUDIT_MODULES).map(([key, val]) => ({key, ...val}));

export function AuditFiltersComponent(props: AuditFiltersProps) {
  const {translate} = useTranslate();
  const {schema, defaultValues} = useAuditFilterFormConfig();

  const {
    control,
    handleSubmit,
    formState: {errors},
    watch,
    setValue,
    reset,
  } = useForm<AuditFilterFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const selectedModule = watch("module");
  const dateFromValue = watch("date_from");
  const today = getToday();
  const minDate = getOneYearAgo();
  const canApply = !!(selectedModule && watch("action_type"));

  const availableActions: AuditActionOption[] = selectedModule ? AUDIT_MODULES[selectedModule.key]?.actions ?? [] : [];

  function handleModuleChange() {
    setValue("action_type", null as any);
  }

  function submit(data: AuditFilterFormValues) {
    props.onApply({
      module: data.module!.key,
      action_type: data.action_type!.action,
      date_from: data.date_from || undefined,
      date_to: data.date_to || undefined,
    });
  }

  function handleClear() {
    reset(defaultValues);
    props.onClear();
  }

  function handleDateFromChange(value: string) {
    if (value > watch("date_to")) {
      setValue("date_to", value);
    }
  }

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" fontWeight={600} color="primary" sx={{mb: 2}}>
          {translate("audit.filterTitle")}
        </Typography>

        <FormContextProvider control={control} errors={errors} formType="create">
          <form onSubmit={handleSubmit(submit)}>
            <Grid container spacing={1}>
              <FormDropdown<AuditModuleOption>
                fieldName="module"
                options={MODULE_OPTIONS}
                uniqueKey="key"
                label="audit.fields.module"
                buildLabel={(option) => translate(option.label)}
                additionalOnChange={handleModuleChange}
                size={3}
              />
              <FormDropdown<AuditActionOption>
                fieldName="action_type"
                options={availableActions}
                uniqueKey="action"
                label="audit.fields.action"
                buildLabel={(option) => translate(option.label)}
                disabled={!selectedModule}
                size={3}
              />
              <FormDatePicker
                fieldName="date_from"
                label="audit.fields.dateFrom"
                minDate={minDate}
                maxDate={today}
                additionalOnChange={handleDateFromChange}
                size={3}
              />
              <FormDatePicker
                fieldName="date_to"
                label="audit.fields.dateTo"
                minDate={dateFromValue}
                maxDate={today}
                size={3}
              />
            </Grid>

            <Box sx={{display: "flex", justifyContent: "space-between", alignItems: "center", mt: 2}}>
              <Box sx={{display: "flex", alignItems: "flex-start", gap: 0.75, maxWidth: "60%"}}>
                <WarningAmberOutlinedIcon sx={{fontSize: "1rem", color: "warning.main", flexShrink: 0, mt: "1px"}} />
                <Typography variant="caption" color="text.secondary">
                  {translate("audit.disclaimer")}
                </Typography>
              </Box>
              <Box sx={{display: "flex", gap: 1, flexShrink: 0}}>
                <Button variant="outlined" onClick={handleClear}>
                  {translate("audit.actions.clear")}
                </Button>
                <Button type="submit" variant="contained" disabled={!canApply}>
                  {translate("audit.actions.apply")}
                </Button>
              </Box>
            </Box>
          </form>
        </FormContextProvider>
      </CardContent>
    </Card>
  );
}
