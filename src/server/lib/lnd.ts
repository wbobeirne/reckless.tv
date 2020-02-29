import createLnRpc, { LnRpc } from "@radar/lnrpc";
import { decode } from "bolt11";
import { NodeArgs, NodeResponse } from "../../shared/types/api";

function makeClient(args: Omit<NodeArgs, "nodeType">): Promise<LnRpc> {
  const cert = new Buffer(args.cert, "base64").toString("ascii");
  return createLnRpc({
    cert,
    server: args.grpcUrl,
    macaroon: args.macaroon,
  });
}

export async function validateNodeCredentials(
  args: Omit<NodeArgs, "nodeType">,
): Promise<NodeResponse> {
  const client = await makeClient(args)

  // Run a call to addInvoice so we can extract node info from the BOLT11 string
  const memo = "Reckless.tv Test Invoice";
  const res = await client.addInvoice({ memo });
  const decoded = decode(res.paymentRequest);
  console.log(decoded);

  if (!decoded.payeeNodeKey) {
    throw new Error("Failed to determine node pubkey from invoice");
  }

  const memoTag = decoded.tags.find(t => t.tagName === "description")
  if (!memoTag || memoTag.data !== memo) {
    throw new Error("Failed to validate memo from node invoice")
  }

  return {
    pubkey: decoded.payeeNodeKey,
  };
}
