import {PropsWithChildren, ReactNode} from "react";

export interface LoginFormProps extends PropsWithChildren {
  gradientId: string;
  onSubmit: (login: string, password: string) => Promise<void>;
  defaultLoginValue?: string;
  footer?: ReactNode;
}
