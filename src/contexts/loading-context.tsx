"use client";
import {Box, Dialog as MuiDialog, Typography, styled} from "@mui/material";
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
  show: (message?: string) => void;
  hide: () => void;
}

const LoaderContext = createContext<ILoaderContext>({
  loading: false,
  show: noop,
  hide: noop,
});

export function LoaderContextProvider(props: PropsWithChildren) {
  const [loading, setLoading] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const show = useCallback((msg?: string) => {
    setLoading((l) => l + 1);
    if (msg) setMessage(msg);
  }, []);

  const hide = useCallback(() => {
    setLoading((l) => {
      const next = Math.max(0, l - 1);
      if (next === 0) setMessage(null);
      return next;
    });
  }, []);

  return (
    <LoaderContext.Provider value={{loading: loading !== 0, show, hide}}>
      {loading !== 0 && (
        <Dialog open={true} fullScreen>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              background: "#D3D3D30A",
              height: "100vh",
              width: "100%",
              gap: 3,
            }}
          >
            <Loader size={130} />
            {message && (
              <Box sx={{display: "flex", alignItems: "center", gap: 1}}>
                <Typography variant="body2" color="text.secondary">
                  {message}
                </Typography>
                {[0, 1, 2].map((i) => (
                  <Box
                    key={i}
                    component="span"
                    sx={{
                      display: "inline-block",
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      backgroundColor: "text.secondary",
                      animation: "loaderDots 1.2s infinite ease-in-out",
                      animationDelay: `${i * 0.2}s`,
                      "@keyframes loaderDots": {
                        "0%, 80%, 100%": {transform: "translateY(0)"},
                        "40%": {transform: "translateY(-8px)"},
                      },
                    }}
                  />
                ))}
              </Box>
            )}
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
