"use client";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Box, Button, Collapse, Grid, IconButton, Tooltip} from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import {DatePicker} from "@/src/components/form-fields/date-picker";
import {CurrencyInput} from "@/src/components/form-fields/currency-input";
import {useTranslate} from "@/src/contexts/translation-context";
import {SalesFiltersProps, SalesFilterFormValues} from "./types";
import {useSalesFilterFormConfig} from "./form-config";
import moment from "moment";

const timeZone = process.env.TIME_ZONE ?? "America/Sao_Paulo";

export function SalesFilters(props: SalesFiltersProps) {
  const [expanded, setExpanded] = useState(false);
  const [filtersApplied, setFiltersApplied] = useState(false);
  const {translate} = useTranslate();
  const {schema, defaultValues} = useSalesFilterFormConfig();
  const today = moment().format("YYYY-MM-DD");

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {errors},
  } = useForm<SalesFilterFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const dateFrom = watch("dateFrom");
  const dateTo = watch("dateTo");
  const valueFrom = watch("valueFrom");
  const valueTo = watch("valueTo");

  function onSubmit(data: SalesFilterFormValues) {
    const hasDateFilters = data.dateFrom || data.dateTo;
    const hasValueFilters = (data.valueFrom && data.valueFrom !== "0") || (data.valueTo && data.valueTo !== "0");
    setFiltersApplied(!!hasDateFilters || !!hasValueFilters);
    props.onFilterChange({
      dateFrom: data.dateFrom || undefined,
      dateTo: data.dateTo || undefined,
      valueFrom: data.valueFrom && data.valueFrom !== "0" ? data.valueFrom : undefined,
      valueTo: data.valueTo && data.valueTo !== "0" ? data.valueTo : undefined,
      timezone: hasDateFilters ? timeZone : undefined,
    });
  }

  function handleClear() {
    reset(defaultValues);
    setFiltersApplied(false);
    props.onFilterChange({});
  }

  return (
    <Box sx={{mb: 2}}>
      <Box sx={{display: "flex", alignItems: "center", gap: 1, mb: 1}}>
        <Tooltip title={expanded ? translate("sales.filters.close") : translate("sales.filters.open")}>
          <IconButton onClick={() => setExpanded(!expanded)}>
            <FilterListIcon sx={{color: filtersApplied ? "error.main" : "inherit"}} />
          </IconButton>
        </Tooltip>
        {filtersApplied && (
          <Tooltip title={translate("sales.filters.clearTooltip")}>
            <IconButton onClick={handleClear} size="small" color="error">
              <ClearIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Collapse in={expanded}>
        <Box
          component="form"
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            p: 2,
            backgroundColor: "background.paper",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
          }}
        >
          <Grid container spacing={2}>
            <Grid size={3}>
              <DatePicker
                label="sales.filters.dateFrom"
                value={dateFrom}
                onChange={(v) => setValue("dateFrom", v)}
                maxDate={today}
                error={errors.dateFrom?.message}
                fullWidth
              />
            </Grid>
            <Grid size={3}>
              <DatePicker
                label="sales.filters.dateTo"
                value={dateTo}
                onChange={(v) => setValue("dateTo", v)}
                maxDate={today}
                error={errors.dateTo?.message}
                fullWidth
              />
            </Grid>
            <Grid size={3}>
              <CurrencyInput
                label="sales.filters.valueFrom"
                value={valueFrom}
                onChange={(v) => setValue("valueFrom", v)}
                error={errors.valueFrom?.message}
                fullWidth
              />
            </Grid>
            <Grid size={3}>
              <CurrencyInput
                label="sales.filters.valueTo"
                value={valueTo}
                onChange={(v) => setValue("valueTo", v)}
                error={errors.valueTo?.message}
                fullWidth
              />
            </Grid>
          </Grid>

          <Box sx={{display: "flex", justifyContent: "flex-end", gap: 1, mt: 2}}>
            <Button variant="outlined" onClick={handleClear}>
              {translate("sales.filters.clear")}
            </Button>
            <Button variant="contained" type="submit">
              {translate("sales.filters.apply")}
            </Button>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
}
