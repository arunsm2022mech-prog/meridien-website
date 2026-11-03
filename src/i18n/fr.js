// French copy for / (the default page). Keys must match src/i18n/en.js (scripts/pages.mjs checks this).
// Values are inserted as HTML, so <em class="accent"> and <strong> work.
// French typography: a non-breaking space ( ) goes before ? ! : and between a price and €.
const _ = ' ';

export default {
  lang: 'fr',
  locale: 'fr_FR',
  altLocale: 'en_GB',
  url: 'https://www.meridienbrandsociety.com/',

  meta: {
    title: 'Méridien Brand Society',
    description: 'Méridien est le club de stratégie de marque de NEOMA Business School, à Reims. Des équipes d’étudiants multiculturelles qui guident les marques vers des marchés inexplorés.',
    ogDescription: 'Guider les marques vers des marchés inexplorés. Le club de stratégie de marque de NEOMA Business School, à Reims.',
  },

  ui: {
    skip: 'Aller au contenu',
    home: 'Méridien Brand Society, accueil',
    navLabel: 'Navigation principale',
    menu: 'Menu',
    close: 'Fermer',
    langLabel: 'Langue',
    backToTop: 'Retour en haut',
    honeypot: 'Laissez ce champ vide',
    sending: 'Envoi…',
    sendError: 'L’envoi a échoué. Vérifiez votre connexion et réessayez.',
  },

  nav: {
    projects: 'Projets',
    membership: 'Adhésion',
    events: 'Événements',
    brief: 'Proposer un brief',
  },

  hero: {
    eyebrow: 'Le club de stratégie de marque de NEOMA Business School',
    line1: 'Guider les marques',
    line2: 'vers des marchés inexplorés.',
    sub1: `Des étudiants venus de plusieurs continents, sur de vrais briefs pour de vraies entreprises, à${_}Reims.`,
    sub2: 'Plusieurs regards. Un seul cap.',
    ctaBrief: 'Confiez-nous un brief',
    ctaJoin: 'Devenir membre',
  },

  manifesto: {
    title: 'Qui sommes-nous',
    text: 'Nous venons de plusieurs continents, de l’ingénierie au management. Nous parlons des langues différentes et raisonnons avec des cadres différents. Réunis autour d’un même brief, ces regards produisent une stratégie plus affûtée qu’aucun point de vue ne pourrait atteindre seul.',
  },

  projects: {
    title: 'Ce semestre, trois équipes ont <em class="accent">un vrai client.</em>',
    intro: 'Chaque équipe projet accompagne une entreprise pendant tout le semestre, de l’étude de marché aux recommandations.',
    bioli: {
      origin: 'Cosmétique danoise',
      lead: 'Équipe menée par Abir',
      brief: `Une marque danoise de soins de la peau qui explore le marché français. Qui est l’acheteur français, et que doit lui dire Bioli pour le convaincre${_}?`,
    },
    flaneries: {
      origin: 'Festival de musique à Reims',
      lead: 'Équipe menée par Aditi',
      brief: 'Le festival de musique de Reims veut renouveler son public et toucher une génération plus jeune.',
    },
    rosy: {
      origin: 'Alimentation animale chinoise',
      lead: 'Équipe menée par Sirine',
      brief: 'Un grand groupe chinois d’alimentation animale qui se développe et renforce sa présence en France.',
    },
    open: {
      title: 'Quatre chefs de projet cherchent encore <em class="accent">un client.</em>',
      text: `Votre marque arrive en France, vise un nouveau public ou repense son positionnement${_}? L’une de nos équipes peut s’en charger.`,
      cta: 'Proposer un brief',
    },
  },

  membership: {
    title: 'Les avantages membres',
    intro: 'Méridien fonctionne désormais avec une adhésion officielle. Les membres restent dans l’association et dans le groupe de discussion, et accèdent à tout ce qui suit.',
    b1: { title: 'Opportunités de carrière', text: 'Nous recommandons nos membres pour des stages et d’autres postes, selon leur profil, leurs compétences et leur implication.' },
    b2: { title: 'De vrais projets', text: 'Rejoignez une équipe projet, pilotez un futur projet et travaillez sur de vrais enjeux pour de vraies entreprises.' },
    b3: { title: 'Les pôles', text: 'Engagez-vous dans les pôles qui font tourner Méridien et aidez le club à grandir.' },
    b4: { title: 'Méridien Sessions', text: 'Des ateliers, ainsi que les formations, présentations et supports internes que nous utilisons sur nos projets.' },
    b5: { title: 'Événements et networking', text: 'Des soirées entre membres, et des événements de networking avec des professionnels et des entreprises.' },
    join: 'Rejoindre Méridien',
    price1: `15${_}€`,
    label1: 'Un semestre',
    price2: `25${_}€`,
    label2: 'Année complète',
    hoodie: {
      alt: `Hoodie Méridien bleu marine${_}: petit logo devant, grand logo et inscription Méridien Brand Society au dos`,
      name: 'Le hoodie Méridien',
      price: `<s>30${_}€</s> 25${_}€ avec votre adhésion`,
    },
    form: {
      success: `C’est noté${_}! Nous vous enverrons les modalités de paiement dans les prochaines semaines.`,
      note: 'Aucun paiement pour l’instant. Nous recueillons les confirmations et communiquerons les modalités de paiement dans les prochaines semaines.',
      name: 'Nom complet',
      email: 'E-mail',
      membership: 'Adhésion',
      semester: `Un semestre, 15${_}€`,
      year: `Année complète, 25${_}€`,
      hoodie: `Ajouter le hoodie pour 25${_}€${_}?`,
      yes: 'Oui',
      no: 'Non',
      size: 'Taille du hoodie',
      sizeChoose: 'Choisir une taille',
      submit: 'Confirmer mon adhésion',
    },
  },

  events: {
    title: 'À venir',
    e1: { date: 'Vendredi 30 octobre', title: 'Soirée Halloween', text: 'Notre première soirée de l’année. Venez déguisés et rencontrez les équipes.' },
    e2: { date: 'Tout au long du semestre', title: 'Méridien Sessions', text: `Des ateliers pratiques sur les méthodes de nos équipes projet${_}: études, positionnement, plateformes de marque.` },
    e3: { date: 'Date à venir', title: 'Networking avec des professionnels', text: 'Une soirée avec des professionnels de marques et d’agences. Les membres sont prioritaires.' },
  },

  partner: {
    title: `Votre marque prend <em class="accent">un nouveau cap${_}?</em>`,
    text: `Une équipe Méridien consacre un semestre entier à votre enjeu${_}: entrer sur le marché français, toucher un nouveau public ou affiner votre positionnement. Vous obtenez des études fraîches et des recommandations d’une équipe qui observe le marché sous de multiples angles.`,
    f1: '<strong>Un semestre</strong> par projet',
    f2: '<strong>Une équipe dédiée</strong>, menée par un chef de projet',
    f3: '<strong>Basés à Reims</strong>, nous travaillons en français et en anglais',
    form: {
      success: 'Brief reçu. Un chef de projet revient vers vous très vite.',
      name: 'Votre nom',
      company: 'Entreprise',
      email: 'E-mail',
      challenge: `Quel est votre enjeu${_}?`,
      submit: 'Envoyer notre brief',
    },
  },

  footer: {
    line: 'Ensemble, on va plus loin.',
    w1: 'Ensemble,',
    w2: 'on va',
    w3: 'plus loin.',
    about: 'Le club de stratégie de marque de NEOMA Business School, à Reims. Fondé en 2026.',
  },
};
