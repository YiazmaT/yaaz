"use client";
import {Box, Card, CardContent, Checkbox, Divider, FormControlLabel, Grid, Typography} from "@mui/material";
import {useWatch, useFormContext} from "react-hook-form";
import {useTranslate} from "@/src/contexts/translation-context";
import {UserGroupFormValues} from "../form/form-config";
import {PermissionCardProps} from "./types";

export function PermissionCard(props: PermissionCardProps) {
  const {module, disabled} = props;
  const {translate} = useTranslate();
  const {setValue, control} = useFormContext<UserGroupFormValues>();

  const watched = useWatch({control, name: `permissions.${module.key}` as any});

  const allChecked = module.actions.every((action) => {
    const val = (watched as any)?.[action];
    return val === true;
  });

  const someChecked = !allChecked && module.actions.some((action) => (watched as any)?.[action] === true);

  function handleToggleAll(checked: boolean) {
    for (const action of module.actions) {
      setValue(`permissions.${module.key}.${action}` as any, checked, {shouldValidate: false});
    }
  }

  return (
    <Card variant="outlined" sx={{height: "100%"}}>
      <CardContent sx={{pb: "12px !important", pt: 1.5, px: 2}}>
        <Box sx={{display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1}}>
          <Typography variant="subtitle2" fontWeight={600}>
            {translate(module.labelKey as any)}
          </Typography>
          {module.actions.length > 1 && (
            <FormControlLabel
              label={
                <Typography variant="caption" color="text.secondary">
                  {translate("userGroups.permissions.all")}
                </Typography>
              }
              control={
                <Checkbox
                  size="small"
                  checked={allChecked}
                  indeterminate={someChecked}
                  onChange={(e) => handleToggleAll(e.target.checked)}
                  disabled={disabled}
                />
              }
              sx={{mr: 0}}
            />
          )}
        </Box>
        <Divider sx={{mb: 1}} />
        <Grid container spacing={0}>
          {module.actions.map((action) => {
            const value = (watched as any)?.[action] ?? false;

            return (
              <Grid key={action} size={6}>
                <FormControlLabel
                  label={<Typography variant="body2">{translate(`userGroups.permissions.${action}` as any)}</Typography>}
                  control={
                    <Checkbox
                      size="small"
                      checked={!!value}
                      onChange={(e) => setValue(`permissions.${module.key}.${action}` as any, e.target.checked, {shouldValidate: false})}
                      disabled={disabled}
                    />
                  }
                />
              </Grid>
            );
          })}
        </Grid>
      </CardContent>
    </Card>
  );
}
