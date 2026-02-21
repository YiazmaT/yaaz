"use client";
import {Button, Divider, Grid} from "@mui/material";
import {FormImageInput} from "@/src/components/form-fields/image-input";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {FormCurrencyInput} from "@/src/components/form-fields/currency-input";
import {FormDecimalInput} from "@/src/components/form-fields/decimal-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {IngredientsSelector} from "@/src/components/ingredients-selector";
import {PackagesSelector} from "@/src/components/packages-selector";
import {FormProps} from "./types";
import {PackageType} from "@/src/pages-content/stock/packages/types";

export function Form(props: FormProps) {
  const {products, imageSize = 150} = props;
  const {translate} = useTranslate();
  const isDetails = products.formType === "details";

  return (
    <FormContextProvider control={products.control} errors={products.errors} formType={products.formType}>
      <GenericDrawer
        title={
          products.formType === "create" ? "products.createTitle" : products.formType === "edit" ? "products.editTitle" : "products.detailsTitle"
        }
        show={products.showDrawer}
        onClose={products.closeDrawer}
      >
        <form onSubmit={products.handleSubmit(products.submit)}>
          <Grid container spacing={2}>
            <FormImageInput fieldName="image" label="products.fields.image" imageSize={imageSize} />
            <FormTextInput fieldName="name" label="products.fields.name" />
            <FormCurrencyInput fieldName="price" label="products.fields.price" />
            <FormTextInput fieldName="description" label="products.fields.description" multiline />
            <FormDecimalInput fieldName="min_stock" label="products.fields.minStock" />
            <Grid size={12}>
              <Divider />
            </Grid>
            <IngredientsSelector value={products.composition} onChange={products.setComposition} disabled={isDetails} />
            <Grid size={12}>
              <Divider />
            </Grid>
            <PackagesSelector value={products.packages} onChange={products.setPackages} disabled={isDetails} typeFilter={PackageType.product} />
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
  );
}
