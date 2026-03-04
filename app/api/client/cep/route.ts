import {LogModule} from "@/src/lib/logger";
import {withAuth} from "@/src/lib/route-handler";
import {NextRequest} from "next/server";

const ROUTE = "/api/client/cep";

export async function GET(req: NextRequest) {
  return withAuth(LogModule.CLIENT, ROUTE, null, async ({error, success}) => {
    const {searchParams} = new URL(req.url);
    const cep = searchParams.get("cep")?.replace(/\D/g, "");

    if (!cep || cep.length !== 8) {
      return error("api.errors.missingRequiredFields", 400);
    }

    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const data = await response.json();

    return success("get", data);
  });
}
