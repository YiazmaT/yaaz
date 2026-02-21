import {useBankAccounts} from "../../use-bank-accounts";

export interface BankAccountFormProps {
  bankAccounts: ReturnType<typeof useBankAccounts>;
}
