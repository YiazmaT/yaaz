import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {Nfe, NfeItem} from "./types";
import {NfeFormItem, NfeFormValues, useNfeFormConfig} from "./form-config";
import {useNfeTableConfig} from "./desktop/table-config";
import {NfeLaunchContent} from "./components/launch-content";
import {LaunchPreviewItem} from "./components/launch-content/types";

const API_ROUTE = "/api/finance/nfe/paginated-list";

export function useNfe() {
  const [formType, setFormType] = useState("create");
  const [showModal, setShowModal] = useState(false);
  const [fileNfe, setFileNfe] = useState<Nfe | null>(null);
  const [selectedNfeId, setSelectedNfeId] = useState<string | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const {defaultValues, schema} = useNfeFormConfig();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
    watch,
    setValue,
  } = useForm<NfeFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {generateConfig} = useNfeTableConfig({
    onEdit: (row) => handleEdit(row),
    onDelete: (row) => handleDelete(row),
    onViewFile: (row) => handleViewFile(row),
    onViewDetails: (row) => handleViewDetails(row),
    onLaunch: (row) => handleLaunch(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  async function doCreate(data: NfeFormValues) {
    const jsonPayload = {
      description: data.description,
      supplier: data.supplier,
      nfeNumber: data.nfeNumber,
      date: data.date,
      items: data.items.map((item) => ({
        itemType: item.itemType,
        itemId: item.itemId,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      createBill: data.createBill,
      addToStock: data.addToStock,
    };

    const formData = new FormData();
    formData.append("data", JSON.stringify(jsonPayload));
    if (data.file) {
      formData.append("file", data.file);
    }

    await api.fetch("POST", "/api/finance/nfe/create", {
      formData,
      onSuccess: () => {
        toast.successToast("finance.nfe.createSuccess");
        reset(defaultValues);
        closeModal();
        refreshTable();
      },
    });
  }

  async function submit(data: NfeFormValues) {
    if (formType === "create") {
      if (data.addToStock) {
        showConfirmModal({
          message: "finance.nfe.launchConfirm",
          content: <NfeLaunchContent items={formItemsToPreview(data.items)} />,
          maxWidth: 650,
          onConfirm: () => doCreate(data),
        });
      } else {
        await doCreate(data);
      }
    } else {
      const jsonPayload = {
        id: selectedNfeId,
        description: data.description,
        supplier: data.supplier,
        nfeNumber: data.nfeNumber,
        date: data.date,
        items: data.items.map((item) => ({
          itemType: item.itemType,
          itemId: item.itemId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
        })),
      };

      await api.fetch("PUT", "/api/finance/nfe/update", {
        body: jsonPayload,
        onSuccess: () => {
          toast.successToast("finance.nfe.updateSuccess");
          reset(defaultValues);
          closeModal();
          refreshTable();
        },
      });
    }
  }

  function closeModal() {
    setShowModal(false);
    reset(defaultValues);
    setSelectedNfeId(null);
  }

  function handleCreate() {
    setSelectedNfeId(null);
    reset(defaultValues);
    setFormType("create");
    setShowModal(true);
  }

  function loadNfeIntoForm(row: Nfe) {
    setSelectedNfeId(row.id);
    reset({
      description: row.description,
      supplier: row.supplier || "",
      nfeNumber: row.nfe_number || "",
      date: row.date.split("T")[0],
      items: row.items.map((item) => ({
        id: item.id,
        itemType: item.item_type,
        itemId: item.ingredient_id || item.product_id || item.package_id || "",
        name: item.ingredient?.name || item.product?.name || item.package?.name || "",
        image: item.ingredient?.image || item.product?.image || item.package?.image || null,
        unityOfMeasure:
          item.ingredient?.unity_of_measure?.unity || item.product?.unity_of_measure?.unity || item.package?.unity_of_measure?.unity || "",
        quantity: String(item.quantity),
        unitPrice: String(item.unit_price),
      })),
      file: null,
    });
  }

  function handleEdit(row: Nfe) {
    loadNfeIntoForm(row);
    setFormType("edit");
    setShowModal(true);
  }

  function handleViewDetails(row: Nfe) {
    loadNfeIntoForm(row);
    setFormType("details");
    setShowModal(true);
  }

  function handleDelete(row: Nfe) {
    showConfirmModal({
      message: row.stock_added ? "finance.nfe.deleteConfirmWithStock" : "finance.nfe.deleteConfirm",
      ...(row.stock_added ? {content: <NfeLaunchContent items={toPreviewItems(row.items)} mode="delete" />, maxWidth: 650} : {}),
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/finance/nfe/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("finance.nfe.deleteSuccess");
            refreshTable();
          },
        });
      },
    });
  }

  function handleLaunch(row: Nfe) {
    showConfirmModal({
      message: "finance.nfe.launchConfirm",
      content: <NfeLaunchContent items={toPreviewItems(row.items)} />,
      maxWidth: 650,
      onConfirm: async () => {
        await api.fetch("POST", "/api/finance/nfe/launch", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("finance.nfe.launchSuccess");
            refreshTable();
          },
        });
      },
    });
  }

  function handleViewFile(row: Nfe) {
    setFileNfe(row);
  }

  function closeFileModal() {
    setFileNfe(null);
  }

  function handleFileChange() {
    refreshTable();
    setFileNfe(null);
  }

  return {
    formType,
    showModal,
    control,
    errors,
    generateConfig,
    handleSubmit,
    submit,
    closeModal,
    handleCreate,
    handleEdit,
    handleViewDetails,
    handleDelete,
    handleLaunch,
    handleViewFile,
    refreshTable,
    watch,
    setValue,
    fileNfe,
    closeFileModal,
    handleFileChange,
  };
}

function toPreviewItems(items: NfeItem[]): LaunchPreviewItem[] {
  return items.map((item) => {
    const entity = item.ingredient ?? item.product ?? item.package;
    return {
      id: item.id,
      item_type: item.item_type,
      name: entity?.name ?? "",
      image: entity?.image ?? null,
      unity: entity?.unity_of_measure?.unity ?? "",
      stock: Number(entity?.stock ?? 0),
      quantity: Number(item.quantity),
    };
  });
}

function formItemsToPreview(items: NfeFormItem[]): LaunchPreviewItem[] {
  return items.map((item) => ({
    id: item.id,
    item_type: item.itemType,
    name: item.name,
    image: item.image ?? null,
    unity: item.unityOfMeasure,
    stock: item.stock ?? 0,
    quantity: Number(item.quantity),
  }));
}
