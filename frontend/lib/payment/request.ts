export async function readPaymentBody(request: Request): Promise<unknown> {
  if (!request.body) throw new SyntaxError("Missing body")
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  try {
    while (true) {
      const { value, done } = await reader.read()
      if (done) break
      length += value.byteLength
      if (length > 16_384) {
        await reader.cancel()
        throw new RangeError("Body too large")
      }
      chunks.push(value)
    }
  } finally {
    reader.releaseLock()
  }
  return JSON.parse(Buffer.concat(chunks).toString("utf8"))
}
