import type { OrderStatus } from '../api/contract';

type StatusStyle = {
  label: string;
  note: string;
  className: string;
};

const STATUS_STYLES: Record<OrderStatus, StatusStyle> = {
  PENDING: {
    label: 'Em processamento',
    note: 'Recebemos seu pedido e estamos confirmando o estoque.',
    className: 'bg-amber-100 text-amber-800',
  },
  CONFIRMED: {
    label: 'Confirmado',
    note: 'Estoque reservado. Sua capinha já está separada para envio.',
    className: 'bg-emerald-100 text-emerald-800',
  },
  CANCELLED: {
    label: 'Cancelado',
    note: 'Este pedido foi cancelado e não será enviado.',
    className: 'bg-coral-soft text-coral',
  },
  FAILED: {
    label: 'Não concluído',
    note: 'Não conseguimos concluir este pedido.',
    className: 'bg-coral-soft text-coral',
  },
};

export function orderStatusStyle(status: OrderStatus): StatusStyle {
  return STATUS_STYLES[status];
}
