"use client";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import moment from "moment";
import {Box, Grid} from "@mui/material";
import {FormDatePicker} from "@/src/components/form-fields/date-picker";
import {FormAsyncDropdown} from "@/src/components/form-fields/async-dropdown";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useApi} from "@/src/hooks/use-api";
import {ReportCard} from "../../components/report-card";
import {ProfitMarginResult} from "./result";
import {useProfitMarginFormConfig} from "./form-config";
import {ProfitMarginFilters, ProfitMarginRow, ProductOption} from "./types";

const timeZone = process.env.TIME_ZONE ?? "America/Sao_Paulo";
const today = moment().format("YYYY-MM-DD");

export function ProfitMarginReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<{data: ProfitMarginRow[]; filters: ProfitMarginFilters} | null>(null);
  const {schema, defaultValues} = useProfitMarginFormConfig();
  const api = useApi();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<ProfitMarginFilters>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  async function generate(data: ProfitMarginFilters) {
    setIsGenerating(true);
    const params = new URLSearchParams();
    params.append("dateFrom", data.dateFrom);
    params.append("dateTo", data.dateTo);
    params.append("timezone", timeZone);
    if (data.product?.id) params.append("productId", data.product.id);

    const response = await api.fetch<ProfitMarginRow[]>("GET", `/api/reports/sales/profit-margin?${params.toString()}`, {hideLoader: true});

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
            <FormDatePicker fieldName="dateFrom" label="reports.filters.dateFrom" maxDate={today} size={4} />
            <FormDatePicker fieldName="dateTo" label="reports.filters.dateTo" maxDate={today} size={4} />
            <FormAsyncDropdown<ProductOption>
              fieldName="product"
              label="reports.filters.product"
              apiRoute="/api/product/paginated-list"
              uniqueKey="id"
              buildLabel={(opt) => opt.name}
              size={4}
            />
          </Grid>
        </FormContextProvider>
      </ReportCard>

      {result && <ProfitMarginResult data={result.data} filters={result.filters} />}
    </Box>
  );
}
