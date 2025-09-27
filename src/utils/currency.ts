export function formatCurrency(amount: number, currency: 'USD' | 'CLP'): string {
  if (currency === 'USD') {
    return amount.toLocaleString('en-US')
  } else {
    return amount.toLocaleString('es-CL')
  }
}