import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {Box, Typography} from "@mui/material";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {CategoryFormValues, useCategoryFormConfig} from "./form-config";
import {useCategoriesTableConfig} from "./desktop/table-config";
import {CategoriesFilters, FinanceCategory} from "./types";
import {flexGenerator} from "@/src/utils/flex-generator";

const API_ROUTE = "/api/finance/category/paginated-list";

export function useCategories() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<CategoriesFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {translate} = useTranslate();
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
    onDelete: (row) => handleDelete(row),
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

  function buildDependenciesContent(data?: {billCount: number; transactionCount: number; total: number}) {
    if (!data) return undefined;
    return (
      <Box sx={{marginTop: 1, width: "100%"}}>
        {data.billCount > 0 && (
          <Typography variant="body2" sx={{marginY: 0.5}}>
            · {translate("finance.categories.usedInBills")}: {data.billCount}
          </Typography>
        )}
        {data.transactionCount > 0 && (
          <Typography variant="body2" sx={{marginY: 0.5}}>
            · {translate("finance.categories.usedInTransactions")}: {data.transactionCount}
          </Typography>
        )}
        <Typography variant="body2" color="text.secondary" sx={{marginTop: 1}}>
          {`${translate("finance.categories.totalUsage")}${data.total}`}
        </Typography>
      </Box>
    );
  }

  function handleDelete(row: FinanceCategory) {
    showConfirmModal({
      message: "finance.categories.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/finance/category/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("finance.categories.deleteSuccess");
            refreshTable();
          },
          onError: (error, data) => {
            if (error === "finance.categories.errors.inUse") {
              const content = buildDependenciesContent(data);
              if (row.active) {
                showConfirmModal({
                  message: "finance.categories.deactivateInstead",
                  content,
                  onConfirm: async () => {
                    await api.fetch("PUT", "/api/finance/category/toggle-active", {
                      body: {id: row.id},
                      onSuccess: () => {
                        toast.successToast("finance.categories.deactivateSuccess");
                        refreshTable();
                      },
                    });
                  },
                });
              } else {
                showConfirmModal({
                  message: "finance.categories.errors.inUse",
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
    handleDelete,
    filters,
    handleFilterChange,
  };
}
