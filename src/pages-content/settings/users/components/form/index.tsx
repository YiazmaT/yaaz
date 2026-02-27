"use client";
import {Button, Grid} from "@mui/material";
import {FormCheckBox} from "@/src/components/form-fields/check-box";
import {FormImageInput} from "@/src/components/form-fields/image-input";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {FormProps} from "./types";

export function Form(props: FormProps) {
  const {users} = props;
  const {translate} = useTranslate();

  return (
    <FormContextProvider control={users.control} errors={users.errors} formType={users.formType}>
      <GenericDrawer
        title={
          users.formType === "create"
            ? "users.createTitle"
            : users.formType === "edit"
              ? "users.editTitle"
              : "users.detailsTitle"
        }
        show={users.showDrawer}
        onClose={users.closeDrawer}
      >
        <form onSubmit={users.handleSubmit(users.submit)}>
          <Grid container spacing={2}>
            <FormImageInput fieldName="image" label="users.fields.image" imageSize={120} />
            <FormTextInput fieldName="name" label="users.fields.name" />
            <FormTextInput fieldName="login" label="users.fields.login" />
            {users.formType !== "details" && (
              <FormTextInput
                fieldName="password"
                label={users.formType === "edit" ? "users.fields.newPassword" : "users.fields.password"}
                isPassword
              />
            )}
            <FormCheckBox fieldName="admin" label="users.fields.admin" />
            {users.formType !== "details" && (
              <Grid size={12}>
                <Button variant="contained" type="submit" fullWidth>
                  {translate("global.confirm")}
                </Button>
              </Grid>
            )}
          </Grid>
        </form>
      </GenericDrawer>
    </FormContextProvider>
  );
}
