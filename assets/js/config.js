/* =========================================================
   RésuméKlinik — SITE SETTINGS
   ---------------------------------------------------------
   This is the ONE file to edit for everyday changes.
   Open it in Notepad, change the text between the quotes,
   save, and re-upload the folder to Netlify.

   Rules:
   - Keep the quotes "..." and the commas at the end of lines.
   - To hide a price and show "Request a quote", leave price as "".
   ========================================================= */

window.RK_CONFIG = {

  /* ---- Founder ----
     linkedin: paste your personal LinkedIn profile link to show
     "Follow" buttons on the About and Insights pages. */
  founder: {
    name: "Mayowa Olusesi",
    title: "Founder & Principal Consultant",
    linkedin: "https://www.linkedin.com/in/olusesimayowabastu"
  },

  /* ---- Contact details ---- */
  whatsapp: "2348081688328",          // Country code + number, no + or spaces (used when a message is pre-filled)
  whatsappLink: "https://wa.me/message/7ADQUNJIY4NDB1", // WhatsApp Business link for plain "Chat on WhatsApp" buttons
  email: "resumeklinik@gmail.com",
  cvFormUrl: "https://bit.ly/CVKlinik",
  location: "Lagos, Nigeria",

  /* ---- Social media links ---- */
  socials: {
    linkedin:  "https://linkedin.com/company/resumeklinik",
    instagram: "https://instagram.com/resumeklinik",
    facebook:  "https://facebook.com/resumeklinik",
    x:         "https://x.com/resumeklinik"
  },

  /* ---- Numbers shown in the dark stats band ----
     count: true makes the number animate upwards. */
  stats: [
    { value: 500,  suffix: "+", label: "CVs transformed",            count: true  },
    { value: 2018, suffix: "",  label: "Helping careers since",      count: false },
    { value: 7,    suffix: "+", label: "Years inside HR and consulting", count: true },
    { value: 12,   suffix: "",  label: "Sectors served",             count: true  }
  ],

  /* ---- Packages on the Services page and homepage ----
     price: "" shows "Request a quote". Example: price: "45,000" */
  currency: "₦",
  packages: [
    {
      id: "cv-writing",
      name: "CV Essentials",
      description: "A rewritten, ATS-friendly CV for professionals ready to apply.",
      price: "",
      unit: "per CV",
      features: [
        "Full CV rewrite from your career history",
        "Achievement-led, quantified bullet points",
        "ATS-friendly formatting",
        "Keywords matched to your target roles"
      ],
      featured: false
    },
    {
      id: "suite",
      name: "Career Document Suite",
      description: "Everything you need to apply with confidence, written as one story.",
      price: "",
      features: [
        "Everything in CV Essentials",
        "Tailored cover letter",
        "LinkedIn profile optimisation",
        "Professional summary and achievements addendum"
      ],
      featured: true
    },
    {
      id: "executive",
      name: "Executive Branding",
      description: "For senior moves into Big 4, multinational and C-suite roles.",
      price: "",
      features: [
        "Executive CV and leadership narrative",
        "Executive summary",
        "LinkedIn profile for senior visibility",
        "Tailored cover letters"
      ],
      featured: false
    }
  ],

  /* ---- Client reviews ----
     photo: filename inside assets/media/testimonials/ (optional, leave "" for initials)
     Add more by copying a { ... } block, with a comma between blocks. */
  testimonials: [
    {
      quote: "Got three interview calls within a week of sending my new CV. RésuméKlinik transformed my entire professional narrative.",
      name: "Finance professional",
      role: "Big 4 placement, Lagos",
      photo: ""
    }
  ],

  /* ---- Employer logos strip ("Our clients have been hired at") ----
     Add logo files to assets/media/clients/ and list their names here.
     Leave the list empty [] to hide the strip. */
  clientLogos: [
    // "client-01.png", "client-02.png"
  ],

  /* ---- Downloadable documents (About and Services pages) ----
     Put PDFs in assets/media/docs/. Only files that exist are shown. */
  downloads: [
    { file: "services-brochure.pdf", title: "Services brochure",   note: "PDF, our services and process" },
    { file: "cv-checklist.pdf",      title: "Free CV checklist",   note: "PDF, 20 checks before you apply" },
    { file: "sample-cv.pdf",         title: "Sample CV",           note: "PDF, an anonymised client example" }
  ],

  /* ---- Resources sold or hosted elsewhere (e.g. Selar) ----
     These always show. Leave the list empty [] to hide. Example:
     { title: "PAYE calculator workbook", note: "Excel, Nigeria Tax Act 2025", url: "https://selar.co/..." } */
  externalResources: [
  ]
};
