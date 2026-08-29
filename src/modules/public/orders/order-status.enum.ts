export enum OrderStatus {
  PENDING_PAYMENT = 'PENDING_PAYMENT',
  WAITING_VENDOR_CONFIRMATION = 'WAITING_VENDOR_CONFIRMATION',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_CUSTOMER_CONFIRMATION = 'WAITING_CUSTOMER_CONFIRMATION',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  REJECTED_BY_VENDOR = 'REJECTED_BY_VENDOR',
  DISPUTED = 'DISPUTED',
}

export enum OrderPaymentType {
  DP = 'DP',
  FULL = 'FULL',
}

// Peta transisi status order yang valid — dipakai OrdersService untuk menolak perubahan status
// yang tidak sesuai alur (mis. mengonfirmasi order yang belum WAITING_VENDOR_CONFIRMATION).
// State di ujung alur (COMPLETED/CANCELLED/REJECTED_BY_VENDOR) sengaja tidak punya transisi lanjutan.
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  [OrderStatus.PENDING_PAYMENT]: [
    OrderStatus.WAITING_VENDOR_CONFIRMATION,
    OrderStatus.CANCELLED,
  ],
  [OrderStatus.WAITING_VENDOR_CONFIRMATION]: [
    OrderStatus.CONFIRMED,
    OrderStatus.REJECTED_BY_VENDOR,
  ],
  [OrderStatus.CONFIRMED]: [
    OrderStatus.IN_PROGRESS,
    OrderStatus.CANCELLED,
    OrderStatus.DISPUTED,
  ],
  [OrderStatus.IN_PROGRESS]: [
    OrderStatus.WAITING_CUSTOMER_CONFIRMATION,
    OrderStatus.DISPUTED,
  ],
  [OrderStatus.WAITING_CUSTOMER_CONFIRMATION]: [
    OrderStatus.COMPLETED,
    OrderStatus.DISPUTED,
  ],
  [OrderStatus.COMPLETED]: [],
  [OrderStatus.CANCELLED]: [],
  [OrderStatus.REJECTED_BY_VENDOR]: [],
  [OrderStatus.DISPUTED]: [OrderStatus.COMPLETED, OrderStatus.CANCELLED],
};
