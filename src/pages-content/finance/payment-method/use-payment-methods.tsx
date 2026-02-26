import {useState} from "react";
import {Box, Typography} from "@mui/material";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {useApi} from "@/src/hooks/use-api";
import {PaymentMethodFormValues, usePaymentMethodFormConfig} from "./form-config";
import {usePaymentMethodsTableConfig} from "./desktop/table-config";
import {PaymentMethod, PaymentMethodFilters} from "./types";

const API_ROUTE = "/api/finance/payment-method/paginated-list";

export function usePaymentMethods() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<PaymentMethodFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [originalBankAccountId, setOriginalBankAccountId] = useState<string | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = usePaymentMethodFormConfig();
  const {translate} = useTranslate();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<PaymentMethodFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {generateConfig} = usePaymentMethodsTableConfig({
    onEdit: (row) => handleEdit(row),
    onToggleActive: (row) => handleToggleActive(row),
    onDelete: (row) => handleDelete(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  async function doSubmit(data: PaymentMethodFormValues) {
    const bank_account_id = data.bank_account?.id ?? null;

    if (formType === "edit" && selectedId) {
      await api.fetch("PUT", "/api/finance/payment-method/update", {
        body: {id: selectedId, name: data.name, bank_account_id},
        onSuccess: () => {
          toast.successToast("finance.paymentMethod.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/finance/payment-method/create", {
        body: {name: data.name, bank_account_id},
        onSuccess: () => {
          toast.successToast("finance.paymentMethod.createSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    }
  }

  async function submit(data: PaymentMethodFormValues) {
    const isAddingBankAccount = data.bank_account !== null && originalBankAccountId === null;

    if (isAddingBankAccount) {
      showConfirmModal({
        message: "finance.paymentMethod.bankAccountConfirm",
        onConfirm: () => doSubmit(data),
      });
      return;
    }

    await doSubmit(data);
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
    setOriginalBankAccountId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleEdit(row: PaymentMethod) {
    setSelectedId(row.id);
    setOriginalBankAccountId(row.bank_account_id);
    reset({
      name: row.name,
      bank_account: row.bank_account_id ? {id: row.bank_account_id, name: row.bank_account_name!} : null,
    });
    openDrawer("edit");
  }

  function handleFilterChange(newFilters: PaymentMethodFilters) {
    setFilters(newFilters);
  }

  function handleToggleActive(row: PaymentMethod) {
    const messageKey = row.active ? "finance.paymentMethod.deactivateConfirm" : "finance.paymentMethod.activateConfirm";
    const successKey = row.active ? "finance.paymentMethod.deactivateSuccess" : "finance.paymentMethod.activateSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/finance/payment-method/toggle-active", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast(successKey);
            refreshTable();
          },
        });
      },
    });
  }

  function buildUsageContent(data?: {saleCount: number}) {
    if (!data) return undefined;
    return (
      <Box sx={{marginTop: 1, width: "100%"}}>
        <Typography variant="body2" sx={{marginY: 0.5}}>
          · {translate("finance.paymentMethod.usedInSales")}: {data.saleCount}
        </Typography>
      </Box>
    );
  }

  function handleDelete(row: PaymentMethod) {
    showConfirmModal({
      message: "finance.paymentMethod.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/finance/payment-method/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("finance.paymentMethod.deleteSuccess");
            refreshTable();
          },
          onError: (errorKey, data) => {
            if (errorKey === "finance.paymentMethod.errors.inUse") {
              const content = buildUsageContent(data);
              if (row.active) {
                showConfirmModal({
                  message: "finance.paymentMethod.deactivateInstead",
                  content,
                  onConfirm: async () => {
                    await api.fetch("PUT", "/api/finance/payment-method/toggle-active", {
                      body: {id: row.id},
                      onSuccess: () => {
                        toast.successToast("finance.paymentMethod.deactivateSuccess");
                        refreshTable();
                      },
                    });
                  },
                });
              } else {
                showConfirmModal({
                  message: "finance.paymentMethod.errors.inUse",
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
