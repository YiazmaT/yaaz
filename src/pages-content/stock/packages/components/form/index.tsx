"use client";
import {Button, Grid} from "@mui/material";
import {FormDecimalInput} from "@/src/components/form-fields/decimal-input";
import {FormDropdown} from "@/src/components/form-fields/dropdown";
import {FormImageInput} from "@/src/components/form-fields/image-input";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormRadioGroup} from "@/src/components/form-fields/radio-group";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {usePackagesConstants} from "../../constants";
import {FormProps} from "./types";

export function Form(props: FormProps) {
  const {packages, imageSize = 150} = props;
  const {translate} = useTranslate();
  const {typeOfPackage} = usePackagesConstants();

  return (
    <FormContextProvider control={packages.control} errors={packages.errors} formType={packages.formType}>
      <GenericDrawer
        title={
          packages.formType === "create" ? "packages.createTitle" : packages.formType === "edit" ? "packages.editTitle" : "packages.detailsTitle"
        }
        show={packages.showDrawer}
        onClose={packages.closeDrawer}
      >
        <form onSubmit={packages.handleSubmit(packages.submit)}>
          <Grid container spacing={2}>
            <FormImageInput fieldName="image" label="packages.fields.image" imageSize={imageSize} />
            <FormTextInput fieldName="name" label="packages.fields.name" />
            <FormTextInput fieldName="description" label="packages.fields.description" multiline />
            <FormDropdown
              fieldName="unitOfMeasure"
              label="packages.fields.unityOfMeasure"
              options={packages.unitOptions}
              uniqueKey="id"
              buildLabel={(o) => o.unity}
            />
            <FormRadioGroup fieldName="type" label="packages.fields.type" options={Object.values(typeOfPackage)} />
            <FormDecimalInput fieldName="min_stock" label="packages.fields.minStock" />
            {packages.formType !== "details" && (
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
