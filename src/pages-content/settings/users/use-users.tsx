import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi, useApiQuery} from "@/src/hooks/use-api";
import {User, UsersListResponse} from "./types";
import {UserFormValues, useUserFormConfig} from "./form-config";
import {useUsersTableConfig} from "./desktop/table-config";

export const API_ROUTE = "/api/settings/user/paginated-list";

export function useUsers() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
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
    if (formType === "edit" && selectedId) {
      await api.fetch("PUT", "/api/settings/user/update", {
        body: {
          id: selectedId,
          name: data.name,
          login: data.login,
          password: data.password || undefined,
          admin: data.admin,
          imageUrl: selectedImage,
        },
        onSuccess: () => {
          toast.successToast("users.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/settings/user/create", {
        body: {
          name: data.name,
          login: data.login,
          password: data.password,
          admin: data.admin,
        },
        onSuccess: () => {
          toast.successToast("users.createSuccess");
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
    setSelectedId(null);
    setSelectedImage(null);
    reset(defaultValues);
  }

  function populateForm(row: User) {
    reset({
      name: row.name,
      login: row.login,
      password: "",
      admin: row.admin,
    });
    setSelectedImage(row.image);
  }

  function handleCreate() {
    setSelectedId(null);
    setSelectedImage(null);
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
    refreshTable,
    maxUserAmount,
    totalUsers,
    selectedImage,
  };
}
