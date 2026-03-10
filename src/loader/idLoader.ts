export async function idLoader({ params }: { params?: { uid?: string } }) {
  const uid = params?.uid ?? '00'
  return { uid }
}
