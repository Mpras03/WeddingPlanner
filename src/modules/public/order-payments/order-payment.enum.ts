export enum OrderPaymentInstallment {
  DP = 'DP',
  FULL = 'FULL',
  REMAINING = 'REMAINING',
}

export enum OrderPaymentStatus {
  PENDING = 'PENDING',
  WAITING_PAYMENT = 'WAITING_PAYMENT',
  WAITING_VERIFICATION = 'WAITING_VERIFICATION',
  PAID = 'PAID',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  REJECTED = 'REJECTED',
  REFUNDED = 'REFUNDED',
}

// Peta transisi status pembayaran yang valid — REJECTED bisa balik ke WAITING_VERIFICATION karena
// customer boleh submit ulang bukti transfer (lihat OrderPaymentsService.submitProof).
export const ORDER_PAYMENT_STATUS_TRANSITIONS: Record<
  OrderPaymentStatus,
  OrderPaymentStatus[]
> = {
  [OrderPaymentStatus.PENDING]: [OrderPaymentStatus.WAITING_PAYMENT],
  [OrderPaymentStatus.WAITING_PAYMENT]: [
    OrderPaymentStatus.WAITING_VERIFICATION,
    OrderPaymentStatus.EXPIRED,
  ],
  [OrderPaymentStatus.WAITING_VERIFICATION]: [
    OrderPaymentStatus.PAID,
    OrderPaymentStatus.REJECTED,
  ],
  [OrderPaymentStatus.PAID]: [OrderPaymentStatus.REFUNDED],
  [OrderPaymentStatus.REJECTED]: [OrderPaymentStatus.WAITING_VERIFICATION],
  [OrderPaymentStatus.FAILED]: [],
  [OrderPaymentStatus.EXPIRED]: [],
  [OrderPaymentStatus.REFUNDED]: [],
};
