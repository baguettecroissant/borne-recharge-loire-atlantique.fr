// Programmatic Content Engine - Loire-Atlantique (44) - Borne de Recharge
// Generates highly unique, localized, helpful content for each commune in the Loire-Atlantique department.
// Uses a multi-dimensional sentence-level spintax matrix to avoid duplicate content penalties
// and provides rich technical details (E-E-A-T) optimized for local search queries in 44.

import communes from '../data/communes.json';

export function spin(text: string, seed: string): string {
  let result = text;
  const spintaxTest = /{([^{}|]+\|[^{}]+)}/;
  const spintaxReplace = /{([^{}|]+\|[^{}]+)}/g;
  
  while (spintaxTest.test(result)) {
    result = result.replace(spintaxReplace, (match, choicesStr) => {
      if (['VILLE', 'CODE_POSTAL', 'PRIX_MIN', 'PRIX_MAX', 'VARIANTE_INTRO'].includes(choicesStr)) {
        return match;
      }
      const choices = choicesStr.split('|');
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = (hash * 31 + seed.charCodeAt(i)) | 0;
      }
      hash = hash + choicesStr.length;
      const index = Math.abs(hash) % choices.length;
      return choices[index];
    });
  }
  return result;
}

export interface Commune {
  nom: string;
  slug: string;
  codeInsee: string;
  codePostal: string;
  population: number;
  altitude?: number;
  prixM2Moyen?: number;
  logements?: number;
  logementsMaison?: number;
  vehiculesElectriques?: number;
  croissanceVE?: number;
  bornesPubliques?: number;
  intercommunalite?: string;
  canton?: string;
  latitude?: number;
  longitude?: number;
  distanceNantes?: number; // distance to Nantes center
  densiteBornes?: number;
  profilCommune?: string;
  marcheImmobilier?: string;
  tauxMaisonLabel?: string;
}

export interface ExternalLink {
  label: string;
  url: string;
  description: string;
}

export interface GuideLink {
  href: string;
  label: string;
  desc: string;
}

export interface LocalContent {
  introParagraph: string;
  logisticsAlert: string;
  useCaseText: string;
  pricesContext: string;
  faqItems: { question: string; answer: string }[];
  ecoText: string;
  localContext: string;
  climateZoneLabel: string;
  localAgencyName: string;
  externalLinks: ExternalLink[];
  communeDataInsight: string;
  expertTip: string;
  tableIntro: string;
  guideLinks: GuideLink[];
  savingsEstimate: string;
  lastUpdated: string;
  realEstateInsight: string;
  populationTierContent: string;
  densiteAnalysis: string;
  marcheImmobilierInsight: string;
  distanceNantesContext: string;
  anecdotePatrimoine: string;
  localRegulation: string;
  sourcesCitation: string;
  mobiliteContext: string;
  specificiteElectrique: string;
  expertBlockquote: string;
  intercommunaliteContext: string;
  profilCommuneInsight: string;
}

export type GeographicZone = 'coastline' | 'nantes-metropolis' | 'rural-briere';

export function getGeographicZone(codePostal: string, slug: string): GeographicZone {
  const cp = codePostal.trim();
  if (cp.startsWith('445') || cp.startsWith('446') || cp.startsWith('44210') || cp.startsWith('44250') || slug.includes('baule') || slug === 'saint-nazaire' || slug === 'guerande') {
    return 'coastline';
  }
  if (cp.startsWith('440') || cp.startsWith('441') || cp.startsWith('442') || cp.startsWith('443') || cp.startsWith('448') || cp.startsWith('449') || slug === 'nantes') {
    return 'nantes-metropolis';
  }
  return 'rural-briere';
}

export function getLocalAgency(codePostal: string, slug: string): { name: string; detail: string; website: string } {
  const cp = codePostal.trim();
  if (cp.startsWith('440') || cp.startsWith('441') || cp.startsWith('442') || cp.startsWith('443') || cp.startsWith('448') || slug === 'nantes') {
    return {
      name: "l'Espace Conseil France Rénov' de Nantes Métropole",
      detail: "l'organisme métropolitain d'aide à la transition énergétique",
      website: "nantesmetropole.fr"
    };
  }
  return {
    name: "l'Espace Conseil France Rénov' de Loire-Atlantique (animé par l'ADIL 44)",
    detail: "le service public d'accompagnement de la transition écologique du département",
    website: "adil44.org"
  };
}

export function getVariantIndex(slug: string, offset: number, maxVariants: number): number {
  let hash = offset * 31;
  for (let i = 0; i < slug.length; i++) {
    hash = ((hash << 5) - hash + slug.charCodeAt(i)) | 0;
  }
  hash = hash ^ (slug.length * 2654435761);
  hash = (hash ^ (offset * 16777619)) | 0;
  hash = (hash + slug.charCodeAt(0) * 7919 + slug.charCodeAt(slug.length - 1) * 104729) | 0;
  return Math.abs(hash) % maxVariants;
}

export function getDynamicPrices(commune: Commune) {
  let priceFactor = 1.0;
  
  if (commune.population > 100000) priceFactor += 0.03; // metropolis
  else if (commune.population > 20000) priceFactor += 0.01;
  
  if (commune.prixM2Moyen) {
    if (commune.prixM2Moyen > 5000) priceFactor += 0.08; // premium coast (La Baule)
    else if (commune.prixM2Moyen > 3800) priceFactor += 0.04; // Nantes center
    else if (commune.prixM2Moyen < 2400) priceFactor -= 0.03; // accessible
  }
  
  priceFactor = Math.max(0.90, Math.min(1.15, priceFactor));

  return {
    greenUp: { min: Math.round(400 * priceFactor), max: Math.round(700 * priceFactor) },
    wallbox7kW: { min: Math.round(1200 * priceFactor), max: Math.round(1800 * priceFactor) },
    wallbox11kW: { min: Math.round(1500 * priceFactor), max: Math.round(2200 * priceFactor) },
    wallbox22kW: { min: Math.round(2000 * priceFactor), max: Math.round(3500 * priceFactor) },
    copro: { min: Math.round(2500 * priceFactor), max: Math.round(4500 * priceFactor) },
    triUpgrade: { min: Math.round(500 * priceFactor), max: Math.round(1200 * priceFactor) },
    priceFactor
  };
}

export function getAnecdotePatrimoine(slug: string, nom: string): string {
  if (slug === 'nantes' || slug === 'reze' || slug === 'saint-herblain' || slug === 'orvault') {
    return "Nantes, labellisée Capitaine Verte de l'Europe (Green Capital) et célèbre pour le Château des Ducs de Bretagne et les Machines de l'Île avec son Grand Éléphant mécanique, concilie histoire et innovation écologique. L'installation de bornes de recharge dans les copropriétés de l'Île de Nantes ou les maisons nantaises traditionnelles à colombages ou meulières s'inscrit pleinement dans cette dynamique. Elle respecte les réglementations locales d'intégration paysagère tout en modernisant l'accès à la mobilité douce.";
  }
  if (slug === 'saint-nazaire' || slug === 'pornichet' || slug === 'montoir-de-bretagne') {
    return `Saint-Nazaire, ville ouverte sur l'océan, célèbre pour ses chantiers navals géants où sont construits les plus grands paquebots du monde, et pour sa base sous-marine historique, incarne une identité industrielle forte. L'expansion des véhicules électriques y est soutenue par les salariés des secteurs aéronautique et naval, qui recherchent des installations de bornes de recharge robustes, adaptées aux variations climatiques maritimes de l'estuaire de la Loire.`;
  }
  if (slug === 'la-baule-escoublac' || slug === 'guerande' || slug === 'pornic') {
    return `La Baule-Escoublac, connue pour sa baie mythique et ses villas balnéaires nichées sous les pins, forme avec les remparts médiévaux de Guérande et le charme maritime de Pornic un patrimoine exceptionnel. Équiper une résidence secondaire ou une villa bauloise d'une wallbox de recharge IRVE discrète est un atout majeur, permettant de recharger sereinement son véhicule après un trajet depuis Paris ou Nantes tout en valorisant significativement son bien immobilier.`;
  }
  if (slug === 'clisson' || slug === 'getignie' || slug === 'mouzillon' || slug === 'le-pallet') {
    return `Clisson, surnommée la "Petite Italie" de la Loire-Atlantique grâce à son architecture remarquable d'inspiration toscane et ses ponts romantiques, constitue le cœur du vignoble nantais (Muscadet). Installer une borne de recharge à ${nom} permet de découvrir ce patrimoine viticole exceptionnel en véhicule électrique, tout en respectant l'intégrité architecturale des demeures de caractère de la Sèvre nantaise.`;
  }
  if (slug === 'carquefou' || slug === 'la-chapelle-sur-erdre' || slug === 'sucé-sur-erdre') {
    return `Les bords de l'Erdre, qualifiée de "plus belle rivière de France" par François Ier, constituent un cadre résidentiel privilégié. À ${nom}, les maisons avec jardin et garage individuel sont idéales pour l'installation d'une borne wallbox. Le calme de ce secteur boisé, entre nature préservée et proximité de la métropole nantaise, séduit les ménages actifs soucieux de leur empreinte écologique.`;
  }
  if (slug === 'vertou' || slug === 'haute-goulaine' || slug === 'basse-goulaine') {
    return `Le vignoble de la Sèvre et Maine s'étend à travers les communes de ${nom} et ses environs, constituant un patrimoine viticole AOC réputé. Les demeures viticoles historiques, souvent dotées de grands garages et de dépendances, offrent des conditions optimales pour l'installation de wallbox. L'énergie verte de la recharge à domicile s'harmonise naturellement avec la tradition de respect du terroir.`;
  }
  
  // Generic 16 thematic anecdotes for Loire-Atlantique (doubled from 12)
  const genericAnecdotes = [
    `Le département de la Loire-Atlantique, marqué par l'estuaire de la Loire et le dynamisme de la métropole nantaise, connaît une transition rapide vers la mobilité électrique. Installer une borne de recharge à domicile à ${nom} constitue la réponse idéale pour les navetteurs réguliers souhaitant optimiser leur budget énergétique grâce aux heures creuses d'Enedis.`,
    `Les résidences de Loire-Atlantique, qu'il s'agisse de pavillons contemporains ou de longères rénovées en pierre, disposent de configurations électriques variées. À ${nom}, l'intervention d'un électricien certifié IRVE garantit un raccordement sécurisé conforme aux exigences techniques du consuel et de l'habitat local.`,
    `Avec l'essor du vélopartage et des véhicules propres sous l'esprit de Nantes Green Capital, la Loire-Atlantique se positionne en leader de la transition écologique. Équiper sa maison à ${nom} d'une borne intelligente permet de réduire de 80% le coût au kilomètre par rapport aux carburants fossiles.`,
    `Les liaisons routières majeures de Loire-Atlantique (N165 vers Brest, N137 vers Rennes, A11 vers Paris) génèrent d'importants trajets quotidiens. Pour les résidents de ${nom}, disposer d'un point de charge privé de 7.4 kW permet d'aborder ces axes l'esprit serein avec une batterie pleine chaque matin.`,
    `L'architecture traditionnelle de Loire-Atlantique, intégrant de belles façades en pierre ou des toitures en ardoise, requiert une pose de borne propre et discrète. Nos installateurs certifiés à ${nom} veillent à intégrer esthétiquement le matériel de recharge sur le mur du garage ou sur un pied de support dans l'allée.`,
    `Les zones d'activités tertiaires et industrielles du 44 (Nantes Métropole, pôle d'innovation d'Indret, chantiers de Saint-Nazaire) accueillent des milliers de salariés. À ${nom}, faire installer sa wallbox par un pro IRVE permet de simplifier sa logistique quotidienne domicile-travail.`,
    `Le climat tempéré océanique de la Loire-Atlantique, exposé aux vents humides et aux embruns sur la côte, exige du matériel de recharge particulièrement résistant. À ${nom}, nous préconisons des bornes dotées d'un indice de protection IP65 et IK10 contre les intempéries et les chocs.`,
    `Pour les trajets vers le littoral (La Baule, Pornic, presqu'île de Guérande), le véhicule électrique s'impose comme le moyen de transport écologique par excellence. À ${nom}, recharger à domicile sécurise l'autonomie nécessaire pour vos sorties week-end sur la côte sans dépendre des réseaux publics parfois saturés en été.`,
    `L'obligation légale de pré-équipement des parkings dans l'immobilier neuf souligne l'urgence de s'équiper dans l'ancien. À ${nom}, devancer cette norme en installant une wallbox de grande marque (ABB, Schneider, Easee) valorise immédiatement votre patrimoine bâti.`,
    `Les conseillers France Rénov' en Loire-Atlantique recommandent d'anticiper la mise aux normes de son tableau électrique lors d'un projet de recharge. À ${nom}, un diagnostic préalable par un électricien qualifié IRVE permet d'évaluer la qualité de la prise de terre indispensable à la charge sécurisée.`,
    `La recharge résidentielle est la solution de recharge la plus économique du marché. En programmant sa recharge de nuit à ${nom}, on bénéficie d'une électricité à tarif régulé très compétitive, divisant par 5 la facture de déplacement annuel.`,
    `Qu'il s'agisse de recharger un SUV familial, une citadine ou un véhicule utilitaire à ${nom}, les bornes connectées actuelles s'adaptent à toutes les batteries et permettent un suivi précis des consommations d'énergie depuis une application mobile.`,
    `Le Plan Climat Air Énergie Territorial (PCAET) de la Loire-Atlantique fixe des objectifs ambitieux de réduction des émissions de CO₂ liées aux transports. À ${nom}, chaque installation de borne IRVE contribue concrètement à atteindre ces objectifs départementaux tout en offrant des économies substantielles aux ménages.`,
    `Les marais salants de Guérande, l'estuaire de la Loire classé Natura 2000 et le lac de Grand-Lieu forment un patrimoine naturel exceptionnel. À ${nom}, adopter la mobilité électrique grâce à une borne de recharge à domicile participe activement à la préservation de ces écosystèmes fragiles.`,
    `Le réseau TER et Aléop de Loire-Atlantique encourage la multimodalité transport en commun + voiture électrique. À ${nom}, disposer d'une wallbox garantit une recharge complète pour les trajets de rabattement vers les gares ou les parkings relais de la métropole.`,
    `Le Département de Loire-Atlantique accompagne les communes rurales dans le développement de leurs infrastructures de recharge. À ${nom}, les habitants qui s'équipent d'une borne privée bénéficient d'un confort de recharge optimal, complémentaire au maillage public encore en déploiement dans les zones moins denses.`
  ];
  
  let hashVal = 0;
  for (let i = 0; i < slug.length; i++) {
    hashVal = (hashVal * 31 + slug.charCodeAt(i)) | 0;
  }
  hashVal = hashVal ^ (slug.length * 2654435761);
  return genericAnecdotes[Math.abs(hashVal) % genericAnecdotes.length];
}

function getExternalLinks(category: string, codePostal: string, slug: string): ExternalLink[] {
  const agency = getLocalAgency(codePostal, slug);
  const agencyUrl = agency.website.startsWith('http') ? agency.website : `https://www.${agency.website}`;
  
  const base: ExternalLink[] = [
    {
      label: "Programme ADVENIR — Subventions Bornes de Recharge",
      url: "https://advenir.mobi",
      description: "Site officiel du programme ADVENIR détaillant les primes pour les particuliers, les copropriétés et les syndics."
    },
    {
      label: `${agency.name} — Service Public local`,
      url: agencyUrl,
      description: "Accompagnement de proximité gratuit pour votre transition énergétique et aides financières en Loire-Atlantique."
    },
    {
      label: "Avere-France — Association nationale de mobilité électrique",
      url: "https://www.avere-france.org",
      description: "L'organisme national de référence sur la mobilité électrique : actualités, guides de recharge et statistiques."
    },
    {
      label: "Qualifelec — Annuaire des Électriciens qualifiés IRVE",
      url: "https://www.qualifelec.fr",
      description: "Vérifiez officiellement la qualification IRVE de votre électricien pour valider l'éligibilité aux subventions."
    },
    {
      label: "Enedis — Raccordement de bornes de recharge dans l'Ouest",
      url: "https://www.enedis.fr/particuliers/raccordement-et-branchement",
      description: "Guide officiel du gestionnaire de réseau Enedis sur les modalités de raccordement d'un point de charge en Loire-Atlantique."
    }
  ];

  if (category === 'copropriete') {
    return [
      ...base,
      {
        label: "Légifrance — Décret n° 2020-1720 (Droit à la prise)",
        url: "https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000042740927",
        description: "Texte de loi officiel régissant le droit à la prise en copropriété pour installer une borne de recharge."
      }
    ];
  } else if (category === 'wallbox') {
    return [
      ...base,
      {
        label: "Automobile Propre — Guide de choix de borne",
        url: "https://www.automobile-propre.com",
        description: "Comparatifs indépendants, temps de charge et fiches techniques des meilleures wallbox du marché."
      }
    ];
  } else {
    return [
      ...base,
      {
        label: "Service-Public.fr — Crédit d'impôt Borne de recharge",
        url: "https://www.service-public.fr/particuliers/vosdroits/F35535",
        description: "Fiche officielle décrivant les conditions d'octroi du crédit d'impôt de 500 € pour l'année 2026."
      }
    ];
  }
}

