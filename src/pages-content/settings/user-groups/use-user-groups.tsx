import {useState} from "react";
import {useForm} from "react-hook-form";
import {yupResolver} from "@hookform/resolvers/yup";
import {useQueryClient} from "@tanstack/react-query";
import {useConfirmModal} from "@/src/contexts/confirm-modal-context";
import {useToaster} from "@/src/contexts/toast-context";
import {useApi} from "@/src/hooks/use-api";
import {flatToPermissions, permissionsToFlat} from "@/src/lib/permissions";
import {UserGroup, UserGroupDetail} from "./types";
import {UserGroupFormValues, useUserGroupFormConfig} from "./components/form/form-config";
import {useUserGroupsTableConfig} from "./desktop/table-config";

export const API_ROUTE = "/api/settings/user-group/paginated-list";

export function useUserGroups() {
  const [formType, setFormType] = useState("create");
  const [showDrawer, setShowDrawer] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const {show: showConfirmModal} = useConfirmModal();
  const api = useApi();
  const toast = useToaster();
  const queryClient = useQueryClient();

  const {defaultValues, schema} = useUserGroupFormConfig();

  const formMethods = useForm<UserGroupFormValues>({
    mode: "onChange",
    resolver: yupResolver(schema) as any,
    defaultValues,
  });

  const {control, handleSubmit, formState: {errors}, reset} = formMethods;

  const {generateConfig} = useUserGroupsTableConfig({
    onView: (row) => handleView(row),
    onEdit: (row) => handleEdit(row),
    onDelete: (row) => handleDelete(row),
  });

  function refreshTable() {
    queryClient.invalidateQueries({queryKey: [API_ROUTE]});
  }

  async function loadPermissions(id: string) {
    const result = await api.fetch<UserGroupDetail>("GET", `/api/settings/user-group/get?id=${id}`);
    return result;
  }

  async function submit(data: UserGroupFormValues) {
    const permissions = permissionsToFlat(data.permissions);

    if (formType === "edit" && selectedId) {
      await api.fetch("PUT", "/api/settings/user-group/update", {
        body: {id: selectedId, name: data.name, description: data.description || null, permissions},
        onSuccess: () => {
          toast.successToast("userGroups.updateSuccess");
          reset();
          closeDrawer();
          refreshTable();
        },
      });
    } else {
      await api.fetch("POST", "/api/settings/user-group/create", {
        body: {name: data.name, description: data.description || null, permissions},
        onSuccess: () => {
          toast.successToast("userGroups.createSuccess");
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
    reset(defaultValues);
  }

  function handleCreate() {
    setSelectedId(null);
    reset(defaultValues);
    openDrawer("create");
  }

  async function handleView(row: UserGroup) {
    const detail = await loadPermissions(row.id);
    if (!detail) return;
    reset({
      name: detail.name,
      description: detail.description ?? "",
      permissions: flatToPermissions(detail.permissions),
    });
    openDrawer("details");
  }

  async function handleEdit(row: UserGroup) {
    const detail = await loadPermissions(row.id);
    if (!detail) return;
    setSelectedId(row.id);
    reset({
      name: detail.name,
      description: detail.description ?? "",
      permissions: flatToPermissions(detail.permissions),
    });
    openDrawer("edit");
  }

  function handleDelete(row: UserGroup) {
    const hasUsers = row.user_count > 0;
    showConfirmModal({
      message: hasUsers ? "userGroups.deleteWithUsersConfirm" : "userGroups.deleteConfirm",
      messageVars: hasUsers ? {count: String(row.user_count)} : undefined,
      onConfirm: async () => {
        await api.fetch("DELETE", "/api/settings/user-group/delete", {
          body: {id: row.id},
          onSuccess: () => {
            toast.successToast("userGroups.deleteSuccess");
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
    formMethods,
    generateConfig,
    handleSubmit,
    submit,
    closeDrawer,
    handleCreate,
    handleView,
    handleEdit,
    handleDelete,
    refreshTable,
  };
}

export type UseUserGroupsReturn = ReturnType<typeof useUserGroups>;
