import { PaymentStatus } from "@/components/payment-status"

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <PaymentStatus orderId={id} />
}
