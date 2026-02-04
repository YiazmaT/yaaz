"use client";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {Box, Grid} from "@mui/material";
import {FormDropdown} from "@/src/components/form-fields/dropdown";
import {FormCheckBox} from "@/src/components/form-fields/check-box";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useApi} from "@/src/hooks/use-api";
import {useReportsConstants} from "../../constants";
import {ReportCard} from "../../components/report-card";
import {StockLevelsResult} from "./result";
import {StockLevelsFilters, StockLevelsRow, StockTypeOption} from "./types";

export function StockLevelsReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{data: StockLevelsRow[]; filters: StockLevelsFilters} | null>(null);
  const {stockTypeOptions} = useReportsConstants();
  const api = useApi();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<StockLevelsFilters>({
    defaultValues: {
      type: stockTypeOptions[0],
      belowMinimumOnly: false,
    },
  });

  async function generate(data: StockLevelsFilters) {
    setIsGenerating(true);
    const params = new URLSearchParams();
    params.append("type", data.type?.value ?? "all");
    params.append("belowMinimumOnly", String(data.belowMinimumOnly));

    const response = await api.fetch<StockLevelsRow[]>("GET", `/api/reports/stock/stock-levels?${params.toString()}`, {hideLoader: true});

    if (response) {
      setResult({data: response, filters: data});
    }
    setIsGenerating(false);
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", gap: 3}}>
      <ReportCard title="reports.filters.title" isGenerating={isGenerating} onGenerate={handleSubmit(generate)}>
        <FormContextProvider control={control} errors={errors}>
          <Grid container spacing={2} alignItems="center">
            <FormDropdown<StockTypeOption>
              fieldName="type"
              label="reports.filters.stockType"
              options={stockTypeOptions}
              uniqueKey="value"
              buildLabel={(opt) => opt.label}
              size={6}
            />
            <FormCheckBox fieldName="belowMinimumOnly" label="reports.filters.belowMinimumOnly" size={6} />
          </Grid>
        </FormContextProvider>
      </ReportCard>

      {result && <StockLevelsResult data={result.data} filters={result.filters} />}
    </Box>
  );
}
