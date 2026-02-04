import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      nav: {
        about: 'About',
        services: 'Services',
        corporate: 'Corporate',
        booking: 'Book now',
        contact: 'Contact',
      },
      hero: {
        title: 'Find your balance',
        subtitle: 'Premium wellness massage in a serene, private setting',
        cta: 'Book your session',
        ctaPrivate: 'Book a private session',
        ctaCorporate: 'Corporate wellness inquiry',
      },
      about: {
        title: 'About me',
        subtitle: 'Dedicated to your wellness journey',
        intro:
          'With over 10 years of experience in professional massage, I specialize in creating personalized wellness experiences that restore balance and promote healing.',
        certification: 'Certified professional wellness practitioner',
        approach: 'My approach',
        approachText:
          'Every body is unique. I combine traditional techniques with intuitive care to address your specific needs, whether you seek relaxation, pain relief, or deeper wellness work.',
        specialties: 'Specialties',
        specialty1: 'Deep tissue therapy',
        specialty2: 'Swedish relaxation',
        specialty3: 'Sports recovery',
        specialty4: 'Prenatal care',
        cta: 'Book a session',
        studioDescription:
          'Experience a tranquil, safe, and nurturing environment designed for your comfort and healing.',
        label: 'About Me',
        guidesTitle: 'What Guides Me',
        guide: {
          clientCareTitle: 'Client-Centered Care',
          clientCareBody:
            'Your comfort, safety, and goals are my top priorities.',
          excellenceTitle: 'Professional Excellence',
          excellenceBody:
            'I am fully certified and committed to ongoing training.',
          holisticTitle: 'Holistic Approach',
          holisticBody: 'I address the whole person—body, mind, and spirit.',
        },
        certificationLabel: 'Certified',
        studioTitle: 'My Private Studio',
        studioLocationTitle: 'Private Studio Location',
        byAppointment: 'By Appointment Only',
        contactTitle: 'Contact via email through the booking form',
        approachLabel: 'My Approach',
        approachHeading: 'A Personalized Wellness Journey',
        mapTitle: 'Studio Area – 5 Avenues, 13004 Marseille',
        mapDescription:
          'The map shows the general 5 Avenues area in the 4th arrondissement of Marseille.',
        mapPrivacy: 'Client privacy and discretion are always respected.',
        mapCollapsedTitle: 'Private Studio Location',
        mapCollapsedSubtitle: 'By Appointment Only',
        mapHintHover: 'Hover to enlarge the map',
        mapHintScroll: 'Scroll to view the map',
        mapPreview: 'View map',
      },
      services: {
        title: 'Services',
        subtitle: 'Wellness massage tailored to your needs',
        slide: 'SLIDE',
        mostPopular: 'Most popular',
      },
      corp: {
        subjectPrefix: 'Corporate/Event Booking',
        form: {
          name: 'Full name',
          email: 'Email',
          phone: 'Phone',
          company: 'Company/Organization',
          eventType: 'Event type',
          attendees: 'Estimated attendees',
          duration: 'Hours / duration',
          date: 'Date',
          endDate: 'End date (optional)',
          location: 'Location / address',
          'location.placeholder': 'Company address or venue',
          services: 'Requested services',
          'services.placeholder':
            'Chair massage, 10-min rotations, 2 practitioners…',
          budget: 'Budget (optional)',
          notes: 'Additional notes',
          'notes.placeholder':
            'Ambiance / space available, parking, access badges, etc.',
          moreDetailsLabel: 'Additional details (optional)',
          optional: '(optional)',
          send: 'Request quote',
          sending: 'Sending...',
          success: 'Request sent! I will get back to you shortly. ✨',
          error: 'Could not send your request. Please try again.',
          notice: 'We reply within one business day for corporate requests.',
          gdpr: {
            title: 'Privacy notice',
            text: 'This form emails your request directly. We do not store your data; it is used only to reply to you.',
          },
          validation: {
            nameRequired: 'Name is required',
            nameTooShort: 'Name is too short',
            emailRequired: 'Email is required',
            emailInvalid: 'Invalid email',
            companyRequired: 'Company is required',
            attendeesNumber: 'Enter a number',
            attendeesMin: 'At least 1 attendee',
          },
          eventTypes: {
            corporate: 'Corporate wellness',
            team: 'Team day / offsite',
            expo: 'Fair / expo / booth',
            private: 'Private event',
            other: 'Other',
          },
          placeholders: {
            name: 'Jane Doe',
            email: 'jane@company.com',
            phone: '+33 6 00 00 00 00',
            company: 'Acme SAS',
            attendees: '25',
            duration: '09:00–17:00 or 3h',
            budget: '€500–€1500',
          },
          emailLines: {
            contact: 'Contact',
            company: 'Company',
            eventType: 'Event type',
            attendees: 'Attendees',
            date: 'Date',
            duration: 'Duration/Hours',
            location: 'Location',
            services: 'Requested services',
            budget: 'Budget',
            notes: 'Notes',
            dash: '-',
            arrow: '→',
          },
        },
      },
      booking: {
        title: 'Book your session',
        subtitle: 'Select your preferred time and service',
        form: {
          name: 'Full name',
          email: 'Email address',
          phone: 'Phone number',
          service: 'Select service',
          date: 'Preferred date',
          time: 'Preferred time',
          notes: 'Special requests (optional)',
          submit: 'Confirm booking',
        },
      },
      contact: {
        form: {
          title: 'Contact form',
          name: 'Full name',
          email: 'Email address',
          phone: 'Phone number',
          subject: 'Subject',
          message: 'Message',
          optional: '(optional)',
          send: 'Send message',
          sending: 'Sending...',
          success: 'Message sent successfully! ✨',
          error: 'Error sending message. Please try again.',
          notice: 'I will reply as soon as possible during business hours.',
          'subject.placeholder': 'Appointment request',
          'message.placeholder':
            'Describe your needs, your preferred date/time, or any questions you may have...',
          validation: {
            nameRequired: 'Name is required',
            nameTooShort: 'Name is too short',
            emailRequired: 'Email is required',
            emailInvalid: 'Invalid email',
            subjectRequired: 'Subject is required',
            messageRequired: 'Message is required',
            messageTooShort: 'Message is too short',
          },
          gdpr: {
            title: 'Privacy notice',
            text: 'This contact form sends your message directly via email. We do not collect, store, or process any personal data. Your information is only used to respond to your inquiry.',
          },
        },
      },
      footer: {
        tagline:
          'Professional relaxing massage and holistic well-being in the heart of Marseille.',
        addressFull: '5 Avenues, 13004 Marseille, France',
        info: 'Information',
        legalNotice: 'Legal notice',
        privacy: 'Privacy policy',
        cgv: 'Terms & Conditions',
        cookies: 'Cookie settings',
        contactTitle: 'Contact',
        email: 'contact@serenity-massage.fr',
        hours: 'Hours',
        hoursValue: 'Mon–Sat: 9:00–19:00',
        allRights: 'All rights reserved.',
        designedBy: 'Website by',
      },
      legalPages: {
        legal: {
          title: 'Legal Notice',
          sections: {
            publisher: {
              title: '1. Site Publisher',
              intro: 'The website La Serenity is published by:',
              items: [
                'Company Name: [TO BE COMPLETED]',
                'Legal Status: [Registration in progress]',
                'Address: [TO BE COMPLETED]',
                'SIRET/Registration ID: [PENDING]',
                'Contact Email: [YOUR EMAIL]',
              ],
            },
            hosting: {
              title: '2. Hosting',
              intro:
                'The website is hosted on a distributed cloud architecture:',
              items: [
                'Backend & Database: Fly.io and Neon.tech.',
                'Frontend & CDN: Cloudflare Inc.',
              ],
              outro:
                'Data is stored securely, and providers adhere to international security standards.',
            },
            ip: {
              title: '3. Intellectual Property',
              body: 'All content on this website is protected by French and international intellectual property laws. All reproduction rights are reserved.',
            },
          },
        },
        privacy: {
          title: 'Privacy Policy',
          sections: {
            controller: {
              title: '1. Data Controller',
              body: 'The party responsible for data processing is [PRACTITIONER NAME OR COMPANY].',
            },
            data: {
              title: '2. Data Collection',
              intro:
                'We collect only the data strictly necessary to process your request via our forms (Contact and Corporate):',
              items: [
                'Name',
                'Email address',
                'Phone number',
                'Event details (for corporate inquiries)',
              ],
            },
            purpose: {
              title: '3. Purpose of Data',
              intro: 'The collected information is used solely to:',
              items: [
                'Respond to your inquiries or booking requests.',
                'Create quotes for corporate services.',
              ],
              highlight:
                'Privacy Commitment: Your data is never sold, rented, or used for advertising/marketing purposes. We will not send you newsletters without your explicit consent.',
            },
            retention: {
              title: '4. Data Retention',
              items: [
                'Contact inquiries: 12 months after the last communication.',
                'Billing data (if applicable): 10 years (legal obligation).',
              ],
            },
            processors: {
              title: '5. Technical Service Providers',
              intro:
                'To ensure site functionality, technical data may be processed by our trusted providers:',
              items: [
                'Fly.io & Neon: Server hosting and database.',
                'Cloudinary: Media management.',
                'Cloudflare: Site security and delivery (CDN).',
              ],
            },
            rights: {
              title: '6. Your Rights',
              body: 'In accordance with GDPR, you have the right to access, rectify, and delete your data. To exercise this right, contact us at: [YOUR EMAIL].',
            },
          },
        },
        cookies: {
          title: 'Cookie Policy',
          sections: {
            what: {
              title: '1. What is a cookie?',
              body: 'A cookie is a small text file placed on your device when visiting a website.',
            },
            used: {
              title: '2. Cookies used on this site',
              intro:
                'We prioritize a minimalist approach that respects your privacy.',
              items: [
                'Strictly Necessary Cookies: Essential for technical operation (e.g., CSRF security, Cloudflare load balancing). These cannot be disabled.',
                'Preference Cookies: Used to remember your language choice (French/English).',
                'Third-Party Cookies: Embedded content (like Cloudinary images) may use technical trackers to optimize display.',
              ],
            },
            ads: {
              title: '3. No Advertising Cookies',
              body: 'This website does not use advertising cookies or intrusive commercial tracking.',
            },
            consent: {
              title: '4. Consent Management',
              body: 'You can configure your browser to refuse all cookies, though this may affect the functionality of certain parts of the site (such as contact forms).',
            },
          },
        },
        terms: {
          title: 'Terms and Conditions',
          sections: {
            object: {
              title: '1. Object',
              body: 'These terms govern the sale of wellness massage services offered by La Serenity.',
            },
            nature: {
              title: '2. Nature of Services',
              body: 'The massages offered are strictly for wellness and relaxation purposes. They have no therapeutic, medical, or physiotherapeutic aim and are not a substitute for medical treatment.',
            },
            pricing: {
              title: '3. Pricing and Payment',
              body: 'Prices are indicated in Euros (€) on the "Services" page. Payment is made [TO BE COMPLETED - e.g., on-site via cash or card].',
            },
            cancellation: {
              title: '4. Appointments and Cancellation',
              items: [
                'Lateness: Delays of more than [15] minutes may result in a reduced session time or cancellation.',
                'Cancellation: Cancellations must be made at least [24 or 48] hours in advance. Missed appointments or late cancellations may be charged.',
              ],
            },
            vouchers: {
              title: '5. Gift Vouchers',
              body: 'Gift vouchers are valid for [X] months from the date of purchase. They are non-refundable and cannot be exchanged for cash.',
            },
            contraindications: {
              title: '6. Contre-indications',
              body: 'Le client s’engage à informer le praticien de tout problème de santé, allergie, ou grossesse avant le début de la séance. Le praticien se réserve le droit de refuser une prestation en cas de contre-indication médicale.',
            },
          },
        },
        accessibility: {
          title: 'Accessibility Statement',
          sections: {
            commitment: {
              title: 'Commitment',
              body: 'La Serenity is committed to making its website accessible to the widest possible audience, regardless of physical or cognitive ability.',
            },
            standard: {
              title: 'Technical Standard',
              intro:
                'This site was built using modern technologies (React, semantic HTML) following WCAG (Web Content Accessibility Guidelines) best practices:',
              items: [
                'Optimized color contrast.',
                'Screen-reader friendly navigation.',
                'Alternative text for images.',
              ],
            },
            feedback: {
              title: 'Feedback',
              body: 'If you encounter any navigation barriers, please contact us so we can assist you: [YOUR EMAIL].',
            },
          },
        },
      },
      review: {
        trigger: 'Leave a review',
        title: 'Leave a review',
        subtitle: 'Share your experience with our services',
        close: 'Close',
        rating: {
          label: 'Your rating',
          required: '*',
          star: 'star',
          stars: 'stars',
        },
        form: {
          name: 'Your name',
          namePlaceholder: 'John Smith',
          email: 'Email (optional)',
          emailPlaceholder: 'john@example.com',
          emailHelp: 'To contact you if needed',
          text: 'Your review',
          textPlaceholder: 'Tell us about your experience...',
          characters: 'characters',
          submit: 'Submit review',
          submitting: 'Submitting...',
          notice: 'Your review will be published after validation by our team',
          gdpr: {
            title: 'Privacy notice',
            text: 'Your review will be stored in our system for moderation. We only collect the information you provide (name, optional email, and review text) to display your testimonial. Your email will not be published or shared.',
          },
        },
        validation: {
          required: 'Please fill in all required fields',
          tooShort: 'Your review must contain at least 10 characters',
        },
        success: 'Thank you! Your review will be published after validation.',
        error: 'An error occurred while sending',
      },
      testimonials: {
        label: 'Client stories',
        title: 'What our clients say',
        subtitle: 'Discover testimonials from our satisfied clients',
        reply: 'Reply',
        modal: {
          close: 'Close modal',
          discussion: 'Discussion',
          earlier: 'Earlier',
          empty: 'No replies yet. Be the first to respond!',
          error: 'Error submitting reply',
          successTitle: 'Thank you for your reply!',
          successMessage: 'It has been sent for moderation.',
          writeAnother: 'Write another',
          form: {
            title: 'Join the conversation',
            namePlaceholder: 'Your Name',
            emailPlaceholder: 'Email (Private)',
            textPlaceholder: 'Write your response...',
            submit: 'Post Reply',
            submitting: 'Sending...',
          },
        },
      },
      cookie: {
        intro:
          'We use essential cookies to run this site. With your consent, we can also enable:',
        mediaTitle: 'Third-party media (Cloudinary)',
        mediaDesc:
          'Enables Cloudinary images/videos (may set third-party cookies).',
        analyticsTitle: 'Analytics',
        analyticsDesc:
          'Loads the analytics tool if configured (none by default).',
        learnMore: 'Learn more',
        customize: 'Customize',
        hideOptions: 'Hide options',
        essentials: 'Essential',
        alwaysOn: 'Always on',
        decline: 'Decline non-essential',
        acceptAll: 'Accept all',
        save: 'Save choices',
      },
      gift: {
        trigger: 'Offer a Gift',
        title: 'Give the Gift of Relaxation',
        subtitle: 'Send a personalized massage voucher instantly.',
        paymentNotice:
          'Online payment is coming soon. For now, vouchers are sent by email and paid directly at the appointment.',
        form: {
          purchaserSection: 'Your Details',
          recipientSection: 'Recipient Details',
          purchaserName: 'Your Name',
          purchaserEmail: 'Your Email',
          recipientName: "Recipient's Name",
          recipientEmail: "Recipient's Email",
          message: 'Personal Message',
          messagePlaceholder: 'Happy Birthday! Enjoy a moment of peace...',
          date: 'Preferred Date (Optional)',
          submit: 'Send Gift Voucher',
          sending: 'Generating Voucher...',
          successTitle: 'Voucher Sent!',
          successMessage:
            'We have emailed the voucher to the recipient and a copy to you.',
          codeLabel: 'Voucher Code:',
          close: 'Close',
          purchaserNamePlaceholder: 'Jane Doe',
          purchaserEmailPlaceholder: 'jane@example.com',
          recipientNamePlaceholder: 'Recipient name',
          recipientEmailPlaceholder: 'recipient@example.com',
        },
        validation: {
          required: 'Required field',
          email: 'Invalid email address',
        },
      },
    },
  },
  fr: {
    translation: {
      nav: {
        about: 'À propos',
        services: 'Services',
        corporate: 'Entreprises',
        booking: 'Réserver',
        contact: 'Contact',
      },
      hero: {
        title: 'Trouvez votre équilibre',
        subtitle: 'Massage bien-être premium dans un cadre serein et privé',
        cta: 'Réserver votre séance',
        ctaPrivate: 'Réserver une séance individuelle',
        ctaCorporate: 'Demande bien-être en entreprise',
      },
      about: {
        title: 'À propos de moi',
        subtitle: 'Dédiée à votre bien-être',
        intro:
          "Avec plus de 10 ans d'expérience en massage professionnel, je me spécialise dans la création d'expériences de bien-être personnalisées qui restaurent l'équilibre et favorisent la guérison.",
        certification: 'Praticienne professionnelle certifiée en bien-être',
        approach: 'Mon approche',
        approachText:
          'Chaque corps est unique. Je combine des techniques traditionnelles avec des soins intuitifs pour répondre à vos besoins spécifiques, que vous recherchiez la relaxation, le soulagement de la douleur ou un travail de bien-être plus profond.',
        specialties: 'Spécialités',
        specialty1: 'Thérapie tissus profonds',
        specialty2: 'Relaxation suédoise',
        specialty3: 'Récupération sportive',
        specialty4: 'Soins prénatals',
        cta: 'Réserver une séance',
        studioDescription:
          'Vivez un environnement calme, sécurisant et bienveillant, pensé pour votre confort et votre guérison.',
        label: 'À propos de moi',
        guidesTitle: 'Ce qui me guide',
        guide: {
          clientCareTitle: 'Un accompagnement centré sur vous',
          clientCareBody:
            'Votre confort, votre sécurité et vos objectifs sont ma priorité.',
          excellenceTitle: 'Excellence professionnelle',
          excellenceBody:
            'Je suis pleinement certifiée et engagée dans une formation continue.',
          holisticTitle: 'Approche holistique',
          holisticBody:
            'Je prends en compte la personne dans sa globalité : corps, esprit et émotionnel.',
        },
        certificationLabel: 'Certifiée',
        studioTitle: 'Mon cabinet privé',
        studioLocationTitle: 'Emplacement du cabinet privé',
        byAppointment: 'Uniquement sur rendez-vous',
        contactTitle: 'Contact par e-mail via le formulaire de réservation',
        approachLabel: 'Mon approche',
        approachHeading: 'Un accompagnement bien-être personnalisé',
        mapTitle: 'Zone du cabinet – 5 Avenues, 13004 Marseille',
        mapDescription:
          'La carte indique la zone des 5 Avenues dans le 4ᵉ arrondissement de Marseille.',
        mapPrivacy:
          'La confidentialité et la discrétion de la clientèle sont toujours respectées.',
        mapCollapsedTitle: 'Emplacement du cabinet privé',
        mapCollapsedSubtitle: 'Uniquement sur rendez-vous',
        mapHintHover: 'Survolez pour agrandir la carte',
        mapHintScroll: 'Faites défiler pour afficher la carte',
        mapPreview: 'Voir la carte',
      },
      services: {
        title: 'Services',
        subtitle: 'Massage bien-être adapté à vos besoins',
        slide: 'GLISSER',
        mostPopular: 'Le plus populaire',
      },
      corp: {
        subjectPrefix: 'Demande Entreprise / Événement',
        form: {
          name: 'Nom complet',
          email: 'Email',
          phone: 'Téléphone',
          company: 'Entreprise / Organisation',
          eventType: "Type d'événement",
          attendees: 'Participants estimés',
          duration: 'Horaires / durée',
          date: 'Date',
          endDate: 'Date de fin (optionnel)',
          location: 'Lieu / adresse',
          'location.placeholder': "Adresse de l'entreprise ou du lieu",
          services: 'Prestations souhaitées',
          'services.placeholder':
            'Massage assis, rotations 10 min, 2 praticiens…',
          budget: 'Budget (optionnel)',
          notes: 'Informations complémentaires',
          'notes.placeholder':
            "Ambiance / espace disponible, parking, badges d'accès, etc.",
          moreDetailsLabel: 'Détails supplémentaires (optionnel)',
          optional: '(optionnel)',
          send: 'Demander un devis',
          sending: 'Envoi…',
          success: 'Votre demande a bien été envoyée ✨',
          error: "Impossible d'envoyer votre demande. Réessayez.",
          notice: 'Réponse sous un jour ouvré pour les demandes entreprises.',
          gdpr: {
            title: 'Confidentialité',
            text: 'Ce formulaire envoie votre demande par e-mail. Nous ne stockons pas vos données ; elles servent uniquement à vous répondre.',
          },
          validation: {
            nameRequired: 'Le nom est requis',
            nameTooShort: 'Le nom est trop court',
            emailRequired: "L'email est requis",
            emailInvalid: 'Email invalide',
            companyRequired: "Le nom de l'entreprise est requis",
            attendeesNumber: 'Entrez un nombre',
            attendeesMin: 'Au moins 1 participant',
          },
          eventTypes: {
            corporate: 'Bien-être en entreprise',
            team: 'Journée équipe / offsite',
            expo: 'Salon / stand / expo',
            private: 'Événement privé',
            other: 'Autre',
          },
          placeholders: {
            name: 'Marie Dupont',
            email: 'marie@entreprise.fr',
            phone: '+33 6 00 00 00 00',
            company: 'Acme SAS',
            attendees: '25',
            duration: '09:00–17:00 ou 3h',
            budget: '500–1500 €',
          },
          emailLines: {
            contact: 'Contact',
            company: 'Entreprise',
            eventType: "Type d'événement",
            attendees: 'Participants',
            date: 'Date',
            duration: 'Horaires / durée',
            location: 'Lieu',
            services: 'Prestations souhaitées',
            budget: 'Budget',
            notes: 'Notes',
            dash: '-',
            arrow: '→',
          },
        },
      },
      booking: {
        title: 'Réserver votre séance',
        subtitle: 'Sélectionnez votre horaire et service préférés',
        form: {
          name: 'Nom complet',
          email: 'Adresse email',
          phone: 'Numéro de téléphone',
          service: 'Sélectionner un service',
          date: 'Date souhaitée',
          time: 'Heure souhaitée',
          notes: 'Demandes spéciales (optionnel)',
          submit: 'Confirmer la réservation',
        },
      },
      contact: {
        form: {
          title: 'Formulaire de contact',
          name: 'Nom complet',
          email: 'Adresse email',
          phone: 'Téléphone',
          subject: 'Sujet',
          message: 'Message',
          optional: '(optionnel)',
          send: 'Envoyer le message',
          sending: 'Envoi en cours...',
          success: 'Message envoyé avec succès ! ✨',
          error: "Erreur lors de l'envoi. Veuillez réessayer.",
          notice:
            'Je vous répondrai dans les plus brefs délais pendant les heures ouvrables.',
          'subject.placeholder': 'Demande de rendez-vous',
          'message.placeholder':
            'Décrivez vos besoins, vos préférences de date/heure, ou toute question que vous pourriez avoir...',
          validation: {
            nameRequired: 'Le nom est requis',
            nameTooShort: 'Le nom est trop court',
            emailRequired: "L'email est requis",
            emailInvalid: 'Email invalide',
            subjectRequired: 'Le sujet est requis',
            messageRequired: 'Le message est requis',
            messageTooShort: 'Le message est trop court',
          },
          gdpr: {
            title: 'Avis de confidentialité',
            text: 'Ce formulaire de contact envoie votre message directement par e-mail. Nous ne collectons, ne stockons ni ne traitons aucune donnée personnelle. Vos informations sont uniquement utilisées pour répondre à votre demande.',
          },
        },
      },
      footer: {
        tagline:
          'Massage professionnel relaxant et bien-être holistique au cœur de Marseille.',
        addressFull: '5 Avenues, 13004 Marseille, France',
        info: 'Informations',
        legalNotice: 'Mentions légales',
        privacy: 'Politique de confidentialité',
        cgv: 'CGV',
        cookies: 'Gestion des cookies',
        contactTitle: 'Nous contacter',
        email: 'contact@serenity-massage.fr',
        hours: 'Horaires',
        hoursValue: 'Lun–Sam : 9:00–19:00',
        allRights: 'Tous droits réservés.',
        designedBy: 'Site réalisé par',
      },
      legalPages: {
        legal: {
          title: 'Mentions Légales',
          sections: {
            publisher: {
              title: '1. Éditeur du site',
              intro: 'Le site internet La Serenity est édité par :',
              items: [
                "Nom de l'entreprise : [À COMPLÉTER - Ex: Sophie Martin EI]",
                "Statut Juridique : [À COMPLÉTER - Ex: Entreprise Individuelle en cours d'immatriculation]",
                "Siège social : [À COMPLÉTER - Ex: 12 Rue de la République, 13001 Marseille]",
                'SIRET : [EN COURS D’ATTRIBUTION]',
                'Email de contact : [VOTRE EMAIL]',
                'Téléphone : [VOTRE TÉLÉPHONE - Optionnel]',
              ],
            },
            hosting: {
              title: '2. Hébergement',
              intro:
                'Le site est hébergé sur une architecture cloud distribuée :',
              items: [
                'Backend & Base de données : Fly.io (Chicago, IL, USA) et Neon.tech.',
                'Frontend & CDN : Cloudflare Inc. (San Francisco, CA, USA).',
              ],
              outro:
                'Les données sont stockées de manière sécurisée et les fournisseurs adhèrent aux normes de sécurité internationales.',
            },
            ip: {
              title: '3. Propriété Intellectuelle',
              body: 'L’ensemble de ce site relève de la législation française et internationale sur le droit d’auteur et la propriété intellectuelle. Tous les droits de reproduction sont réservés, y compris pour les documents téléchargeables et les représentations iconographiques et photographiques.',
            },
          },
        },
        privacy: {
          title: 'Politique de Confidentialité',
          sections: {
            controller: {
              title: '1. Responsable du traitement',
              body: "Le responsable du traitement des données est [NOM DU PRATICIEN OU DE L'ENTREPRISE].",
            },
            data: {
              title: '2. Données collectées',
              intro:
                'Nous collectons uniquement les données strictement nécessaires au traitement de votre demande via nos formulaires (Contact et Entreprise) :',
              items: [
                'Nom et Prénom',
                'Adresse email',
                'Numéro de téléphone',
                "Détails de l'événement (pour les demandes entreprises)",
              ],
            },
            purpose: {
              title: '3. Finalité des données',
              intro: 'Les informations recueillies ne sont utilisées que pour :',
              items: [
                "Répondre à vos demandes d'informations ou de rendez-vous.",
                'Établir des devis pour les prestations entreprises.',
              ],
              highlight:
                'Engagement de confidentialité : Vos données ne sont jamais vendues, louées ou utilisées à des fins publicitaires ou marketing par des tiers. Nous ne vous enverrons pas de newsletter sans votre consentement explicite.',
            },
            retention: {
              title: '4. Durée de conservation',
              items: [
                'Formulaire de contact : 12 mois après le dernier échange.',
                'Données de facturation (si applicable) : 10 ans (obligation légale).',
              ],
            },
            processors: {
              title: '5. Destinataires des données (Sous-traitants techniques)',
              intro:
                'Pour assurer le bon fonctionnement du site, certaines données techniques transitent par nos prestataires de confiance :',
              items: [
                'Fly.io & Neon : Hébergement du serveur et base de données.',
                'Cloudinary : Gestion des médias.',
                'Cloudflare : Sécurisation et distribution du site (CDN).',
              ],
            },
            rights: {
              title: '6. Vos droits',
              body: 'Conformément au RGPD, vous disposez d’un droit d’accès, de rectification et de suppression de vos données. Pour exercer ce droit, contactez-nous à : [VOTRE EMAIL].',
            },
          },
        },
        cookies: {
          title: 'Gestion des Cookies',
          sections: {
            what: {
              title: "1. Qu'est-ce qu'un cookie ?",
              body: "Un cookie est un petit fichier texte déposé sur votre terminal lors de la visite d'un site.",
            },
            used: {
              title: '2. Cookies utilisés sur ce site',
              intro:
                'Nous privilégions une approche minimaliste respectueuse de votre vie privée.',
              items: [
                'Cookies strictement nécessaires : Indispensables au fonctionnement technique (ex: sécurité CSRF, équilibrage de charge via Cloudflare). Ces cookies ne peuvent pas être désactivés.',
                'Cookies de préférence : Utilisés pour mémoriser votre choix de langue (Français/Anglais).',
                'Cookies tiers : Certains contenus intégrés (comme les images Cloudinary) peuvent déposer des traceurs techniques pour optimiser l’affichage.',
              ],
            },
            ads: {
              title: '3. Absence de cookies publicitaires',
              body: "Ce site n'utilise pas de cookies publicitaires ou de traçage commercial intrusif.",
            },
            consent: {
              title: '4. Gestion du consentement',
              body: 'Vous pouvez configurer votre navigateur pour refuser tous les cookies, mais cela pourrait altérer le fonctionnement de certaines parties du site (comme les formulaires de contact).',
            },
          },
        },
        terms: {
          title: 'Conditions Générales de Vente (CGV)',
          sections: {
            object: {
              title: '1. Objet',
              body: 'Les présentes conditions régissent la vente de prestations de massage bien-être proposées par La Serenity.',
            },
            nature: {
              title: '2. Nature des prestations',
              body: 'Les massages proposés sont des soins de bien-être et de relaxation, sans aucune visée thérapeutique, médicale ou kinésithérapeutique. Ils ne se substituent en aucun cas à un traitement médical.',
            },
            pricing: {
              title: '3. Tarifs et Paiement',
              body: 'Les tarifs sont indiqués en euros (€) sur la page "Services" du site. Le paiement s’effectue [À COMPLÉTER - ex: sur place en espèces ou carte bancaire / ou virement en amont].',
            },
            cancellation: {
              title: '4. Rendez-vous et Annulation',
              items: [
                'Retards : Tout retard de plus de [15] minutes pourra entraîner la réduction de la durée du soin ou son annulation.',
                'Annulation : Toute annulation doit être effectuée au moins [24 ou 48] heures à l’avance. Tout rendez-vous non honoré ou annulé hors délai est dû.',
              ],
            },
            vouchers: {
              title: '5. Bons Cadeaux',
              body: 'Les bons cadeaux sont valables [X] mois à compter de la date d’achat. Ils ne sont ni remboursables ni échangeables contre de l’argent.',
            },
            contraindications: {
              title: '6. Contre-indications',
              body: 'Le client s’engage à informer le praticien de tout problème de santé, allergie, ou grossesse avant le début de la séance. Le praticien se réserve le droit de refuser une prestation en cas de contre-indication médicale.',
            },
          },
        },
        accessibility: {
          title: "Déclaration d'Accessibilité",
          sections: {
            commitment: {
              title: 'Engagement',
              body: 'La Serenity s’engage à rendre son site internet accessible au plus grand nombre, quelles que soient les capacités physiques ou cognitives.',
            },
            standard: {
              title: 'Standard Technique',
              intro:
                'Ce site a été développé avec des technologies modernes (React, HTML sémantique) en suivant les bonnes pratiques WCAG (Web Content Accessibility Guidelines) :',
              items: [
                'Contraste des couleurs optimisé.',
                'Navigation compatible avec les lecteurs d’écran.',
                'Textes alternatifs pour les images.',
              ],
            },
            feedback: {
              title: 'Retour d’information',
              body: 'Si vous rencontrez un obstacle à la navigation, veuillez nous contacter afin que nous puissions vous assister : [VOTRE EMAIL].',
            },
          },
        },
      },
      review: {
        trigger: 'Laisser un avis',
        title: 'Laissez un avis',
        subtitle: 'Partagez votre expérience avec nos services',
        close: 'Fermer',
        rating: {
          label: 'Votre note',
          required: '*',
          star: 'étoile',
          stars: 'étoiles',
        },
        form: {
          name: 'Votre nom',
          namePlaceholder: 'Marie Dupont',
          email: 'Email (optionnel)',
          emailPlaceholder: 'marie@example.com',
          emailHelp: 'Pour vous recontacter si besoin',
          text: 'Votre avis',
          textPlaceholder: 'Parlez-nous de votre expérience...',
          characters: 'caractères',
          submit: "Soumettre l'avis",
          submitting: 'Envoi en cours...',
          notice: 'Votre avis sera publié après validation par notre équipe',
          gdpr: {
            title: 'Avis de confidentialité',
            text: 'Votre avis sera stocké dans notre système pour modération. Nous ne collectons que les informations que vous fournissez (nom, email optionnel et texte) pour afficher votre témoignage. Votre email ne sera pas publié ni partagé.',
          },
        },
        validation: {
          required: 'Veuillez remplir tous les champs obligatoires',
          tooShort: 'Votre avis doit contenir au moins 10 caractères',
        },
        success: 'Merci ! Votre avis sera publié après validation.',
        error: "Une erreur s'est produite lors de l'envoi",
      },
      testimonials: {
        label: 'Témoignages clients',
        title: 'Ce que disent nos clients',
        subtitle: 'Découvrez les témoignages de nos clients satisfaits',
        reply: 'Répondre',
        modal: {
          close: 'Fermer',
          discussion: 'Discussion',
          earlier: 'Précédemment',
          empty: 'Aucune réponse pour le moment. Soyez le premier à répondre !',
          error: "Erreur lors de l'envoi de la réponse",
          successTitle: 'Merci pour votre réponse !',
          successMessage: 'Elle a été envoyée pour modération.',
          writeAnother: 'En écrire une autre',
          form: {
            title: 'Rejoindre la conversation',
            namePlaceholder: 'Votre nom',
            emailPlaceholder: 'Email (Privé)',
            textPlaceholder: 'Écrivez votre réponse...',
            submit: 'Publier',
            submitting: 'Envoi...',
          },
        },
      },
      cookie: {
        intro:
          'Nous utilisons des cookies essentiels pour faire fonctionner ce site. Avec votre accord, nous pouvons également activer :',
        mediaTitle: 'Médias tiers (Cloudinary)',
        mediaDesc:
          'Active les images/vidéos Cloudinary (peut définir des cookies tiers).',
        analyticsTitle: "Mesure d'audience",
        analyticsDesc:
          "Chargera l'outil d'analyse si présent (aucun par défaut).",
        learnMore: 'En savoir plus',
        customize: 'Personnaliser',
        hideOptions: 'Masquer les options',
        essentials: 'Essentiels',
        alwaysOn: 'Toujours actifs',
        decline: 'Refuser non-essentiels',
        acceptAll: 'Tout accepter',
        save: 'Enregistrer les choix',
      },
      gift: {
        trigger: 'Offrir un cadeau',
        title: 'Offrez le Cadeau de la Détente',
        subtitle: 'Envoyez un bon cadeau personnalisé instantanément.',
        paymentNotice:
          'Le paiement en ligne arrive bientôt. Pour le moment, les bons sont envoyés par e-mail et le paiement se fait directement lors du rendez-vous.',
        form: {
          purchaserSection: 'Vos Coordonnées',
          recipientSection: 'Destinataire',
          purchaserName: 'Votre Nom',
          purchaserEmail: 'Votre Email',
          recipientName: 'Nom du Destinataire',
          recipientEmail: 'Email du Destinataire',
          message: 'Message Personnel',
          messagePlaceholder: 'Joyeux anniversaire ! Profite de ce moment...',
          date: 'Date Préférée (Optionnel)',
          submit: 'Envoyer le Bon Cadeau',
          sending: 'Génération...',
          successTitle: 'Bon Envoyé !',
          successMessage:
            'Nous avons envoyé le bon au destinataire et une copie à vous.',
          codeLabel: 'Code du Bon :',
          close: 'Fermer',
          purchaserNamePlaceholder: 'Marie Dupont',
          purchaserEmailPlaceholder: 'marie@example.com',
          recipientNamePlaceholder: 'Nom du destinataire',
          recipientEmailPlaceholder: 'destinataire@example.com',
        },
        validation: {
          required: 'Champ requis',
          email: 'Email invalide',
        },
      },
    },
  },
}

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr',
    interpolation: { escapeValue: false },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18next
