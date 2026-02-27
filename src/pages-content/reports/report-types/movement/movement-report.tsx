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
import {MovementResult} from "./result";
import {useMovementFormConfig} from "./form-config";
import {MovementData, MovementFilters} from "./types";

const today = moment().format("YYYY-MM-DD");

export function MovementReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{data: MovementData; filters: MovementFilters} | null>(null);
  const {schema, defaultValues} = useMovementFormConfig();
  const api = useApi();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<MovementFilters>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  async function generate(data: MovementFilters) {
    setIsGenerating(true);
    const response = await api.fetch<MovementData>(
      "GET",
      `/api/reports/finance/movement?dateFrom=${data.dateFrom}&dateTo=${data.dateTo}`,
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

      {result && <MovementResult data={result.data} filters={result.filters} />}
    </Box>
  );
}
