import Decimal from "decimal.js";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Box, Typography} from "@mui/material";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi, useApiQuery} from "@/src/hooks/use-api";
import {useFormatCurrency} from "@/src/hooks/use-format-currency";
import {PackageCompositionItem} from "@/src/components/selectors/packages-selector/types";
import {Sale, ItemSale} from "./types";
import {PaymentMethod} from "../finance/payment-method/types";
import {SaleFormValues, useSaleFormConfig} from "./form-config";
import {useSalesTableConfig} from "./desktop/table-config";
import {CreateSaleResponse, ConvertQuoteResponse, ProductStockWarning, PackageStockWarning, PriceChangeWarning} from "./dto";
import {SalesFilters} from "./components/filters/types";

const API_ROUTE = "/api/sale/paginated-list";

export function useSales() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<SalesFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = useSaleFormConfig();

  const {data: paymentMethodsResponse} = useApiQuery<{data: PaymentMethod[]; total: number; page: number; limit: number}>({
    queryKey: ["/api/finance/payment-method/paginated-list", "all-active"],
    route: "/api/finance/payment-method/paginated-list?limit=100",
  });
  const paymentMethods = paymentMethodsResponse?.data ?? [];
  const {translate} = useTranslate();
  const api = useApi();
  const toast = useToaster();
  const formatCurrency = useFormatCurrency();
  const queryClient = useQueryClient();

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  function StockWarningsList(props: {productWarnings: ProductStockWarning[]; packageWarnings: PackageStockWarning[]}) {
    return (
      <Box sx={{width: "100%", mt: 2}}>
        {props.productWarnings.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} sx={{mb: 1}}>
              {translate("global.products")}
            </Typography>
            {props.productWarnings.map((item) => (
              <Box key={item.productId} sx={{display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #eee"}}>
                <Typography variant="body2" fontWeight={500}>
                  {item.productName}
                </Typography>
                <Typography variant="body2" color="error">
                  {item.currentStock} → {item.resultingStock}
                </Typography>
              </Box>
            ))}
          </>
        )}
        {props.packageWarnings.length > 0 && (
          <>
            <Typography variant="subtitle2" fontWeight={600} sx={{mt: props.productWarnings.length > 0 ? 2 : 0, mb: 1}}>
              {translate("global.packages")}
            </Typography>
            {props.packageWarnings.map((item) => (
              <Box key={item.packageId} sx={{display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #eee"}}>
                <Typography variant="body2" fontWeight={500}>
                  {item.packageName}
                </Typography>
                <Typography variant="body2" color="error">
                  {item.currentStock} → {item.resultingStock}
                </Typography>
              </Box>
            ))}
          </>
        )}
      </Box>
    );
  }

  function PriceChangeWarningsList(props: {warnings: PriceChangeWarning[]; originalTotal: string; newTotal: string}) {
    return (
      <Box sx={{width: "100%", mt: 2}}>
        <Typography variant="subtitle2" fontWeight={600} sx={{mb: 1}}>
          {translate("sales.priceChangeWarning.products")}
        </Typography>
        {props.warnings.map((item) => (
          <Box key={item.productId} sx={{display: "flex", justifyContent: "space-between", py: 0.5, borderBottom: "1px solid #eee"}}>
            <Typography variant="body2" fontWeight={500}>
              {item.productName}
            </Typography>
            <Typography variant="body2" color="warning.main">
              {formatCurrency(item.originalPrice)} → {formatCurrency(item.currentPrice)}
            </Typography>
          </Box>
        ))}
        <Box sx={{mt: 2, p: 1.5, backgroundColor: "grey.100", borderRadius: 1}}>
          <Box sx={{display: "flex", justifyContent: "space-between", mb: 0.5}}>
            <Typography variant="body2">{translate("sales.priceChangeWarning.originalTotal")}</Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatCurrency(props.originalTotal)}
            </Typography>
          </Box>
          <Box sx={{display: "flex", justifyContent: "space-between"}}>
            <Typography variant="body2">{translate("sales.priceChangeWarning.newTotal")}</Typography>
            <Typography variant="body2" fontWeight={600} color="warning.main">
              {formatCurrency(props.newTotal)}
            </Typography>
          </Box>
        </Box>
      </Box>
    );
  }

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
    watch,
    setValue,
  } = useForm<SaleFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const items = watch("items");
  const packages = watch("packages");
  const total = watch("total");

  function setItems(value: ItemSale[]) {
    setValue("items", value);
    recalculateTotal(value);
  }

  function setPackages(value: PackageCompositionItem[]) {
    setValue("packages", value);
  }

  function recalculateTotal(currentItems: ItemSale[]) {
    const itemsTotal = currentItems.reduce((acc, item) => {
      const price = item.unit_price || item.product.price.toString();
      return acc.plus(new Decimal(price).times(item.quantity));
    }, new Decimal(0));
    setValue("total", itemsTotal.toString());
  }

  const {generateConfig} = useSalesTableConfig({
    onView: (row) => handleView(row),
    onEdit: (row) => handleEdit(row),
    onDelete: (row) => handleDelete(row),
    onConvertQuote: (row) => handleConvertQuote(row),
    onDownloadPdf: (row) => handleDownloadPdf(row),
  });

  async function submit(data: SaleFormValues) {
    const hasNoItems = data.items.length === 0 && data.packages.length === 0;
    if (hasNoItems) {
      toast.errorToast("sales.errors.noItems");
      return;
    }

    const totalValue = new Decimal(data.total);
    if (totalValue.isZero() || totalValue.lessThan(0)) {
      toast.errorToast("sales.errors.invalidTotal");
      return;
    }

    const hasZeroQuantityItem = data.items.some((item) => Number(item.quantity) <= 0);
    const hasZeroQuantityPackage = data.packages.some((pkg) => Number(pkg.quantity) <= 0);
    if (hasZeroQuantityItem || hasZeroQuantityPackage) {
      toast.errorToast("sales.errors.zeroQuantity");
      return;
    }

    const cleanItems: {product_id: string; quantity: string; unit_price: string}[] = [];
    for (let i = 0; i < data.items.length; i++) {
      cleanItems.push({
        product_id: String(data.items[i].product.id),
        quantity: data.items[i].quantity,
        unit_price: data.items[i].unit_price || data.items[i].product.price.toString(),
      });
    }

    const cleanPackages: {package_id: string; quantity: string}[] = [];
    for (let i = 0; i < data.packages.length; i++) {
      cleanPackages.push({
        package_id: String(data.packages[i].package.id),
        quantity: data.packages[i].quantity,
      });
    }

    const body = {
      payment_method_id: data.payment_method_id,
      total: data.total,
      items: cleanItems,
      packages: cleanPackages,
      force: false,
      is_quote: data.is_quote || false,
      client_id: data.client?.id || null,
    };

    if (formType === "edit" && selectedId) {
      async function submitUpdate(updateBody: typeof body & {id: string; updatePrices?: boolean}) {
        const result = await api.fetch<CreateSaleResponse>("PUT", "/api/sale/update", {body: updateBody});

        if (result?.success === false) {
          const hasPriceWarnings = result?.priceChangeWarnings && result.priceChangeWarnings.length > 0;
          if (hasPriceWarnings) {
            const originalTotal = data.items.reduce((acc, item) => {
              const price = item.unit_price || item.product.price.toString();
              return acc.plus(new Decimal(price).times(item.quantity));
            }, new Decimal(0));
            const newTotal = data.items.reduce((acc, item) => {
              return acc.plus(new Decimal(item.product.price).times(item.quantity));
            }, new Decimal(0));

            showConfirmModal({
              title: "sales.priceChangeWarning.title",
              message: "sales.priceChangeWarning.message",
              content: (
                <PriceChangeWarningsList
                  warnings={result.priceChangeWarnings!}
                  originalTotal={originalTotal.toString()}
                  newTotal={newTotal.toString()}
                />
              ),
              onConfirm: () => submitUpdate({...updateBody, updatePrices: true}),
              onCancel: () => submitUpdate({...updateBody, updatePrices: false}),
            });
            return false;
          }

          const hasProductWarnings = result?.stockWarnings && result.stockWarnings.length > 0;
          const hasPackageWarnings = result?.packageWarnings && result.packageWarnings.length > 0;
          if (hasProductWarnings || hasPackageWarnings) {
            showConfirmModal({
              message: "sales.negativeStockWarning",
              content: <StockWarningsList productWarnings={result?.stockWarnings || []} packageWarnings={result?.packageWarnings || []} />,
              onConfirm: async () => {
                await submitUpdate({...updateBody, force: true});
              },
            });
            return false;
          }

          return false;
        }

        if (result) {
          toast.successToast("sales.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
          return true;
        }

        return false;
      }

      await submitUpdate({...body, id: selectedId});
    } else {
      const result = await api.fetch<CreateSaleResponse>("POST", "/api/sale/create", {body});

      if (result?.success === false) {
        const hasProductWarnings = result?.stockWarnings && result.stockWarnings.length > 0;
        const hasPackageWarnings = result?.packageWarnings && result.packageWarnings.length > 0;

        if (hasProductWarnings || hasPackageWarnings) {
          const forceBody = {...body, force: true};
          showConfirmModal({
            message: "sales.negativeStockWarning",
            content: <StockWarningsList productWarnings={result?.stockWarnings || []} packageWarnings={result?.packageWarnings || []} />,
            onConfirm: async () => {
              const forceResult = await api.fetch<CreateSaleResponse>("POST", "/api/sale/create", {body: forceBody});
              if (forceResult) {
                toast.successToast("sales.createSuccess");
                reset();
                closeDrawer();
                refreshTable();
              }
            },
          });
        }
      } else if (result) {
        toast.successToast("sales.createSuccess");
        reset();
        closeDrawer();
        refreshTable();
      }
    }
  }

  function openDrawer(type: string) {
    setFormType(type);
    setShowDrawer(true);
  }

  function closeDrawer() {
    setShowDrawer(false);
    reset(defaultValues);
    setSelectedId(null);
  }

  function populateForm(row: Sale) {
    reset({
      payment_method_id: row.payment_method_id,
      items: row.items || [],
      packages: row.packages || [],
      total: row.total,
      client: row.client || null,
    });
  }

  function handleCreate() {
    setSelectedId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleView(row: Sale) {
    populateForm(row);
    openDrawer("details");
  }

  function handleEdit(row: Sale) {
    setSelectedId(row.id);
    populateForm(row);
    openDrawer("edit");
  }

  function handleDelete(row: Sale) {
    showConfirmModal({
      message: "sales.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/sale/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("sales.deleteSuccess");
            refreshTable();
          },
        });
      },
    });
  }

  function handleConvertQuote(row: Sale) {
    showConfirmModal({
      message: "sales.convertQuoteConfirm",
      onConfirm: async () => {
        const result = await api.fetch<ConvertQuoteResponse>("PUT", "/api/sale/convert-quote", {body: {id: row.id}});

        if (result?.success === false) {
          const hasProductWarnings = result?.stockWarnings && result.stockWarnings.length > 0;
          const hasPackageWarnings = result?.packageWarnings && result.packageWarnings.length > 0;

          if (hasProductWarnings || hasPackageWarnings) {
            showConfirmModal({
              message: "sales.negativeStockWarning",
              content: <StockWarningsList productWarnings={result?.stockWarnings || []} packageWarnings={result?.packageWarnings || []} />,
              onConfirm: async () => {
                const forceResult = await api.fetch<ConvertQuoteResponse>("PUT", "/api/sale/convert-quote", {body: {id: row.id, force: true}});
                if (forceResult) {
                  toast.successToast("sales.convertQuoteSuccess");
                  refreshTable();
                }
              },
            });
          }
        } else if (result) {
          toast.successToast("sales.convertQuoteSuccess");
          refreshTable();
        }
      },
    });
  }

  function handleDownloadPdf(row: Sale) {
    window.open(`/api/sale/pdf?id=${row.id}`, "_blank");
  }

  function handleFilterChange(newFilters: SalesFilters) {
    setFilters(newFilters);
  }

  return {
    formType,
    showDrawer,
    control,
    errors,
    items,
    packages,
    total,
    filters,
    paymentMethods,
    setItems,
    setPackages,
    generateConfig,
    handleSubmit,
    submit,
    closeDrawer,
    handleCreate,
    handleView,
    handleEdit,
    handleDelete,
    handleConvertQuote,
    handleDownloadPdf,
    handleFilterChange,
  };
}
