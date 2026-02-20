/* Serenity dashboard translations + language toggle (scoped to #serenity-app) */

document.addEventListener("DOMContentLoaded", () => {
  const root = document.getElementById("serenity-app");
  if (!root) return;

  const COPY = {
    en: {
      welcome: "Welcome to Serenity CMS",
      subtitle:
        "Edit your website content by section. Select a card to jump directly to what you want to change.",
      sections: {
        hero: {
          title: "Hero Section",
          desc:
            "The first thing visitors see - your main headline and tagline at the top of the page.",
          btn1: "Edit Hero",
        },
        about: {
          title: "About Section",
          desc: "Tell your story - introduce yourself, your approach, and your specialties.",
          btn1: "Edit About",
        },
        services: {
          title: "Services",
          desc: "Add, edit, or remove massage services.",
          btn1: "View & Edit Services",
          btn2: "Add Service",
        },
        servicesHero: {
          title: "Services Hero",
          desc:
            "Edit the corporate wellness hero: title, pricing, CTA, benefits, and background video.",
          btn1: "Edit Services Hero",
        },
        vouchers: {
          title: "Gift Vouchers",
          desc:
            "Manage gift vouchers year-round. View sold vouchers, verify codes, and update popup + email wording.",
          btn1: "Manage Vouchers",
          btn2: "Popup, Email & Form",
        },
        testimonials: {
          title: "Testimonials",
          desc: "Manage client reviews and ratings shown on your site.",
          btn1: "Manage Reviews",
          btn2: "Add Review",
        },
        replies: {
          title: "Review Replies",
          desc: "Approve or reject replies to testimonials.",
          btn1: "Manage Replies",
        },
        contact: {
          title: "Contact Info",
          desc: "Update your contact details shown in the footer and throughout the site.",
          btn1: "Edit Contact",
        },
      },
    },
    fr: {
      welcome: "Bienvenue sur Serenity CMS",
      subtitle:
        "Modifiez le contenu de votre site web par section. Sélectionnez une carte pour accéder directement.",
      sections: {
        hero: {
          title: "Section Héro",
          desc: "La première chose que les visiteurs voient — votre titre principal et slogan.",
          btn1: "Modifier Héro",
        },
        about: {
          title: "Section À Propos",
          desc: "Racontez votre histoire — présentez-vous, votre approche et vos spécialités.",
          btn1: "Modifier À Propos",
        },
        services: {
          title: "Services",
          desc: "Ajoutez, modifiez ou supprimez des services de massage.",
          btn1: "Voir & Modifier Services",
          btn2: "Ajouter Service",
        },
        servicesHero: {
          title: "Héro Services",
          desc:
            "Modifiez l'héro bien-être en entreprise : titre, prix, CTA, bénéfices et vidéo.",
          btn1: "Modifier Héro Services",
        },
        vouchers: {
          title: "Bons Cadeaux",
          desc:
            "Gérez les bons cadeaux toute l'année. Consultez les ventes et mettez à jour le popup + l'email.",
          btn1: "Gérer les Bons",
          btn2: "Popup, Email & Formulaire",
        },
        testimonials: {
          title: "Témoignages",
          desc: "Gérez les avis et notes des clients affichés sur votre site.",
          btn1: "Gérer Avis",
          btn2: "Ajouter Avis",
        },
        replies: {
          title: "Réponses aux Avis",
          desc: "Approuvez ou rejetez les réponses de la communauté.",
          btn1: "Gérer Réponses",
        },
        contact: {
          title: "Info Contact",
          desc: "Mettez à jour vos coordonnées affichées dans le pied de page.",
          btn1: "Modifier Contact",
        },
      },
    },
  };

  const storageKey = "serenity_lang";

  const getLang = () => {
    const raw = localStorage.getItem(storageKey);
    return raw === "fr" ? "fr" : "en";
  };

  const setLang = (lang) => localStorage.setItem(storageKey, lang);

  const txtWelcome = document.getElementById("txt-welcome");
  const txtSubtitle = document.getElementById("txt-subtitle");
  const langBtns = root.querySelectorAll(".sd-lang-opt");

  const fill = (lang) => {
    const D = COPY[lang];

    if (txtWelcome) txtWelcome.textContent = D.welcome;
    if (txtSubtitle) txtSubtitle.textContent = D.subtitle;

    langBtns.forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.lang === lang);
      btn.setAttribute("aria-pressed", btn.dataset.lang === lang ? "true" : "false");
    });

    root.querySelectorAll(".sd-card").forEach((card) => {
      const key = card.getAttribute("data-key");
      const c = D.sections[key];
      if (!c) return;

      const title = card.querySelector(".t-title");
      const desc = card.querySelector(".t-desc");
      if (title) title.textContent = c.title;
      if (desc) desc.textContent = c.desc;

      const btn1 = card.querySelector(".t-btn1");
      if (btn1) btn1.textContent = c.btn1;

      const btn2 = card.querySelector(".t-btn2");
      if (btn2) {
        if (c.btn2) {
          btn2.textContent = c.btn2;
          btn2.removeAttribute("hidden");
          btn2.style.display = "";
        } else {
          btn2.setAttribute("hidden", "hidden");
          btn2.style.display = "none";
        }
      }
    });
  };

  let lang = getLang();
  fill(lang);

  langBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const next = btn.dataset.lang === "fr" ? "fr" : "en";
      lang = next;
      setLang(lang);
      fill(lang);
    });
  });
});
