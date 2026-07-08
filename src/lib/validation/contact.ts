import { z } from 'zod'

export const PRESTATIONS = ['portrait', 'mariage', 'corporate', 'animalier', 'evenement', 'autre'] as const

const sansCaracteresDeControle = (valeur: string) => !/[\r\n\t\0]/.test(valeur)

export const contactSchema = z.object({
  nom: z.string().trim().min(2, "Indiquez votre nom, s'il vous plaît.").max(100, 'Nom trop long.')
    .refine(sansCaracteresDeControle, 'Caractères non autorisés.'),
  email: z.string().trim().min(3).max(254, 'Adresse e-mail trop longue.').email('Adresse e-mail invalide.'),
  telephone: z.string().trim().max(30, 'Numéro trop long.').optional().or(z.literal('')),
  prestation: z.enum(PRESTATIONS).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Votre message est un peu court (10 caractères minimum).').max(4000, 'Votre message est trop long.'),
})

export type ContactInput = z.infer<typeof contactSchema>
