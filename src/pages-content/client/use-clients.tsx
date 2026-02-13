import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {Box, Typography} from "@mui/material";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {Client, ClientsFilters} from "./types";
import {ClientFormValues, useClientFormConfig} from "./form-config";
import {useClientsTableConfig} from "./desktop/table-config";

const API_ROUTE = "/api/client/paginated-list";

export function useClients() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filters, setFilters] = useState<ClientsFilters>({});
  const {show: showConfirmModal} = useConfirmModal();
  const {translate} = useTranslate();
  const {defaultValues, schema} = useClientFormConfig();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
    setValue,
  } = useForm<ClientFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {generateConfig} = useClientsTableConfig({
    onView: (row) => handleView(row),
    onEdit: (row) => handleEdit(row),
    onDelete: (row) => handleDelete(row),
    onToggleActive: (row) => handleToggleActive(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
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
          {`${translate("clients.totalSales")}${data.total}`}
        </Typography>
      </Box>
    );
  }

  async function submit(data: ClientFormValues) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("description", data.description || "");
    formData.append("email", data.email || "");
    formData.append("phone", data.phone || "");
    formData.append("cpf", data.cpf || "");
    formData.append("cnpj", data.cnpj || "");
    formData.append("isCompany", String(data.isCompany));
    formData.append("address", JSON.stringify(data.address));

    if (data.image instanceof File) {
      formData.append("image", data.image);
    }

    if (formType === "edit" && selectedId) {
      formData.append("id", selectedId);
      await api.fetch("PUT", "/api/client/update", {
        formData,
        onSuccess: () => {
          toast.successToast("clients.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/client/create", {
        formData,
        onSuccess: () => {
          toast.successToast("clients.createSuccess");
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

  function populateForm(row: Client) {
    reset({
      name: row.name,
      description: row.description || "",
      email: row.email || "",
      phone: row.phone || "",
      cpf: row.cpf || "",
      cnpj: row.cnpj || "",
      image: row.image,
      isCompany: row.isCompany,
      address: {
        cep: row.address?.cep || "",
        address: row.address?.address || "",
        number: row.address?.number || "",
        complement: row.address?.complement || "",
        neighborhood: row.address?.neighborhood || "",
        city: row.address?.city || "",
        state: row.address?.state || "",
      },
    });
  }

  function handleCreate() {
    setSelectedId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleView(row: Client) {
    populateForm(row);
    openDrawer("details");
  }

  function handleEdit(row: Client) {
    setSelectedId(row.id);
    populateForm(row);
    openDrawer("edit");
  }

  function handleDelete(row: Client) {
    showConfirmModal({
      message: "clients.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/client/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("clients.deleteSuccess");
            refreshTable();
          },
          onError: (error, data) => {
            if (error === "clients.errors.inUseBySales") {
              const content = buildSalesDependenciesContent(data);
              if (row.active) {
                showConfirmModal({
                  message: "clients.deactivateInstead",
                  content,
                  onConfirm: async () => {
                    await api.fetch("PUT", "/api/client/toggle-active", {
                      body: {id: row.id},
                      onSuccess: () => {
                        toast.successToast("clients.deactivateSuccess");
                        refreshTable();
                      },
                    });
                  },
                });
              } else {
                showConfirmModal({message: "clients.errors.inUseBySales", content, hideCancel: true});
              }
              return true;
            }
            return false;
          },
        });
      },
    });
  }

  function handleToggleActive(row: Client) {
    const messageKey = row.active ? "clients.deactivateConfirm" : "clients.activateConfirm";
    const successKey = row.active ? "clients.deactivateSuccess" : "clients.activateSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/client/toggle-active", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast(successKey);
            refreshTable();
          },
        });
      },
    });
  }

  function handleFilterChange(newFilters: ClientsFilters) {
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
    setValue,
    closeDrawer,
    handleCreate,
    handleView,
    handleEdit,
    handleDelete,
    handleToggleActive,
    refreshTable,
    filters,
    handleFilterChange,
  };
}
