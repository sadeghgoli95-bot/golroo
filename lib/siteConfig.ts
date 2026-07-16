export const siteConfig = {
  name: "گل‌رو",
  url: "https://golroo.ir",
  description:
    "برند شخصی صادق گل‌رو؛ روان‌درمانگر کودک و نوجوان. جلسات آنلاین برای کودکان، نوجوانان و والدین.",
  person: {
    name: "محمد صادق گل‌رو",
    jobTitle: "روان‌شناس و روان‌درمانگر کودک و نوجوان",
    image: "https://golroo.ir/favicon.ico",
  },
  contact: {
    whatsapp: "https://wa.me/989120538112",
    telegram: "https://t.me/SadeghGolroo",
    instagram: "https://instagram.com/sadeghgolroo_psy",
    email: "sadeghgoli95@gmail.com",
    phones: ["+982122849351", "+989307070617"],
    address:
      "تهران، پاسداران، خیابان بوستان دوم، خیابان گیلان غربی، بین فرخی یزدی و داوود اسلامی، نبش موحد ۲، پلاک ۵",
  },
  social: {
    telegram: "https://t.me/SadeghGolroo",
    instagram: "https://instagram.com/sadeghgolroo_psy",
  },
} as const;

export const sameAs = Object.values(siteConfig.social);