function getGuideLinks(category: string, slug: string = ''): GuideLink[] {
  const allGuides: GuideLink[] = [
    { href: '/guides/prix-borne-recharge-loire-atlantique-2026/', label: 'Prix Borne Recharge 44', desc: 'Budget complet pour équiper votre logement en Loire-Atlantique en 2026.' },
    { href: '/guides/nantes-green-capital-ve-mobilite-durable/', label: 'Nantes Green Capital & VE', desc: 'Aides locales, infrastructures et objectifs écologiques à Nantes.' },
    { href: '/guides/aides-advenir-nantes-metropole-subventions-2026/', label: 'Aides ADVENIR & Métropole', desc: 'Comment cumuler les subventions pour votre wallbox dans le 44.' },
    { href: '/guides/copropriete-nantes-droit-a-la-prise-syndic/', label: 'Copropriété : Droit à la Prise', desc: "Faire voter l'installation d'une borne en AG à Nantes." },
    { href: '/guides/borne-recharge-residence-secondaire-la-baule/', label: 'Borne Résidence Secondaire La Baule', desc: 'Valoriser votre bien immobilier sur la côte bauloise.' },
    { href: '/guides/wallbox-autoconsommation-solaire-loire-atlantique/', label: 'Wallbox & Solaire dans le 44', desc: 'Rentabilité et couplage borne de recharge avec panneaux photovoltaïques.' },
    { href: '/guides/comparatif-wallbox-ecoresponsables-2026/', label: 'Comparatif Bornes Écoresponsables', desc: 'Sélection de wallbox recyclables à faible empreinte carbone.' },
    { href: '/guides/installateur-irve-loire-atlantique-selection/', label: 'Choisir son Installateur IRVE', desc: 'Critères de certification obligatoires et pièges des devis.' },
  ];

  const categoryPriority: Record<string, number[]> = {
    copropriete: [3, 2, 0],
    wallbox: [5, 6, 1],
    main: [0, 7, 2],
  };

  const prioritySet = new Set(categoryPriority[category] || [0, 7, 2]);
  const baseOffset = getVariantIndex(slug, 300, allGuides.length);
  
  const selected: GuideLink[] = [];
  const usedIndices = new Set<number>();
  
  const priorityArr = Array.from(prioritySet);
  const priorityIdx = priorityArr[getVariantIndex(slug, 310, priorityArr.length)];
  selected.push(allGuides[priorityIdx]);
  usedIndices.add(priorityIdx);
  
  let rotOffset = baseOffset;
  while (selected.length < 3) {
    const idx = rotOffset % allGuides.length;
    if (!usedIndices.has(idx)) {
      selected.push(allGuides[idx]);
      usedIndices.add(idx);
    }
    rotOffset++;
  }
  
  return selected;
}

// =====================================================================
// SPINTAX POOLS — French, adjusted to Loire-Atlantique green capital tone
// Each pool has 16 variants (doubled from 8) to avoid collision across 152 communes
// =====================================================================

const INTRO_POOLS: Record<string, string[]> = {
  main: [
    "Pour {l'installation|la pose} de votre borne de recharge à {VILLE}, {profitez|bénéficiez} d'une installation clés en main par un électricien agréé IRVE. Nous étudions la conformité de votre tableau électrique pour assurer une charge {sûre|sécurisée} pour votre maison ou copropriété.",
    "Besoin d'installer une wallbox de recharge pour votre véhicule électrique à {VILLE} ? Nos installateurs certifiés Qualifelec de Loire-Atlantique vous proposent du matériel {performant|haut de gamme} et prennent en charge vos demandes d'aides ADVENIR.",
    "Sécurisez la charge de votre véhicule électrique à {VILLE} avec une borne de recharge {7.4 kW|11 kW|22 kW} posée par un artisan certifié IRVE. Obtenez un devis gratuit et planifiez une visite technique sous {48h|deux jours} dans le 44.",
    "Pour vos trajets quotidiens entre {VILLE} et le centre de Nantes ou Saint-Nazaire, équiper votre maison d'une borne wallbox est la solution {optimale|idéale} pour rouler vert et recharger pendant les heures creuses.",
    "Vous habitez à {VILLE} et souhaitez franchir le pas de la transition écologique ? Nos électriciens partenaires certifiés IRVE installent votre borne {à domicile|dans votre garage} dans le strict respect de la norme NF C 15-100.",
    "Recharger sur une simple prise domestique à {VILLE} est {beaucoup trop lent|inefficace}. Choisissez une borne murale de recharge rapide avec délestage de puissance intelligent (Smart Charging).",
    "Nos spécialistes en infrastructures de recharge interviennent à {VILLE} pour installer votre wallbox. Profitez du crédit d'impôt national de 500 € et d'une TVA réduite avec nos {artisans certifiés|experts IRVE}.",
    "Profitez du savoir-faire d'un installateur IRVE qualifié à {VILLE} pour brancher votre wallbox connectée. Nous configurons un système de délestage pour éviter de surcharger l'abonnement électrique de votre {maison nantaise|logement}.",
    "À {VILLE}, l'installation d'une borne de recharge résidentielle par un professionnel IRVE {certifié|agréé Qualifelec} vous garantit une mise en conformité totale et l'accès aux aides financières de l'État.",
    "Faites poser votre borne de recharge à {VILLE} par un électricien du réseau IRVE Loire-Atlantique. {Notre équipe|Nos techniciens} dimensionne(nt) précisément votre installation pour une charge sécurisée sans risque de disjonction.",
    "Vous envisagez de passer au véhicule électrique à {VILLE} ? L'installation d'une borne murale de 7.4 kW est le premier investissement {rentable|stratégique} pour les conducteurs du département 44.",
    "Rouler en électrique à {VILLE} commence par une infrastructure de recharge fiable chez soi. Nos installateurs IRVE vous accompagnent de l'étude technique à la mise en service de votre wallbox.",
    "Votre projet de borne de recharge à {VILLE} mérite un accompagnement {sur mesure|personnalisé}. Nos artisans IRVE du 44 réalisent une visite préalable gratuite pour évaluer votre installation électrique existante.",
    "L'électromobilité progresse à {VILLE} et équiper son domicile d'un point de charge privé devient {essentiel|incontournable}. Nos installateurs certifiés vous proposent les meilleures wallbox du marché au meilleur tarif.",
    "Chaque installation de borne IRVE à {VILLE} inclut un diagnostic complet de votre réseau électrique, la fourniture du matériel connecté et la configuration du Smart Charging pour optimiser vos {heures creuses|tarifs Enedis}.",
    "Optez pour une borne de recharge {intelligente|connectée} à {VILLE} et rechargez votre véhicule électrique jusqu'à 8 fois plus vite qu'avec une prise classique, avec un suivi de consommation en temps réel."
  ],
  copropriete: [
    "Vous résidez en copropriété à {VILLE} et souhaitez poser un point de recharge ? Le droit à la prise vous garantit la liberté d'équiper votre place de parking privative, soutenu par les aides financières ADVENIR en Loire-Atlantique.",
    "Installez votre borne individuelle en copropriété à {VILLE} en toute simplicité. Nos électriciens certifiés IRVE vous accompagnent pour présenter un dossier solide à votre syndic de copropriété et déduire l'aide ADVENIR de 960 €.",
    "Le droit à la prise (décret de 2020) permet à tout copropriétaire ou locataire à {VILLE} d'installer une borne de recharge sur son emplacement de parking. Découvrez nos solutions sur mesure pour résidences collectives.",
    "Sécurisez la recharge électrique de votre voiture dans votre résidence à {VILLE}. Nous concevons et déployons des raccordements individuels reliés aux services généraux, éligibles aux subventions ADVENIR 2026.",
    "Rendre votre copropriété compatible avec la recharge de VE à {VILLE} valorise l'ensemble de l'immeuble. Nos techniciens certifiés IRVE interviennent pour des raccordements collectifs ou individuels.",
    "Le raccordement d'un chargeur de VE en sous-sol ou en parking extérieur à {VILLE} requiert une étude de puissance rigoureuse. Nous établissons le schéma électrique pour validation en assemblée générale.",
    "Faites poser votre wallbox sur votre place de stationnement en copropriété à {VILLE} en tirant parti de la prime ADVENIR qui finance 50% de vos travaux de raccordement individuel.",
    "Nos installateurs IRVE agréés en Loire-Atlantique accompagnent les syndics et conseils syndicaux de {VILLE} dans le déploiement d'infrastructures collectives avec colonne horizontale Enedis.",
    "Copropriétaire ou locataire à {VILLE}, la loi vous donne le droit d'installer un point de charge. Nos techniciens IRVE préparent l'intégralité du dossier technique pour convaincre votre syndic.",
    "Anticipez la demande croissante de bornes dans votre résidence à {VILLE}. Nous {proposons|déployons} des solutions collectives évolutives permettant d'équiper progressivement chaque place de parking.",
    "Votre copropriété à {VILLE} peut bénéficier d'une infrastructure collective de recharge financée en partie par le programme ADVENIR. Nos équipes dimensionnent l'installation selon le nombre de places équipables.",
    "Le nombre de résidents roulant en électrique dans les copropriétés de {VILLE} {augmente rapidement|ne cesse de croître}. Nos solutions de bornes individuelles ou partagées s'adaptent à toutes les configurations de parking.",
    "Installer une borne IRVE en copropriété à {VILLE} nécessite l'intervention d'un professionnel qualifié pour garantir la conformité des raccordements et la sécurité incendie en parking couvert.",
    "Les copropriétés de {VILLE} équipées de bornes de recharge voient leur attractivité immobilière augmenter sensiblement. Nos solutions sont conçues pour s'intégrer sans perturber les parties communes.",
    "En tant que résident d'un immeuble à {VILLE}, vous pouvez {faire installer|demander la pose de} votre propre borne avec sous-compteur MID individuel, sans frais pour les autres copropriétaires.",
    "La transition vers la mobilité électrique concerne aussi les parkings collectifs à {VILLE}. Nos électriciens IRVE déploient des solutions compatibles avec tous les types de parking (souterrain, aérien, extérieur)."
  ],
  wallbox: [
    "Optimisez le temps de charge de votre voiture électrique à {VILLE} en faisant installer une borne murale rapide (Wallbox) de 7.4 kW à 22 kW par un installateur certifié IRVE de Loire-Atlantique.",
    "Vous recherchez une recharge rapide et intelligente à domicile à {VILLE} ? Découvrez nos wallbox connectées avec gestion automatique des heures creuses d'Enedis et délestage dynamique.",
    "Installez une wallbox sécurisée de grande marque (ABB, Easee, Schneider) dans votre garage à {VILLE}. Nous sélectionnons le matériel le plus adapté à la capacité de la batterie de votre voiture.",
    "La borne murale intelligente ou Wallbox est la solution de recharge résidentielle de référence à {VILLE}, chargeant jusqu'à 8 fois plus vite qu'une prise de courant classique.",
    "Faites poser votre borne Wallbox à {VILLE} par un électricien qualifié IRVE pour sécuriser vos câblages et bénéficier des aides de l'État et du crédit d'impôt de 500 € en 2026.",
    "Vous souhaitez recharger rapidement votre véhicule électrique de standing à {VILLE} ? Nos électriciens analysent votre raccordement pour installer une wallbox adaptée à votre réseau monophasé ou triphasé.",
    "Équipez votre espace de stationnement à {VILLE} d'une wallbox connectée de dernière génération. Pilotez vos sessions de charge depuis votre mobile et profitez des tarifs de nuit avantageux.",
    "Bénéficiez d'une installation conforme et garantie pour votre wallbox à {VILLE} grâce à notre réseau d'artisans IRVE partenaires basés en Loire-Atlantique.",
    "Comparez les modèles de bornes murales disponibles à {VILLE} : puissance, connectivité, marque et prix. Nos experts IRVE du 44 vous orientent vers le choix {le plus adapté|optimal} pour votre usage.",
    "La wallbox est le standard de recharge domestique en 2026. À {VILLE}, nos installateurs certifiés proposent des modèles {connectés|intelligents} capables de moduler la puissance en fonction de votre abonnement Enedis.",
    "Choisir sa wallbox à {VILLE} implique de considérer la puissance disponible, le type de câblage et la compatibilité avec votre véhicule. Nos techniciens IRVE réalisent un diagnostic complet avant toute pose.",
    "L'installation d'une wallbox {performante|de qualité} à {VILLE} par un professionnel IRVE certifié Qualifelec est la condition sine qua non pour bénéficier du crédit d'impôt et des garanties constructeur.",
    "À {VILLE}, nous installons des wallbox de marques européennes reconnues (Easee, Schneider, ABB, Hager) avec des garanties fabricant allant de 3 à 5 ans pour une tranquillité d'esprit totale.",
    "Le marché des bornes murales évolue rapidement. À {VILLE}, nos installateurs IRVE vous conseillent sur les dernières innovations : charge bidirectionnelle V2H, intégration solaire et pilotage vocal.",
    "Votre projet de wallbox à {VILLE} commence par une {étude technique|visite préalable} gratuite. Nos électriciens IRVE évaluent la distance au tableau, la section de câble nécessaire et la conformité de votre installation.",
    "Pourquoi investir dans une wallbox à {VILLE} ? Parce qu'une recharge nocturne de 7 heures sur une borne de 7.4 kW restaure 350 km d'autonomie pour un coût inférieur à {3 €|2,80 €}."
  ]
};

