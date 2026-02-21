import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {BankAccountFormValues, useBankAccountFormConfig} from "./form-config";
import {useBankAccountsTableConfig} from "./desktop/table-config";
import {BankAccount, BankAccountsFilters} from "./types";

const API_ROUTE = "/api/finance/bank-account/paginated-list";

export function useBankAccounts() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<BankAccountsFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [statementAccount, setStatementAccount] = useState<BankAccount | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = useBankAccountFormConfig();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<BankAccountFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {generateConfig} = useBankAccountsTableConfig({
    onEdit: (row) => handleEdit(row),
    onToggleActive: (row) => handleToggleActive(row),
    onStatement: (row) => handleStatement(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  async function submit(data: BankAccountFormValues) {
    if (formType === "edit" && selectedId) {
      await api.fetch("PUT", "/api/finance/bank-account/update", {
        body: {id: selectedId, name: data.name},
        onSuccess: () => {
          toast.successToast("finance.bank.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/finance/bank-account/create", {
        body: {name: data.name, balance: data.balance},
        onSuccess: () => {
          toast.successToast("finance.bank.createSuccess");
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

  function handleEdit(row: BankAccount) {
    setSelectedId(row.id);
    reset({name: row.name, balance: String(row.balance)});
    openDrawer("edit");
  }

  function handleFilterChange(newFilters: BankAccountsFilters) {
    setFilters(newFilters);
  }

  function handleToggleActive(row: BankAccount) {
    const messageKey = row.active ? "finance.bank.deactivateConfirm" : "finance.bank.activateConfirm";
    const successKey = row.active ? "finance.bank.deactivateSuccess" : "finance.bank.activateSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/finance/bank-account/toggle-active", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast(successKey);
            refreshTable();
          },
        });
      },
    });
  }

  function handleStatement(row: BankAccount) {
    setStatementAccount(row);
  }

  function closeStatement() {
    setStatementAccount(null);
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
    statementAccount,
    handleStatement,
    closeStatement,
    refreshTable,
  };
}
