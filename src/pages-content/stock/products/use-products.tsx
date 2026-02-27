import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {Box, Typography} from "@mui/material";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi, useApiQuery} from "@/src/hooks/use-api";
import {useR2Upload} from "@/src/hooks/use-r2-upload";
import {CompositionItem, PackageCompositionItem, Product, ProductsFilters, UnityOfMeasure} from "./types";
import {ProductFormValues, useProductFormConfig} from "./components/form/form-config";
import {useProductsTableConfig} from "./desktop/table-config";

const API_ROUTE = "/api/stock/product/paginated-list";
const UNITS_ROUTE = "/api/stock/unity-of-measure/paginated-list";

export function useProducts() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<ProductsFilters>({});
  const [filesItem, setFilesItem] = useState<Product | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stockChangeItem, setStockChangeItem] = useState<Product | null>(null);
  const [costHistoryItem, setCostHistoryItem] = useState<Product | null>(null);
  const [stockHistoryItem, setStockHistoryItem] = useState<Product | null>(null);
  const [manufactureCostItem, setManufactureCostItem] = useState<Product | null>(null);
  const {translate} = useTranslate();
  const {upload, deleteOrphan} = useR2Upload();
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = useProductFormConfig();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {data: unitsData} = useApiQuery<{data: UnityOfMeasure[]}>({
    queryKey: [UNITS_ROUTE, {limit: 100}],
    route: `${UNITS_ROUTE}?limit=100`,
  });

  const unitOptions: UnityOfMeasure[] = unitsData?.data ?? [];

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
    watch,
    setValue,
  } = useForm<ProductFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const composition = watch("composition");
  const packages = watch("packages");

  function setComposition(value: CompositionItem[]) {
    setValue("composition", value);
  }

  function setPackages(value: PackageCompositionItem[]) {
    setValue("packages", value);
  }

  const {generateConfig} = useProductsTableConfig({
    onView: (row: Product) => handleView(row),
    onEdit: (row: Product) => handleEdit(row),
    onDelete: (row: Product) => handleDelete(row),
    onToggleLandingPage: (row: Product) => handleToggleLandingPage(row),
    onStockChange: (row: Product) => handleStockChange(row),
    onStockHistoryClick: (row: Product) => setStockHistoryItem(row),
    onManufactureCostClick: (row: Product) => setManufactureCostItem(row),
    onCostClick: (row: Product) => setCostHistoryItem(row),
    onToggleActive: (row: Product) => handleToggleActive(row),
    onOpenFiles: (row: Product) => handleOpenFiles(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  function buildDependenciesContent(data?: {sales: string[]; total: number}) {
    if (!data?.sales?.length) return undefined;
    return (
      <Box sx={{marginTop: 1, width: "100%"}}>
        <Box>
          {data.sales.map((code, i) => (
            <Typography key={i} variant="body2" sx={{marginY: 0.5}}>
              · {code.toLocaleUpperCase()}
            </Typography>
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{marginTop: 1}}>
          {`${translate("products.totalSales")}${data.total}`}
        </Typography>
      </Box>
    );
  }

  async function submit(data: ProductFormValues) {
    const hasZeroQuantityIngredient = data.composition?.some((item) => !item.quantity || parseFloat(item.quantity) === 0);
    const hasZeroQuantityPackage = data.packages?.some((item) => !item.quantity || parseFloat(item.quantity) === 0);

    if (hasZeroQuantityIngredient || hasZeroQuantityPackage) {
      toast.errorToast("products.errors.zeroQuantity");
      return;
    }

    let imageUrl: string | null = typeof data.image === "string" ? data.image : null;

    if (data.image instanceof File) {
      const r2Result = await upload(data.image, "products");
      if (!r2Result) return;
      imageUrl = r2Result.url;
    }

    const body = {
      name: data.name,
      price: data.price,
      description: data.description || null,
      min_stock: data.min_stock || "0",
      composition: data.composition || [],
      packages: data.packages || [],
      unitOfMeasureId: data.unitOfMeasure?.id || "",
      imageUrl,
    };

    if (formType === "edit" && selectedId) {
      const result = await api.fetch("PUT", "/api/stock/product/update", {
        body: {...body, id: selectedId},
        onSuccess: () => {
          toast.successToast("products.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
      if (!result && imageUrl && data.image instanceof File) {
        await deleteOrphan(imageUrl);
      }
    } else {
      const result = await api.fetch("POST", "/api/stock/product/create", {
        body,
        onSuccess: () => {
          toast.successToast("products.createSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
      if (!result && imageUrl && data.image instanceof File) {
        await deleteOrphan(imageUrl);
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

  function populateForm(row: Product) {
    reset({
      name: row.name,
      price: row.price,
      description: row.description || "",
      image: row.image,
      composition: row.composition || [],
      packages: row.packages || [],
      min_stock: row.min_stock ?? "0",
      unitOfMeasure: row.unity_of_measure ?? null,
    });
  }

  function handleCreate() {
    setSelectedId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleView(row: Product) {
    populateForm(row);
    openDrawer("details");
  }

  function handleEdit(row: Product) {
    setSelectedId(row.id);
    populateForm(row);
    openDrawer("edit");
  }

  function handleDelete(row: Product) {
    if (Number(row.stock) !== 0) {
      toast.errorToast("products.errors.cannotDeleteWithStock");
      return;
    }

    showConfirmModal({
      message: "products.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/stock/product/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("products.deleteSuccess");
            refreshTable();
          },
          onError: (error, data) => {
            if (error === "products.errors.inUseBySales") {
              const content = buildDependenciesContent(data);
              if (row.active) {
                showConfirmModal({
                  message: "products.deactivateInstead",
                  content,
                  onConfirm: async () => {
                    await api.fetch("PUT", "/api/stock/product/toggle-active", {
                      body: {id: row.id},
                      onSuccess: () => {
                        toast.successToast("products.deactivateSuccess");
                        refreshTable();
                      },
                    });
                  },
                });
              } else {
                showConfirmModal({
                  message: "products.errors.inUseBySales",
                  content,
                  hideCancel: true,
                });
              }
              return true;
            }
            return false;
          },
        });
      },
    });
  }

  function handleToggleLandingPage(row: Product) {
    const messageKey = row.displayLandingPage ? "products.landingPage.removeConfirm" : "products.landingPage.addConfirm";
    const successKey = row.displayLandingPage ? "products.landingPage.removeSuccess" : "products.landingPage.addSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/stock/product/update", {
          body: {
            id: row.id,
            name: row.name,
            price: row.price,
            description: row.description || null,
            min_stock: row.min_stock ?? "0",
            composition: row.composition || [],
            packages: row.packages || [],
            unitOfMeasureId: row.unity_of_measure?.id || "",
            imageUrl: row.image,
            displayLandingPage: !row.displayLandingPage,
          },
          onSuccess: () => {
            toast.successToast(successKey);
            refreshTable();
          },
        });
      },
    });
  }

  function handleStockChange(row: Product) {
    setStockChangeItem(row);
  }

  function closeStockChangeModal() {
    setStockChangeItem(null);
  }

  function closeStockHistoryModal() {
    setStockHistoryItem(null);
  }

  function closeManufactureCostModal() {
    setManufactureCostItem(null);
  }

  function closeCostHistoryModal() {
    setCostHistoryItem(null);
  }

  function handleToggleActive(row: Product) {
    if (row.active && Number(row.stock) !== 0) {
      toast.errorToast("products.errors.cannotDeactivateWithStock");
      return;
    }

    const messageKey = row.active ? "products.deactivateConfirm" : "products.activateConfirm";
    const successKey = row.active ? "products.deactivateSuccess" : "products.activateSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/stock/product/toggle-active", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast(successKey);
            refreshTable();
          },
        });
      },
    });
  }

  function handleOpenFiles(row: Product) {
    setFilesItem(row);
  }

  function closeFilesModal() {
    setFilesItem(null);
  }

  function handleFilesChange(files: string[]) {
    setFilesItem((prev) => (prev ? {...prev, files} : null));
    refreshTable();
  }

  function handleFilterChange(newFilters: ProductsFilters) {
    setFilters(newFilters);
  }

  return {
    formType,
    showDrawer,
    control,
    errors,
    composition,
    setComposition,
    packages,
    setPackages,
    unitOptions,
    generateConfig,
    handleSubmit,
    submit,
    closeDrawer,
    handleCreate,
    handleView,
    handleEdit,
    handleDelete,
    handleToggleLandingPage,
    refreshTable,
    stockChangeItem,
    handleStockChange,
    closeStockChangeModal,
    stockHistoryItem,
    closeStockHistoryModal,
    manufactureCostItem,
    closeManufactureCostModal,
    costHistoryItem,
    closeCostHistoryModal,
    filesItem,
    handleOpenFiles,
    closeFilesModal,
    handleFilesChange,
    filters,
    handleFilterChange,
    handleToggleActive,
  };
}
