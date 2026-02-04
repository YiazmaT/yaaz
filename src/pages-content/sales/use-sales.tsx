import Decimal from "decimal.js";
import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {Box, Typography} from "@mui/material";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {PackageCompositionItem} from "@/src/components/packages-selector/types";
import {Sale, ItemSale} from "./types";
import {SaleFormValues, useSaleFormConfig} from "./form-config";
import {useSalesTableConfig} from "./desktop/table-config";
import {CreateSaleResponse, ProductStockWarning, PackageStockWarning} from "./dto";
import {SalesFilters} from "./components/filters/types";

export function useSales() {
  const [tableKey, setTableKey] = useState(0);
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<SalesFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = useSaleFormConfig();
  const {translate} = useTranslate();
  const api = useApi();
  const toast = useToaster();

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
    const itemsTotal = currentItems.reduce((acc, item) => acc.plus(new Decimal(item.product.price).times(item.quantity)), new Decimal(0));
    setValue("total", itemsTotal.toString());
  }

  const {generateConfig} = useSalesTableConfig({
    onView: (row) => handleView(row),
    onEdit: (row) => handleEdit(row),
    onDelete: (row) => handleDelete(row),
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

    const hasZeroQuantityItem = data.items.some((item) => item.quantity <= 0);
    const hasZeroQuantityPackage = data.packages.some((pkg) => Number(pkg.quantity) <= 0);
    if (hasZeroQuantityItem || hasZeroQuantityPackage) {
      toast.errorToast("sales.errors.zeroQuantity");
      return;
    }

    const cleanItems: {product_id: string; quantity: number}[] = [];
    for (let i = 0; i < data.items.length; i++) {
      cleanItems.push({
        product_id: String(data.items[i].product.id),
        quantity: Number(data.items[i].quantity),
      });
    }

    const cleanPackages: {package_id: string; quantity: number}[] = [];
    for (let i = 0; i < data.packages.length; i++) {
      cleanPackages.push({
        package_id: String(data.packages[i].package.id),
        quantity: Math.floor(Number(data.packages[i].quantity)),
      });
    }

    const body = {
      payment_method: String(data.payment_method),
      total: data.total,
      items: cleanItems,
      packages: cleanPackages,
      force: false,
    };

    if (formType === "edit" && selectedId) {
      const result = await api.fetch<CreateSaleResponse>("PUT", "/api/sale/update", {
        body: {...body, id: selectedId},
      });

      if (result?.success) {
        toast.successToast("sales.updateSuccess");
        reset();
        closeDrawer();
        setTableKey((prev) => prev + 1);
      } else {
        const hasProductWarnings = result?.stockWarnings && result.stockWarnings.length > 0;
        const hasPackageWarnings = result?.packageWarnings && result.packageWarnings.length > 0;

        if (hasProductWarnings || hasPackageWarnings) {
          const forceBody = {...body, id: selectedId, force: true};
          showConfirmModal({
            message: "sales.negativeStockWarning",
            content: (
              <StockWarningsList
                productWarnings={result?.stockWarnings || []}
                packageWarnings={result?.packageWarnings || []}
              />
            ),
            onConfirm: async () => {
              const forceResult = await api.fetch<CreateSaleResponse>("PUT", "/api/sale/update", {body: forceBody});
              if (forceResult?.success) {
                toast.successToast("sales.updateSuccess");
                reset();
                closeDrawer();
                setTableKey((prev) => prev + 1);
              }
            },
          });
        }
      }
    } else {
      const result = await api.fetch<CreateSaleResponse>("POST", "/api/sale/create", {body});

      if (result?.success) {
        toast.successToast("sales.createSuccess");
        reset();
        closeDrawer();
        setTableKey((prev) => prev + 1);
      } else {
        const hasProductWarnings = result?.stockWarnings && result.stockWarnings.length > 0;
        const hasPackageWarnings = result?.packageWarnings && result.packageWarnings.length > 0;

        if (hasProductWarnings || hasPackageWarnings) {
          const forceBody = {...body, force: true};
          showConfirmModal({
            message: "sales.negativeStockWarning",
            content: (
              <StockWarningsList
                productWarnings={result?.stockWarnings || []}
                packageWarnings={result?.packageWarnings || []}
              />
            ),
            onConfirm: async () => {
              const forceResult = await api.fetch<CreateSaleResponse>("POST", "/api/sale/create", {body: forceBody});
              if (forceResult?.success) {
                toast.successToast("sales.createSuccess");
                reset();
                closeDrawer();
                setTableKey((prev) => prev + 1);
              }
            },
          });
        }
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
      payment_method: row.payment_method,
      items: row.items || [],
      packages: row.packages || [],
      total: row.total,
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
            setTableKey((prev) => prev + 1);
          },
        });
      },
    });
  }

  function handleFilterChange(newFilters: SalesFilters) {
    setFilters(newFilters);
  }

  return {
    tableKey,
    formType,
    showDrawer,
    control,
    errors,
    items,
    packages,
    total,
    filters,
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
    handleFilterChange,
  };
}
