const dateFormatter = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' });

const timeFormatter = new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' });

export function formatDate(isoDate: string): string {
  return dateFormatter.format(new Date(isoDate));
}

export function formatTime(isoDate: string): string {
  return timeFormatter.format(new Date(isoDate));
}

export function formatDateTime(isoDate: string): string {
  return `${formatDate(isoDate)} às ${formatTime(isoDate)}`;
}
