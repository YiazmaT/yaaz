import {useProducts} from "../use-products";

export interface MobileViewProps {
  products: ReturnType<typeof useProducts>;
}