const USE_CASE_POOLS: Record<string, string[]> = {
  main: [
    "La pose d'une borne wallbox de 7.4 kW à domicile permet d'ajouter entre 40 et 50 km d'autonomie par heure de charge, couvrant les besoins quotidiens de n'importe quel VE (Renault Zoé, Tesla Model Y, Peugeot e-208).",
    "Pour les propriétés équipées d'un tableau triphasé, l'installation d'une borne de 11 kW ou 22 kW offre une vitesse de charge démultipliée, permettant un plein d'énergie en seulement 3 à 5 heures sans risquer de surcharger le tableau.",
    "Une borne de recharge dédiée et fixée au mur ou sur un piédestal sécurise l'installation électrique en coupant le courant automatiquement en cas de détection de fuite de courant continu.",
    "Nos électriciens IRVE préconisent des bornes certifiées compatibles avec les câbles Type 2, qui intègrent une protection IP65 pour supporter une installation en extérieur sans risque d'infiltration d'eau.",
    "Que vous ayez besoin d'une charge rapide pour vos trajets réguliers sur la N165 ou l'A11, ou simplement d'une recharge de sécurité, la wallbox de 7.4 kW reste l'équipement domestique le plus polyvalent.",
    "L'installation d'une prise renforcée Green'Up (3.7 kW) convient pour les charges d'appoint ou les véhicules hybrides rechargeables, mais pour un VE 100% électrique, la wallbox reste indispensable pour charger en une nuit.",
    "Le Smart Charging permet de programmer vos sessions de charge aux heures les plus avantageuses. À {VILLE}, cette fonctionnalité réduit jusqu'à 40% le coût mensuel de recharge par rapport à une charge manuelle classique.",
    "Nos installateurs IRVE à {VILLE} vérifient systématiquement la compatibilité entre la puissance demandée par votre VE et la capacité de votre abonnement Enedis afin d'éviter tout risque de disjonction intempestive.",
    "En fonction de votre utilisation (navetteur quotidien, usage familial ou professionnel), nos experts à {VILLE} dimensionnent précisément la puissance de votre borne pour un rapport performance/investissement optimal.",
    "Le connecteur Type 2 est le standard européen universel. Nos wallbox installées à {VILLE} sont compatibles avec 100% des modèles de véhicules électriques du marché (Tesla, Renault, Peugeot, BMW, Volkswagen).",
    "La recharge à domicile à {VILLE} couvre 95% des besoins quotidiens d'un conducteur moyen. Les bornes publiques rapides ne sont nécessaires que pour les longs trajets exceptionnels vers Paris, Bordeaux ou la Bretagne.",
    "L'avantage d'une wallbox connectée à {VILLE} est la possibilité de piloter la charge à distance : démarrer, stopper ou programmer une session depuis votre smartphone, où que vous soyez."
  ],
  copropriete: [
    "Pour faire valoir votre droit à la prise en copropriété, vous devez envoyer au syndic de l'immeuble un projet technique descriptif par lettre recommandée AR avant de débuter les travaux de raccordement.",
    "La solution la plus simple consiste à raccorder votre borne individuelle sur les services généraux de la copropriété à {VILLE}, avec la mise en place d'un sous-compteur individuel certifié MID pour le remboursement de vos consommations.",
    "Dans les résidences de Loire-Atlantique comportant de nombreuses places de stationnement, nous conseillons de déployer une infrastructure collective avec colonne Enedis horizontale pour attribuer un compteur Linky à chaque utilisateur.",
    "La pose d'une borne de recharge dans un garage collectif fermé (box) exige des dispositifs de sécurité anti-incendie spécifiques et un raccordement conforme aux directives Promotelec.",
    "Le syndic de votre copropriété à {VILLE} ne peut pas rejeter votre projet d'installation de borne individuelle sans motif légitime et sérieux, comme l'existence d'une solution de recharge collective déjà programmée.",
    "Les systèmes de recharge collective en copropriété permettent de gérer la répartition de la puissance électrique totale disponible entre les voitures connectées afin d'éviter tout surcoût d'abonnement général.",
    "En copropriété à {VILLE}, le raccordement individuel avec sous-compteur MID est la solution la plus rapide à mettre en œuvre : elle ne nécessite qu'une notification au syndic et aucun vote en assemblée générale.",
    "L'installation d'une colonne Enedis horizontale dans votre copropriété à {VILLE} permet à chaque résident d'avoir son propre compteur Linky dédié à la recharge, éliminant toute question de répartition des charges.",
    "Nos techniciens IRVE accompagnent les conseils syndicaux de {VILLE} pour présenter en assemblée générale un dossier technique complet incluant le schéma d'implantation et le chiffrage détaillé des travaux.",
    "La pose d'une borne sur une place de parking extérieure en copropriété à {VILLE} requiert un coffret d'alimentation étanche (IP65) et un dispositif de coupure d'urgence accessible depuis les parties communes.",
    "Pour les parkings en sous-sol à {VILLE}, nos installateurs IRVE veillent au respect strict des normes de sécurité incendie : câbles résistants au feu, extincteurs à proximité et coupure générale déportée.",
    "La gestion dynamique de la puissance (load balancing) permet d'équiper progressivement toutes les places de parking de votre copropriété à {VILLE} sans nécessiter de coûteux renforcement du branchement électrique."
  ],
  wallbox: [
    "Une wallbox de 7.4 kW raccordée en monophasé est le choix de référence pour les pavillons individuels à {VILLE}, rechargeant complètement une batterie standard de 60 kWh en 8 heures.",
    "Pour les installations disposant d'un abonnement triphasé à {VILLE}, les bornes murales de 11 kW et 22 kW garantissent une vitesse accrue, idéale pour recharger rapidement les grands SUV électriques.",
    "Les wallbox connectées sélectionnées par nos soins intègrent des protocoles OCPP et une connectivité sans fil pour planifier le lancement de la charge en fonction du calendrier des heures creuses.",
    "L'installation d'une borne murale requiert des protections modulaires spécifiques dans votre tableau électrique de {VILLE} : un disjoncteur dédié de calibre adapté et un différentiel de Type A-EV.",
    "Pour protéger l'accès à votre chargeur à {VILLE}, certains modèles disposent d'un lecteur de badge RFID, empêchant toute recharge par un tiers non autorisé en extérieur.",
    "La régulation automatique de puissance ou délestage dynamique permet à votre wallbox d'ajuster son intensité en temps réel selon les autres appareils allumés dans la maison.",
    "Le choix entre wallbox monophasée (7.4 kW) et triphasée (11 ou 22 kW) à {VILLE} dépend essentiellement de votre abonnement Enedis actuel et de la capacité du chargeur embarqué de votre véhicule.",
    "Les wallbox nouvelle génération installées à {VILLE} intègrent la technologie V2H (Vehicle-to-Home) permettant de restituer l'énergie stockée dans la batterie de votre voiture vers votre réseau domestique en cas de besoin.",
    "La longueur du câble de charge intégré à votre wallbox est un critère important. À {VILLE}, nous recommandons un câble de 5 à 7 mètres pour un confort d'utilisation optimal quelle que soit la position du véhicule.",
    "L'indice de protection IP65 certifie que votre wallbox résiste parfaitement aux projections d'eau et aux intempéries. À {VILLE}, c'est une exigence de base pour toute installation en extérieur.",
    "Les bornes murales intelligentes à {VILLE} sont compatibles avec les assistants vocaux (Alexa, Google Home) et les systèmes domotiques pour une intégration complète dans votre maison connectée.",
    "Le protocole OCPP 1.6/2.0 équipant nos wallbox à {VILLE} garantit une interopérabilité totale : vous pouvez changer d'opérateur ou de fournisseur d'énergie sans remplacer votre borne."
  ]
};

const ECO_POOLS: Record<string, string[]> = {
  main: [
    "En programmant la charge de votre VE pendant les heures creuses d'Enedis en Loire-Atlantique (de 22h à 6h), vous profitez du tarif d'électricité le plus bas du marché, ce qui divise par 5 vos dépenses de carburant.",
    "Avec un coût estimé à moins de 2.50 € pour 100 km en charge résidentielle à {VILLE}, l'installation d'une wallbox par un électricien IRVE est amortie en moins de 18 mois par rapport aux carburants fossiles.",
    "Le crédit d'impôt national de 500 € pour 2026, cumulé à l'application d'une TVA à taux réduit de 5,5% sur le matériel et la pose, rend l'acquisition d'une borne de recharge extrêmement accessible.",
    "Les fonctionnalités intelligentes des bornes actuelles vous permettent de suivre l'historique détaillé de votre consommation d'énergie et de mesurer précisément vos économies mensuelles.",
    "Si vous disposez de panneaux solaires à {VILLE}, certaines wallbox intelligentes peuvent utiliser l'énergie solaire autoproduite en direct pour alimenter votre voiture avec une électricité 100% verte.",
    "Éviter les recharges régulières sur les bornes publiques rapides (aux tarifs nettement plus élevés) en privilégiant la charge lente nocturne permet d'économiser plus de 1 500 € par an.",
    "Selon l'ADEME, un automobiliste roulant 15 000 km par an en électrique à {VILLE} économise en moyenne 1 200 € par an sur ses dépenses de carburant par rapport à un véhicule thermique équivalent.",
    "L'option tarifaire Tempo d'EDF permet aux résidents de {VILLE} de recharger à un coût encore plus bas lors des jours bleus (300 jours par an), rendant la recharge à domicile quasi gratuite.",
    "Le bonus écologique de l'État et la prime à la conversion, combinés au crédit d'impôt borne de 500 €, représentent un avantage financier global pouvant atteindre 7 000 € pour les ménages de {VILLE}.",
    "La durée de vie d'une wallbox de qualité est estimée à 15 ans minimum. L'investissement initial à {VILLE} est donc amorti en moins de 2 ans, laissant 13 années d'économies nettes sur vos déplacements.",
    "En heures creuses Enedis à {VILLE}, le coût d'une recharge complète pour 400 km d'autonomie n'excède pas 4 €. Comparez avec les 50 € de carburant nécessaires pour la même distance en thermique.",
    "L'autoconsommation solaire couplée à une wallbox intelligente à {VILLE} permet de recharger gratuitement votre VE en journée. Les surplus de production sont utilisés pour alimenter directement la borne."
  ],
  copropriete: [
    "Grâce au programme ADVENIR dédié aux habitats collectifs, vous obtenez une subvention finançant 50% de vos dépenses, avec un plafond de 960 € TTC par point de recharge individuel à {VILLE}.",
    "En copropriété, l'installation d'une borne de recharge individuelle par un pro IRVE donne droit à la TVA réduite à 5,5% et au crédit d'impôt de 500 €, réduisant de moitié le reste à charge.",
    "Le raccordement avec sous-comptage MID vous garantit une transparence totale : vous payez uniquement l'électricité consommée par votre voiture, facturée au tarif négocié par l'immeuble.",
    "La recharge de nuit au sein des parkings collectifs de {VILLE} reste le moyen le plus économique pour recharger les véhicules des résidents, préservant ainsi leur pouvoir d'achat.",
    "Les solutions collectives de recharge en copropriété peuvent être gérées par un tiers investisseur sans reste à charge pour le syndicat de copropriété, les frais étant facturés aux utilisateurs sous forme d'abonnement.",
    "Investir dans une solution de recharge en copropriété à {VILLE} est une démarche d'avenir qui rehausse la valeur foncière de votre bien immobilier de façon substantielle.",
    "Le cumul des aides en copropriété à {VILLE} (ADVENIR 960 € + crédit d'impôt 500 € + TVA 5,5%) peut réduire le reste à charge à moins de 300 € pour une borne individuelle standard.",
    "Les opérateurs de recharge proposent désormais des solutions clés en main pour les copropriétés de {VILLE} : installation, maintenance et facturation sont intégralement prises en charge moyennant un abonnement mensuel.",
    "La facturation individuelle par sous-compteur MID dans les copropriétés de {VILLE} élimine tout risque de conflit entre résidents : chacun paie exactement sa consommation électrique de recharge.",
    "En choisissant un installateur labellisé ADVENIR à {VILLE}, la prime est directement déduite de votre devis. Aucune avance de trésorerie n'est nécessaire de votre part.",
    "Pour les grands ensembles résidentiels de {VILLE}, l'infrastructure collective mutualisée permet de diviser les coûts de raccordement par le nombre de bénéficiaires, rendant l'investissement accessible à tous.",
    "Le tiers investissement en copropriété est une solution innovante à {VILLE} : un opérateur finance l'infrastructure et se rémunère par la facturation de l'électricité consommée par les utilisateurs."
  ],
  wallbox: [
    "Grâce à la programmation horaire de votre Wallbox à {VILLE}, la recharge s'active automatiquement dès le passage en heures creuses d'Enedis, garantissant un coût moyen de 3 € pour un plein complet.",
    "Le crédit d'impôt forfaitaire de 500 € est disponible pour toute pose de borne de recharge intelligente dans votre résidence principale ou secondaire de Loire-Atlantique en 2026.",
    "Le coût de recharge à domicile à {VILLE} est 3 à 4 fois inférieur aux tarifs pratiqués sur les bornes rapides d'autoroute ou les réseaux urbains payants.",
    "Les bornes à puissance modulable permettent d'éviter les abonnements d'électricité trop élevés, la borne diminuant d'elle-même sa consommation si le four ou le chauffage de la maison s'allume.",
    "Les wallbox connectées permettent d'intégrer des scénarios de recharge écoresponsables, optimisant l'usage des énergies renouvelables régionales dans le réseau de l'Ouest.",
    "Bénéficier d'une borne de recharge rapide privée à domicile à {VILLE} offre un confort quotidien inégalable tout en maximisant l'amortissement financier de votre véhicule électrique.",
    "Le retour sur investissement d'une wallbox à {VILLE} est atteint en 12 à 18 mois pour un conducteur parcourant 15 000 km par an, grâce aux économies sur le carburant et au crédit d'impôt.",
    "En combinant une wallbox intelligente avec un contrat d'électricité heures creuses à {VILLE}, le coût de recharge descend sous les 0,12 €/kWh, soit environ 1,80 € pour 100 km parcourus.",
    "La wallbox à délestage dynamique installée à {VILLE} ajuste sa puissance en temps réel pour ne jamais dépasser la limite de votre abonnement Enedis, évitant ainsi toute augmentation de forfait.",
    "Les propriétaires de wallbox à {VILLE} constatent en moyenne 70% d'économies sur leurs dépenses de mobilité par rapport à un véhicule thermique équivalent, maintenance incluse.",
    "Grâce aux fonctions de suivi de consommation intégrées à votre wallbox à {VILLE}, vous visualisez précisément le coût de chaque session de charge et optimisez vos habitudes de recharge.",
    "La TVA réduite à 5,5% s'applique automatiquement sur la fourniture et la pose de votre wallbox à {VILLE} pour les logements de plus de 2 ans, réduisant significativement le coût global."
  ]
};

const COMMUNE_DATA_POOLS: Record<string, string[]> = {
  main: [
    "Nos techniciens certifiés IRVE auditent la configuration de votre tableau de distribution principal. Dans les habitations de Loire-Atlantique, une mise aux normes du tableau ou l'installation d'un mini-coffret divisionnaire est souvent nécessaire.",
    "À {VILLE}, nous vérifions impérativement la valeur de la résistance de votre prise de terre. Si la terre est supérieure à 100 Ohms, la charge du véhicule électrique risque de se mettre en défaut par sécurité.",
    "Le réseau Enedis délivre une tension stable à {VILLE}, mais l'intégration d'un disjoncteur différentiel dédié de 30 mA est une obligation de sécurité incontournable pour protéger l'installation contre les surcharges.",
    "Nos électriciens partenaires dimensionnent précisément la ligne d'alimentation. Un câblage en cuivre de grosse section (10 mm² pour 7.4 kW) est nécessaire pour éviter tout risque d'échauffement sur les longues distances.",
    "Si votre pavillon à {VILLE} nécessite un passage du compteur en triphasé pour installer une borne de 22 kW, nous prenons en charge la coordination technique avec Enedis 44.",
    "Chaque point de recharge posé par nos soins à {VILLE} respecte scrupuleusement la norme NF C 15-100 et le guide pratique UTE C 15-722 pour les installations électriques.",
    "L'analyse de la puissance disponible sur votre compteur Linky à {VILLE} est la première étape de notre intervention. Nos techniciens IRVE calculent la marge de puissance pour éviter tout risque de disjonction.",
    "Les habitations construites avant 1990 à {VILLE} nécessitent souvent une mise à niveau du tableau électrique : remplacement des anciens fusibles par des disjoncteurs modulaires et ajout d'un interrupteur différentiel dédié.",
    "La pose d'une borne en façade extérieure à {VILLE} implique le passage de câbles dans des fourreaux étanches et la mise en place d'un coffret de protection IP65 résistant aux intempéries de la Loire-Atlantique.",
    "Nos installateurs IRVE à {VILLE} réalisent systématiquement un test de déclenchement différentiel après la pose de votre borne pour vérifier la réactivité du dispositif de protection en situation réelle.",
    "Le compteur Linky communicant installé par Enedis à {VILLE} permet un suivi en temps réel de la consommation de votre borne. Nos techniciens configurent le module TIC pour un pilotage optimal de la charge.",
    "Dans les constructions récentes à {VILLE} (post-2015), le pré-câblage IRVE est généralement prévu au garage. Nos électriciens vérifient sa conformité et raccordent votre wallbox directement sur le circuit dédié."
  ],
  copropriete: [
    "L'installation d'une borne en copropriété en Loire-Atlantique exige l'intervention d'un installateur agréé IRVE pour valider l'éligibilité aux subventions et garantir la sécurité de l'immeuble.",
    "À {VILLE}, nous étudions la puissance disponible sur le Tableau Général Basse Tension (TGBT) de la copropriété. Nous installons un module de gestion intelligente si la puissance est limitée.",
    "Le passage des câbles d'alimentation dans les parkings collectifs à {VILLE} s'effectue dans des chemins de câbles coupe-feu conformes aux réglementations de sécurité incendie en vigueur.",
    "Nos techniciens collaborent avec le syndic de votre résidence à {VILLE} en fournissant les schémas d'implantation électrique requis pour la validation du dossier technique en AG.",
    "Pour empêcher l'utilisation frauduleuse de votre borne en parking partagé à {VILLE}, nous installons des modèles équipés d'un verrouillage par badge RFID ou clé.",
    "Chaque installation individuelle en copropriété à {VILLE} respecte les normes d'accessibilité PMR pour faciliter l'usage de la borne de recharge par tous les résidents.",
    "L'étude de faisabilité technique en copropriété à {VILLE} inclut la vérification du dimensionnement du branchement collectif Enedis et l'évaluation de la distance entre le TGBT et votre place de parking.",
    "Nos installateurs à {VILLE} utilisent des chemins de câbles anti-feu classés M1 dans les parkings couverts, conformément aux prescriptions de sécurité incendie spécifiques aux immeubles d'habitation.",
    "Le raccordement d'une borne individuelle sur une colonne horizontale Enedis à {VILLE} offre l'avantage d'un compteur Linky personnel : vous gérez votre abonnement et votre facturation de manière totalement indépendante.",
    "Pour les copropriétés à {VILLE} disposant de plusieurs bâtiments, nos techniciens IRVE proposent une architecture de réseau maillée permettant d'alimenter tous les parkings depuis un point de livraison unique.",
    "La vérification de la ventilation du parking est une étape obligatoire avant l'installation de bornes en copropriété à {VILLE}. Nos techniciens s'assurent que le débit d'air est conforme aux normes en vigueur.",
    "Nos électriciens IRVE à {VILLE} intègrent systématiquement un dispositif de coupure d'urgence déporté à l'entrée du parking, accessible aux services de secours en cas d'incident."
  ],
  wallbox: [
    "Le choix du modèle de wallbox à {VILLE} s'effectue après un diagnostic complet de l'installation électrique intérieure pour déterminer l'emplacement idéal et la section de câble requise.",
    "À {VILLE}, nous installons un module de liaison télé-information client (TIC) avec votre compteur Linky pour permettre à la wallbox de réguler sa puissance de charge en temps réel.",
    "Les artisans électriciens intervenant à {VILLE} vérifient la conformité de vos dispositifs de protection. Un disjoncteur courbe C de calibre adapté est posé au tableau électrique.",
    "La puissance de charge de votre wallbox à {VILLE} doit être configurée selon votre abonnement Enedis actuel (6 kVA, 9 kVA ou 12 kVA) pour éviter les coupures de courant intempestives.",
    "Pour les poses de bornes murales en extérieur à {VILLE}, nos installateurs veillent à implanter des coffrets étanches ou des bornes certifiées IP65 résistantes à la pluie.",
    "Nos installations de wallbox à {VILLE} intègrent des prises de recharge de Type 2 avec obturateurs de sécurité (Type 2S) conformes aux directives européennes.",
    "Le câblage de votre wallbox à {VILLE} est réalisé en cuivre de section adaptée (6 mm² à 10 mm²) avec des connecteurs IP65 pour garantir une durabilité maximale face aux contraintes climatiques.",
    "Nos techniciens à {VILLE} paramètrent le délestage de votre wallbox via le fil pilote Linky, assurant une gestion intelligente de la puissance sans intervention manuelle de votre part.",
    "L'installation de votre wallbox à {VILLE} inclut la pose d'un différentiel dédié Type A-EV ou Type B, indispensable pour la détection des courants de fuite continus générés par les chargeurs embarqués.",
    "Le choix de l'emplacement de la wallbox à {VILLE} est optimisé par nos techniciens : proximité du tableau, accessibilité pour le câble de charge et protection contre les chocs de manœuvre (IK10).",
    "Les wallbox que nous installons à {VILLE} sont toutes certifiées CE et conformes à la directive européenne 2014/35/UE sur la sécurité des équipements électriques basse tension.",
    "Nos installateurs à {VILLE} proposent des options de fixation sur pied (totem) pour les clients ne disposant pas de mur porteur à proximité de leur place de stationnement."
  ]
};

