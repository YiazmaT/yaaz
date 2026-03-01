"use client";
import {Button, Grid, Typography} from "@mui/material";
import {FormProvider} from "react-hook-form";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {MODULE_DEFINITIONS} from "@/src/lib/permissions";
import {PermissionCard} from "../permission-card";
import {FormProps} from "./types";

export function Form(props: FormProps) {
  const {userGroups} = props;
  const {translate} = useTranslate();

  const isDetails = userGroups.formType === "details";

  return (
    <FormProvider {...userGroups.formMethods}>
      <FormContextProvider control={userGroups.control} errors={userGroups.errors} formType={userGroups.formType}>
        <GenericDrawer
          title={
            userGroups.formType === "create"
              ? "userGroups.createTitle"
              : userGroups.formType === "edit"
                ? "userGroups.editTitle"
                : "userGroups.detailsTitle"
          }
          show={userGroups.showDrawer}
          onClose={userGroups.closeDrawer}
        >
          <form onSubmit={userGroups.handleSubmit(userGroups.submit)}>
            <Grid container spacing={2}>
              <FormTextInput fieldName="name" label="userGroups.fields.name" />
              <FormTextInput fieldName="description" label="userGroups.fields.description" multiline />
              <Grid size={12}>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  {translate("userGroups.permissions.title")}
                </Typography>
                {MODULE_DEFINITIONS.map((mod) => (
                  <PermissionCard key={mod.key} module={mod} disabled={isDetails} />
                ))}
              </Grid>
              {!isDetails && (
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
    </FormProvider>
  );
}
