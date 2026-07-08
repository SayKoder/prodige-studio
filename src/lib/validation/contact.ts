import { z } from 'zod'

export const PRESTATIONS = ['portrait', 'mariage', 'corporate', 'animalier', 'evenement', 'autre'] as const

export const contactSchema = z.object({
  nom: z.string().trim().min(2, "Indiquez votre nom, s'il vous plaît."),
  email: z.string().trim().email('Adresse e-mail invalide.'),
  telephone: z.string().trim().max(30, 'Numéro trop long.').optional().or(z.literal('')),
  prestation: z.enum(PRESTATIONS).optional().or(z.literal('')),
  message: z.string().trim().min(10, 'Votre message est un peu court (10 caractères minimum).').max(4000, 'Votre message est trop long.'),
})

export type ContactInput = z.infer<typeof contactSchema>