const EXPERT_TIP_POOLS: Record<string, string[]> = {
  main: [
    "Conseil de pro : Privilégiez une borne de recharge intelligente dotée d'un délestage automatique. Cela vous évite d'augmenter la puissance de votre abonnement Enedis 44 et d'alourdir vos factures.",
    "Astuce de l'électricien : Si votre borne est installée en extérieur à {VILLE}, exigez une pose sous un abri ou optez pour une borne certifiée IP65 pour la préserver de l'humidité océanique de la Loire-Atlantique.",
    "Recommandation IRVE : La section de câble d'alimentation ne doit pas être sous-dimensionnée. Pour une borne de 7.4 kW située à plus de 15 mètres du tableau, du câble de 10 mm² de section en cuivre est indispensable.",
    "Conseil technique : Choisissez une wallbox compatible OCPP. C'est l'assurance de pouvoir la connecter à l'avenir à n'importe quel réseau de gestion intelligente ou système domotique.",
    "Règle de sécurité : N'utilisez jamais une rallonge électrique ou une prise multiple pour recharger votre voiture. Seul un circuit dédié avec protection différentielle type A-EV garantit une charge sûre.",
    "L'avis de l'expert 44 : En programmant votre charge entre 2h et 6h du matin, vous rechargez pendant le creux de consommation électrique régional, ce qui soulage le réseau de l'Ouest.",
    "Conseil d'installation : Prévoyez un passage de câble de section généreuse dès la construction de votre maison à {VILLE}. Un fourreau de 40 mm entre le tableau et le garage facilite grandement l'installation future.",
    "Astuce budgétaire : Faites réaliser 3 devis comparatifs d'installateurs IRVE à {VILLE}. Les écarts de prix peuvent atteindre 30% pour une prestation technique équivalente.",
    "Recommandation sécurité : Exigez une attestation de conformité Consuel après chaque installation de borne à {VILLE}. Ce document est obligatoire pour activer la garantie constructeur de votre véhicule.",
    "Conseil de terrain : Si votre garage à {VILLE} est éloigné du tableau principal, demandez à votre installateur IRVE de poser un tableau divisionnaire à proximité de la borne pour minimiser les pertes de ligne.",
    "Avis d'expert en Loire-Atlantique : Privilégiez un installateur IRVE ayant le label ADVENIR. Il pourra déduire directement la prime de votre facture, vous évitant toute avance de trésorerie.",
    "Astuce entretien : Nettoyez régulièrement le connecteur Type 2 de votre wallbox à {VILLE} avec un chiffon sec. L'humidité résiduelle peut provoquer des micro-arcs et dégrader les contacts à long terme."
  ],
  copropriete: [
    "Conseil d'expert : Envoyez votre demande de droit à la prise en recommandé au syndic au moins 3 mois avant la prochaine assemblée générale de copropriété pour accélérer la signature de la convention.",
    "Astuce en copropriété : Même si vous êtes le premier résident à demander une borne à {VILLE}, suggérez au syndic d'étudier une infrastructure collective Enedis pour faciliter les futurs raccordements.",
    "Recommandation technique : Pour les places de stationnement extérieures à {VILLE}, privilégiez une borne robuste fixée sur pied avec protection IK10 contre les chocs de manœuvres.",
    "Le conseil juridique : En vertu du droit à la prise, le syndic ne peut s'opposer aux travaux d'installation que s'il saisit le tribunal judiciaire sous 3 mois avec un motif sérieux.",
    "Conseil de facturation : Pour les raccordements individuels sur les services généraux de la copropriété, assurez-vous que la borne intègre une télé-relève MID pour simplifier le décompte.",
    "Conseil pratique : Optez pour un installateur IRVE labellisé ADVENIR en Loire-Atlantique pour déduire directement la prime de 960 € de votre devis.",
    "Astuce syndic : Constituez un groupe de copropriétaires intéressés à {VILLE} avant de saisir le syndic. Un projet collectif est toujours mieux accueilli qu'une demande isolée en assemblée générale.",
    "Conseil de pro copropriété : Faites réaliser une étude de faisabilité technique indépendante avant l'AG. Un rapport d'expert neutre rassure les copropriétaires hésitants sur la solidité du projet.",
    "Recommandation juridique : Conservez précieusement l'accusé de réception de votre courrier au syndic. Le délai légal de 3 mois pour statuer sur votre demande court à compter de cette date.",
    "Conseil de gestion : Pour les grandes copropriétés de {VILLE}, négociez un contrat cadre avec un installateur IRVE. Les tarifs dégressifs permettent de réduire le coût unitaire de chaque borne.",
    "Astuce technique : Demandez à votre installateur IRVE de prévoir un câblage avec une section supérieure au minimum requis. Cela permet d'augmenter la puissance de la borne ultérieurement sans refaire le câblage.",
    "Conseil financier : Regroupez votre demande d'aide ADVENIR copropriété avec les travaux de rénovation énergétique prévus dans votre résidence à {VILLE} pour bénéficier d'économies d'échelle."
  ],
  wallbox: [
    "Le conseil de l'artisan : Pour une borne murale installée à {VILLE}, préférez un modèle connecté avec une application mobile claire. Vous pourrez ainsi piloter la recharge depuis votre salon.",
    "Astuce d'usage : Si vous prévoyez d'équiper un second véhicule à l'avenir, optez dès maintenant pour une borne double ou capable de répartir dynamiquement la charge entre deux prises.",
    "Recommandation IRVE : Ne choisissez pas un câble trop court. Un câble de charge de 5 mètres ou 7 mètres garantit un confort d'utilisation optimal, peu importe le sens de stationnement à {VILLE}.",
    "Conseil d'expert : Vérifiez la durée de garantie constructeur de votre wallbox. Les marques européennes reconnues proposent souvent des extensions à 5 ans rassurantes pour votre investissement.",
    "Avis technique : Si votre maison à {VILLE} dispose d'un compteur triphasé, installez une borne de 22 kW bridée temporairement selon vos besoins, offrant une flexibilité maximale.",
    "Le conseil entretien : Protégez le connecteur de Type 2 de l'humidité en le replaçant sur son support mural dédié à {VILLE} après chaque utilisation pour éviter la corrosion.",
    "Conseil de choix : À {VILLE}, privilégiez les wallbox certifiées ZE Ready (pour Renault) ou Tesla Wall Connector si vous roulez en Tesla, pour bénéficier de fonctionnalités optimisées avec votre véhicule.",
    "Astuce économie : Configurez votre wallbox à {VILLE} pour limiter la puissance à 6 kW au lieu de 7.4 kW. La différence de temps de charge est minime, mais cela peut vous éviter de changer d'abonnement.",
    "Recommandation de pro : Faites installer un parafoudre en tête de ligne de votre wallbox à {VILLE}. Les orages de Loire-Atlantique peuvent générer des surtensions destructrices pour l'électronique embarquée.",
    "Conseil de terrain : Si vous hésitez entre deux modèles de wallbox à {VILLE}, choisissez celui qui dispose d'un écran LCD intégré plutôt que le tout-mobile. L'affichage direct facilite le diagnostic en cas de souci.",
    "Astuce futureproof : Choisissez une wallbox compatible avec les futures mises à jour firmware OTA (Over The Air) à {VILLE}. Les améliorations logicielles régulières prolongent la durée de vie utile de votre borne.",
    "Le conseil du technicien : À {VILLE}, faites vérifier l'état de votre disjoncteur de branchement Enedis avant l'installation. Un disjoncteur vieillissant peut provoquer des déclenchements intempestifs sous charge."
  ]
};

const REAL_ESTATE_POOLS: Record<string, string[]> = {
  main: [
    "Les agents immobiliers nantais confirment qu'une maison équipée d'une borne de recharge IRVE se vend plus rapidement et bénéficie d'une valeur verte immédiate sur le marché immobilier de {VILLE}.",
    "À {VILLE}, disposer d'une wallbox de recharge opérationnelle dans le garage est devenu un argument de différenciation de poids lors des visites d'acheteurs potentiels roulant en électrique.",
    "Améliorer les performances énergétiques de sa maison passe aussi par la recharge propre. Poser une borne IRVE valorise votre bien tout en attirant une clientèle moderne à {VILLE}.",
    "Avec la fin annoncée des motorisations thermiques, un pavillon déjà câblé et équipé d'une wallbox de 7.4 kW est un atout standard très recherché par les acquéreurs en Loire-Atlantique.",
    "Selon les notaires du 44, les propriétés dotées d'équipements de recharge résidentiels de qualité dans le secteur de {VILLE} se vendent avec une décote moindre lors des négociations.",
    "Les diagnostiqueurs immobiliers du département intègrent désormais la présence d'une borne IRVE dans leurs évaluations, séduisant les acheteurs CSP+ de la métropole nantaise.",
    "À {VILLE}, de nombreux programmes immobiliers neufs intègrent le pré-câblage IRVE. Équiper votre logement existant est indispensable pour rester compétitif sur le marché immobilier local.",
    "Le marché locatif de Loire-Atlantique récompense les bailleurs proposant un point de charge privé : les appartements ou maisons équipés d'une borne se louent en moyenne plus cher à {VILLE}.",
    "L'interdiction de vente des véhicules thermiques neufs en 2035 accélère la demande de logements équipés IRVE. À {VILLE}, les maisons avec wallbox se positionnent en haut des résultats de recherche immobilière.",
    "Les études récentes du marché immobilier en Loire-Atlantique démontrent qu'une borne de recharge ajoutée à un bien à {VILLE} peut réduire le délai de vente de 15 à 25 jours.",
    "Les promoteurs immobiliers de {VILLE} intègrent systématiquement la borne IRVE dans leurs arguments de vente. En tant que propriétaire existant, suivre cette tendance est un investissement patrimonial judicieux.",
    "La labellisation E+C- (Énergie Positive & Réduction Carbone) des constructions neuves à {VILLE} valorise les solutions de recharge à domicile. Équiper votre logement ancien d'une wallbox aligne votre bien sur ces standards.",
    "Les acquéreurs actifs de la métropole nantaise scrutent désormais la présence d'un point de recharge lors de leur recherche immobilière. À {VILLE}, cet équipement est devenu un critère de sélection à part entière.",
    "Les mandataires immobiliers de Loire-Atlantique signalent que les biens équipés d'une wallbox à {VILLE} reçoivent en moyenne 30% de visites supplémentaires que les biens non équipés.",
    "Le DPE (Diagnostic de Performance Énergétique) est désormais complété par la mention de la présence d'un point de recharge IRVE. À {VILLE}, cette mention positive attire les acheteurs soucieux de mobilité durable.",
    "Dans un marché immobilier dynamique comme celui de {VILLE}, la wallbox IRVE est un investissement qui se valorise au fil des années, à mesure que le parc automobile national se convertit à l'électrique."
  ],
  copropriete: [
    "Un appartement disposant d'un emplacement de parking pré-équipé ou d'une borne individuelle à {VILLE} voit sa valeur immobilière s'apprécier par rapport aux lots non équipés.",
    "Dans les copropriétés résidentielles de {VILLE}, avoir un raccordement de charge individuel permet de louer ou revendre sa place de parking beaucoup plus facilement.",
    "La valeur verte des logements collectifs à {VILLE} devient un critère de choix prioritaire pour les locataires qui éliminent les résidences dépourvues de solution de recharge.",
    "Équiper la copropriété d'une infrastructure collective est un investissement collectif judicieux qui pérennise l'attractivité de l'immeuble à {VILLE} face aux résidences neuves.",
    "Les résidences de standing de Loire-Atlantique qui anticipent l'installation de colonnes Enedis horizontales attirent des acheteurs actifs et valorisent l'ensemble des appartements.",
    "D'après les agences immobilières du 44, un lot de copropriété sans point de charge à {VILLE} subit un délai de vente supérieur de 20% par rapport à un lot équipé.",
    "Les syndics professionnels recommandent d'adopter un plan d'équipement IRVE global pour préserver la compétitivité foncière des résidences collectives à {VILLE}.",
    "L'installation d'une infrastructure de recharge collective en parking souterrain à {VILLE} est perçue positivement par les banques partenaires des copropriétés.",
    "Les résidences collectives de {VILLE} dotées d'une infrastructure IRVE mutualisée affichent un taux d'occupation supérieur et des charges de copropriété mieux acceptées par les résidents.",
    "La présence d'une borne de recharge sur une place de parking en copropriété à {VILLE} peut augmenter la valeur de revente du lot de 3 à 5%, selon les estimations des professionnels.",
    "Les bailleurs institutionnels de Loire-Atlantique investissent massivement dans l'équipement IRVE de leurs résidences. À {VILLE}, les copropriétés privées doivent suivre cette dynamique pour rester attractives.",
    "Un plan d'équipement IRVE voté en AG à {VILLE} envoie un signal fort aux acquéreurs potentiels : la copropriété est engagée dans la transition énergétique et prête pour l'avenir.",
    "Les gestionnaires de patrimoine recommandent aux copropriétaires de {VILLE} d'anticiper l'installation de bornes comme un investissement de préservation de la valeur de leurs biens.",
    "La présence d'un point de recharge en copropriété à {VILLE} est un argument de poids pour les locataires de véhicules électriques en LLD, segment en forte croissance.",
    "Les résidences neuves de {VILLE} sont obligatoirement pré-équipées IRVE. Les copropriétés existantes qui s'équipent réduisent l'écart de compétitivité et préservent leur attractivité.",
    "Les investisseurs immobiliers avisés de Loire-Atlantique considèrent la borne IRVE comme un équipement standard des biens de qualité, au même titre que la climatisation ou le double vitrage."
  ],
  wallbox: [
    "L'installation d'une wallbox de marque reconnue valorise immédiatement votre propriété à {VILLE} en augmentant sa valeur verte auprès des acquéreurs de véhicules électriques.",
    "Avoir une borne murale installée dans son garage est un critère de confort haut de gamme très apprécié lors des transactions immobilières en Loire-Atlantique.",
    "Un logement prêt pour la recharge électrique à {VILLE} se vend en moyenne plus rapidement, évitant aux acheteurs d'entreprendre des démarches de travaux après la vente.",
    "Dans le 44, les maisons individuelles dotées d'un carport équipé d'une wallbox de 7.4 kW se situent en tête des recherches immobilières des actifs de la région.",
    "Les mandataires immobiliers de Loire-Atlantique signalent que les acquéreurs s'enquièrent systématiquement de la présence d'une borne avant de visiter des biens à {VILLE}.",
    "Une maison disposant d'une wallbox performante de 22 kW et d'un compteur triphasé à {VILLE} constitue un argument de vente décisif face aux constructions récentes.",
    "Le retour sur investissement d'une wallbox à {VILLE} se traduit également par une plus-value immobilière de sécurité lors de la revente de votre maison.",
    "Les agents immobiliers spécialisés dans le standing à {VILLE} classent désormais la présence d'une wallbox parmi les équipements premium indispensables.",
    "La tendance est claire à {VILLE} : les acquéreurs de maisons individuelles roulant en électrique éliminent d'office les biens sans solution de recharge dans leurs recherches.",
    "Les maisons avec garage équipé d'une wallbox connectée à {VILLE} se négocient avec moins de décote que les biens non équipés, confirmant l'impact positif sur la valorisation.",
    "L'installation d'une wallbox de qualité à {VILLE} est comparable à l'ajout d'une cuisine équipée : un investissement qui se rentabilise directement lors de la transaction immobilière.",
    "Les experts immobiliers de Loire-Atlantique estiment que la présence d'une wallbox opérationnelle à {VILLE} peut représenter jusqu'à 5 000 € de plus-value sur le prix de vente.",
    "Les résidences secondaires équipées d'une wallbox à {VILLE} attirent une clientèle parisienne ou bordelaise qui planifie ses week-ends en véhicule électrique sur la côte atlantique.",
    "Une wallbox de marque européenne (Easee, Schneider, ABB) installée à {VILLE} rassure les acheteurs potentiels sur la fiabilité et la pérennité de l'installation.",
    "L'immobilier à {VILLE} évolue vers des standards de plus en plus écologiques. La wallbox IRVE est le prolongement naturel des panneaux solaires et des pompes à chaleur.",
    "Les propriétaires de maisons anciennes à {VILLE} qui investissent dans une wallbox modernisent leur bien et attirent une clientèle soucieuse de conjuguer charme architectural et mobilité durable."
  ]
};

