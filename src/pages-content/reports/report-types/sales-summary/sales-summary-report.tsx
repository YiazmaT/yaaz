"use client";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import moment from "moment";
import {Box, Grid} from "@mui/material";
import {FormDatePicker} from "@/src/components/form-fields/date-picker";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useApi} from "@/src/hooks/use-api";
import {ReportCard} from "../../components/report-card";
import {SalesSummaryResult} from "./result";
import {useSalesSummaryFormConfig} from "./form-config";
import {SalesSummaryData, SalesSummaryFilters} from "./types";

const today = moment().format("YYYY-MM-DD");

export function SalesSummaryReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{data: SalesSummaryData; filters: SalesSummaryFilters} | null>(null);
  const {schema, defaultValues} = useSalesSummaryFormConfig();
  const api = useApi();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<SalesSummaryFilters>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  async function generate(data: SalesSummaryFilters) {
    setIsGenerating(true);
    const response = await api.fetch<SalesSummaryData>(
      "GET",
      `/api/reports/sales/sales-summary?dateFrom=${data.dateFrom}&dateTo=${data.dateTo}`,
      {hideLoader: true},
    );

    if (response) {
      setResult({data: response, filters: data});
    }
    setIsGenerating(false);
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", gap: 3}}>
      <ReportCard title="reports.filters.title" isGenerating={isGenerating} onGenerate={handleSubmit(generate)}>
        <FormContextProvider control={control} errors={errors}>
          <Grid container spacing={2}>
            <FormDatePicker fieldName="dateFrom" label="reports.filters.dateFrom" maxDate={today} size={6} />
            <FormDatePicker fieldName="dateTo" label="reports.filters.dateTo" maxDate={today} size={6} />
          </Grid>
        </FormContextProvider>
      </ReportCard>

      {result && <SalesSummaryResult data={result.data} filters={result.filters} />}
    </Box>
  );
}
