"use client";
import {Button, Grid} from "@mui/material";
import {FormTextInput} from "@/src/components/form-fields/text-input";
import {GenericDrawer} from "@/src/components/generic-drawer";
import {FormContextProvider} from "@/src/contexts/form-context";
import {useTranslate} from "@/src/contexts/translation-context";
import {FormProps} from "./types";

export function Form(props: FormProps) {
  const {unityOfMeasure} = props;
  const {translate} = useTranslate();

  return (
    <FormContextProvider control={unityOfMeasure.control} errors={unityOfMeasure.errors} formType={unityOfMeasure.formType}>
      <GenericDrawer
        title={unityOfMeasure.formType === "create" ? "unityOfMeasure.createTitle" : "unityOfMeasure.editTitle"}
        show={unityOfMeasure.showDrawer}
        onClose={unityOfMeasure.closeDrawer}
      >
        <form onSubmit={unityOfMeasure.handleSubmit(unityOfMeasure.submit)}>
          <Grid container spacing={1}>
            <FormTextInput fieldName="unity" label="unityOfMeasure.fields.unity" />
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
