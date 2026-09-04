/**
 * Construit l'URL d'un asset Directus (fichier / image) pour le navigateur.
 */
export function useDirectusAsset() {
  const config = useRuntimeConfig()

  function getAssetUrl(
    fileId: string | null | undefined,
    options?: { width?: number; height?: number; format?: string }
  ) {
    if (!fileId) return null
    const baseUrl = config.public.directusUrl
    const url = new URL(`${baseUrl}/assets/${fileId}`)
    if (options?.width) url.searchParams.set('width', options.width.toString())
    if (options?.height) url.searchParams.set('height', options.height.toString())
    if (options?.format) url.searchParams.set('format', options.format)
    return url.toString()
  }

  return { getAssetUrl }
}
