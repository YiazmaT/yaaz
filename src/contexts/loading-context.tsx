"use client";
import {Box, Dialog as MuiDialog, styled} from "@mui/material";
import {noop} from "lodash";
import {PropsWithChildren, createContext, useCallback, useContext, useState} from "react";
import {Loader} from "@/src/components/loader";

const Dialog = styled(MuiDialog)({
  "& .MuiDialog-paper": {
    overflow: "hidden",
    background: `#D3D3D30A`,
  },
});

interface ILoaderContext {
  loading: boolean;
  show: () => void;
  hide: () => void;
}

const LoaderContext = createContext<ILoaderContext>({
  loading: false,
  show: noop,
  hide: noop,
});

export function LoaderContextProvider(props: PropsWithChildren) {
  const [loading, setLoading] = useState(0);
  const show = useCallback(() => setLoading((l) => l + 1), []);
  const hide = useCallback(() => setLoading((l) => Math.max(0, l - 1)), []);

  return (
    <LoaderContext.Provider value={{loading: loading !== 0, show, hide}}>
      {loading !== 0 && (
        <Dialog open={true} fullScreen>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#D3D3D30A",
              height: "100vh",
              width: "100%",
            }}
          >
            <Loader size={130} />
          </Box>
        </Dialog>
      )}

      {props.children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const {loading, hide, show} = useContext(LoaderContext);

  return {
    loading,
    hide,
    show,
  };
}
