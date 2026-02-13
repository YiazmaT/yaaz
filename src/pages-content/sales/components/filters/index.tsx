"use client";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Grid} from "@mui/material";
import {DatePicker} from "@/src/components/form-fields/date-picker";
import {CurrencyInput} from "@/src/components/form-fields/currency-input";
import {FilterDrawer} from "@/src/components/filter-drawer";
import {SalesFiltersProps, SalesFilterFormValues} from "./types";
import {useSalesFilterFormConfig} from "./form-config";
import moment from "moment";

export function SalesFilters(props: SalesFiltersProps) {
  const [filtersApplied, setFiltersApplied] = useState(false);
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
    });
  }

  function handleClear() {
    reset(defaultValues);
    setFiltersApplied(false);
    props.onFilterChange({});
  }

  return (
    <FilterDrawer
      hasActiveFilters={filtersApplied}
      onClear={handleClear}
      showActionButtons
      onApply={handleSubmit(onSubmit)}
      translationPrefix="sales.filters"
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
    </FilterDrawer>
  );
}
