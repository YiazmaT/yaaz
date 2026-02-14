"use client";
import {Button, Grid} from "@mui/material";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {CategoryFormProps} from "./types";

export function CategoryForm(props: CategoryFormProps) {
  const {translate} = useTranslate();
  const {categories} = props;

  return (
    <FormContextProvider control={categories.control} errors={categories.errors} formType={categories.formType}>
      <GenericDrawer
        title={categories.formType === "create" ? "finance.categories.createTitle" : "finance.categories.editTitle"}
        show={categories.showDrawer}
        onClose={categories.closeDrawer}
      >
        <form onSubmit={categories.handleSubmit(categories.submit)}>
          <Grid container spacing={2}>
            <FormTextInput fieldName="name" label="finance.categories.fields.name" />
          </Grid>
          <Grid container spacing={2} sx={{mt: 1}}>
            <Grid size={12}>
              <Button variant="contained" type="submit" fullWidth>
                {translate("global.confirm")}
              </Button>
            </Grid>
          </Grid>
        </form>
      </GenericDrawer>
    </FormContextProvider>
  );
}
