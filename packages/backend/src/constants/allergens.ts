export interface AllergenDefinition {
  id: string;
  icon: string;
  names: Record<string, string>;
  details: Record<string, string>;
}

export const ALLERGEN_CATALOG: AllergenDefinition[] = [
  {
    id: 'GLUTEN',
    icon: '🌾',
    names: {
      tr: 'Gluten',
      en: 'Gluten',
      de: 'Gluten',
      es: 'Gluten',
      fr: 'Gluten',
    },
    details: {
      tr: 'Buğday, çavdar, arpa, yulaf vb. tahıllar',
      en: 'Wheat, rye, barley, oats, and spelt',
      de: 'Weizen, Roggen, Gerste, Hafer',
      es: 'Trigo, centeno, cebada, avena',
      fr: 'Blé, seigle, orge, avoine',
    },
  },
  {
    id: 'DAIRY',
    icon: '🥛',
    names: {
      tr: 'Süt / Laktoz',
      en: 'Milk & Dairy',
      de: 'Milch / Laktose',
      es: 'Leche / Lácteos',
      fr: 'Lait / Lactose',
    },
    details: {
      tr: 'Süt, tereyağı, peynir, krema, yoğurt',
      en: 'Milk, butter, cheese, cream, yogurt',
      de: 'Milch, Butter, Käse, Sahne, Joghurt',
      es: 'Leche, mantequilla, queso, crema, yogur',
      fr: 'Lait, beurre, fromage, crème, yaourt',
    },
  },
  {
    id: 'EGGS',
    icon: '🥚',
    names: {
      tr: 'Yumurta',
      en: 'Eggs',
      de: 'Eier',
      es: 'Huevos',
      fr: 'Œufs',
    },
    details: {
      tr: 'Tüm yumurta ve yumurta içeren ürünler',
      en: 'Eggs and egg-derived ingredients',
      de: 'Eier und daraus hergestellte Erzeugnisse',
      es: 'Huevos y productos a base de huevo',
      fr: 'Œufs et produits à base d’œufs',
    },
  },
  {
    id: 'PEANUTS',
    icon: '🥜',
    names: {
      tr: 'Yer Fıstığı',
      en: 'Peanuts',
      de: 'Erdnüsse',
      es: 'Cacahuetes',
      fr: 'Arachides',
    },
    details: {
      tr: 'Yer fıstığı ve fıstık yağı/ezmesi',
      en: 'Peanuts and peanut oil/butter',
      de: 'Erdnüsse und Erdnussöl',
      es: 'Cacahuetes y aceite de cacahuete',
      fr: 'Arachides et dérivés',
    },
  },
  {
    id: 'TREE_NUTS',
    icon: '🌰',
    names: {
      tr: 'Sert Kabuklu Yemişler',
      en: 'Tree Nuts',
      de: 'Schalenfrüchte',
      es: 'Frutos de Cáscara',
      fr: 'Fruits à Coque',
    },
    details: {
      tr: 'Badem, fındık, ceviz, kaju, antep fıstığı',
      en: 'Almonds, hazelnuts, walnuts, cashews, pistachios',
      de: 'Mandeln, Haselnüsse, Walnüsse, Cashews',
      es: 'Almendras, avellanas, nueces, anacardos',
      fr: 'Amandes, noisettes, noix, pistaches',
    },
  },
  {
    id: 'SOY',
    icon: '🌱',
    names: {
      tr: 'Soya',
      en: 'Soybeans',
      de: 'Soja',
      es: 'Soja',
      fr: 'Soja',
    },
    details: {
      tr: 'Soya fasulyesi, soya sosu, tofu, lesitin',
      en: 'Soybeans, soy sauce, tofu, soy lecithin',
      de: 'Sojabohnen, Sojasauce, Tofu',
      es: 'Soja, salsa de soja, tofu',
      fr: 'Soja, sauce soja, tofu',
    },
  },
  {
    id: 'FISH',
    icon: '🐟',
    names: {
      tr: 'Balık',
      en: 'Fish',
      de: 'Fisch',
      es: 'Pescado',
      fr: 'Poisson',
    },
    details: {
      tr: 'Tüm balık türleri ve balık sosları',
      en: 'All fish species and fish-derived sauces',
      de: 'Alle Fischarten und Fischerzeugnisse',
      es: 'Todo tipo de pescados y salsas de pescado',
      fr: 'Tous poissons et dérivés',
    },
  },
  {
    id: 'CRUSTACEANS',
    icon: '🦐',
    names: {
      tr: 'Kabuklular',
      en: 'Crustaceans',
      de: 'Krebstiere',
      es: 'Crustáceos',
      fr: 'Crustacés',
    },
    details: {
      tr: 'Karides, yengeç, ıstakoz, kerevit',
      en: 'Prawns, crabs, lobster, crayfish',
      de: 'Garnelen, Krabben, Hummer',
      es: 'Gambas, langostinos, cangrejos',
      fr: 'Crevettes, crabes, homards',
    },
  },
  {
    id: 'MOLLUSCS',
    icon: '🦪',
    names: {
      tr: 'Yumuşakçalar',
      en: 'Molluscs',
      de: 'Weichtiere',
      es: 'Moluscos',
      fr: 'Mollusques',
    },
    details: {
      tr: 'Midye, istiridye, ahtapot, kalamar, salyangoz',
      en: 'Mussels, oysters, squid, octopus, snails',
      de: 'Muscheln, Austern, Tintenfisch, Schnecken',
      es: 'Mejillones, ostras, calamares, pulpo',
      fr: 'Moules, huîtres, calmars, poulpe',
    },
  },
  {
    id: 'SESAME',
    icon: '🥯',
    names: {
      tr: 'Susam',
      en: 'Sesame',
      de: 'Sesamsamen',
      es: 'Sésamo',
      fr: 'Sésame',
    },
    details: {
      tr: 'Susam tohumu, tahin, susam yağı',
      en: 'Sesame seeds, tahini, sesame oil',
      de: 'Sesamsamen, Tahin, Sesamöl',
      es: 'Semillas de sésamo, tahini, aceite de sésamo',
      fr: 'Graines de sésame, tahini, huile de sésame',
    },
  },
  {
    id: 'MUSTARD',
    icon: '🌭',
    names: {
      tr: 'Hardal',
      en: 'Mustard',
      de: 'Senf',
      es: 'Mostaza',
      fr: 'Moutarde',
    },
    details: {
      tr: 'Hardal tohumu, hardal tozu, soslar',
      en: 'Mustard seeds, powder, dressings',
      de: 'Senfkörner, Senfpulver, Saucen',
      es: 'Semillas de mostaza, salsas',
      fr: 'Graines de moutarde, condiments',
    },
  },
  {
    id: 'CELERY',
    icon: '🥬',
    names: {
      tr: 'Kereviz',
      en: 'Celery',
      de: 'Sellerie',
      es: 'Apio',
      fr: 'Céleri',
    },
    details: {
      tr: 'Kereviz sapı, yaprağı, kökü ve tohumu',
      en: 'Celery stalks, leaves, roots, seeds',
      de: 'Staudensellerie, Knolle, Samen',
      es: 'Tallos, hojas, raíces de apio',
      fr: 'Branches, feuilles, graines de céleri',
    },
  },
  {
    id: 'LUPIN',
    icon: '🌸',
    names: {
      tr: 'Lupin (Acıbakla)',
      en: 'Lupin',
      de: 'Lupinen',
      es: 'Altramuces',
      fr: 'Lupin',
    },
    details: {
      tr: 'Lupin tohumu ve unu (unlu mamüllerde)',
      en: 'Lupin seeds and flour in baked goods',
      de: 'Lupinensamen und -mehl',
      es: 'Semillas y harina de altramuz',
      fr: 'Graines et farine de lupin',
    },
  },
  {
    id: 'SULPHITES',
    icon: '🍷',
    names: {
      tr: 'Kükürt Dioksit / Sülfitler',
      en: 'Sulphur Dioxide & Sulphites',
      de: 'Schwefeldioxid / Sulfite',
      es: 'Dióxido de Azufre / Sulfitos',
      fr: 'Anhydride Sulfureux / Sulfites',
    },
    details: {
      tr: 'Kuru meyveler, şarap, sirke koruyucuları (>10mg/kg)',
      en: 'Dried fruits, wine, vinegar preservatives (>10mg/kg)',
      de: 'Trockenfrüchte, Wein, Konservierungsstoffe',
      es: 'Frutos secos, vino, conservantes',
      fr: 'Fruits secs, vin, conservateurs',
    },
  },
];

