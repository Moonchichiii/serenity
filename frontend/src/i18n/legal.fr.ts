export const legalFr = {
  legal: {
    title: 'Mentions Légales',
    sections: {
      publisher: {
        title: '1. Éditeur du site',
        intro: 'Le site internet La Serenity est édité par :',
        items: [
          "Nom de l'entreprise : [À COMPLÉTER]",
          "Statut Juridique : [À COMPLÉTER]",
          "Siège social : [À COMPLÉTER]",
          'SIRET : [EN COURS D’ATTRIBUTION]',
          'Email de contact : [VOTRE EMAIL]',
        ],
      },
      hosting: {
        title: '2. Hébergement',
        intro: 'Le site est hébergé sur une architecture cloud distribuée :',
        items: [
          'Backend & Base de données : Fly.io et Neon.tech.',
          'Frontend & CDN : Cloudflare Inc.',
        ],
        outro: 'Les données sont stockées de manière sécurisée et les fournisseurs adhèrent aux normes de sécurité internationales.',
      },
      ip: {
        title: '3. Propriété Intellectuelle',
        body: 'L’ensemble de ce site relève de la législation française et internationale sur le droit d’auteur et la propriété intellectuelle.',
      },
    },
  },
  privacy: {
    title: 'Politique de Confidentialité',
    sections: {
      controller: { title: '1. Responsable du traitement', body: "Le responsable du traitement des données est [NOM DU PRATICIEN]." },
      data: {
        title: '2. Données collectées',
        intro: 'Nous collectons uniquement les données strictement nécessaires via nos formulaires :',
        items: ['Nom et Prénom', 'Adresse email', 'Numéro de téléphone', "Détails de l'événement"],
      },
      purpose: {
        title: '3. Finalité des données',
        intro: 'Les informations recueillies ne sont utilisées que pour :',
        items: ["Répondre à vos demandes d'informations.", 'Établir des devis.'],
        highlight: 'Engagement de confidentialité : Vos données ne sont jamais vendues ou louées à des tiers.',
      },
      retention: {
        title: '4. Durée de conservation',
        items: ['Formulaire de contact : 12 mois.', 'Données de facturation : 10 ans.'],
      },
      processors: {
        title: '5. Destinataires techniques',
        intro: 'Certaines données techniques transitent par nos prestataires :',
        items: ['Fly.io & Neon : Hébergement.', 'Cloudinary : Médias.', 'Cloudflare : Sécurité.'],
      },
      rights: {
        title: '6. Vos droits',
        body: 'Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et de suppression. Contactez-nous à : [VOTRE EMAIL].',
      },
    },
  },
  cookies: {
    title: 'Gestion des Cookies',
    sections: {
      what: { title: "1. Qu'est-ce qu'un cookie ?", body: 'Un cookie est un petit fichier texte déposé sur votre terminal.' },
      used: {
        title: '2. Cookies utilisés',
        intro: 'Nous privilégions une approche minimaliste.',
        items: [
          'Cookies strictement nécessaires : Indispensables au fonctionnement technique.',
          'Cookies de préférence : Mémorisation de la langue.',
          'Cookies tiers : Optimisation d’affichage (ex: Cloudinary).',
        ],
      },
      ads: { title: '3. Absence de traçage', body: "Ce site n'utilise pas de cookies publicitaires." },
      consent: { title: '4. Gestion du consentement', body: 'Vous pouvez configurer votre navigateur pour refuser les cookies.' },
    },
  },
  terms: {
    title: 'Conditions Générales de Vente (CGV)',
    sections: {
      object: { title: '1. Objet', body: 'Les présentes conditions régissent la vente de prestations de massage par La Serenity.' },
      nature: {
        title: '2. Nature des prestations',
        body: 'Les massages sont des soins de bien-être, sans aucune visée thérapeutique ou médicale.',
      },
      pricing: { title: '3. Tarifs et Paiement', body: 'Les tarifs sont indiqués en euros (€). Le paiement s’effectue sur place.' },
      cancellation: {
        title: '4. Rendez-vous et Annulation',
        items: ['Retards : Au-delà de 15 min, la séance peut être écourtée.', 'Annulation : Prévenir au moins 24h à l’avance.'],
      },
      vouchers: { title: '5. Bons Cadeaux', body: 'Valables [X] mois, non remboursables.' },
      contraindications: { title: '6. Contre-indications', body: 'Informer le praticien de tout problème de santé ou grossesse.' },
    },
  },
  accessibility: {
    title: "Déclaration d'Accessibilité",
    sections: {
      commitment: { title: 'Engagement', body: 'La Serenity s’engage à rendre son site internet accessible au plus grand nombre.' },
      standard: {
        title: 'Standard Technique',
        intro: 'Ce site suit les bonnes pratiques WCAG :',
        items: ['Contraste optimisé.', 'Compatibilité lecteurs d’écran.', 'Textes alternatifs.'],
      },
      feedback: { title: 'Retour d’information', body: 'Contactez-nous en cas d’obstacle : [VOTRE EMAIL].' },
    },
  },
};
