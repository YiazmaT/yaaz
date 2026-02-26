import {usePaymentMethods} from "../../use-payment-methods";

export interface PaymentMethodFormProps {
  paymentMethods: ReturnType<typeof usePaymentMethods>;
}
