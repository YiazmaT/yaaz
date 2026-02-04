"use client";
import {noop} from "lodash";
import {createContext, PropsWithChildren, useContext} from "react";
import {ToastContainer, toast} from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {useTranslate} from "./translation-context";

interface IToastContext {
  successToast: (message: string) => void;
  errorToast: (message: string) => void;
  warningToast: (message: string) => void;
}

const ToasterContext = createContext<IToastContext>({
  successToast: noop,
  errorToast: noop,
  warningToast: noop,
});

export function ToasterContextProvider(props: PropsWithChildren) {
  const {translate} = useTranslate();
  return (
    <>
      <ToasterContext.Provider
        value={{
          successToast: function successToastFunction(message: string) {
            toast.success(translate(message));
          },
          errorToast: function errorToastFunction(message: string) {
            toast.error(translate(message));
          },
          warningToast: function warningToastFunction(message: string) {
            toast.warning(translate(message));
          },
        }}
      >
        <ToastContainer position="top-center" autoClose={2000} />
        {props.children}
      </ToasterContext.Provider>
    </>
  );
}

export function useToaster() {
  const {errorToast, successToast, warningToast} = useContext(ToasterContext);

  return {
    errorToast,
    successToast,
    warningToast,
  };
}
