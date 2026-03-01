"use client";
import {Box, Button, Divider, Grid, Typography} from "@mui/material";
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

  const seenGroups = new Set<string>();
  const sections = MODULE_DEFINITIONS.flatMap((mod) => {
    const groupKey = mod.key.split(".")[0];
    const groupLabelKey = mod.key.includes(".")
      ? `userGroups.modules.groups.${groupKey}`
      : mod.labelKey;
    const items = [];
    if (!seenGroups.has(groupKey)) {
      seenGroups.add(groupKey);
      items.push({type: "header" as const, group: groupKey, labelKey: groupLabelKey});
    }
    items.push({type: "module" as const, mod});
    return items;
  });

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
                    <PermissionCard key={section.mod.key} module={section.mod} disabled={isDetails} />
                  )
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
