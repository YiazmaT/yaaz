import {PropsWithChildren, createContext, useContext} from "react";
import {Control, FieldErrors} from "react-hook-form";

interface IFormContext {
  control: Control<any>;
  errors: FieldErrors<any>;
  formType?: string;
}

const FormContext = createContext<IFormContext>({
  control: {} as any,
  errors: {} as any,
  formType: "create",
});

export function FormContextProvider(props: PropsWithChildren<IFormContext>) {
  return (
    <FormContext.Provider value={{control: props.control, errors: props.errors, formType: props.formType ?? "create"}}>
      {props.children}
    </FormContext.Provider>
  );
}

export function useFormContext() {
  return useContext(FormContext);
}
