import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {Ingredient} from "./types";
import {IngredientFormValues, useIngredientFormConfig} from "./form-config";
import {useIngredientsTableConfig} from "./desktop/table-config";
import {useIngredientsConstants} from "./constants";

const API_ROUTE = "/api/ingredient/paginated-list";

export function useIngredients() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [costHistoryIngredient, setCostHistoryIngredient] = useState<Ingredient | null>(null);
  const [stockChangeItem, setStockChangeItem] = useState<Ingredient | null>(null);
  const [stockHistoryItem, setStockHistoryItem] = useState<Ingredient | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {unitOfMeasures} = useIngredientsConstants();
  const {defaultValues, schema} = useIngredientFormConfig();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

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
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  async function submit(data: IngredientFormValues) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("unitOfMeasure", data.unitOfMeasure?.value || "");
    formData.append("min_stock", data.min_stock || "0");

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    if (formType === "edit" && selectedId) {
      formData.append("id", selectedId);
      await api.fetch("PUT", "/api/ingredient/update", {
        formData,
        onSuccess: () => {
          toast.successToast("ingredients.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/ingredient/create", {
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
      unitOfMeasure: unitOfMeasures[row.unit_of_measure as keyof typeof unitOfMeasures] || null,
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
    showConfirmModal({
      message: "ingredients.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/ingredient/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("ingredients.deleteSuccess");
            refreshTable();
          },
        });
      },
    });
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
    unitOfMeasures,
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
  };
}