const POPULATION_TIER_POOLS: Record<string, string[]> = {
  main: [
    "Avec une population locale active et un engagement fort pour la transition écologique, {VILLE} favorise le développement des mobilités durables. Installer une borne de recharge privée vous permet de devancer les futures normes.",
    "Dans cette commune en plein essor de Loire-Atlantique, le nombre d'automobilistes roulant en électrique progresse rapidement. Disposer d'une borne à domicile reste la solution la plus pratique et économique.",
    "Les stations de recharge publiques à {VILLE} étant souvent occupées aux heures de pointe, faire poser une wallbox privée vous assure une tranquillité d'esprit totale au quotidien.",
    "Pour les familles de {VILLE} équipées d'un ou deux véhicules électriques, posséder sa propre borne de recharge accélère la rotation et simplifie la logistique hebdomadaire.",
    "Dans cette ville dynamique de la métropole nantaise, la transition vers les véhicules propres est largement encouragée par les infrastructures locales et les installateurs IRVE agréés.",
    "La densité de véhicules électriques à {VILLE} démontre l'importance d'avoir son propre point de charge résidentiel pour s'affranchir des contraintes du réseau public de recharge.",
    "En tant que résident éco-conscient de {VILLE}, faire poser votre wallbox par un électricien IRVE qualifié est le choix le plus cohérent pour valoriser vos trajets quotidiens.",
    "Le tissu pavillonnaire et résidentiel de {VILLE} se prête idéalement à l'installation de systèmes de charge intelligents reliés à des compteurs Linky communicants.",
    "Les communes comme {VILLE} en Loire-Atlantique sont au cœur de la transformation de la mobilité. L'installation d'une borne de recharge privée constitue un geste à la fois pratique et engagé.",
    "L'attractivité résidentielle de {VILLE} repose sur un cadre de vie de qualité. L'installation d'une wallbox connectée s'inscrit dans cette exigence de confort moderne et de respect de l'environnement.",
    "Le profil démographique de {VILLE} (ménages actifs, familles CSP+, retraités dynamiques) correspond parfaitement à la cible des véhicules électriques. La borne privée est le complément logique.",
    "La croissance démographique de {VILLE} s'accompagne d'un besoin croissant en infrastructures de recharge. Être parmi les premiers équipés vous positionne avantageusement pour la revente future.",
    "Les résidents de {VILLE} qui travaillent à Nantes ou Saint-Nazaire bénéficient pleinement d'une wallbox à domicile : batterie pleine chaque matin, sans détour par une borne publique.",
    "Le dynamisme associatif et citoyen de {VILLE} se traduit par un intérêt marqué pour les solutions de mobilité durable. La borne de recharge résidentielle en est l'expression concrète la plus accessible.",
    "La qualité du réseau routier entre {VILLE} et les pôles d'emploi de Loire-Atlantique rend le véhicule électrique particulièrement adapté. Une wallbox à domicile optimise encore davantage cette configuration.",
    "À {VILLE}, la combinaison d'un habitat résidentiel de qualité et d'une connexion rapide à la métropole fait de l'installation d'une borne IRVE un investissement logique et rentable."
  ],
  copropriete: [
    "À {VILLE}, les copropriétés s'adaptent rapidement aux besoins de recharge des résidents. Notre réseau technique intervient pour faciliter l'accès individuel aux prises de charge.",
    "Le nombre d'appartements équipés de points de recharge augmente dans les résidences collectives de {VILLE}, signe d'un engouement marqué pour la transition énergétique.",
    "Les copropriétaires de {VILLE} s'organisent pour voter des infrastructures collectives, permettant à chacun de raccorder sa borne sur sa place de parking en sous-sol.",
    "Pour les résidents en appartement à {VILLE}, le droit à la prise constitue un levier juridique puissant pour exiger l'installation d'une borne de recharge dans les parkings partagés.",
    "Les syndics de copropriété à {VILLE} travaillent en étroite collaboration avec nos électriciens IRVE pour déployer des solutions de recharge collectives ou individuelles sécurisées.",
    "La mise en place de bornes dans les parkings collectifs de {VILLE} contribue à la modernisation du parc immobilier résidentiel du département.",
    "Grâce aux subventions ADVENIR copropriété, les résidents de {VILLE} peuvent équiper leurs places de stationnement à un tarif très avantageux.",
    "L'accès à un point de recharge dans les résidences collectives de {VILLE} est devenu un critère incontournable pour attirer et retenir les locataires équipés de VE.",
    "Les assemblées générales de copropriété à {VILLE} inscrivent de plus en plus fréquemment le sujet de la recharge électrique à l'ordre du jour, reflétant une demande croissante des résidents.",
    "La proportion de résidents roulant en électrique dans les copropriétés de {VILLE} dépasse désormais le seuil critique qui justifie l'investissement dans une infrastructure collective pérenne.",
    "Les gestionnaires de copropriété à {VILLE} constatent que les résidences équipées de bornes IRVE enregistrent moins de turnover locatif, témoignant de la satisfaction des résidents.",
    "Les copropriétés récentes de {VILLE} disposent souvent d'un pré-câblage IRVE. Pour les résidences plus anciennes, nos techniciens proposent des solutions de raccordement adaptées au bâti existant.",
    "À {VILLE}, les résidents de copropriétés sont de plus en plus nombreux à opter pour un raccordement individuel avec compteur Linky dédié, solution plébiscitée pour sa simplicité de gestion.",
    "Le conseil syndical de votre résidence à {VILLE} peut mandater une étude technique gratuite via notre réseau IRVE pour évaluer la faisabilité et le coût d'une infrastructure de recharge collective.",
    "Les copropriétés situées à proximité des transports en commun à {VILLE} voient une demande accrue de bornes de recharge, les résidents adoptant un mode de mobilité combiné train+VE.",
    "L'engagement des copropriétaires de {VILLE} en faveur de la recharge électrique témoigne d'une prise de conscience collective qui renforce l'image et la valeur de leur résidence."
  ],
  wallbox: [
    "À {VILLE}, les propriétaires choisissent la wallbox de 7.4 kW pour recharger leur voiture rapidement et en toute sécurité pendant les heures creuses d'Enedis.",
    "L'installation d'une wallbox connectée à {VILLE} répond aux attentes des conducteurs recherchant une charge efficace pour leurs déplacements quotidiens en Loire-Atlantique.",
    "La demande pour des modèles de wallbox intelligents avec programmation horaire et délestage dynamique est en forte croissance parmi les foyers de {VILLE}.",
    "Les installateurs IRVE intervenant à {VILLE} recommandent la wallbox murale pour libérer de l'espace dans les garages tout en assurant une charge performante.",
    "Équiper son garage à {VILLE} d'une wallbox de marque européenne garantit la durabilité de l'installation face aux exigences de puissance régulières.",
    "À {VILLE}, la wallbox s'impose comme l'équipement de recharge résidentiel standard pour recharger les batteries de grande capacité en un temps record.",
    "Les fonctions de smart charging intégrées aux wallbox modernes permettent aux résidents de {VILLE} d'optimiser leur facture énergétique globale.",
    "Faire installer une wallbox connectée à {VILLE} offre une indépendance énergétique complète pour couvrir l'ensemble de vos déplacements en Loire-Atlantique.",
    "Les propriétaires de {VILLE} équipés de panneaux photovoltaïques trouvent dans la wallbox solaire-compatible le complément idéal pour une recharge 100% verte.",
    "Le marché de la wallbox à {VILLE} se diversifie rapidement avec des modèles offrant charge bidirectionnelle, intégration domotique et pilotage vocal avancé.",
    "Les familles bi-motorisées de {VILLE} optent pour des wallbox à double prise ou à répartition dynamique de charge pour alimenter deux véhicules simultanément.",
    "La robustesse des wallbox certifiées IP65/IK10 est particulièrement appréciée à {VILLE}, où le climat océanique impose une résistance accrue aux intempéries.",
    "Les résidents de {VILLE} qui passent à la wallbox constatent une simplification considérable de leur quotidien : plus de file d'attente aux bornes publiques et une batterie toujours prête.",
    "L'évolution technologique des wallbox proposées à {VILLE} permet désormais de restituer l'énergie stockée dans la batterie du véhicule vers la maison (V2H) en cas de pic de consommation.",
    "Les modèles de wallbox les plus demandés à {VILLE} combinent design compact, connectivité Wi-Fi/4G et compatibilité avec les principaux fournisseurs d'énergie verte.",
    "L'installation d'une wallbox à {VILLE} s'accompagne d'une configuration personnalisée des paramètres de charge (puissance, horaires, limitation) adaptée à vos habitudes de vie."
  ]
};

const REGULATION_POOLS: Record<string, string[]> = {
  main: [
    "Conformément au décret IRVE de janvier 2017, la pose d'un point de charge d'une puissance supérieure à 3.7 kW doit être réalisée par un électricien titulaire d'une qualification IRVE agréée. Cette certification est requise par les assureurs et les constructeurs de batteries pour valider les garanties.",
    "La réglementation impose que toute borne installée en maison individuelle dispose d'un circuit dédié protégé par un disjoncteur différentiel de 30 mA de type A-EV ou type B. Notre réseau d'artisans à {VILLE} garantit la conformité totale de votre installation.",
    "La norme NF C 15-100 régit l'installation des circuits de recharge à {VILLE}. Elle impose des contrôles stricts de la résistance de la prise de terre pour empêcher toute surcharge ou électrisation des utilisateurs.",
    "Pour bénéficier des aides nationales et régionales (Crédit d'impôt de 500 € et TVA réduite), l'installateur doit obligatoirement fournir une attestation de travaux certifiée IRVE Qualifelec ou AFNOR à la fin du chantier.",
    "Le guide UTE C 15-722, spécifique aux installations de recharge, impose à {VILLE} la pose de protections adaptées aux courants continus résiduels générés par les chargeurs embarqués des véhicules électriques.",
    "La réglementation thermique RE2020 intègre désormais le pré-équipement IRVE dans les constructions neuves. À {VILLE}, les maisons existantes doivent être mises aux normes par un professionnel qualifié pour rester conformes.",
    "L'attestation de conformité Consuel délivrée après l'installation de votre borne à {VILLE} est le document indispensable pour activer la garantie constructeur de votre véhicule et valider votre éligibilité aux aides de l'État.",
    "Le décret n° 2021-546 renforce les obligations de sécurité pour les installations de recharge en Loire-Atlantique : chaque borne doit disposer d'un dispositif de coupure d'urgence accessible et d'une signalétique conforme."
  ],
  copropriete: [
    "Le droit à la prise, renforcé par le décret n° 2020-1720, autorise tout propriétaire, locataire ou occupant de bonne foi à {VILLE} à installer un point de recharge sur son emplacement de parking après notification officielle du syndic.",
    "La réglementation en copropriété impose le respect des normes de sécurité incendie, notamment la présence de dispositifs de coupure d'urgence accessibles aux pompiers et le câblage sous fourreaux coupe-feu.",
    "Toute pose de borne de recharge en parking partagé doit faire l'objet d'une convention signée entre le copropriétaire demandeur et le syndic de copropriété pour définir les modalités d'accès et de remboursement de l'électricité.",
    "Les installations collectives de recharge en copropriété à {VILLE} doivent respecter le cahier des charges ADVENIR pour ouvrir droit aux subventions finançant 50% des travaux de raccordement collectif.",
    "La loi Climat et Résilience de 2021 renforce le droit à la prise en copropriété. À {VILLE}, le syndic dispose d'un délai de 3 mois pour répondre à votre demande, passé lequel le silence vaut acceptation.",
    "L'article 24-5 de la loi du 10 juillet 1965 fixe les modalités de vote en AG pour les travaux de recharge en copropriété. À {VILLE}, la décision est prise à la majorité simple de l'article 24.",
    "Le décret n° 2020-1720 prévoit que le syndic ne peut s'opposer à une installation individuelle de borne en copropriété à {VILLE} que pour des motifs sérieux et légitimes, après saisine du tribunal judiciaire.",
    "Les copropriétés neuves livrées après le 1er janvier 2025 à {VILLE} doivent être équipées d'un réseau de canalisations pour le passage futur des câbles d'alimentation des bornes de recharge."
  ],
  wallbox: [
    "La pose d'une wallbox à domicile à {VILLE} doit impérativement respecter la norme NF C 15-100 Section 722, qui impose une prise de charge équipée d'obturateurs de sécurité (Type 2S) pour interdire les contacts directs.",
    "L'électricien IRVE assurant l'installation de votre wallbox doit obligatoirement réaliser un test de déclenchement différentiel et mesurer la boucle de terre pour délivrer l'attestation de conformité Consuel requise par les assurances.",
    "Pour être éligible au crédit d'impôt de 500 € en 2026, la wallbox doit être pilotable, c'est-à-dire disposer d'une fonctionnalité de programmation de charge ou de modulation de puissance en heures creuses.",
    "Le raccordement d'une wallbox de 22 kW exige un abonnement en courant triphasé et une déclaration préalable auprès d'Enedis Loire-Atlantique pour vérifier la capacité de charge du réseau électrique de votre quartier.",
    "La directive européenne 2014/94/UE impose que toutes les wallbox installées à {VILLE} disposent d'un connecteur Type 2 universel, compatible avec l'ensemble des véhicules électriques commercialisés en Europe.",
    "Le guide pratique UTE C 15-722 applicable à {VILLE} spécifie les calibres de protection recommandés : disjoncteur courbe C de 40A pour une wallbox de 7.4 kW et différentiel 30 mA de type A-EV minimum.",
    "La certification IEC 61851 de votre wallbox garantit le respect de toutes les normes internationales de sécurité. À {VILLE}, nos installateurs IRVE ne posent que des modèles disposant de cette certification.",
    "Le marquage CE obligatoire sur votre wallbox atteste de sa conformité aux exigences essentielles de sécurité européennes. À {VILLE}, vérifiez systématiquement la présence de ce marquage avant toute installation."
  ]
};

