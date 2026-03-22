export const legalFr = {
  legal: {
    title: 'Mentions Légales',
    sections: {
      publisher: {
        title: '1. Éditeur du site',
        intro: 'Le site internet La Serenity est édité par :',
        items: [
          "Nom de l'entreprise : [À COMPLÉTER]",
          'Statut Juridique : [À COMPLÉTER]',
          'Siège social : [À COMPLÉTER]',
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
        outro:
          'Les données sont stockées de manière sécurisée et les fournisseurs adhèrent aux normes de sécurité internationales.',
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
      controller: {
        title: '1. Responsable du traitement',
        body: 'Le responsable du traitement des données est [NOM DU PRATICIEN].',
      },
      data: {
        title: '2. Données collectées',
        intro:
          'Nous collectons uniquement les données strictement nécessaires via nos formulaires :',
        items: [
          'Nom et Prénom',
          'Adresse email',
          'Numéro de téléphone',
          "Détails de l'événement",
        ],
      },
      purpose: {
        title: '3. Finalité des données',
        intro: 'Les informations recueillies ne sont utilisées que pour :',
        items: [
          "Répondre à vos demandes d'informations.",
          'Établir des devis.',
        ],
        highlight:
          'Engagement de confidentialité : Vos données ne sont jamais vendues ou louées à des tiers.',
      },
      retention: {
        title: '4. Durée de conservation',
        items: [
          'Formulaire de contact : 12 mois.',
          'Données de facturation : 10 ans.',
        ],
      },
      processors: {
        title: '5. Destinataires techniques',
        intro:
          'Certaines données techniques transitent par nos prestataires :',
        items: [
          'Fly.io & Neon : Hébergement.',
          'Cloudinary : Médias.',
          'Cloudflare : Sécurité.',
          'Stripe : Utilisé pour le traitement sécurisé des paiements. Stripe collecte et traite vos données bancaires conformément à sa propre politique de confidentialité.',
        ],
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
      what: {
        title: "1. Qu'est-ce qu'un cookie ?",
        body: 'Un cookie est un petit fichier texte déposé sur votre terminal.',
      },
      used: {
        title: '2. Cookies utilisés',
        intro: 'Nous privilégions une approche minimaliste.',
        items: [
          'Cookies strictement nécessaires : Indispensables au fonctionnement technique.',
          'Cookies de préférence : Mémorisation de la langue.',
          'Cookies tiers : Optimisation d’affichage (ex: Cloudinary).',
        ],
      },
      ads: {
        title: '3. Absence de traçage',
        body: "Ce site n'utilise pas de cookies publicitaires.",
      },
      consent: {
        title: '4. Gestion du consentement',
        body: 'Vous pouvez configurer votre navigateur pour refuser les cookies.',
      },
    },
  },
  terms: {
    title: 'Conditions Générales de Vente (CGV)',
    sections: {
      object: {
        title: '1. Objet',
        body: 'Les présentes conditions régissent la vente de prestations de massage par La Serenity.',
      },
      nature: {
        title: '2. Nature des prestations',
        body: 'Les massages sont des soins de bien-être, sans aucune visée thérapeutique ou médicale.',
      },
      pricing: {
        title: '3. Tarifs',
        body: 'Les tarifs sont indiqués en euros (€) et affichés sur le site au moment de la réservation.',
      },
      payments: {
        title: '4. Paiement sécurisé',
        body: 'Le règlement des prestations s’effectue en ligne au moment de la réservation via la plateforme de paiement sécurisée Stripe. Les données bancaires sont chiffrées et ne sont à aucun moment conservées sur nos serveurs.',
      },
      withdrawal: {
        title: '5. Droit de rétractation',
        body: 'Conformément à l’article L.221-18 du Code de la consommation, le client dispose d’un délai de 14 jours pour exercer son droit de rétractation.',
        exception:
          'Toutefois, conformément à l’article L.221-28 du Code de la consommation, lorsque la prestation est pleinement exécutée avant la fin de ce délai, ou doit débuter à une date fixée expressément avant l’expiration de ce délai, le client renonce expressément à son droit de rétractation.',
      },
      cancellation: {
        title: '6. Rendez-vous et annulation',
        items: [
          'Retards : Au-delà de 15 min, la séance peut être écourtée.',
          'Annulation : Prévenir au moins 24h à l’avance.',
        ],
      },
      vouchers: {
        title: '7. Bons cadeaux',
        body: 'Les bons cadeaux sont valables [X] mois à compter de leur date d’achat. Ils ne sont ni remboursables ni échangeables contre des espèces.',
      },
      contraindications: {
        title: '8. Contre-indications',
        body: 'Informer le praticien de tout problème de santé ou grossesse avant la séance.',
      },
      mediation: {
        title: '9. Médiation de la consommation',
        body: 'Conformément aux articles L.616-1 et R.616-1 du Code de la consommation, en cas de litige, vous pouvez recourir gratuitement à un médiateur de la consommation. Les coordonnées du médiateur compétent seront communiquées ou précisées ici dès leur désignation.',
      },
    },
  },
  accessibility: {
    title: "Déclaration d'Accessibilité",
    sections: {
      commitment: {
        title: 'Engagement',
        body: 'La Serenity s’engage à rendre son site internet accessible au plus grand nombre.',
      },
      standard: {
        title: 'Standard Technique',
        intro: 'Ce site suit les bonnes pratiques WCAG :',
        items: [
          'Contraste optimisé.',
          'Compatibilité lecteurs d’écran.',
          'Textes alternatifs.',
        ],
      },
      feedback: {
        title: 'Retour d’information',
        body: 'Contactez-nous en cas d’obstacle : [VOTRE EMAIL].',
      },
    },
  },
};
