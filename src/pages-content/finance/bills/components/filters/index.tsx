"use client";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Chip, Grid} from "@mui/material";
import {DatePicker} from "@/src/components/form-fields/date-picker";
import {CurrencyInput} from "@/src/components/form-fields/currency-input";
import {Dropdown} from "@/src/components/form-fields/dropdown";
import {FilterDrawer} from "@/src/components/filter-drawer";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApiQuery} from "@/src/hooks/use-api";
import {useFinanceConstants} from "../../constants";
import {BillsFiltersProps, BillsFilterFormValues, BillStatusOption} from "./types";
import {useBillsFilterFormConfig} from "./form-config";
import {FinanceCategory} from "../../../categories/types";

export function BillsFilters(props: BillsFiltersProps) {
  const [filtersApplied, setFiltersApplied] = useState(false);
  const {schema, defaultValues} = useBillsFilterFormConfig();
  const {translate} = useTranslate();
  const {billStatuses} = useFinanceConstants();
  const {data: categoriesData} = useApiQuery<FinanceCategory[]>({route: "/api/finance/category/list", queryKey: ["/api/finance/category/list"]});
  const categories = categoriesData || [];
  const statusOptions = Object.values(billStatuses);

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: {errors},
  } = useForm<BillsFilterFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const categoryId = watch("categoryId");
  const dueDateFrom = watch("dueDateFrom");
  const dueDateTo = watch("dueDateTo");
  const valueFrom = watch("valueFrom");
  const valueTo = watch("valueTo");
  const status = watch("status");

  const selectedStatus = statusOptions.find((s) => s.value === status) || null;

  function onSubmit(data: BillsFilterFormValues) {
    const hasFilters =
      data.categoryId ||
      data.status ||
      data.dueDateFrom ||
      data.dueDateTo ||
      (data.valueFrom && data.valueFrom !== "0") ||
      (data.valueTo && data.valueTo !== "0");
    setFiltersApplied(!!hasFilters);
    props.onFilterChange({
      categoryId: data.categoryId || undefined,
      status: data.status || undefined,
      dueDateFrom: data.dueDateFrom || undefined,
      dueDateTo: data.dueDateTo || undefined,
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
      translationPrefix="finance.bills.filters"
    >
      <Grid container spacing={2}>
        <Grid size={3}>
          <Dropdown<FinanceCategory>
            label="finance.bills.filters.category"
            value={categories.find((c) => c.id === categoryId) || null}
            onChange={(v) => setValue("categoryId", v?.id || "")}
            options={categories}
            uniqueKey="id"
            buildLabel={(o) => o.name}
          />
        </Grid>
        <Grid size={3}>
          <Dropdown<BillStatusOption>
            label="finance.bills.filters.status"
            value={selectedStatus}
            onChange={(v) => setValue("status", v?.value || "")}
            options={statusOptions}
            uniqueKey="value"
            buildLabel={(o) => o.label}
            renderOption={(o) => <Chip label={o.label} size="small" color={o.color} />}
          />
        </Grid>
        <Grid size={3}>
          <DatePicker
            label="finance.bills.filters.dueDateFrom"
            value={dueDateFrom}
            onChange={(v) => setValue("dueDateFrom", v)}
            error={errors.dueDateFrom?.message}
            fullWidth
          />
        </Grid>
        <Grid size={3}>
          <DatePicker
            label="finance.bills.filters.dueDateTo"
            value={dueDateTo}
            onChange={(v) => setValue("dueDateTo", v)}
            error={errors.dueDateTo?.message}
            fullWidth
          />
        </Grid>
        <Grid size={3}>
          <CurrencyInput
            label="finance.bills.filters.valueFrom"
            value={valueFrom}
            onChange={(v) => setValue("valueFrom", v)}
            error={errors.valueFrom?.message}
            fullWidth
          />
        </Grid>
        <Grid size={3}>
          <CurrencyInput
            label="finance.bills.filters.valueTo"
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
