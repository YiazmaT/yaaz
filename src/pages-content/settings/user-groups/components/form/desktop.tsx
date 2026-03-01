"use client";
import {Box, Button, Divider, Grid, Typography} from "@mui/material";
import {FormProvider} from "react-hook-form";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {GenericModal} from "@/src/components/generic-modal";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {buildFormSections} from "@/src/lib/permissions";
import {PermissionCard} from "../permission-card";
import {FormProps} from "./types";

export function DesktopFormView(props: FormProps) {
  const {userGroups} = props;
  const {translate} = useTranslate();
  const FORM_ID = "user-group-desktop-form";
  const sections = buildFormSections();
  const isDetails = userGroups.formType === "details";
  const titleKey =
    userGroups.formType === "create" ? "userGroups.createTitle" : userGroups.formType === "edit" ? "userGroups.editTitle" : "userGroups.detailsTitle";

  return (
    <FormProvider {...userGroups.formMethods}>
      <FormContextProvider control={userGroups.control} errors={userGroups.errors} formType={userGroups.formType}>
        <GenericModal title={titleKey} open={userGroups.showDrawer} onClose={userGroups.closeDrawer} maxWidth="lg">
          <form id={FORM_ID} onSubmit={userGroups.handleSubmit(userGroups.submit)}>
            <Grid container spacing={2} sx={{marginTop: 1}}>
              <FormTextInput fieldName="name" label="userGroups.fields.name" size={12} />
              <FormTextInput fieldName="description" label="userGroups.fields.description" multiline size={12} />

              <Grid size={12}>
                <Typography variant="subtitle1" fontWeight={600} mb={2}>
                  {translate("userGroups.permissions.title")}
                </Typography>

                <Grid container spacing={2}>
                  {sections.map((section) =>
                    section.type === "header" ? (
                      <Grid key={`group-${section.group}`} size={12}>
                        <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                          <Divider sx={{flex: 1}} />
                          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{textTransform: "uppercase", letterSpacing: 0.8}}>
                            {translate(section.labelKey as any)}
                          </Typography>
                          <Divider sx={{flex: 1}} />
                        </Box>
                      </Grid>
                    ) : (
                      <Grid key={section.mod.key} size={4}>
                        <PermissionCard module={section.mod} disabled={isDetails} />
                      </Grid>
                    ),
                  )}
                </Grid>
              </Grid>

              {!isDetails && (
                <Grid size={12} sx={{display: "flex", justifyContent: "center", gap: 1}}>
                  <Button variant="contained" type="submit" form={FORM_ID}>
                    {translate("global.confirm")}
                  </Button>
                </Grid>
              )}
            </Grid>
          </form>
        </GenericModal>
      </FormContextProvider>
    </FormProvider>
  );
}
