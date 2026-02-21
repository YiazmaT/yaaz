import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {Box, Typography} from "@mui/material";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi, useApiQuery} from "@/src/hooks/use-api";
import {Package, PackagesFilters} from "./types";
import {PackageFormValues, usePackageFormConfig} from "./form-config";
import {usePackagesTableConfig} from "./desktop/table-config";
import {UnityOfMeasure} from "../unity-of-measure/types";

const API_ROUTE = "/api/stock/package/paginated-list";
const UNITS_ROUTE = "/api/stock/unity-of-measure/paginated-list";

export function usePackages() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<PackagesFilters>({});
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stockChangeItem, setStockChangeItem] = useState<Package | null>(null);
  const [stockHistoryItem, setStockHistoryItem] = useState<Package | null>(null);
  const [costHistoryPackage, setCostHistoryPackage] = useState<Package | null>(null);
  const {translate} = useTranslate();
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = usePackageFormConfig();
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
  } = useForm<PackageFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {generateConfig} = usePackagesTableConfig({
    onView: (row) => handleView(row),
    onEdit: (row) => handleEdit(row),
    onDelete: (row) => handleDelete(row),
    onCostClick: (row) => setCostHistoryPackage(row),
    onStockChange: (row) => handleStockChange(row),
    onStockHistoryClick: (row) => setStockHistoryItem(row),
    onToggleActive: (row) => handleToggleActive(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  function buildProductsDependenciesContent(data?: {products: string[]; total: number}) {
    if (!data?.products?.length) return undefined;
    return (
      <Box sx={{marginTop: 1, width: "100%"}}>
        <Box>
          {data.products.map((name, i) => (
            <Typography key={i} variant="body2" sx={{marginY: 0.5}}>
              · {name}
            </Typography>
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{marginTop: 1}}>
          {`${translate("packages.totalProducts")}${data.total}`}
        </Typography>
      </Box>
    );
  }

  function buildSalesDependenciesContent(data?: {sales: string[]; total: number}) {
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
          {`${translate("packages.totalSales")}${data.total}`}
        </Typography>
      </Box>
    );
  }

  async function submit(data: PackageFormValues) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("type", data.type);
    formData.append("min_stock", data.min_stock || "0");
    formData.append("unitOfMeasureId", data.unitOfMeasure?.id || "");

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    if (formType === "edit" && selectedId) {
      formData.append("id", selectedId);
      await api.fetch("PUT", "/api/stock/package/update", {
        formData,
        onSuccess: () => {
          toast.successToast("packages.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/stock/package/create", {
        formData,
        onSuccess: () => {
          toast.successToast("packages.createSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
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

  function populateForm(row: Package) {
    reset({
      name: row.name,
      description: row.description || "",
      image: row.image,
      type: row.type,
      min_stock: row.min_stock?.toString() || "0",
      unitOfMeasure: row.unity_of_measure ?? null,
    });
  }

  function handleCreate() {
    setSelectedId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleView(row: Package) {
    populateForm(row);
    openDrawer("details");
  }

  function handleEdit(row: Package) {
    setSelectedId(row.id);
    populateForm(row);
    openDrawer("edit");
  }

  function handleDelete(row: Package) {
    if (Number(row.stock) !== 0) {
      toast.errorToast("packages.errors.cannotDeleteWithStock");
      return;
    }

    showConfirmModal({
      message: "packages.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/stock/package/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("packages.deleteSuccess");
            refreshTable();
          },
          onError: (error, data) => {
            if (error === "packages.errors.inUseByProducts") {
              const content = buildProductsDependenciesContent(data);
              if (row.active) {
                showConfirmModal({
                  message: "packages.deactivateInstead",
                  content,
                  onConfirm: async () => {
                    await api.fetch("PUT", "/api/stock/package/toggle-active", {
                      body: {id: row.id},
                      onSuccess: () => {
                        toast.successToast("packages.deactivateSuccess");
                        refreshTable();
                      },
                    });
                  },
                });
              } else {
                showConfirmModal({message: "packages.errors.inUseByProducts", content, hideCancel: true});
              }
              return true;
            }
            if (error === "packages.errors.inUseBySales") {
              const content = buildSalesDependenciesContent(data);
              if (row.active) {
                showConfirmModal({
                  message: "packages.deactivateInstead",
                  content,
                  onConfirm: async () => {
                    await api.fetch("PUT", "/api/stock/package/toggle-active", {
                      body: {id: row.id},
                      onSuccess: () => {
                        toast.successToast("packages.deactivateSuccess");
                        refreshTable();
                      },
                    });
                  },
                });
              } else {
                showConfirmModal({message: "packages.errors.inUseBySales", content, hideCancel: true});
              }
              return true;
            }
            return false;
          },
        });
      },
    });
  }

  function handleToggleActive(row: Package) {
    if (row.active && Number(row.stock) !== 0) {
      toast.errorToast("packages.errors.cannotDeactivateWithStock");
      return;
    }

    const messageKey = row.active ? "packages.deactivateConfirm" : "packages.activateConfirm";
    const successKey = row.active ? "packages.deactivateSuccess" : "packages.activateSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/stock/package/toggle-active", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast(successKey);
            refreshTable();
          },
        });
      },
    });
  }

  function handleFilterChange(newFilters: PackagesFilters) {
    setFilters(newFilters);
  }

  function openStockModal() {
    setShowStockModal(true);
  }

  function closeStockModal() {
    setShowStockModal(false);
  }

  function closeCostHistory() {
    setCostHistoryPackage(null);
  }

  function handleStockChange(row: Package) {
    setStockChangeItem(row);
  }

  function closeStockChangeModal() {
    setStockChangeItem(null);
  }

  function closeStockHistoryModal() {
    setStockHistoryItem(null);
  }

  return {
    formType,
    showDrawer,
    control,
    errors,
    unitOptions,
    generateConfig,
    handleSubmit,
    submit,
    closeDrawer,
    handleCreate,
    handleView,
    handleEdit,
    handleDelete,
    showStockModal,
    openStockModal,
    closeStockModal,
    refreshTable,
    costHistoryPackage,
    closeCostHistory,
    stockChangeItem,
    handleStockChange,
    closeStockChangeModal,
    stockHistoryItem,
    closeStockHistoryModal,
    handleToggleActive,
    filters,
    handleFilterChange,
  };
}
