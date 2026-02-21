"use client";
import {Button, Grid} from "@mui/material";
import {FormDecimalInput} from "@/src/components/form-fields/decimal-input";
import {FormDropdown} from "@/src/components/form-fields/dropdown";
import {FormImageInput} from "@/src/components/form-fields/image-input";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {FormProps} from "./types";

export function Form(props: FormProps) {
  const {ingredients, imageSize = 150} = props;
  const {translate} = useTranslate();

  return (
    <FormContextProvider control={ingredients.control} errors={ingredients.errors} formType={ingredients.formType}>
      <GenericDrawer
        title={
          ingredients.formType === "create"
            ? "ingredients.createTitle"
            : ingredients.formType === "edit"
              ? "ingredients.editTitle"
              : "ingredients.detailsTitle"
        }
        show={ingredients.showDrawer}
        onClose={ingredients.closeDrawer}
      >
        <form onSubmit={ingredients.handleSubmit(ingredients.submit)}>
          <Grid container spacing={2}>
            <FormImageInput fieldName="image" label="ingredients.fields.image" imageSize={imageSize} />
            <FormTextInput fieldName="name" label="ingredients.fields.name" />
            <FormTextInput fieldName="description" label="ingredients.fields.description" multiline />
            <FormDropdown fieldName="unitOfMeasure" label="ingredients.fields.unitOfMeasure" options={ingredients.unitOptions} uniqueKey="value" />
            <FormDecimalInput fieldName="min_stock" label="ingredients.fields.minStock" />
            {ingredients.formType !== "details" && (
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
