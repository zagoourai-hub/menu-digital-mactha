declare module "midtrans-client" {
  export class Snap {
    constructor(options: { isProduction: boolean; serverKey: string })
    createTransaction(parameters: unknown): Promise<unknown>
    transaction: { status(orderId: string): Promise<unknown> }
    httpClient: {
      http_client: { defaults: { timeout: number; maxRedirects: number } }
    }
  }

  const midtransClient: { Snap: typeof Snap }
  export default midtransClient
}
