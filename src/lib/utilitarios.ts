export function formatarMinutos(minutos: number): string {
  if (minutos === 0) return '0h 00min';
  const sinal = minutos > 0 ? '+' : '-';
  const abs = Math.abs(minutos);
  const horas = Math.floor(abs / 60);
  const mins = abs % 60;
  return `${sinal}${horas}h ${mins.toString().padStart(2, '0')}min`;
}

export function cn(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}
