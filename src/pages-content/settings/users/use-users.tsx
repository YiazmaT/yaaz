import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi, useApiQuery} from "@/src/hooks/use-api";
import {useR2Upload} from "@/src/hooks/use-r2-upload";
import {User, UsersFilters, UsersListResponse} from "./types";
import {UserFormValues, useUserFormConfig} from "./components/form/form-config";
import {useUsersTableConfig} from "./desktop/table-config";

export const API_ROUTE = "/api/settings/user/paginated-list";

export function useUsers() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [filters, setFilters] = useState<UsersFilters>({});
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {upload, deleteOrphan} = useR2Upload();
  const {show: showConfirmModal} = useConfirmModal();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const isEdit = formType === "edit";
  const {defaultValues, schema} = useUserFormConfig(isEdit);

  const {
    control,
    handleSubmit,
    formState: {errors},
    reset,
  } = useForm<UserFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {data: listData} = useApiQuery<UsersListResponse>({
    queryKey: [API_ROUTE, {page: 1, limit: 1}],
    route: `${API_ROUTE}?page=1&limit=1`,
  });

  const maxUserAmount = listData?.max_user_amount ?? 3;
  const totalUsers = listData?.total ?? 0;

  const {generateConfig} = useUsersTableConfig({
    onView: (row) => handleView(row),
    onEdit: (row) => handleEdit(row),
    onToggleActive: (row) => handleToggleActive(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  async function submit(data: UserFormValues) {
    let imageUrl: string | null = typeof data.image === "string" ? data.image : null;

    if (data.image instanceof File) {
      const r2Result = await upload(data.image, "users");
      if (!r2Result) return;
      imageUrl = r2Result.url;
    }

    if (formType === "edit" && selectedId) {
      const result = await api.fetch("PUT", "/api/settings/user/update", {
        body: {
          id: selectedId,
          name: data.name,
          login: data.login,
          password: data.password || undefined,
          admin: data.admin,
          imageUrl,
        },
        onSuccess: () => {
          toast.successToast("users.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });

      if (!result && imageUrl && data.image instanceof File) {
        await deleteOrphan(imageUrl);
      }
    } else {
      const result = await api.fetch("POST", "/api/settings/user/create", {
        body: {
          name: data.name,
          login: data.login,
          password: data.password,
          admin: data.admin,
          imageUrl,
        },
        onSuccess: () => {
          toast.successToast("users.createSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });

      if (!result && imageUrl && data.image instanceof File) {
        await deleteOrphan(imageUrl);
      }
    }
  }

  function openDrawer(type: string) {
    setFormType(type);
    setShowDrawer(true);
  }

  function closeDrawer() {
    setShowDrawer(false);
    setSelectedId(null);
    reset(defaultValues);
  }

  function populateForm(row: User) {
    reset({
      name: row.name,
      login: row.login,
      password: "",
      admin: row.admin,
      image: row.image,
    });
  }

  function handleCreate() {
    setSelectedId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  function handleView(row: User) {
    populateForm(row);
    openDrawer("details");
  }

  function handleEdit(row: User) {
    setSelectedId(row.id);
    populateForm(row);
    openDrawer("edit");
  }

  function handleFilterChange(newFilters: UsersFilters) {
    setFilters(newFilters);
  }

  function handleToggleActive(row: User) {
    const messageKey = row.active ? "users.deactivateConfirm" : "users.activateConfirm";
    const successKey = row.active ? "users.deactivateSuccess" : "users.activateSuccess";

    showConfirmModal({
      message: messageKey,
      onConfirm: async () => {
        await api.fetch("PUT", "/api/settings/user/toggle-active", {
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
    handleView,
    handleEdit,
    handleToggleActive,
    handleFilterChange,
    filters,
    refreshTable,
    maxUserAmount,
    totalUsers,
  };
}