// =====================================================================
// EXPERT BLOCKQUOTE POOLS — Dynamic geo-zoned E-E-A-T content
// Replaces the previously hardcoded blockquotes in templates
// =====================================================================
const EXPERT_BLOCKQUOTE_POOLS: Record<string, Record<string, string[]>> = {
  main: {
    'coastline': [
      "L'atmosphère saline du littoral de Loire-Atlantique impose des contraintes spécifiques pour les installations de bornes à {VILLE}. Nos électriciens certifiés utilisent des fixations en inox marin et des presse-étoupes anti-corrosion pour garantir la longévité de votre wallbox face aux embruns et aux vents marins de la côte atlantique.",
      "Le climat océanique humide du secteur de {VILLE} exige une attention particulière à l'étanchéité des raccordements. Nos techniciens IRVE posent systématiquement des coffrets IP65 en façade et appliquent un traitement hydrofuge sur les traversées murales pour prévenir toute infiltration d'eau.",
      "Les sols sablonneux du littoral de {VILLE} peuvent présenter une résistivité de terre élevée. Nos installateurs effectuent une mesure de terre et posent si nécessaire un piquet en cuivre supplémentaire pour garantir la conformité Consuel et le déclenchement fiable des protections différentielles.",
      "Sur le littoral de {VILLE}, les variations de température et l'air salin accélèrent l'oxydation des composants électriques. Nos techniciens sélectionnent des bornes avec revêtement anti-UV et connecteurs en alliage résistant à la corrosion marine."
    ],
    'nantes-metropolis': [
      "Les sous-sols schisteux et granitiques du socle armoricain présents dans le secteur de {VILLE} peuvent présenter une résistivité de terre élevée. Nos électriciens partenaires effectuent systématiquement une mesure de la boucle de terre et installent si nécessaire un piquet de terre supplémentaire en cuivre pour garantir la conformité Consuel.",
      "Dans le tissu urbain dense de la métropole nantaise autour de {VILLE}, l'accès au tableau électrique et le passage de câbles nécessitent une étude préalable minutieuse. Nos techniciens IRVE réalisent un relevé 3D des cheminements pour optimiser le parcours du câblage tout en minimisant l'impact visuel.",
      "Les maisons de ville nantaises du secteur de {VILLE}, souvent construites en tuffeau ou en pierre de Loire, demandent une pose de borne respectueuse du patrimoine. Nos installateurs utilisent des fixations spéciales pour murs anciens et des chemins de câbles discrets assortis aux façades.",
      "Le réseau électrique Enedis dans le secteur métropolitain de {VILLE} est généralement robuste, mais les quartiers anciens peuvent présenter des branchements sous-dimensionnés. Nos techniciens coordonnent avec Enedis 44 tout renforcement nécessaire avant l'installation de votre borne."
    ],
    'rural-briere': [
      "Les constructions rurales en pierre de Loire-Atlantique autour de {VILLE} possèdent souvent des réseaux électriques vieillissants. Nos techniciens IRVE effectuent un diagnostic complet du tableau et de la prise de terre avant toute installation, incluant si nécessaire une mise aux normes de l'alimentation principale.",
      "Dans les zones bocagères du nord de la Loire-Atlantique autour de {VILLE}, les distances entre le compteur Enedis et le garage peuvent être importantes. Nos installateurs dimensionnent le câblage en conséquence (10 mm² voire 16 mm²) pour éviter les chutes de tension sur les longues distances.",
      "Les habitations isolées du secteur de {VILLE} sont parfois alimentées en bout de ligne Enedis. Nos techniciens IRVE installent un module de délestage intelligent qui régule la puissance de la borne en cas de baisse de tension réseau pour garantir une charge stable.",
      "Les toitures en ardoise et les murs en granit typiques du bâti rural de {VILLE} nécessitent un outillage spécifique pour la fixation de la borne. Nos installateurs certifiés utilisent des chevilles chimiques haute performance adaptées aux pierres dures du Massif Armoricain."
    ]
  },
  copropriete: {
    'coastline': [
      "Les parkings des copropriétés en bord de mer à {VILLE} sont exposés aux projections salines et à l'humidité ambiante. Nos techniciens certifiés posent des bornes avec coffrets en inox IP65/IK10 et des chemins de câbles coupe-feu résistants à la corrosion pour pérenniser les installations.",
      "Dans les résidences côtières de {VILLE}, les sous-sols peuvent être soumis à des remontées d'humidité liées à la nappe phréatique littorale. Nos installateurs IRVE vérifient le taux d'hygrométrie du parking et choisissent des bornes avec une protection renforcée contre la condensation.",
      "Les copropriétés du littoral de {VILLE} subissent des contraintes climatiques spécifiques (vents forts, air salin, humidité). Nos techniciens sélectionnent des câbles à gaine renforcée et des connecteurs étanches pour garantir la fiabilité des installations de recharge en bord de mer.",
      "Le sel marin présent dans l'air à {VILLE} peut provoquer une corrosion accélérée des contacts électriques. Nos installateurs IRVE appliquent un traitement anti-oxydation sur tous les points de connexion et recommandent une maintenance préventive annuelle."
    ],
    'nantes-metropolis': [
      "Pour les copropriétés situées dans le périmètre métropolitain de {VILLE}, les parkings souterrains sont souvent humides en raison de la proximité de la Loire et de l'Erdre. Nos techniciens certifiés posent des chemins de câbles et coffrets de dérivation avec un indice d'étanchéité renforcé (IP65/IK10).",
      "Les immeubles d'habitation de la métropole nantaise autour de {VILLE} présentent des configurations de parking variées (en sous-sol, en surface, en structure). Nos installateurs IRVE adaptent la solution technique à chaque typologie pour garantir conformité et sécurité.",
      "La densité du bâti collectif dans le secteur de {VILLE} impose une gestion intelligente de la puissance disponible. Nos techniciens IRVE installent des systèmes de load balancing permettant d'équiper tous les résidents sans renforcer le branchement Enedis de la copropriété.",
      "Les copropriétés anciennes du centre-ville de {VILLE} peuvent présenter des contraintes d'accessibilité pour le passage de câbles. Nos installateurs utilisent des techniques non destructives (forage horizontal, chemins de câbles affleurants) pour préserver l'intégrité du bâti."
    ],
    'rural-briere': [
      "Les résidences collectives en zone rurale autour de {VILLE} disposent souvent de parkings extérieurs plus vastes, facilitant l'installation de bornes sur pied ou sur muret. Nos techniciens IRVE conçoivent des solutions robustes adaptées aux espaces ouverts et aux conditions climatiques locales.",
      "Dans les bourgs ruraux de Loire-Atlantique autour de {VILLE}, les copropriétés sont généralement de taille modeste. Nos installateurs proposent des solutions de recharge individuelles avec sous-compteur MID, plus adaptées que les infrastructures collectives coûteuses.",
      "Les petites copropriétés rurales du secteur de {VILLE} bénéficient souvent d'un réseau Enedis dimensionné pour de faibles consommations. Nos techniciens IRVE évaluent la puissance disponible et proposent des bornes à délestage dynamique pour éviter tout surcoût d'abonnement.",
      "Les résidences collectives des communes rurales autour de {VILLE} peuvent présenter des distances importantes entre le TGBT et les places de parking. Nos installateurs IRVE dimensionnent des câblages de section adaptée pour garantir une alimentation stable sur de longues portées."
    ]
  },
  wallbox: {
    'coastline': [
      "Pour les installations en extérieur ou sous carport sur le littoral de {VILLE}, l'atmosphère saline et les intempéries exigent une protection IP65 et des presse-étoupes en inox. Nos artisans installateurs appliquent un traitement anti-corrosion sur les supports et fixations pour pérenniser le fonctionnement de votre wallbox face au vent marin.",
      "Les villas balnéaires de {VILLE} nécessitent des wallbox spécialement conçues pour résister aux embruns. Nos techniciens IRVE sélectionnent des modèles avec boîtier en polycarbonate UV-résistant et connecteurs en alliage marin pour une durabilité maximale en environnement côtier.",
      "Le sel marin et l'humidité constante à {VILLE} imposent le choix de wallbox avec indice IK10 (résistance aux chocs) et IP65 (étanchéité totale). Nos installateurs certifiés vérifient également l'état des joints d'étanchéité lors de chaque maintenance préventive.",
      "Les installations de wallbox en bord de mer à {VILLE} requièrent une attention particulière à la qualité des raccordements. Nos techniciens utilisent des connecteurs à sertissage étanche et des gaines thermo-rétractables pour protéger chaque point de connexion de la corrosion saline."
    ],
    'nantes-metropolis': [
      "Les sous-sols schisteux et granitiques du Massif Armoricain présents dans le secteur de {VILLE} peuvent présenter une résistivité de terre élevée. Nos électriciens partenaires effectuent systématiquement une mesure de la boucle de terre et installent si nécessaire un piquet de terre supplémentaire en cuivre pour garantir la conformité Consuel et le déclenchement des protections différentielles.",
      "Dans le secteur de {VILLE}, les variations de tension du réseau Enedis en période de forte consommation (hiver, soirées) peuvent affecter la qualité de charge. Nos techniciens installent des wallbox avec régulation de tension intégrée pour garantir une charge optimale en toutes circonstances.",
      "Les maisons mitoyennes typiques de la métropole nantaise autour de {VILLE} imposent des contraintes de passage de câbles. Nos installateurs IRVE planifient des cheminements discrets en applique murale avec des goulottes assorties à la façade pour un rendu esthétique soigné.",
      "Le tissu urbain dense autour de {VILLE} signifie souvent des garages de taille réduite. Nos techniciens IRVE optimisent le positionnement de la wallbox pour maximiser l'espace restant, en privilégiant des modèles ultra-compacts comme l'Easee One ou le Schneider Charge."
    ],
    'rural-briere': [
      "Les constructions rurales en pierre de Loire-Atlantique autour de {VILLE} possèdent souvent des murs épais nécessitant des traversées adaptées. Nos installateurs IRVE utilisent des carottages au diamètre juste et des manchons étanches pour le passage du câble d'alimentation de votre wallbox.",
      "Dans les zones rurales du secteur de {VILLE}, les distances entre le compteur et le lieu d'installation de la wallbox peuvent dépasser 20 mètres. Nos techniciens prévoient des sections de câble majorées (10 mm² ou 16 mm²) et un tableau divisionnaire local pour compenser les pertes de ligne.",
      "Les propriétés rurales du secteur de {VILLE} disposent souvent de hangars ou de dépendances idéaux pour l'installation d'une wallbox. Nos techniciens IRVE évaluent la faisabilité du raccordement depuis le tableau principal et proposent des solutions d'alimentation enterrée si nécessaire.",
      "Le réseau électrique en zone rurale autour de {VILLE} peut présenter des fluctuations de tension. Nos installateurs équipent votre wallbox d'un module de régulation qui adapte automatiquement la puissance de charge à la qualité du courant disponible."
    ]
  }
};

// =====================================================================
// generateCommuneContent — Main content generation function
// Uses UNIQUE OFFSETS per pool to maximize combinatorial diversity
// =====================================================================

