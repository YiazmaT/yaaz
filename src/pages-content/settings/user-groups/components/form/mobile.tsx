"use client";
import {Box, Button, Divider, Grid, Typography} from "@mui/material";
import {FormProvider} from "react-hook-form";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {buildFormSections} from "@/src/lib/permissions";
import {PermissionCard} from "../permission-card";
import {FormProps} from "./types";

export function MobileFormView(props: FormProps) {
  const {userGroups} = props;
  const {translate} = useTranslate();
  const sections = buildFormSections();
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
                {sections.map((section) =>
                  section.type === "header" ? (
                    <Box key={`group-${section.group}`} sx={{display: "flex", alignItems: "center", gap: 1, mt: 1, mb: 1.5}}>
                      <Divider sx={{flex: 1}} />
                      <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{textTransform: "uppercase", letterSpacing: 0.8}}>
                        {translate(section.labelKey as any)}
                      </Typography>
                      <Divider sx={{flex: 1}} />
                    </Box>
                  ) : (
                    <Box key={section.mod.key} sx={{mb: 1.5}}>
                      <PermissionCard module={section.mod} disabled={isDetails} />
                    </Box>
                  ),
                )}
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
