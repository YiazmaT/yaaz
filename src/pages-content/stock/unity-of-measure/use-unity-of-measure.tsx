import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {Box, Typography} from "@mui/material";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {UnityOfMeasure, UnityOfMeasureFilters} from "./types";
import {UnityOfMeasureFormValues, useUnityOfMeasureFormConfig} from "./form-config";
import {useUnityOfMeasureTableConfig} from "./desktop/table-config";

const API_ROUTE = "/api/stock/unity-of-measure/paginated-list";

export function useUnityOfMeasure() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<UnityOfMeasureFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {translate} = useTranslate();
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = useUnityOfMeasureFormConfig();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<UnityOfMeasureFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {generateConfig} = useUnityOfMeasureTableConfig({
    onEdit: (row) => handleEdit(row),
    onDelete: (row) => handleDelete(row),
    onToggleActive: (row) => handleToggleActive(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  function buildDependenciesContent(data?: {products: string[]; packages: string[]; ingredients: string[]; total: number}) {
    const allNames = [...(data?.products ?? []), ...(data?.packages ?? []), ...(data?.ingredients ?? [])];
    if (!allNames.length) return undefined;
    return (
      <Box sx={{marginTop: 1, width: "100%"}}>
        <Box>
          {allNames.map((name, i) => (
            <Typography key={i} variant="body2" sx={{marginY: 0.5}}>
              · {name}
            </Typography>
          ))}
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{marginTop: 1}}>
          {`${translate("unityOfMeasure.totalDependencies")}${data?.total}`}
        </Typography>
      </Box>
    );
  }

  async function submit(data: UnityOfMeasureFormValues) {
    if (formType === "edit" && selectedId) {
      await api.fetch("PUT", "/api/stock/unity-of-measure/update", {
        body: {id: selectedId, unity: data.unity},
        onSuccess: () => {
          toast.successToast("unityOfMeasure.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/stock/unity-of-measure/create", {
        body: {unity: data.unity},
        onSuccess: () => {
          toast.successToast("unityOfMeasure.createSuccess");
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

  function populateForm(row: UnityOfMeasure) {
    reset({
      unity: row.unity,
    });
  }

  function handleCreate() {
    setSelectedId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleEdit(row: UnityOfMeasure) {
    setSelectedId(row.id);
    populateForm(row);
    openDrawer("edit");
  }

  function handleDelete(row: UnityOfMeasure) {
    showConfirmModal({
      message: "unityOfMeasure.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/stock/unity-of-measure/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("unityOfMeasure.deleteSuccess");
            refreshTable();
          },
          onError: (error, data) => {
            if (error === "unityOfMeasure.errors.inUse") {
              const content = buildDependenciesContent(data);
              if (row.active) {
                showConfirmModal({
                  message: "unityOfMeasure.deactivateInstead",
                  content,
                  onConfirm: async () => {
                    await api.fetch("PUT", "/api/stock/unity-of-measure/toggle-active", {
                      body: {id: row.id},
                      onSuccess: () => {
                        toast.successToast("unityOfMeasure.deactivateSuccess");
                        refreshTable();
                      },
                    });
                  },
                });
              } else {
                showConfirmModal({
                  message: "unityOfMeasure.errors.inUse",
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

  function handleToggleActive(row: UnityOfMeasure) {
    const messageKey = row.active ? "unityOfMeasure.deactivateConfirm" : "unityOfMeasure.activateConfirm";
    const successKey = row.active ? "unityOfMeasure.deactivateSuccess" : "unityOfMeasure.activateSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/stock/unity-of-measure/toggle-active", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast(successKey);
            refreshTable();
          },
        });
      },
    });
  }

  function handleFilterChange(newFilters: UnityOfMeasureFilters) {
    setFilters(newFilters);
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
    handleDelete,
    handleToggleActive,
    refreshTable,
    filters,
    handleFilterChange,
  };
}