export const ALLERGEN_DISCLAIMER = {
  tr: '⚠️ Alerjen Bilgisi: Menüdeki alerjen bilgileri işletme beyanına dayanmaktadır. Mutfak ve servis ortamlarında çapraz bulaşma (cross-contamination) riski bulunabileceğinden, ciddi gıda alerjisi veya intoleransı olan misafirlerimizin sipariş öncesinde servis personeline bilgi vermesi önemle rica olunur.',
  en: '⚠️ Allergen Notice: Allergen information is based on declarations provided by the venue. Due to potential cross-contamination during preparation and service, guests with severe food allergies or intolerances are kindly requested to inform our staff before ordering.',
  de: '⚠️ Allergenhinweis: Die Allergenangaben basieren auf Angaben des Betriebs. Wegen möglicher Kreuzkontamination bitten wir Gäste mit schweren Allergien, vor der Bestellung das Servicepersonal zu informieren.',
  es: '⚠️ Aviso de Alérgenos: La información sobre alérgenos se basa en las declaraciones del establecimiento. Debido al riesgo de contaminación cruzada, rogamos a los clientes con alergias graves que informen al personal antes de realizar su pedido.',
  fr: '⚠️ Information Allergènes: Les informations sur les allergènes reposent sur les déclarations de l’établissement. En raison du risque de contamination croisée, les personnes allergiques sont priées d’en informer le personnel avant de commander.',
};