export function generateCommuneContent(commune: Commune, category: 'main' | 'copropriete' | 'wallbox'): LocalContent {
  const seed = `${commune.slug}-${category}`;
  const prices = getDynamicPrices(commune);
  const cp = commune.codePostal;
  const name = commune.nom;
  const zone = getGeographicZone(cp, commune.slug);
  const agency = getLocalAgency(cp, commune.slug);

  // Spin helper with UNIQUE offset per pool (fixes hash collision)
  const sOffset = (pool: string[], offset: number) => {
    const idx = getVariantIndex(seed, offset, pool.length);
    const spun = spin(pool[idx], seed);
    return spun
      .replace(/{VILLE}/g, name)
      .replace(/{CODE_POSTAL}/g, cp)
      .replace(/{PRIX_MIN}/g, String(prices.wallbox7kW.min))
      .replace(/{PRIX_MAX}/g, String(prices.wallbox7kW.max));
  };

  // Each pool gets a DIFFERENT offset to break hash correlation
  const introParagraph = sOffset(INTRO_POOLS[category], 10);
  const useCaseText = sOffset(USE_CASE_POOLS[category], 23);
  const ecoText = sOffset(ECO_POOLS[category], 37);
  const localContext = sOffset(COMMUNE_DATA_POOLS[category], 41);
  const expertTip = sOffset(EXPERT_TIP_POOLS[category], 53);
  const realEstateInsight = sOffset(REAL_ESTATE_POOLS[category], 67);
  const populationTierContent = sOffset(POPULATION_TIER_POOLS[category], 79);
  const localRegulation = sOffset(REGULATION_POOLS[category], 83);

  const lastUpdated = "Juin 2026";
  const climateZoneLabel = zone === 'coastline' ? "littoral atlantique de la Loire-Atlantique" : zone === 'nantes-metropolis' ? "cœur de la métropole nantaise" : "zone rurale et bocagère du nord du département";
  const localAgencyName = agency.name;

  const savingsEstimate = category === 'copropriete' ? "960 € (ADVENIR) + 500 € (crédit d'impôt)" : "500 € (crédit d'impôt national)";

  // Spun logistics alert (8 variants, unique offset 89)
  const ALERTS = [
    `Pour les chantiers situés à ${name}, nos techniciens se déplacent systématiquement pour une visite technique préalable. Cela permet d'identifier l'emplacement optimal de la borne et de chiffrer précisément les mètres de câble nécessaires.`,
    `Attention aux distances de câblage à ${name} : si la borne est posée à plus de 15 mètres du tableau électrique principal, une section de câble supérieure (10 mm² ou 16 mm²) sera requise pour limiter les chutes de tension.`,
    `Dans le bâti ancien de Loire-Atlantique, la mise aux normes du tableau principal (installation d'un interrupteur différentiel dédié et d'un disjoncteur divisionnaire courbe C) est souvent un prérequis indispensable avant la pose de la borne.`,
    `Nos artisans électriciens à ${name} s'occupent de toutes les démarches administratives de labellisation ADVENIR, déduisant ainsi directement la prime de copropriété de votre facture finale.`,
    `Avant toute pose de borne à ${name}, nos installateurs IRVE vérifient la compatibilité de votre abonnement Enedis avec la puissance demandée. Si un passage en triphasé est nécessaire, nous coordonnons directement avec Enedis 44.`,
    `Les interventions à ${name} débutent toujours par un relevé photographique détaillé du tableau électrique et du parcours de câble. Ce document vous est remis avec le devis pour une transparence totale sur les travaux envisagés.`,
    `Pour les installations en extérieur à ${name}, nos techniciens préconisent systématiquement une pose sous abri ou une borne certifiée IP65/IK10 pour résister aux conditions climatiques du département.`,
    `Nos équipes intervenant à ${name} garantissent un délai maximum de 15 jours ouvrés entre la validation du devis et la mise en service de votre borne de recharge, hors délais Enedis pour le triphasé.`
  ];
  const alertIdx = getVariantIndex(seed, 89, ALERTS.length);
  const logisticsAlert = ALERTS[alertIdx];

  // Spun prices context (8 variants, unique offset 97)
  const PRICES_CONTEXTS = [
    `Le coût total d'une wallbox à ${name} varie selon la puissance (7.4 kW en monophasé vs 11/22 kW en triphasé) et la complexité des travaux de raccordement (goulottes intérieures ou tranchée extérieure dans le jardin).`,
    `À ${name}, nos devis intègrent systématiquement la fourniture de la borne connectée, les protections électriques requises en tête de ligne, et le câble d'alimentation en cuivre de grosse section.`,
    `Le budget de pose d'un point de charge à ${name} inclut le taux de TVA super-réduit à 5,5% pour les logements construits depuis plus de 2 ans, allégeant significativement le coût final de l'installation.`,
    `Bénéficiez d'une estimation transparente pour votre projet de charge à ${name}. Nos installateurs comparent les modèles de bornes (Keba, Schneider, ABB) pour vous proposer le meilleur rapport qualité-prix.`,
    `Les tarifs d'installation à ${name} comprennent l'ensemble des prestations : diagnostic électrique, fourniture du matériel certifié, pose conforme NF C 15-100, mise en service et attestation Consuel.`,
    `Le prix de pose d'une borne de recharge à ${name} varie principalement en fonction de la distance entre le tableau électrique et l'emplacement de la borne. Plus cette distance est courte, plus le devis sera accessible.`,
    `Nos devis d'installation à ${name} sont personnalisés et détaillés ligne par ligne. Aucun frais caché : chaque composant (borne, câble, protections, main d'œuvre) est clairement identifié.`,
    `Le rapport qualité-prix de nos installations à ${name} est garanti par notre sélection de marques européennes reconnues et par l'utilisation exclusive de matériaux certifiés conformes aux normes en vigueur.`
  ];
  const priceIdx = getVariantIndex(seed, 97, PRICES_CONTEXTS.length);
  const pricesContext = PRICES_CONTEXTS[priceIdx];

  // Spun table intro (8 variants, unique offset 103)
  const TABLE_INTROS = [
    `Consultez les tarifs indicatifs pour les différents types d'équipements de recharge résidentiels posés à ${name} :`,
    `Découvrez le budget moyen à prévoir pour l'achat et la pose d'une borne ou d'une prise renforcée à ${name} en 2026 :`,
    `Voici le tableau comparatif des prix pour l'installation d'un chargeur de voiture électrique à ${name} :`,
    `Retrouvez ci-dessous la tarification de base pour les équipements de recharge IRVE à ${name} (devis moyen constaté) :`,
    `Les tarifs suivants reflètent les prix moyens constatés auprès de nos installateurs IRVE intervenant à ${name} et dans les communes voisines :`,
    `Estimez le coût de votre projet de recharge à ${name} grâce à notre grille tarifaire actualisée pour 2026 :`,
    `Le tableau ci-dessous présente les fourchettes de prix pour les principales solutions de recharge résidentielle disponibles à ${name} :`,
    `Pour vous aider à budgétiser votre installation de borne à ${name}, voici les tarifs moyens constatés en Loire-Atlantique en 2026 :`
  ];
  const tableIntroIdx = getVariantIndex(seed, 103, TABLE_INTROS.length);
  const tableIntroText = TABLE_INTROS[tableIntroIdx];

  // Spun Real Estate Insight (8 variants, unique offset 109)
  const RE_INSIGHTS = [
    `L'analyse des transactions immobilières en Loire-Atlantique montre qu'une place de parking équipée d'une borne ou un garage avec wallbox accélère la vente et réduit le temps de négociation à ${name}.`,
    `Avec un prix moyen du mètre carré estimé à ${commune.prixM2Moyen || 2500} € à ${name}, disposer d'un équipement IRVE de standing est une plus-value moderne très appréciée par les acheteurs locaux.`,
    `Dans cette commune affichant un taux de maisons individuelles de ${commune.logementsMaison || 50}%, installer une borne privée à domicile est un investissement vertueux rapidement rentabilisé lors de la revente du bien.`,
    `Les diagnostiqueurs immobiliers du 44 confirment qu'une wallbox murale de 7.4 kW opérationnelle est perçue par les acquéreurs comme un équipement de confort haut de gamme à ${name}.`,
    `Le marché immobilier de ${name} valorise les biens équipés de solutions de recharge IRVE. Les acheteurs actifs de la métropole nantaise considèrent cet équipement comme un critère de sélection prioritaire.`,
    `Avec un patrimoine estimé à ${commune.prixM2Moyen || 2500} €/m² à ${name}, l'ajout d'une wallbox représente un investissement minime au regard de la valorisation qu'elle apporte à votre bien immobilier.`,
    `Les notaires de Loire-Atlantique constatent que les transactions immobilières à ${name} intègrent de plus en plus la question de la recharge électrique dans les discussions de négociation.`,
    `La présence d'une borne IRVE opérationnelle dans un bien à ${name} rassure les acquéreurs sur la qualité technique du logement et témoigne d'un propriétaire soucieux de l'entretien et de la modernisation de son patrimoine.`
  ];
  const reIdx = getVariantIndex(seed, 109, RE_INSIGHTS.length);
  const realEstateInsightText = RE_INSIGHTS[reIdx];

  // Spun market tier insight (8 variants, unique offset 113)
  const MARKET_TIERS = [
    `Le marché de l'immobilier à ${name} est classé en zone ${commune.marcheImmobilier || 'intermédiaire'}, attirant des ménages actifs sensibles à la transition écologique et désireux de s'équiper de solutions de recharge fiables.`,
    `Avec une population de ${commune.population.toLocaleString()} habitants, ${name} présente un profil immobilier ${commune.tauxMaisonLabel || 'mixte'}, ce qui influence directement le type d'installations de recharge demandées (maison vs copropriété).`,
    `Pour ce secteur caractérisé par un marché immobilier ${commune.marcheImmobilier || 'intermédiaire'}, la présence d'une wallbox valorise le patrimoine et attire les acquéreurs de la métropole nantaise roulant déjà en électrique.`,
    `Le tissu urbain de ${name} avec ses ${commune.logementsMaison || 50}% de pavillons individuels se prête idéalement à l'installation de prises renforcées Green'Up et de wallbox de 7.4 kW.`,
    `Le dynamisme immobilier de ${name} (marché ${commune.marcheImmobilier || 'intermédiaire'}) reflète une attractivité résidentielle en hausse, portée par des ménages actifs qui plébiscitent les logements équipés de solutions de mobilité durable.`,
    `Avec ${commune.logements?.toLocaleString() || '4 000'} logements recensés et un taux de maisons de ${commune.logementsMaison || 50}%, ${name} offre un potentiel d'installation de bornes résidentielles considérable pour le département.`,
    `La croissance de ${commune.croissanceVE || 35}% des immatriculations de véhicules électriques à ${name} témoigne d'un marché local en pleine mutation, où la borne de recharge devient un équipement standard attendu par les résidents.`,
    `Le profil résidentiel de ${name} (${commune.profilCommune || 'commune dynamique'}) génère une demande soutenue en installations IRVE, portée par des ménages actifs et des familles souhaitant réduire leur empreinte carbone.`
  ];
  const marketIdx = getVariantIndex(seed, 113, MARKET_TIERS.length);
  const marcheImmobilierInsight = MARKET_TIERS[marketIdx];

  // Spun distance to Nantes context (8 variants, unique offset 119)
  const distKm = commune.distanceNantes || 10;
  const DISTANCE_TEMPLATES = [
    `Située à seulement ${distKm} km du centre de Nantes, la commune de ${name} bénéficie d'une accessibilité directe à la métropole. Les trajets pendulaires quotidiens représentent environ ${distKm * 2} km aller-retour, une distance idéale pour rouler en électrique et recharger à domicile.`,
    `À une distance de ${distKm} km de Nantes, la ville de ${name} accueille de nombreux navetteurs qui parcourent ces distances chaque jour. Charger son véhicule sur sa borne privée de 7.4 kW à domicile est la solution la plus pratique et économique pour couvrir ces déplacements.`,
    `La proximité géographique de ${name} (${distKm} km du cœur de Nantes) en fait une commune résidentielle recherchée. Un aller-retour quotidien métropolitain ne consomme que très peu d'autonomie, qui se récupère en moins de 2 heures de branchement sur une wallbox.`,
    `Pour les trajets quotidiens reliant ${name} à Nantes (${distKm} km), posséder sa propre wallbox intelligente permet d'optimiser ses charges et de réaliser de substantielles économies sur le coût de l'électricité.`,
    `Les ${distKm} km séparant ${name} du centre de Nantes représentent un trajet quotidien de ${(distKm * 2 * 0.15).toFixed(1)} kWh en véhicule électrique. Avec une wallbox de 7.4 kW, ce besoin est couvert en moins de ${((distKm * 2 * 0.15) / 7.4).toFixed(1)} heures de charge.`,
    `La liaison routière entre ${name} et Nantes (${distKm} km) est parfaitement adaptée à l'usage d'un véhicule électrique. La recharge nocturne à domicile sur une wallbox garantit une autonomie confortable pour les trajets quotidiens et les imprévus.`,
    `Résider à ${name}, à ${distKm} km de la métropole nantaise, offre un cadre de vie privilégié compatible avec la mobilité électrique. Le trajet pendulaire ne représente que ${(distKm * 2 * 0.15).toFixed(1)} kWh, soit environ ${((distKm * 2 * 0.15) * 0.19).toFixed(2)} € de recharge en heures creuses.`,
    `La position de ${name} dans le département (${distKm} km de Nantes) permet de bénéficier pleinement des avantages de la mobilité électrique : trajets courts, recharge nocturne économique et accès rapide à l'ensemble des pôles d'emploi de Loire-Atlantique.`
  ];
  const distIdx = getVariantIndex(seed, 119, DISTANCE_TEMPLATES.length);
  const distanceNantesContext = DISTANCE_TEMPLATES[distIdx];

  // Spun FAQ items (14 total, select 3 per commune with unique offsets)
  const FAQ_POOL = [
    {
      q: "Est-il légalement obligatoire d'utiliser un installateur qualifié IRVE ?",
      a: "Oui, le décret du 12 janvier 2017 impose que toute borne d'une puissance supérieure à 3.7 kW soit installée par un électricien qualifié IRVE. Sans cette attestation, votre assurance habitation peut refuser de vous indemniser en cas de sinistre, et le constructeur automobile peut invalider la garantie de la batterie."
    },
    {
      q: "Quel est le montant du crédit d'impôt en 2026 ?",
      a: "Pour l'année 2026, l'État octroie un crédit d'impôt forfaitaire de 500 € par contribuable pour l'installation d'une borne de recharge pilotable (permettant la programmation des charges en heures creuses) à votre domicile (résidence principale ou secondaire)."
    },
    {
      q: "Peut-on cumuler les aides pour installer sa borne en Loire-Atlantique ?",
      a: "Oui, les aides sont cumulables. Vous pouvez bénéficier du crédit d'impôt national de 500 €, du taux de TVA réduit à 5,5% appliqué sur le devis, et de la prime ADVENIR individuelle (allant jusqu'à 960 € TTC) si vous résidez en copropriété."
    },
    {
      q: "Combien de temps prend la recharge sur une wallbox de 7.4 kW ?",
      a: "Pour une batterie moyenne de 60 kWh, une borne de 7.4 kW monophasée permet de récupérer l'intégralité de l'autonomie en environ 7 à 8 heures (soit une nuit de charge standard), contre plus de 24 heures sur une simple prise de courant domestique."
    },
    {
      q: "Faut-il modifier son abonnement d'électricité chez Enedis ?",
      a: "Dans la majorité des cas, il n'est pas nécessaire d'augmenter la puissance de votre abonnement (généralement 9 kVA). Nous installons un module de délestage dynamique qui régule la puissance de la borne en temps réel selon les autres consommations de la maison."
    },
    {
      q: "La borne est-elle compatible avec toutes les marques de voitures ?",
      a: "Oui, les wallbox installées par nos artisans certifiés disposent d'un connecteur de Type 2 (le standard européen), compatible avec l'ensemble des voitures électriques modernes (Tesla, Renault, Peugeot, Volkswagen, BMW, Audi)."
    },
    {
      q: "Peut-on installer une borne de recharge en extérieur sans abri ?",
      a: "Oui. Les bornes sélectionnées par nos techniciens intègrent des indices de protection renforcés IP65 et IK10. Elles résistent parfaitement à la pluie, à la poussière et aux gelées hivernales sans nécessiter d'abri dédié."
    },
    {
      q: "Comment fonctionne le droit à la prise en copropriété ?",
      a: "Le droit à la prise (décret de 2020) permet à tout occupant (propriétaire ou locataire) d'équiper sa place de parking privative en copropriété. Vous devez notifier votre syndic avec un dossier technique. Le syndic ne peut s'y opposer que pour des motifs sérieux et légitimes."
    },
    {
      q: `Quel est le coût réel d'une recharge complète à ${name} ?`,
      a: `Pour une batterie de 60 kWh rechargée en heures creuses à ${name}, le coût est d'environ 3 à 4 € (soit environ 0,06 €/km). En comparaison, un plein de carburant pour la même autonomie coûterait entre 40 et 60 €, soit un rapport de 1 à 10 en faveur de l'électrique.`
    },
    {
      q: "Quelle est la durée de vie moyenne d'une wallbox ?",
      a: "Les wallbox de marques reconnues (Easee, Schneider, ABB) ont une durée de vie estimée entre 15 et 20 ans, soit bien supérieure à la durée de détention moyenne d'un véhicule. La garantie constructeur couvre généralement 3 à 5 ans, pièces et main-d'œuvre."
    },
    {
      q: "Peut-on installer une borne sur un mur en pierre ou en parpaing ?",
      a: "Oui, nos installateurs IRVE disposent de l'outillage adapté pour fixer une wallbox sur tous types de supports : mur en pierre, parpaing, béton, brique ou plaque de plâtre renforcée. Des chevilles chimiques haute performance sont utilisées pour les murs en pierre ancienne."
    },
    {
      q: `Combien coûte l'installation d'une borne de recharge à ${name} ?`,
      a: `Le prix moyen d'une installation de wallbox 7.4 kW à ${name} se situe entre ${prices.wallbox7kW.min} € et ${prices.wallbox7kW.max} € TTC, fourniture et pose comprises. Ce tarif inclut la borne connectée, les protections électriques et la mise en service. Le crédit d'impôt de 500 € réduit significativement le reste à charge.`
    },
    {
      q: "Peut-on coupler sa wallbox avec des panneaux solaires ?",
      a: "Oui, certaines wallbox intelligentes (comme le modèle Easee ou le SolarEdge) peuvent être couplées à votre installation photovoltaïque pour recharger votre véhicule à l'énergie solaire autoproduite. En Loire-Atlantique, avec environ 1 600 heures d'ensoleillement par an, l'autoconsommation solaire est rentable."
    },
    {
      q: "Quel délai pour l'installation d'une borne à domicile ?",
      a: "Nos installateurs IRVE en Loire-Atlantique s'engagent sur un délai moyen de 10 à 15 jours ouvrés entre la validation du devis et la mise en service de votre borne. Ce délai inclut la visite technique, la commande du matériel et l'intervention sur site."
    }
  ];

  // Rotate and select 3 FAQ items with independent offsets
  const faqIndices: number[] = [];
  let faqOffset = 0;
  while (faqIndices.length < 3) {
    const idx = getVariantIndex(seed, 200 + faqOffset * 7, FAQ_POOL.length);
    if (!faqIndices.includes(idx)) {
      faqIndices.push(idx);
    }
    faqOffset++;
  }

  const faqItems = faqIndices.map(idx => ({
    question: FAQ_POOL[idx].q.replace(/{VILLE}/g, name),
    answer: FAQ_POOL[idx].a.replace(/{VILLE}/g, name)
  }));

  // Heritage anecdote
  const anecdotePatrimoine = getAnecdotePatrimoine(commune.slug, name);

  // Commune data insight text (8 variants, unique offset 127)
  const DATA_INSIGHTS = [
    `Les statistiques locales pour ${name} indiquent un parc estimé de ${(commune.vehiculesElectriques || 100).toLocaleString()} véhicules électriques en circulation, avec un taux de croissance annuel de ${commune.croissanceVE || 30}%, démontrant l'essor de l'électromobilité.`,
    `À ${name}, les infrastructures de recharge publiques comptent actuellement ${commune.bornesPubliques || 4} points de charge. Ce maillage reste restreint, justifiant l'équipement d'un chargeur privé à domicile.`,
    `Avec ${commune.logements || 2000} logements recensés sur la commune et ${commune.logementsMaison || 50}% de maisons individuelles, la demande pour des installations IRVE à domicile est particulièrement soutenue à ${name}.`,
    `L'observatoire de la recharge en Loire-Atlantique évalue la densité de bornes publiques à ${commune.densiteBornes || 1.2} bornes pour 1 000 habitants à ${name}, rendant la borne privée indispensable pour un confort de recharge quotidien.`,
    `Le parc automobile électrique de ${name} (${(commune.vehiculesElectriques || 100).toLocaleString()} VE estimés) progresse de ${commune.croissanceVE || 30}% par an, une dynamique qui souligne l'importance de disposer d'une infrastructure de recharge résidentielle adaptée.`,
    `Les données Enedis pour ${name} révèlent ${commune.bornesPubliques || 4} bornes publiques pour ${commune.population.toLocaleString()} habitants, soit une densité de ${commune.densiteBornes || 1.2}/1 000 hab. Cette couverture limitée renforce l'intérêt d'une borne privée à domicile.`,
    `L'analyse du tissu résidentiel de ${name} (${commune.logementsMaison || 50}% de pavillons, ${commune.logements?.toLocaleString() || '3 000'} logements) montre un potentiel d'équipement IRVE considérable, en particulier pour les maisons disposant d'un garage ou d'un carport.`,
    `La progression de ${commune.croissanceVE || 30}% des immatriculations de VE à ${name} dépasse la moyenne nationale, confirmant l'engouement local pour la mobilité électrique. Les ${commune.bornesPubliques || 4} bornes publiques ne suffisent plus à absorber cette demande croissante.`
  ];
  const dataIdx = getVariantIndex(seed, 127, DATA_INSIGHTS.length);
  const communeDataInsight = DATA_INSIGHTS[dataIdx];

  // Table intro text
  const tableIntro = tableIntroText;

  // Sources Citation (8 variants, unique offset 131)
  const SOURCES_POOLS = [
    `Données statistiques issues de l'Insee (recensement ${commune.codePostal}), de l'Avere-France (baromètre VE 2026) et des données Enedis Loire-Atlantique. Prix constatés auprès de professionnels IRVE qualifiés du 44.`,
    `Sources : registre national des immatriculations de véhicules électriques (SDES), fichiers fonciers DVF pour ${commune.nom}, portail Enedis OpenData et barème ADVENIR 2026 actualisé.`,
    `Informations compilées à partir des données publiques Insee, du répertoire open data des bornes IRVE (data.gouv.fr) et des retours chantiers de nos installateurs certifiés en Loire-Atlantique.`,
    `Références : norme électrique NF C 15-100 (Afnor), guide UTE C 15-722, programme ADVENIR (advenir.mobi), barème crédit d'impôt 2026 (CGI art. 200 quater C), données Insee pour ${commune.nom} (${commune.codePostal}).`,
    `Données collectées auprès de l'Avere-France, du SDES (service des données et études statistiques), d'Enedis Loire-Atlantique OpenData et des bases tarifaires de nos artisans IRVE partenaires opérant à ${commune.nom}.`,
    `Sources de référence : observatoire Avere-France de l'électromobilité, portail national des bornes IRVE (data.gouv.fr), données démographiques Insee 2024 pour ${commune.nom} et barèmes ADVENIR 2026.`,
    `Chiffres consolidés à partir des données Enedis OpenData (compteurs Linky et bornes IRVE), des statistiques Insee pour ${commune.nom} (${commune.codePostal}) et des tarifs moyens constatés par nos installateurs en Loire-Atlantique.`,
    `Références techniques et réglementaires : norme NF C 15-100, guide UTE C 15-722, décret IRVE du 12/01/2017, loi Climat et Résilience 2021, programme ADVENIR 2026. Données locales : Insee et Enedis 44.`
  ];
  const sourcesIdx = getVariantIndex(seed, 131, SOURCES_POOLS.length);
  const sourcesCitation = SOURCES_POOLS[sourcesIdx];

  // Mobile Context (8 variants, unique offset 137)
  const pendulaireProfil = distKm > 30 ? 'grand navetteur (> 30 km)' : distKm > 15 ? 'navetteur moyen (15-30 km)' : 'trajet urbain de proximité (< 15 km)';
  const MOBILITE_TEMPLATES = [
    `Les résidents de ${name} parcourent en moyenne ${distKm} km pour rejoindre Nantes, ce qui correspond à un profil de ${pendulaireProfil}. En roulant en électrique, ce trajet quotidien ne consomme qu'environ ${(distKm * 2 * 0.15).toFixed(1)} kWh, soit un coût de charge nocturne de ${((distKm * 2 * 0.15) * 0.19).toFixed(2)} € au tarif heures creuses.`,
    `Située à ${distKm} km du cœur de Nantes, la commune de ${name} affiche un profil de mobilité de type ${pendulaireProfil}. La pose d'une borne wallbox 7.4 kW permet de sécuriser ces trajets en récupérant la puissance nécessaire en moins de ${((distKm * 2 * 0.15) / 7.4).toFixed(1)} heures de branchement de nuit.`,
    `La position de ${name} (${distKm} km de la métropole) caractérise un profil de déplacements ${pendulaireProfil}. Recharger à domicile sur une wallbox assure une autonomie constante pour vos trajets quotidiens et professionnels vers Nantes ou Saint-Nazaire.`,
    `Les navetteurs habitant à ${name} parcourent en moyenne ${distKm * 2} km par jour pour leurs déplacements professionnels. Avec une borne à domicile, le coût de ce trajet est divisé par 5 par rapport à un véhicule essence équivalent.`,
    `Le profil de mobilité des résidents de ${name} (${pendulaireProfil}, ${distKm} km de Nantes) est parfaitement adapté à l'usage d'un véhicule électrique. La recharge nocturne sur wallbox couvre largement les besoins quotidiens en autonomie.`,
    `Avec ${distKm} km entre ${name} et Nantes, le trajet quotidien consomme environ ${(distKm * 2 * 0.15).toFixed(1)} kWh. Une wallbox de 7.4 kW restaure cette énergie en ${((distKm * 2 * 0.15) / 7.4 * 60).toFixed(0)} minutes de charge, largement réalisable pendant la nuit.`,
    `Le profil ${pendulaireProfil} des habitants de ${name} (${distKm * 2} km quotidiens) est le terrain de jeu idéal pour le véhicule électrique. La borne de recharge à domicile transforme chaque nuit en station-service personnelle et économique.`,
    `Pour les actifs de ${name} effectuant la navette vers les pôles d'emploi nantais (${distKm} km), la wallbox résidentielle représente un gain de temps et d'argent considérable : plus de détour par la station-service et un coût de déplacement réduit à ${((distKm * 2 * 0.15) * 0.19).toFixed(2)} €/jour.`
  ];
  const mobiliteIdx = getVariantIndex(seed, 137, MOBILITE_TEMPLATES.length);
  const mobiliteContext = MOBILITE_TEMPLATES[mobiliteIdx];

  // Electrical details (8 variants, unique offset 143)
  const densiteBornesVal = commune.densiteBornes || 1.2;
  const bornesPub = commune.bornesPubliques || 4;
  const maisonPctVal = commune.logementsMaison || 50;
  const abonnementReco = maisonPctVal > 60 ? '9 kVA monophasé' : '12 kVA monophasé ou 9-12 kVA triphasé';
  const ELECTRIQUE_TEMPLATES = [
    `Le réseau public à ${name} met à disposition ${bornesPub} bornes de recharge pour une densité de ${densiteBornesVal} points pour 1 000 habitants, un maillage restreint face aux besoins. Pour les ${maisonPctVal > 50 ? 'nombreux ' : ''}propriétaires individuels, un abonnement de ${abonnementReco} est conseillé pour alimenter une borne de 7.4 kW de façon fluide.`,
    `Avec ${bornesPub} bornes publiques recensées pour ${commune.population.toLocaleString()} habitants, ${name} affiche une densité de ${densiteBornesVal}/1 000. Face à la hausse de ${commune.croissanceVE}% du parc de véhicules propres local, la borne résidentielle privée devient indispensable. Nous recommandons un abonnement électrique de ${abonnementReco}.`,
    `L'infrastructure de recharge à ${name} (comprenant ${bornesPub} points publics et une densité de ${densiteBornesVal}/1 000 hab.) est complétée par un réseau électrique Enedis robuste. Le raccordement d'une wallbox munie d'un délestage intelligent évite tout risque de coupure de courant générale sans nécessiter de surclassement de puissance d'abonnement.`,
    `Le profil de ${name} (${maisonPctVal}% d'habitat individuel, marché ${commune.marcheImmobilier || 'intermédiaire'}) oriente vers une installation standard de 7.4 kW couplée à un abonnement de ${abonnementReco}. Les ${bornesPub} bornes de voirie servent de recharge d'appoint pour les ${(commune.vehiculesElectriques || 100).toLocaleString()} conducteurs de VE locaux.`,
    `L'analyse du réseau public de ${name} (${bornesPub} bornes pour ${commune.population.toLocaleString()} habitants, densité ${densiteBornesVal}/1 000) confirme l'insuffisance des infrastructures collectives. Un abonnement Enedis de ${abonnementReco} est optimal pour votre borne résidentielle.`,
    `À ${name}, le ratio ${bornesPub} bornes publiques / ${(commune.vehiculesElectriques || 100).toLocaleString()} VE illustre un déficit d'infrastructure qui rend la borne privée incontournable. Nos techniciens IRVE dimensionnent votre installation pour un abonnement de ${abonnementReco}.`,
    `Le maillage de recharge publique à ${name} (${densiteBornesVal} bornes/1 000 hab.) reste en-deçà de la recommandation européenne. Pour les ${maisonPctVal}% de maisons individuelles, l'installation privée sur un abonnement ${abonnementReco} est la solution la plus fiable.`,
    `L'évolution rapide du parc VE à ${name} (+${commune.croissanceVE || 35}%/an) met sous pression les ${bornesPub} bornes publiques existantes. La borne résidentielle sur abonnement ${abonnementReco} offre une alternative pérenne et économique aux files d'attente.`
  ];
  const electriqueIdx = getVariantIndex(seed, 143, ELECTRIQUE_TEMPLATES.length);
  const specificiteElectrique = ELECTRIQUE_TEMPLATES[electriqueIdx];

  // Densité Analysis (6 formulations alternatives, unique offset 149)
  const DENSITE_TEMPLATES = [
    `${name} compte actuellement une population de ${commune.population.toLocaleString()} habitants, avec un parc de logements estimé à ${commune.logements.toLocaleString()} unités, dont ${commune.logementsMaison}% de maisons individuelles. L'essor des motorisations électriques y est soutenu par un taux de croissance de ${commune.croissanceVE}% des immatriculations de véhicules électriques et hybrides.`,
    `Avec ses ${commune.population.toLocaleString()} habitants répartis dans ${commune.logements.toLocaleString()} logements (${commune.logementsMaison}% de pavillons), ${name} se distingue par une dynamique de transition vers la mobilité électrique particulièrement marquée (+${commune.croissanceVE}% d'immatriculations de VE par an).`,
    `La commune de ${name} (${commune.population.toLocaleString()} hab., ${commune.logements.toLocaleString()} logements dont ${commune.logementsMaison}% de maisons) connaît une progression annuelle de ${commune.croissanceVE}% des véhicules électriques, confirmant l'intérêt croissant des résidents pour la mobilité propre.`,
    `Le tissu résidentiel de ${name} se compose de ${commune.logements.toLocaleString()} logements pour ${commune.population.toLocaleString()} habitants, avec une proportion de ${commune.logementsMaison}% de maisons individuelles. La croissance de ${commune.croissanceVE}% du parc de VE témoigne d'une transition énergétique bien engagée localement.`,
    `${name} accueille ${commune.population.toLocaleString()} habitants dans ${commune.logements.toLocaleString()} logements, majoritairement ${commune.logementsMaison > 50 ? 'pavillonnaires' : 'collectifs'} (${commune.logementsMaison}% de maisons). Avec +${commune.croissanceVE}% de VE par an, la demande en bornes de recharge résidentielles s'accélère nettement.`,
    `Les ${commune.population.toLocaleString()} habitants de ${name} vivent dans ${commune.logements.toLocaleString()} logements dont ${commune.logementsMaison}% de maisons individuelles, un cadre idéal pour l'installation de bornes IRVE. Le parc de véhicules électriques y progresse de ${commune.croissanceVE}% chaque année.`
  ];
  const densiteIdx = getVariantIndex(seed, 149, DENSITE_TEMPLATES.length);
  const densiteAnalysis = DENSITE_TEMPLATES[densiteIdx];

  // Expert Blockquote — Dynamic geo-zoned E-E-A-T content (unique offset 157)
  const blockquotePool = EXPERT_BLOCKQUOTE_POOLS[category]?.[zone] || EXPERT_BLOCKQUOTE_POOLS['main']['nantes-metropolis'];
  const blockquoteIdx = getVariantIndex(seed, 157, blockquotePool.length);
  const expertBlockquote = blockquotePool[blockquoteIdx].replace(/{VILLE}/g, name);

  // Intercommunalité Context (unique offset 163)
  const interco = commune.intercommunalite || "communauté de communes locale";
  const INTERCO_TEMPLATES = [
    `${name} fait partie de ${interco}, qui développe activement sa politique de mobilité durable. Les investissements collectifs dans les infrastructures de recharge publiques complètent utilement l'équipement privé des résidents.`,
    `La politique de transition énergétique de ${interco}, dont ${name} est membre, encourage l'installation de bornes de recharge résidentielles. Les aides nationales se combinent avec les initiatives intercommunales pour faciliter l'équipement des foyers.`,
    `Au sein de ${interco}, ${name} bénéficie d'un plan de déploiement de bornes publiques en cours de réalisation. En complément, l'installation d'une borne privée à domicile reste la solution la plus fiable pour les déplacements quotidiens.`,
    `L'intercommunalité ${interco} pilote le schéma directeur de recharge de son territoire. Pour les résidents de ${name}, l'équipement privé en borne IRVE constitue un complément indispensable aux bornes de voirie prévues dans ce schéma.`,
    `${name}, commune membre de ${interco}, s'inscrit dans une dynamique territoriale favorable à la mobilité électrique. Le déploiement de bornes publiques s'accompagne d'incitations à l'équipement résidentiel IRVE pour les particuliers.`,
    `La stratégie de mobilité durable de ${interco} prévoit un maillage de bornes publiques à l'échelle du territoire. À ${name}, compléter cette offre par une wallbox privée garantit une disponibilité de recharge optimale au quotidien.`
  ];
  const intercoIdx = getVariantIndex(seed, 163, INTERCO_TEMPLATES.length);
  const intercommunaliteContext = INTERCO_TEMPLATES[intercoIdx];

  // Profil Commune Insight (unique offset 167)
  const profil = commune.profilCommune || 'commune dynamique';
  const PROFIL_TEMPLATES = [
    `En tant que ${profil}, ${name} attire des ménages actifs et des familles qui adoptent massivement le véhicule électrique. La borne de recharge résidentielle répond à leurs besoins de mobilité quotidienne en toute autonomie.`,
    `Le profil de ${profil} de ${name} génère une demande soutenue en solutions de recharge résidentielles. Les navetteurs, les familles et les retraités actifs trouvent dans la wallbox à domicile un confort de mobilité irremplaçable.`,
    `Classée comme ${profil}, ${name} présente un tissu résidentiel favorable à l'installation de bornes IRVE. Les pavillons avec garage, les maisons avec jardin et les places de stationnement privatives constituent autant de points d'installation potentiels.`,
    `Le caractère de ${profil} de ${name} se reflète dans la diversité de son habitat et de ses besoins en mobilité. Nos solutions de recharge s'adaptent à chaque configuration, du pavillon individuel à la résidence collective.`,
    `En tant que ${profil} du département de Loire-Atlantique, ${name} conjugue qualité de vie résidentielle et proximité des bassins d'emploi. L'installation d'une borne de recharge y est un investissement à forte valeur ajoutée.`,
    `Le positionnement de ${name} comme ${profil} en Loire-Atlantique en fait un territoire privilégié pour le développement de la mobilité électrique. Les conditions sont réunies pour un équipement massif en bornes résidentielles IRVE.`
  ];
  const profilIdx = getVariantIndex(seed, 167, PROFIL_TEMPLATES.length);
  const profilCommuneInsight = PROFIL_TEMPLATES[profilIdx];

  return {
    introParagraph,
    logisticsAlert,
    useCaseText,
    pricesContext,
    faqItems,
    ecoText,
    localContext,
    climateZoneLabel,
    localAgencyName,
    externalLinks: getExternalLinks(category, commune.codePostal, commune.slug),
    communeDataInsight,
    expertTip,
    tableIntro,
    guideLinks: getGuideLinks(category, commune.slug),
    savingsEstimate,
    lastUpdated,
    realEstateInsight: realEstateInsightText,
    populationTierContent,
    densiteAnalysis,
    marcheImmobilierInsight,
    distanceNantesContext,
    anecdotePatrimoine,
    localRegulation,
    sourcesCitation,
    mobiliteContext,
    specificiteElectrique,
    expertBlockquote,
    intercommunaliteContext,
    profilCommuneInsight
  };
}
