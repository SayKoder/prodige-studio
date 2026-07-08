import { resolveMx } from 'node:dns/promises'

/**
 * Vérifie que le domaine de l'adresse peut recevoir du courrier (MX présents).
 * Ne vérifie pas que la boîte existe réellement, seulement que le domaine
 * n'est pas une faute de frappe manifeste (ex. gmial.com).
 *
 * En cas de souci réseau/DNS transitoire (pas "domaine inexistant"), on
 * laisse passer plutôt que de bloquer un client légitime par erreur.
 */
export async function domainePeutRecevoirDuCourrier(email: string): Promise<boolean> {
  const domaine = email.split('@')[1]
  if (!domaine) return false

  try {
    const enregistrements = await resolveMx(domaine)
    return enregistrements.length > 0
  } catch (err) {
    const code = (err as NodeJS.ErrnoException)?.code
    if (code === 'ENOTFOUND' || code === 'ENODATA') return false
    return true
  }
}
