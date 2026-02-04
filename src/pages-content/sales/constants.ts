import {PaymentMethod} from "./types";

export function useSalesConstants() {
  const payment_methods = {
    [PaymentMethod.credit]: {value: PaymentMethod.credit, label: "global.credit"},
    [PaymentMethod.debit]: {value: PaymentMethod.debit, label: "global.debit"},
    [PaymentMethod.pix]: {value: PaymentMethod.pix, label: "global.pix"},
    [PaymentMethod.cash]: {value: PaymentMethod.cash, label: "global.cash"},
    [PaymentMethod.iFood]: {value: PaymentMethod.iFood, label: "global.iFood"},
  };

  return {payment_methods};
}
