import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {CategoriesFilters, FinanceCategory} from "../../types";
import {CategoryFormValues, useCategoryFormConfig} from "./form-config";
import {useCategoriesTableConfig} from "./table-config";

const API_ROUTE = "/api/finance/category/paginated-list";

export function useCategories() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<CategoriesFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = useCategoryFormConfig();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<CategoryFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {generateConfig} = useCategoriesTableConfig({
    onEdit: (row) => handleEdit(row),
    onToggleActive: (row) => handleToggleActive(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  async function submit(data: CategoryFormValues) {
    if (formType === "edit" && selectedId) {
      await api.fetch("PUT", "/api/finance/category/update", {
        body: {id: selectedId, name: data.name},
        onSuccess: () => {
          toast.successToast("finance.categories.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/finance/category/create", {
        body: {name: data.name},
        onSuccess: () => {
          toast.successToast("finance.categories.createSuccess");
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

  function handleCreate() {
    setSelectedId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleEdit(row: FinanceCategory) {
    setSelectedId(row.id);
    reset({name: row.name});
    openDrawer("edit");
  }

  function handleFilterChange(newFilters: CategoriesFilters) {
    setFilters(newFilters);
  }

  function handleToggleActive(row: FinanceCategory) {
    const messageKey = row.active ? "finance.categories.deactivateConfirm" : "finance.categories.activateConfirm";
    const successKey = row.active ? "finance.categories.deactivateSuccess" : "finance.categories.activateSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/finance/category/toggle-active", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast(successKey);
            refreshTable();
          },
        });
      },
    });
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
    handleEdit,
    handleToggleActive,
    filters,
    handleFilterChange,
  };
}
