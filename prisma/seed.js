'use strict'
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  const email = process.env.ADMIN_EMAIL ?? 'admin@prodige-studio.me'
  const password = process.env.ADMIN_PASSWORD ?? 'Prodige@Studio24!'
  const passwordHash = await bcrypt.hash(password, 12)

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  })

  console.log('\n✓ Compte admin créé')
  console.log(`  Email    : ${email}`)
  console.log(`  Password : ${password}`)
  console.log('  → Changez ce mot de passe après le premier login !\n')

  const textes = [
    { cle: 'hero_titre_1',        valeur: "L'image au",                                                                              description: 'Héro — ligne 1 du titre'      },
    { cle: 'hero_titre_2',        valeur: 'service',                                                                                 description: 'Héro — mot doré central'      },
    { cle: 'hero_titre_3',        valeur: 'de votre récit',                                                                          description: 'Héro — ligne 3 du titre'      },
    { cle: 'hero_sous_titre',     valeur: 'Photographie haut de gamme pour les professionnels, portraits, mariages et événements qui comptent.', description: 'Héro — sous-titre' },
    { cle: 'hero_localisation',   valeur: 'Reims · France · Europe',                                                                 description: 'Héro — localisation'         },
    { cle: 'about_phrase_1',      valeur: "Capturer l'authentique,",                                                                 description: 'About — phrase ligne 1'       },
    { cle: 'about_phrase_2',      valeur: "sublimer l'ordinaire.",                                                                   description: 'About — phrase ligne 2'       },
    { cle: 'about_annees',        valeur: '5+',                                                                                      description: "About — années d'expérience"  },
    { cle: 'about_couverture',    valeur: 'FR·EU',                                                                                   description: 'About — couverture géo'       },
    { cle: 'footer_cta_titre',    valeur: 'Parlons de votre projet',                                                                 description: 'Footer — titre CTA'           },
    { cle: 'footer_cta_sous_titre', valeur: 'Envie de travailler ensemble ?',                                                        description: 'Footer — sous-titre'          },
  ]

  for (const t of textes) {
    await prisma.siteTexte.upsert({
      where: { cle: t.cle },
      update: {},
      create: t,
    })
  }
  console.log(`✓ ${textes.length} textes du site insérés`)

  const forfaits = [
    { categorie: 'portraits_evenements', nom: 'Pack Flash',           sousTitre: 'Portrait Solo · Animal',    prix: '79€',    details: ['30 à 45 min de prise de vue', '3 photos retouchées avec soin', 'Livraison sous 7 jours'],            ordre: 1 },
    { categorie: 'portraits_evenements', nom: 'Portrait Pro',         sousTitre: 'Profil LinkedIn · Pro',     prix: '149€',   details: ['1h sur le lieu de votre choix', '7 photos retouchées avec soin', 'Idéal profil pro, LinkedIn, CV'],   ordre: 2 },
    { categorie: 'portraits_evenements', nom: 'Duo & Famille',        sousTitre: 'Séance Famille',            prix: '179€',   details: ['1h de prise de vue', '10 photos retouchées', 'Sélection personnalisée'],                              ordre: 3 },
    { categorie: 'portraits_evenements', nom: 'Forfait Événementiel', sousTitre: 'Salon · Soirée · Fête',    prix: '350€',   details: ['3h consécutives sur place', 'Reportage photo complet', '40 photos sélectionnées & retouchées'],        ordre: 4 },
    { categorie: 'grands_forfaits',      nom: 'Pack Premium',         sousTitre: '12 photos + 3 offertes',   prix: '290€',   details: ['12 photos retouchées', '2 thèmes possibles', 'Retouches avancées'],                  populaire: false, ordre: 1 },
    { categorie: 'grands_forfaits',      nom: "Mariage — Grain d'Or", sousTitre: 'Demi-journée',             prix: '950€',   details: ['Reportage photo complet', 'Montage soigné inclus', 'Couverture demi-journée'],       populaire: true,  ordre: 2 },
    { categorie: 'grands_forfaits',      nom: "Mariage — L'Étoilé",  sousTitre: 'Journée complète',         prix: '1650€',  details: ['Journée entière', 'Prises de vues spéciales', 'Montage soigné premium'],              populaire: false, ordre: 3 },
  ]

  const count = await prisma.forfait.count()
  if (count === 0) {
    await prisma.forfait.createMany({ data: forfaits })
    console.log(`✓ ${forfaits.length} forfaits insérés`)
  } else {
    console.log(`✓ Forfaits déjà présents (${count}) — seed ignoré`)
  }
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
