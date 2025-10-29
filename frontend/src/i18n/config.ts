import i18next from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'

const resources = {
  en: {
    translation: {
      nav: {
        about: 'About',
        services: 'Services',
        booking: 'Book Now',
        contact: 'Contact',
      },
      hero: {
        title: 'Find Your Balance',
        subtitle: 'Premium therapeutic massage in a serene, private setting',
        cta: 'Book Your Session',
      },
      about: {
        title: 'About Me',
        subtitle: 'Dedicated to Your Wellness Journey',
        intro:
          'With over 10 years of experience in therapeutic massage, I specialize in creating personalized wellness experiences that restore balance and promote healing.',
        certification: 'Certified Professional Massage Therapist',
        approach: 'My Approach',
        approachText:
          'Every body is unique. I combine traditional techniques with intuitive care to address your specific needs, whether you seek relaxation, pain relief, or deeper therapeutic work.',
        specialties: 'Specialties',
        specialty1: 'Deep Tissue Therapy',
        specialty2: 'Swedish Relaxation',
        specialty3: 'Sports Recovery',
        specialty4: 'Prenatal Care',
      },
      services: {
        title: 'Our Services',
        subtitle: 'Therapeutic massage tailored to your needs',
        swedish: {
          title: 'Swedish Massage',
          description:
            'Relaxing full-body massage using gentle, flowing strokes to ease tension and promote overall wellness.',
          duration: '60 min',
          price: '€80',
        },
        deep: {
          title: 'Deep Tissue',
          description:
            'Targeted therapy focusing on deeper muscle layers to release chronic tension and knots.',
          duration: '90 min',
          price: '€110',
        },
        therapeutic: {
          title: 'Therapeutic',
          description:
            'Customized treatment combining techniques to address specific concerns and restore balance.',
          duration: '75 min',
          price: '€95',
        },
        prenatal: {
          title: 'Prenatal Care',
          description:
            'Gentle, supportive massage designed for expectant mothers to ease discomfort and promote relaxation.',
          duration: '60 min',
          price: '€85',
        },
      },
      booking: {
        title: 'Book Your Session',
        subtitle: 'Select your preferred time and service',
        form: {
          name: 'Full Name',
          email: 'Email Address',
          phone: 'Phone Number',
          service: 'Select Service',
          date: 'Preferred Date',
          time: 'Preferred Time',
          notes: 'Special Requests (optional)',
          submit: 'Confirm Booking',
        },
      },
      contact: {
        form: {
          title: 'Contact Form',
          name: 'Full Name',
          email: 'Email Address',
          phone: 'Phone Number',
          subject: 'Subject',
          message: 'Message',
          optional: '(optional)',
          send: 'Send Message',
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
        },
      },
      footer: {
        tagline: 'Premium therapeutic massage services',
        hours: 'Hours',
        hoursText: 'By appointment only',
        contact: 'Contact',
        email: 'contact@serenity-massage.fr',
        phone: '+33 6 00 00 00 00',
        rights: 'All rights reserved',
      },
      review: {
        trigger: 'Leave a Review',
        title: 'Leave a Review',
        subtitle: 'Share your experience with our services',
        close: 'Close',
        rating: {
          label: 'Your Rating',
          required: '*',
          star: 'star',
          stars: 'stars',
        },
        form: {
          name: 'Your Name',
          namePlaceholder: 'John Smith',
          email: 'Email (optional)',
          emailPlaceholder: 'john@example.com',
          emailHelp: 'To contact you if needed',
          text: 'Your Review',
          textPlaceholder: 'Tell us about your experience...',
          characters: 'characters',
          submit: 'Submit Review',
          submitting: 'Submitting...',
          notice: 'Your review will be published after validation by our team',
        },
        validation: {
          required: 'Please fill in all required fields',
          tooShort: 'Your review must contain at least 10 characters',
        },
        success: 'Thank you! Your review will be published after validation.',
        error: 'An error occurred while sending',
      },
      testimonials: {
        title: 'What Our Clients Say',
        subtitle: 'Discover testimonials from our satisfied clients',
      },
    },
  },
  fr: {
    translation: {
      nav: {
        about: 'À Propos',
        services: 'Services',
        booking: 'Réserver',
        contact: 'Contact',
      },
      hero: {
        title: 'Trouvez Votre Équilibre',
        subtitle: 'Massage thérapeutique premium dans un cadre serein et privé',
        cta: 'Réserver Votre Séance',
      },
      about: {
        title: 'À Propos de Moi',
        subtitle: 'Dédiée à Votre Bien-Être',
        intro:
          "Avec plus de 10 ans d'expérience en massage thérapeutique, je me spécialise dans la création d'expériences de bien-être personnalisées qui restaurent l'équilibre et favorisent la guérison.",
        certification: 'Massothérapeute Professionnelle Certifiée',
        approach: 'Mon Approche',
        approachText:
          'Chaque corps est unique. Je combine des techniques traditionnelles avec des soins intuitifs pour répondre à vos besoins spécifiques, que vous recherchiez la relaxation, le soulagement de la douleur ou un travail thérapeutique plus profond.',
        specialties: 'Spécialités',
        specialty1: 'Thérapie Tissus Profonds',
        specialty2: 'Relaxation Suédoise',
        specialty3: 'Récupération Sportive',
        specialty4: 'Soins Prénatals',
      },
      services: {
        title: 'Nos Services',
        subtitle: 'Massage thérapeutique adapté à vos besoins',
        swedish: {
          title: 'Massage Suédois',
          description:
            'Massage complet du corps relaxant utilisant des mouvements doux et fluides pour soulager les tensions.',
          duration: '60 min',
          price: '€80',
        },
        deep: {
          title: 'Tissus Profonds',
          description:
            'Thérapie ciblée se concentrant sur les couches musculaires profondes pour libérer les tensions chroniques.',
          duration: '90 min',
          price: '€110',
        },
        therapeutic: {
          title: 'Thérapeutique',
          description:
            'Traitement personnalisé combinant des techniques pour répondre à vos besoins spécifiques.',
          duration: '75 min',
          price: '€95',
        },
        prenatal: {
          title: 'Soins Prénatals',
          description:
            "Massage doux et bienveillant conçu pour les futures mamans afin de soulager l'inconfort.",
          duration: '60 min',
          price: '€85',
        },
      },
      booking: {
        title: 'Réservez Votre Séance',
        subtitle: 'Sélectionnez votre horaire et service préférés',
        form: {
          name: 'Nom Complet',
          email: 'Adresse Email',
          phone: 'Numéro de Téléphone',
          service: 'Choisir un Service',
          date: 'Date Souhaitée',
          time: 'Heure Souhaitée',
          notes: 'Demandes Spéciales (optionnel)',
          submit: 'Confirmer la Réservation',
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
          success: 'Message envoyé avec succès! ✨',
          error: "Erreur lors de l'envoi. Veuillez réessayer.",
          notice: "Je vous répondrai dans les plus brefs délais pendant les heures ouvrables.",
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
        },
      },
      footer: {
        tagline: 'Services de massage thérapeutique premium',
        hours: 'Horaires',
        hoursText: 'Sur rendez-vous uniquement',
        contact: 'Contact',
        email: 'contact@serenity-massage.fr',
        phone: '+33 6 00 00 00 00',
        rights: 'Tous droits réservés',
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
        },
        validation: {
          required: 'Veuillez remplir tous les champs obligatoires',
          tooShort: 'Votre avis doit contenir au moins 10 caractères',
        },
        success: 'Merci ! Votre avis sera publié après validation.',
        error: "Une erreur s'est produite lors de l'envoi",
      },
      testimonials: {
        title: 'Ce Que Disent Nos Clients',
        subtitle: 'Découvrez les témoignages de nos clients satisfaits',
      },
    },
  },
}

i18next
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'fr', // Default to French for France
    interpolation: {
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
    },
  })

export default i18next
