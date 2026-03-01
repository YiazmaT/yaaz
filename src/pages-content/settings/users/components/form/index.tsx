"use client";
import {Button, Grid} from "@mui/material";
import {FormCheckBox} from "@/src/components/form-fields/check-box";
import {FormImageInput} from "@/src/components/form-fields/image-input";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormAsyncDropdown} from "@/src/components/form-fields/async-dropdown";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {UserGroupOption} from "./form-config";
import {FormProps} from "./types";

export function Form(props: FormProps) {
  const {users} = props;
  const {translate} = useTranslate();

  const isAdminOrOwner = users.formType !== "create" && (users.selectedUser?.admin || users.selectedUser?.owner);

  return (
    <FormContextProvider control={users.control} errors={users.errors} formType={users.formType}>
      <GenericDrawer
        title={users.formType === "create" ? "users.createTitle" : users.formType === "edit" ? "users.editTitle" : "users.detailsTitle"}
        show={users.showDrawer}
        onClose={users.closeDrawer}
      >
        <form onSubmit={users.handleSubmit(users.submit)}>
          <Grid container spacing={2}>
            <FormImageInput fieldName="image" label="users.fields.image" imageSize={300} />
            <FormTextInput fieldName="name" label="users.fields.name" />
            <FormTextInput fieldName="login" label="users.fields.login" />
            <FormCheckBox fieldName="admin" label="users.fields.admin" />
            {!isAdminOrOwner && (
              <FormAsyncDropdown<UserGroupOption>
                fieldName="user_group"
                label="users.fields.group"
                apiRoute="/api/settings/user-group/paginated-list"
                uniqueKey="id"
                buildLabel={(opt) => opt.name}
              />
            )}
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
