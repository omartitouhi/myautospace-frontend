/* Bilingual copy (English + French) for the MyAutoSpace landing page.
   Context is Tunisia: Tunisian cities, dealers and Dinar (DT) pricing.
   `t = translations[lang]`; components read nested keys directly. */

export const LANGS = ['fr', 'en']

export const translations = {
  en: {
    code: 'en',
    other: 'FR',
    nav: {
      buy: 'Buy',
      sell: 'Sell',
      services: 'Services',
      how: 'How it works',
      signin: 'Sign in',
      getStarted: 'Get started',
      switchTheme: 'Switch theme',
      switchLang: 'Switch to French',
    },
    hero: {
      eyebrow: 'The all-in-one vehicle marketplace',
      h1: [
        { text: 'Buy. Sell. Service.' },
        { pre: 'All in one ', em: 'trusted' },
        { text: 'space.' },
      ],
      sub: [
        { t: 'MyAutoSpace connects buyers, sellers and certified providers across Tunisia on one verified marketplace — with ' },
        { s: 'Trust Scores' },
        { t: ', ' },
        { s: 'secure escrow' },
        { t: ' and protected contracts on every deal.' },
      ],
      modes: [
        { id: 'buy', label: 'Buy' },
        { id: 'sell', label: 'Sell' },
        { id: 'service', label: 'Service' },
      ],
      fields: {
        buy: [['Make & model', 'e.g. Volkswagen Golf'], ['Location', 'City or area']],
        sell: [['Your vehicle', 'e.g. 2021 Hyundai Accent'], ['Location', 'City or area']],
        service: [['Service type', 'e.g. inspection, detailing'], ['Location', 'City or area']],
      },
      chips: [
        { ic: 'shieldCheck', t: 'Verified sellers' },
        { ic: 'lock', t: 'Secure escrow' },
        { ic: 'star', t: 'Trust Score on every profile' },
      ],
      fc: {
        inspection: 'Inspection',
        inspectionValue: '172-pt verified',
        trust: 'Seller Trust Score',
        listed: 'Listed today',
        price: '75 000 DT',
      },
    },
    marquee: ['SUVs', 'Electric', 'Sedans', 'Hatchbacks', 'Family', 'Diesel', 'Vans', 'Hybrids', 'City cars', 'Pickups'],
    fuel: { electric: 'Electric', petrol: 'Petrol', hybrid: 'Hybrid', diesel: 'Diesel' },
    listings: {
      eyebrow: 'Featured vehicles',
      title: 'Hand-picked, fully verified',
      browse: 'Browse all 48,000+',
      verified: 'Verified',
      trust: 'Trust',
    },
    how: {
      eyebrow: 'How it works',
      title: 'From browsing to keys in hand',
      sub: 'A marketplace built around trust at every step — so a deal between strangers feels as safe as one between friends.',
      steps: [
        { ic: 'search', t: 'Search & discover', d: 'Filter 48,000+ listings by make, budget, city and more — with smart synonyms and saved alerts.' },
        { ic: 'eye', t: 'Inspect & verify', d: "Every listing carries a 172-point inspection, history report and the seller's public Trust Score." },
        { ic: 'lock', t: 'Pay securely', d: "Funds are held in escrow and released only once you've taken delivery and signed the digital contract." },
        { ic: 'road', t: 'Drive away', d: 'Book transport or pickup, manage paperwork and rate the deal — all from your dashboard.' },
      ],
    },
    features: {
      eyebrow: 'Why MyAutoSpace',
      title: 'Protection built into every layer',
      sub: 'Verification, payments, contracts and fraud defense work together so both sides can deal with total confidence.',
      items: [
        { ic: 'star', t: 'Trust Score on every profile', d: 'A transparent 0–10 score built from verified ID, transaction history, response time and reviews — so reputation follows every buyer and seller across the platform.' },
        { ic: 'lock', t: 'Escrow payments', d: 'Money is held safely and released only when both sides confirm. No transfer scams, no surprises.' },
        { ic: 'doc', t: 'Digital contracts', d: 'Legally-binding agreements generated, e-signed and stored automatically for each deal.' },
        { ic: 'shield', t: 'Fraud protection', d: 'Real-time risk scoring flags suspicious listings and accounts before they ever reach you.' },
        { ic: 'chat', t: 'In-app messaging', d: 'Negotiate, share documents and book viewings without ever exposing your number.' },
      ],
    },
    services: {
      eyebrow: 'Service network',
      title: 'More than a marketplace',
      sub: 'Tap a network of certified providers — book inspections, detailing, transport and admin right alongside your purchase.',
      book: 'Book now',
      items: [
        { ic: 'wrench', t: 'Inspection & repair', d: 'Book certified mechanics for pre-purchase checks and servicing.' },
        { ic: 'spray', t: 'Detailing', d: 'Interior and exterior detailing from vetted local specialists.' },
        { ic: 'truck', t: 'Transport & delivery', d: 'Door-to-door vehicle transport across Tunisia with live tracking.' },
        { ic: 'doc', t: 'Paperwork & registration', d: 'Carte grise, registration and insurance handled for you.' },
      ],
    },
    stats: {
      eyebrow: 'By the numbers',
      title: 'Trusted at scale',
      labels: ['Vehicles listed', 'Verified sellers', 'Protected in escrow', 'Average Trust Score'],
    },
    cta: {
      title: 'Ready to find your space?',
      sub: 'Join thousands of Tunisians buying, selling and servicing their vehicles the safer way — free to browse, no risk to start.',
      primary: 'Browse vehicles',
      secondary: 'List your vehicle',
    },
    footer: {
      tagline: 'The all-in-one vehicle marketplace — buy, sell and service with verified trust at every step.',
      news: 'Email for new listings',
      cols: [
        { h: 'Marketplace', links: ['Buy a vehicle', 'Sell a vehicle', 'Electric & hybrid', 'Dealers', 'Pricing'] },
        { h: 'Services', links: ['Inspections', 'Detailing', 'Transport', 'Paperwork', 'Become a provider'] },
        { h: 'Company', links: ['About', 'Careers', 'Press', 'Trust & safety', 'Contact'] },
        { h: 'Legal', links: ['Terms', 'Privacy', 'Cookies', 'Escrow terms'] },
      ],
      rights: '© 2026 MyAutoSpace. All rights reserved.',
    },
  },

  fr: {
    code: 'fr',
    other: 'EN',
    nav: {
      buy: 'Acheter',
      sell: 'Vendre',
      services: 'Services',
      how: 'Comment ça marche',
      signin: 'Se connecter',
      getStarted: 'Commencer',
      switchTheme: 'Changer de thème',
      switchLang: "Passer à l'anglais",
    },
    hero: {
      eyebrow: 'La marketplace tout-en-un pour véhicules',
      h1: [
        { text: 'Achetez. Vendez. Réparez.' },
        { pre: 'Un espace unique et ', em: 'fiable' },
        { text: 'pour vos véhicules.' },
      ],
      sub: [
        { t: 'MyAutoSpace réunit acheteurs, vendeurs et prestataires certifiés partout en Tunisie sur une seule marketplace vérifiée — avec ' },
        { s: 'Scores de Confiance' },
        { t: ', ' },
        { s: 'séquestre sécurisé' },
        { t: ' et contrats protégés sur chaque transaction.' },
      ],
      modes: [
        { id: 'buy', label: 'Acheter' },
        { id: 'sell', label: 'Vendre' },
        { id: 'service', label: 'Entretien' },
      ],
      fields: {
        buy: [['Marque & modèle', 'ex. Volkswagen Golf'], ['Ville', 'Ville ou région']],
        sell: [['Votre véhicule', 'ex. Hyundai Accent 2021'], ['Ville', 'Ville ou région']],
        service: [['Type de service', 'ex. inspection, esthétique'], ['Ville', 'Ville ou région']],
      },
      chips: [
        { ic: 'shieldCheck', t: 'Vendeurs vérifiés' },
        { ic: 'lock', t: 'Séquestre sécurisé' },
        { ic: 'star', t: 'Score de Confiance sur chaque profil' },
      ],
      fc: {
        inspection: 'Inspection',
        inspectionValue: '172 points vérifiés',
        trust: 'Score de Confiance vendeur',
        listed: "Publié aujourd'hui",
        price: '75 000 DT',
      },
    },
    marquee: ['SUV', 'Électrique', 'Berlines', 'Citadines', 'Familiales', 'Diesel', 'Utilitaires', 'Hybrides', 'Compactes', 'Pick-up'],
    fuel: { electric: 'Électrique', petrol: 'Essence', hybrid: 'Hybride', diesel: 'Diesel' },
    listings: {
      eyebrow: 'Véhicules en vedette',
      title: 'Sélectionnés et entièrement vérifiés',
      browse: 'Voir les 48 000+',
      verified: 'Vérifié',
      trust: 'Confiance',
    },
    how: {
      eyebrow: 'Comment ça marche',
      title: 'De la recherche aux clés en main',
      sub: "Une marketplace pensée autour de la confiance à chaque étape — pour qu'une transaction entre inconnus soit aussi sûre qu'entre amis.",
      steps: [
        { ic: 'search', t: 'Rechercher & découvrir', d: 'Filtrez plus de 48 000 annonces par marque, budget, ville et plus — avec synonymes intelligents et alertes enregistrées.' },
        { ic: 'eye', t: 'Inspecter & vérifier', d: 'Chaque annonce inclut une inspection en 172 points, un historique et le Score de Confiance public du vendeur.' },
        { ic: 'lock', t: 'Payer en sécurité', d: 'Les fonds sont placés sous séquestre et libérés seulement après la livraison et la signature du contrat numérique.' },
        { ic: 'road', t: 'Prendre la route', d: 'Réservez le transport ou le retrait, gérez les documents et notez la transaction — depuis votre tableau de bord.' },
      ],
    },
    features: {
      eyebrow: 'Pourquoi MyAutoSpace',
      title: 'Une protection intégrée à chaque niveau',
      sub: 'Vérification, paiements, contrats et lutte anti-fraude fonctionnent ensemble pour que chacun négocie en toute confiance.',
      items: [
        { ic: 'star', t: 'Score de Confiance sur chaque profil', d: "Un score transparent de 0 à 10 basé sur l'identité vérifiée, l'historique des transactions, le temps de réponse et les avis — la réputation suit chaque acheteur et vendeur sur la plateforme." },
        { ic: 'lock', t: 'Paiements sous séquestre', d: "L'argent est conservé en sécurité et libéré seulement quand les deux parties confirment. Aucune arnaque, aucune surprise." },
        { ic: 'doc', t: 'Contrats numériques', d: 'Des accords juridiquement valables, générés, signés électroniquement et archivés automatiquement pour chaque transaction.' },
        { ic: 'shield', t: 'Protection anti-fraude', d: "Un score de risque en temps réel signale les annonces et comptes suspects avant qu'ils ne vous atteignent." },
        { ic: 'chat', t: 'Messagerie intégrée', d: 'Négociez, partagez des documents et planifiez des visites sans jamais exposer votre numéro.' },
      ],
    },
    services: {
      eyebrow: 'Réseau de services',
      title: "Plus qu'une marketplace",
      sub: 'Accédez à un réseau de prestataires certifiés — réservez inspection, esthétique, transport et démarches en même temps que votre achat.',
      book: 'Réserver',
      items: [
        { ic: 'wrench', t: 'Inspection & réparation', d: "Réservez des mécaniciens certifiés pour les contrôles avant achat et l'entretien." },
        { ic: 'spray', t: 'Esthétique auto', d: 'Nettoyage intérieur et extérieur par des spécialistes locaux vérifiés.' },
        { ic: 'truck', t: 'Transport & livraison', d: 'Transport de véhicule porte-à-porte partout en Tunisie avec suivi en direct.' },
        { ic: 'doc', t: 'Démarches & immatriculation', d: 'Carte grise, immatriculation et assurance gérées pour vous.' },
      ],
    },
    stats: {
      eyebrow: 'En chiffres',
      title: 'La confiance à grande échelle',
      labels: ['Véhicules en ligne', 'Vendeurs vérifiés', 'Protégé sous séquestre', 'Score de Confiance moyen'],
    },
    cta: {
      title: 'Prêt à trouver votre espace ?',
      sub: 'Rejoignez des milliers de Tunisiens qui achètent, vendent et entretiennent leur véhicule en toute sécurité — gratuit pour parcourir, sans risque pour commencer.',
      primary: 'Parcourir les véhicules',
      secondary: 'Vendre mon véhicule',
    },
    footer: {
      tagline: 'La marketplace tout-en-un pour véhicules — achetez, vendez et entretenez en toute confiance, à chaque étape.',
      news: 'E-mail pour les nouvelles annonces',
      cols: [
        { h: 'Marketplace', links: ['Acheter un véhicule', 'Vendre un véhicule', 'Électrique & hybride', 'Concessionnaires', 'Tarifs'] },
        { h: 'Services', links: ['Inspections', 'Esthétique auto', 'Transport', 'Démarches', 'Devenir prestataire'] },
        { h: 'Entreprise', links: ['À propos', 'Carrières', 'Presse', 'Confiance & sécurité', 'Contact'] },
        { h: 'Légal', links: ['Conditions', 'Confidentialité', 'Cookies', 'Conditions de séquestre'] },
      ],
      rights: '© 2026 MyAutoSpace. Tous droits réservés.',
    },
  },
}
