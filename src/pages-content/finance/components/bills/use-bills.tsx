import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {Bill} from "../../types";
import {BillFormValues, useBillFormConfig} from "./form-config";
import {useBillsTableConfig} from "./table-config";

const API_ROUTE = "/api/finance/bill/paginated-list";

export function useBills() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<Record<string, string>>({});
  const [selectedBillId, setSelectedBillId] = useState<string | null>(null);
  const [payBill, setPayBill] = useState<Bill | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = useBillFormConfig();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<BillFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {generateConfig} = useBillsTableConfig({
    onEdit: (row) => handleEdit(row),
    onDelete: (row) => handleDelete(row),
    onPay: (row) => handlePay(row),
    onCancelPayment: (row) => handleCancelPayment(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  async function submit(data: BillFormValues) {
    if (formType === "edit" && selectedBillId) {
      await api.fetch("PUT", "/api/finance/bill/update", {
        body: {
          id: selectedBillId,
          description: data.description,
          categoryId: data.category?.id || null,
          amount: data.amount,
          dueDate: data.dueDate,
        },
        onSuccess: () => {
          toast.successToast("finance.bills.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/finance/bill/create", {
        body: {
          description: data.description,
          categoryId: data.category?.id || null,
          amount: data.amount,
          installmentCount: data.installmentCount,
          dueDate: data.dueDate,
        },
        onSuccess: () => {
          toast.successToast("finance.bills.createSuccess");
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
    setSelectedBillId(null);
  }

  function handleCreate() {
    setSelectedBillId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleEdit(row: Bill) {
    setSelectedBillId(row.id);
    reset({
      description: row.description,
      category: row.category || null,
      amount: String(row.amount),
      installmentCount: "1",
      dueDate: row.due_date.split("T")[0],
    });
    openDrawer("edit");
  }

  function handleDelete(row: Bill) {
    showConfirmModal({
      message: "finance.bills.deleteConfirm",
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/finance/bill/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("finance.bills.deleteSuccess");
            refreshTable();
          },
        });
      },
    });
  }

  function handlePay(row: Bill) {
    setPayBill(row);
  }

  function closePayModal() {
    setPayBill(null);
  }

  function handleCancelPayment(row: Bill) {
    showConfirmModal({
      message: "finance.bills.cancelPaymentConfirm",
      onConfirm: async () => {
        await api.fetch("POST", "/api/finance/bill/cancel-payment", {
          body: {billId: row.id},
          onSuccess: () => {
            toast.successToast("finance.bills.cancelPaymentSuccess");
            refreshTable();
          },
        });
      },
    });
  }

  function handleFilterChange(newFilters: Record<string, string>) {
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
    handlePay,
    handleCancelPayment,
    payBill,
    closePayModal,
    refreshTable,
    filters,
    handleFilterChange,
  };
}
