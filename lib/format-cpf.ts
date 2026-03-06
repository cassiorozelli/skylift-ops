/** Formata CPF para exibição: xxx.xxx.xxx-xx */
export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, "")
  if (digits.length !== 11) return value
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")
}

/** Remove formatação do CPF */
export function cleanCpf(value: string): string {
  return value.replace(/\D/g, "")
}
