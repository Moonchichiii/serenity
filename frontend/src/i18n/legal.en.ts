export const legalEn = {
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
        intro: 'The website is hosted on a distributed cloud architecture:',
        items: [
          'Backend & Database: Fly.io and Neon.tech.',
          'Frontend & CDN: Cloudflare Inc.',
        ],
        outro: 'Data is stored securely, and providers adhere to international security standards.',
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
        intro: 'We collect only the data strictly necessary to process your request via our forms (Contact and Corporate):',
        items: ['Name', 'Email address', 'Phone number', 'Event details (for corporate inquiries)'],
      },
      purpose: {
        title: '3. Purpose of Data',
        intro: 'The collected information is used solely to:',
        items: ['Respond to your inquiries or booking requests.', 'Create quotes for corporate services.'],
        highlight: 'Privacy Commitment: Your data is never sold, rented, or used for advertising/marketing purposes. We will not send you newsletters without your explicit consent.',
      },
      retention: {
        title: '4. Data Retention',
        items: ['Contact inquiries: 12 months after the last communication.', 'Billing data (if applicable): 10 years (legal obligation).'],
      },
      processors: {
        title: '5. Technical Service Providers',
        intro: 'To ensure site functionality, technical data may be processed by our trusted providers:',
        items: ['Fly.io & Neon: Server hosting and database.', 'Cloudinary: Media management.', 'Cloudflare: Site security and delivery (CDN).'],
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
        intro: 'We prioritize a minimalist approach that respects your privacy.',
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
      object: { title: '1. Object', body: 'These terms govern the sale of wellness massage services offered by La Serenity.' },
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
        intro: 'This site was built using modern technologies (React, semantic HTML) following WCAG (Web Content Accessibility Guidelines) best practices:',
        items: ['Optimized color contrast.', 'Screen-reader friendly navigation.', 'Alternative text for images.'],
      },
      feedback: { title: 'Feedback', body: 'If you encounter any navigation barriers, please contact us so we can assist you: [YOUR EMAIL].' },
    },
  },
};
