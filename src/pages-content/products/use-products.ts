import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {CompositionItem, PackageCompositionItem, Product, ProductsFilters} from "./types";
import {ProductFormValues, useProductFormConfig} from "./form-config";
import {useProductsTableConfig} from "./desktop/table-config";

export function useProducts() {
  const [tableKey, setTableKey] = useState(0);
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [stockChangeItem, setStockChangeItem] = useState<Product | null>(null);
  const [stockHistoryItem, setStockHistoryItem] = useState<Product | null>(null);
  const [filters, setFilters] = useState<ProductsFilters>({});
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = useProductFormConfig();
  const api = useApi();
  const toast = useToaster();

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
    onToggleActive: (row: Product) => handleToggleActive(row),
  });

  async function submit(data: ProductFormValues) {
    const hasZeroQuantityIngredient = data.composition?.some((item) => !item.quantity || parseFloat(item.quantity) === 0);
    const hasZeroQuantityPackage = data.packages?.some((item) => !item.quantity || parseFloat(item.quantity) === 0);

    if (hasZeroQuantityIngredient || hasZeroQuantityPackage) {
      toast.errorToast("products.errors.zeroQuantity");
      return;
    }

    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("price", String(data.price));
    formData.append("description", data.description || "");
    formData.append("min_stock", data.min_stock || "0");
    formData.append("composition", JSON.stringify(data.composition || []));
    formData.append("packages", JSON.stringify(data.packages || []));

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    if (formType === "edit" && selectedId) {
      formData.append("id", selectedId);
      await api.fetch("PUT", "/api/product/update", {
        formData,
        onSuccess: () => {
          toast.successToast("products.updateSuccess");
          reset();
          closeDrawer();
          setTableKey((prev) => prev + 1);
        },
      });
    } else {
      await api.fetch("POST", "/api/product/create", {
        formData,
        onSuccess: () => {
          toast.successToast("products.createSuccess");
          reset();
          closeDrawer();
          setTableKey((prev) => prev + 1);
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

  function populateForm(row: Product) {
    reset({
      name: row.name,
      price: row.price,
      description: row.description || "",
      image: row.image,
      composition: row.composition || [],
      packages: row.packages || [],
      min_stock: row.min_stock?.toString() || "0",
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
    if (row.stock !== 0) {
      toast.errorToast("products.errors.cannotDeleteWithStock");
      return;
    }

    showConfirmModal({
      message: "products.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/product/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("products.deleteSuccess");
            setTableKey((prev) => prev + 1);
          },
          onError: (error) => {
            if (error === "products.errors.inUseBySales") {
              showConfirmModal({
                message: "products.deactivateInstead",
                onConfirm: async () => {
                  await api.fetch("PUT", "/api/product/toggle-active", {
                    body: {id: row.id},
                    onSuccess: () => {
                      toast.successToast("products.deactivateSuccess");
                      setTableKey((prev) => prev + 1);
                    },
                  });
                },
              });
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
        const formData = new FormData();
        formData.append("id", row.id);
        formData.append("name", row.name);
        formData.append("price", String(row.price));
        formData.append("description", row.description || "");
        formData.append("min_stock", row.min_stock?.toString() || "0");
        formData.append("composition", JSON.stringify(row.composition || []));
        formData.append("packages", JSON.stringify(row.packages || []));
        formData.append("displayLandingPage", String(!row.displayLandingPage));

        await api.fetch("PUT", "/api/product/update", {
          formData,
          onSuccess: () => {
            toast.successToast(successKey);
            setTableKey((prev) => prev + 1);
          },
        });
      },
    });
  }

  function refreshTable() {
    setTableKey((prev) => prev + 1);
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

  function handleToggleActive(row: Product) {
    if (row.active && row.stock !== 0) {
      toast.errorToast("products.errors.cannotDeactivateWithStock");
      return;
    }

    const messageKey = row.active ? "products.deactivateConfirm" : "products.activateConfirm";
    const successKey = row.active ? "products.deactivateSuccess" : "products.activateSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/product/toggle-active", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast(successKey);
            setTableKey((prev) => prev + 1);
          },
        });
      },
    });
  }

  function handleFilterChange(newFilters: ProductsFilters) {
    setFilters(newFilters);
  }

  return {
    tableKey,
    formType,
    showDrawer,
    control,
    errors,
    composition,
    setComposition,
    packages,
    setPackages,
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
    filters,
    handleFilterChange,
    handleToggleActive,
  };
}
