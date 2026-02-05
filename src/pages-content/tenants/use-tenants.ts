import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {Tenant} from "./types";
import {TenantFormValues, useTenantFormConfig} from "./form-config";
import {useTenantsTableConfig} from "./desktop/table-config";

export function useTenants() {
  const [tableKey, setTableKey] = useState(0);
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {defaultValues, schema} = useTenantFormConfig();
  const api = useApi();
  const toast = useToaster();

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<TenantFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {generateConfig} = useTenantsTableConfig({
    onView: (row) => handleView(row),
    onEdit: (row) => handleEdit(row),
  });

  async function submit(data: TenantFormValues) {
    const formData = new FormData();
    formData.append("name", data.name);
    formData.append("primary_color", data.primary_color || "");
    formData.append("secondary_color", data.secondary_color || "");
    formData.append("time_zone", data.time_zone);
    formData.append("currency_type", data.currency_type);

    if (data.logo instanceof File) {
      formData.append("logo", data.logo);
    }

    if (formType === "edit" && selectedId) {
      formData.append("id", selectedId);
      await api.fetch("PUT", "/api/tenant/update", {
        formData,
        onSuccess: () => {
          toast.successToast("tenants.updateSuccess");
          reset();
          closeDrawer();
          setTableKey((prev) => prev + 1);
        },
      });
    } else {
      await api.fetch("POST", "/api/tenant/create", {
        formData,
        onSuccess: () => {
          toast.successToast("tenants.createSuccess");
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

  function populateForm(row: Tenant) {
    reset({
      name: row.name,
      logo: row.logo,
      primary_color: row.primary_color || "",
      secondary_color: row.secondary_color || "",
      time_zone: row.time_zone,
      currency_type: row.currency_type,
    });
  }

  function handleCreate() {
    setSelectedId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleView(row: Tenant) {
    populateForm(row);
    openDrawer("details");
  }

  function handleEdit(row: Tenant) {
    setSelectedId(row.id);
    populateForm(row);
    openDrawer("edit");
  }

  function refreshTable() {
    setTableKey((prev) => prev + 1);
  }

  return {
    tableKey,
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
    refreshTable,
  };
}
