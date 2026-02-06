import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {Package} from "./types";
import {PackageFormValues, usePackageFormConfig} from "./form-config";
import {usePackagesTableConfig} from "./desktop/table-config";

const API_ROUTE = "/api/package/paginated-list";

export function usePackages() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [costHistoryPackage, setCostHistoryPackage] = useState<Package | null>(null);
  const [stockChangeItem, setStockChangeItem] = useState<Package | null>(null);
  const [stockHistoryItem, setStockHistoryItem] = useState<Package | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = usePackageFormConfig();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

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
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  async function submit(data: PackageFormValues) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("type", data.type);
    formData.append("min_stock", data.min_stock || "0");

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    if (formType === "edit" && selectedId) {
      formData.append("id", selectedId);
      await api.fetch("PUT", "/api/package/update", {
        formData,
        onSuccess: () => {
          toast.successToast("packages.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/package/create", {
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
    showConfirmModal({
      message: "packages.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/package/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("packages.deleteSuccess");
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
  };
}
