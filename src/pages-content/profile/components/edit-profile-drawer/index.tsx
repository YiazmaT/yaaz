"use client";
import {Box, Button, CircularProgress} from "@mui/material";
import {useEffect, useState} from "react";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {useForm} from "react-hook-form";
import {useTranslate} from "@/src/contexts/translation-context";
import {useTenant} from "@/src/contexts/tenant-context";
import {useApi} from "@/src/hooks/use-api";
import {useToaster} from "@/src/contexts/toast-context";
import {useR2Upload} from "@/src/hooks/use-r2-upload";
import {FormContextProvider} from "@/src/contexts/form-context";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {ImageInput} from "@/src/components/form-fields/image-input";
import {EditProfileDrawerProps} from "./types";

type ImageValue = File | string | null;

export function EditProfileDrawer({open, onClose}: EditProfileDrawerProps) {
  const {user, setUser} = useTenant();
  const [loading, setLoading] = useState(false);
  const [imageValue, setImageValue] = useState<ImageValue>(user?.image ?? null);
  const {translate} = useTranslate();
  const {successToast} = useToaster();
  const {upload, deleteOrphan} = useR2Upload();
  const api = useApi();

  useEffect(() => {
    if (open) {
      setImageValue(user?.image ?? null);
      reset({name: user?.name ?? ""});
    }
  }, [open]);

  const {control, handleSubmit, formState: {errors}, reset} = useForm({
    mode: "onChange",
    defaultValues: {name: user?.name ?? ""},
  });

  function handleClose() {
    reset({name: user?.name ?? ""});
    setImageValue(user?.image ?? null);
    onClose();
  }

  async function onSubmit(data: {name: string}) {
    setLoading(true);
    try {
      let imageUrl: string | null = typeof imageValue === "string" ? imageValue : null;

      let uploadedUrl: string | null = null;

      if (imageValue instanceof File) {
        const uploaded = await upload(imageValue, "users");
        if (!uploaded) return;
        imageUrl = uploaded.url;
        uploadedUrl = uploaded.url;
      }

      const result = await api.fetch<{id: string; name: string; image: string | null}>("PUT", "/api/settings/user/update", {
        body: {id: user!.id, name: data.name, login: user!.login, imageUrl},
        hideLoader: true,
      });

      if (!result) {
        if (uploadedUrl) await deleteOrphan(uploadedUrl);
        return;
      }

      if (result) {
        if (imageValue instanceof File && user?.image) await deleteOrphan(user.image);
        if (imageValue === null && user?.image) await deleteOrphan(user.image);
        setUser({...user!, name: result.name, image: result.image});
        successToast(translate("profile.profileUpdated"));
        handleClose();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <GenericDrawer title="profile.editProfile" show={open} onClose={handleClose}>
      <Box sx={{display: "flex", justifyContent: "center", mb: 2}}>
        <ImageInput value={imageValue} onChange={setImageValue} imageSize={150} />
      </Box>

      <FormContextProvider control={control} errors={errors}>
        <FormTextInput fieldName="name" label="global.name" />
      </FormContextProvider>

      <Button variant="contained" fullWidth disabled={loading} onClick={handleSubmit(onSubmit)} sx={{mt: 3}}>
        {loading ? <CircularProgress size={22} /> : translate("global.save")}
      </Button>
    </GenericDrawer>
  );
}
