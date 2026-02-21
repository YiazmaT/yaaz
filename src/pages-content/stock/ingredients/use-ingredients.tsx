import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {Box, Typography} from "@mui/material";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi, useApiQuery} from "@/src/hooks/use-api";
import {Ingredient, IngredientsFilters} from "./types";
import {IngredientFormValues, useIngredientFormConfig} from "./form-config";
import {useIngredientsTableConfig} from "./desktop/table-config";

const API_ROUTE = "/api/stock/ingredient/paginated-list";

export function useIngredients() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [filters, setFilters] = useState<IngredientsFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [costHistoryIngredient, setCostHistoryIngredient] = useState<Ingredient | null>(null);
  const [stockChangeItem, setStockChangeItem] = useState<Ingredient | null>(null);
  const [stockHistoryItem, setStockHistoryItem] = useState<Ingredient | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {translate} = useTranslate();
  const {defaultValues, schema} = useIngredientFormConfig();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {data: unitsData} = useApiQuery<{data: {id: string; unity: string}[]}>({
    queryKey: ["/api/stock/unity-of-measure/paginated-list", {limit: 100}],
    route: "/api/stock/unity-of-measure/paginated-list?limit=100",
  });

  const unitOptions = (unitsData?.data || []).map((u) => ({value: u.id, label: u.unity}));

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<IngredientFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {generateConfig} = useIngredientsTableConfig({
    onView: (row) => handleView(row),
    onEdit: (row) => handleEdit(row),
    onDelete: (row) => handleDelete(row),
    onCostClick: (row) => setCostHistoryIngredient(row),
    onStockChange: (row) => handleStockChange(row),
    onStockHistoryClick: (row) => setStockHistoryItem(row),
    onToggleActive: (row) => handleToggleActive(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  function buildDependenciesContent(data?: {products: string[]; total: number}) {
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
          {`${translate("ingredients.totalProducts")}${data.total}`}
        </Typography>
      </Box>
    );
  }

  async function submit(data: IngredientFormValues) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("unitOfMeasureId", data.unitOfMeasure?.id || "");
    formData.append("min_stock", data.min_stock || "0");

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    if (formType === "edit" && selectedId) {
      formData.append("id", selectedId);
      await api.fetch("PUT", "/api/stock/ingredient/update", {
        formData,
        onSuccess: () => {
          toast.successToast("ingredients.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/stock/ingredient/create", {
        formData,
        onSuccess: () => {
          toast.successToast("ingredients.createSuccess");
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

  function populateForm(row: Ingredient) {
    reset({
      name: row.name,
      description: row.description || "",
      image: row.image,
      unitOfMeasure: row.unity_of_measure ?? null,
      min_stock: row.min_stock?.toString() || "0",
    });
  }

  function handleCreate() {
    setSelectedId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleView(row: Ingredient) {
    populateForm(row);
    openDrawer("details");
  }

  function handleEdit(row: Ingredient) {
    setSelectedId(row.id);
    populateForm(row);
    openDrawer("edit");
  }

  function handleDelete(row: Ingredient) {
    if (Number(row.stock) !== 0) {
      toast.errorToast("ingredients.errors.cannotDeleteWithStock");
      return;
    }

    showConfirmModal({
      message: "ingredients.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/stock/ingredient/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("ingredients.deleteSuccess");
            refreshTable();
          },
          onError: (error, data) => {
            if (error === "ingredients.errors.inUseByProducts") {
              const content = buildDependenciesContent(data);
              if (row.active) {
                showConfirmModal({
                  message: "ingredients.deactivateInstead",
                  content,
                  onConfirm: async () => {
                    await api.fetch("PUT", "/api/stock/ingredient/toggle-active", {
                      body: {id: row.id},
                      onSuccess: () => {
                        toast.successToast("ingredients.deactivateSuccess");
                        refreshTable();
                      },
                    });
                  },
                });
              } else {
                showConfirmModal({
                  message: "ingredients.errors.inUseByProducts",
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

  function handleToggleActive(row: Ingredient) {
    if (row.active && Number(row.stock) !== 0) {
      toast.errorToast("ingredients.errors.cannotDeactivateWithStock");
      return;
    }

    const messageKey = row.active ? "ingredients.deactivateConfirm" : "ingredients.activateConfirm";
    const successKey = row.active ? "ingredients.deactivateSuccess" : "ingredients.activateSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/stock/ingredient/toggle-active", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast(successKey);
            refreshTable();
          },
        });
      },
    });
  }

  function handleFilterChange(newFilters: IngredientsFilters) {
    setFilters(newFilters);
  }

  function openStockModal() {
    setShowStockModal(true);
  }

  function closeStockModal() {
    setShowStockModal(false);
  }

  function closeCostHistory() {
    setCostHistoryIngredient(null);
  }

  function handleStockChange(row: Ingredient) {
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
    costHistoryIngredient,
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
