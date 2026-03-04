"use client";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import moment from "moment";
import {Box, Chip, FormControlLabel, Checkbox, Grid, Typography} from "@mui/material";
import {FormDatePicker} from "@/src/components/form-fields/date-picker";
import {FormContextProvider} from "@/src/contexts/form-context";
import {AsyncDropdown} from "@/src/components/form-fields/async-dropdown";
import {ImagePreview} from "@/src/components/image-preview";
import {useApi} from "@/src/hooks/use-api";
import {useTranslate} from "@/src/contexts/translation-context";
import {buildName} from "@/src/pages-content/stock/products/utils";
import {Product} from "@/src/pages-content/stock/products/types";
import {ReportCard} from "../../components/report-card";
import {SalesPerProductResult} from "./result";
import {useSalesPerProductFormConfig} from "./form-config";
import {SalesPerProductData, SalesPerProductFilters, SelectedProduct} from "./types";

const today = moment().format("YYYY-MM-DD");

export function SalesPerProductReport() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [allProducts, setAllProducts] = useState(true);
  const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
  const [result, setResult] = useState<{data: SalesPerProductData; filters: SalesPerProductFilters} | null>(null);
  const {schema, defaultValues} = useSalesPerProductFormConfig();
  const {translate} = useTranslate();
  const api = useApi();

  const {
    control,
    handleSubmit,
    formState: {errors},
  } = useForm<SalesPerProductFilters>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  function handleAddProduct(product: Product | null) {
    if (!product) return;
    if (selectedProducts.some((p) => p.id === product.id)) return;
    setSelectedProducts((prev) => [...prev, {id: product.id, name: product.name, code: product.code, image: product.image ?? null}]);
  }

  function handleRemoveProduct(id: string) {
    setSelectedProducts((prev) => prev.filter((p) => p.id !== id));
  }

  async function generate(data: SalesPerProductFilters) {
    if (!allProducts && selectedProducts.length === 0) return;

    setIsGenerating(true);
    const params = new URLSearchParams({dateFrom: data.dateFrom, dateTo: data.dateTo});
    if (allProducts) {
      params.set("allProducts", "true");
    } else {
      selectedProducts.forEach((p) => params.append("productIds", p.id));
    }

    const response = await api.fetch<SalesPerProductData>("GET", `/api/reports/sales/sales-per-product?${params.toString()}`, {hideLoader: true});
    if (response) setResult({data: response, filters: data});
    setIsGenerating(false);
  }

  return (
    <Box sx={{display: "flex", flexDirection: "column", gap: 3}}>
      <ReportCard title="reports.filters.title" isGenerating={isGenerating} onGenerate={handleSubmit(generate)}>
        <FormContextProvider control={control} errors={errors}>
          <Grid container spacing={2}>
            <FormDatePicker fieldName="dateFrom" label="reports.filters.dateFrom" maxDate={today} size={6} />
            <FormDatePicker fieldName="dateTo" label="reports.filters.dateTo" maxDate={today} size={6} />

            <Grid size={12}>
              <FormControlLabel
                control={<Checkbox checked={allProducts} onChange={(e) => setAllProducts(e.target.checked)} />}
                label={translate("reports.filters.allProducts")}
              />
            </Grid>

            {!allProducts && (
              <Grid size={12}>
                <AsyncDropdown<Product>
                  apiRoute="/api/stock/product/paginated-list"
                  uniqueKey="id"
                  label="global.products"
                  buildLabel={(p) => buildName(p)}
                  renderOption={(p) => <ProductDropdownOption product={p} />}
                  onChange={handleAddProduct}
                />
                {selectedProducts.length > 0 && (
                  <Box sx={{display: "flex", flexWrap: "wrap", gap: 1, mt: 1.5}}>
                    {selectedProducts.map((p) => (
                      <Chip
                        key={p.id}
                        size="small"
                        avatar={<ImagePreview url={p.image} alt={p.name} width={20} height={20} borderRadius={10} />}
                        label={buildName(p)}
                        onDelete={() => handleRemoveProduct(p.id)}
                      />
                    ))}
                  </Box>
                )}
                {selectedProducts.length === 0 && (
                  <Typography variant="caption" color="text.secondary" sx={{display: "block", mt: 1}}>
                    {translate("reports.filters.selectAtLeastOne")}
                  </Typography>
                )}
              </Grid>
            )}
          </Grid>
        </FormContextProvider>
      </ReportCard>

      {result && <SalesPerProductResult data={result.data} filters={result.filters} allProducts={allProducts} products={selectedProducts} />}
    </Box>
  );
}

function ProductDropdownOption(props: {product: Product}) {
  return (
    <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
      <ImagePreview url={props.product.image} alt={buildName(props.product)} width={28} height={28} borderRadius={4} />
      <Typography variant="body2">{buildName(props.product)}</Typography>
    </Box>
  );
}
