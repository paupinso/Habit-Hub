/**
 * Pauta Nutricional Oficial per a Esportistes (CEA 1945)
 * Per: Antoni J. Valle Font
 * Graduat en Ciències de l'Activitat Física i l'Esport
 * Màster en Nutrició i Dietètica per a la Salut
 */

import { GoalDietGuideline, UserGoalType, UserProfile } from '../types';

export interface DayDietPlan {
  dayId: 'dl' | 'dm' | 'dx' | 'dj' | 'dv';
  dayName: string;
  esmorzar: {
    title: string;
    description: string;
    estimatedKcal: number;
    hasSugar: boolean;
    sugarWarning?: string;
    accompanimentOptions: string[];
  };
  snackEscola: {
    title: string;
    description: string;
    estimatedKcal: number;
    hasSugar: boolean;
    sugarWarning?: string;
  };
  dinar: {
    title: string;
    description: string;
    estimatedKcal: number;
    hasSugar: boolean;
    dessertOptions: string[];
  };
  sopar: {
    title: string;
    description: string;
    estimatedKcal: number;
    hasSugar: boolean;
    dessertOptions: string[];
  };
  totalEstimatedKcal: number;
}

export const OFFICIAL_DIET_PLANS: DayDietPlan[] = [
  {
    dayId: 'dl',
    dayName: 'Dilluns',
    esmorzar: {
      title: 'Pa torrat amb confitura',
      description: 'Pa al gust torrat amb una capa de confitura natural de fruita.',
      estimatedKcal: 230,
      hasSugar: true,
      sugarWarning: 'La confitura conté sucre (compte amb la regla d’1 pic per setmana).',
      accompanimentOptions: ['Fruita de temporada', 'Gelatina natural o protein', 'Papilla per nadons'],
    },
    snackEscola: {
      title: 'Dos plàtans amb nous',
      description: '2 plàtans d’origen canari amb una grapada de nous crues.',
      estimatedKcal: 310,
      hasSugar: false,
    },
    dinar: {
      title: 'Crema de verdures i pollastre al forn amb patata',
      description: 'Crema natural de carabassa/carbassó i cuixa o pit de pollastre al forn amb patata (boniato millor).',
      estimatedKcal: 560,
      hasSugar: false,
      dessertOptions: ['Fruita de temporada', 'Gelatina natural o protein Mercadona'],
    },
    sopar: {
      title: 'Ensalada amb tonyina i ou bullit',
      description: 'Amanida de fulles verdes, tomàquet, ceba, llauna de tonyina natural i 1-2 ous bullits.',
      estimatedKcal: 360,
      hasSugar: false,
      dessertOptions: ['Fruita de temporada', 'Gelatina natural o protein'],
    },
    totalEstimatedKcal: 1520, // + acompanyaments ~1750 kcal
  },
  {
    dayId: 'dm',
    dayName: 'Dimarts',
    esmorzar: {
      title: 'Tortilla (3 clares i 1 rovell) amb tonyina',
      description: 'Truita francesa proteica amb 3 clares d’ou, 1 rovell i una llauna de tonyina escorreguda.',
      estimatedKcal: 230,
      hasSugar: false,
      accompanimentOptions: ['Fruita de temporada', 'Gelatina protein', 'Cafè o infusió sense sucre'],
    },
    snackEscola: {
      title: 'Iogurt proteic (Mercadona)',
      description: 'Iogurt líquid o ferm proteic 0% matèria grassa i sense sucres afegits.',
      estimatedKcal: 85,
      hasSugar: false,
    },
    dinar: {
      title: 'Espaguetis amb salsa de tomàtiga i carn de ternera picada',
      description: 'Pasta (80-100g en cru), salsa de tomàquet triturada casolana i carn de vedella picada magra.',
      estimatedKcal: 590,
      hasSugar: false,
      dessertOptions: ['Fruita de temporada', 'Gelatina natural'],
    },
    sopar: {
      title: 'Pizza de tonyina amb ceba o pernil dolç (0 salses)',
      description: 'Base de pizza fina casolana o d’espelta amb tomàquet natural, formatge mozzarella, tonyina/pernil i 0 salses industrials.',
      estimatedKcal: 680,
      hasSugar: false,
      dessertOptions: ['Fruita de temporada', 'Infusió digestiva'],
    },
    totalEstimatedKcal: 1645,
  },
  {
    dayId: 'dx',
    dayName: 'Dimecres',
    esmorzar: {
      title: 'Sandwich mixt de pernil dolç i formatge',
      description: '2 llesques de pa integral torrat amb pernil cuit de qualitat (més del 85% carn) i formatge semicurat o havarti.',
      estimatedKcal: 290,
      hasSugar: false,
      accompanimentOptions: ['Fruita de temporada', 'Gelatina natural'],
    },
    snackEscola: {
      title: 'Poma amb combinació de fruits secs',
      description: '1 poma gran cruixent acompanyada de 25g de fruits secs (ametlles crues, avellanes i anacards).',
      estimatedKcal: 210,
      hasSugar: false,
    },
    dinar: {
      title: 'Arròs amb verdures saltejades i tonyina natural',
      description: 'Arròs integral o basmati (80g), verdures variades (pebrot, ceba, pastanaga) saltejades amb un rajolí d’oli d’oliva verge extra i tonyina.',
      estimatedKcal: 510,
      hasSugar: false,
      dessertOptions: ['Fruita de temporada', 'Gelatina protein Mercadona'],
    },
    sopar: {
      title: 'Peix al forn amb patata i verdures',
      description: 'Filet de daurada, llobarro o lluç al forn sobre un llit de patata tallada fina i verdures de temporada.',
      estimatedKcal: 440,
      hasSugar: false,
      dessertOptions: ['Fruita de temporada', 'Gelatina'],
    },
    totalEstimatedKcal: 1510,
  },
  {
    dayId: 'dj',
    dayName: 'Dijous',
    esmorzar: {
      title: 'Pa torrat amb gall d’indi i alvocat',
      description: 'Pa integral de fleca amb mig alvocat madur aixafat i 2-3 llesques fines de pit de gall d’indi.',
      estimatedKcal: 320,
      hasSugar: false,
      accompanimentOptions: ['Fruita de temporada', 'Gelatina natural'],
    },
    snackEscola: {
      title: 'Mig sandwich vegetal i tonyina',
      description: '1 llesca doble de pa amb enciam, tomàquet en rodanxes i tonyina clara.',
      estimatedKcal: 230,
      hasSugar: false,
    },
    dinar: {
      title: 'Crema de verdures amb remenat de 4 ous i pernil salat',
      description: 'Brou o puré de verdures de primer plat, seguit d’un remenat amb clares i rovells amb daus de pernil ibèric o salat.',
      estimatedKcal: 490,
      hasSugar: false,
      dessertOptions: ['Fruita de temporada', 'Gelatina protein'],
    },
    sopar: {
      title: 'Tacos de carn picada amb verdures',
      description: '2-3 tortilles de blat de moro amb carn picada de pollastre o vedella marinada amb espècies, ceba, pebrot i tomàquet natural.',
      estimatedKcal: 530,
      hasSugar: false,
      dessertOptions: ['Fruita de temporada', 'Gelatina natural'],
    },
    totalEstimatedKcal: 1630,
  },
  {
    dayId: 'dv',
    dayName: 'Divendres',
    esmorzar: {
      title: '“Tortitas” d’avena amb nous, plàtan i mel',
      description: 'Pancakes casolanes de farina d’avena i clares d’ou, cobertes de plàtan a rodanxes, nous i un filet de mel.',
      estimatedKcal: 390,
      hasSugar: true,
      sugarWarning: 'La mel conté sucres simples (compta com el teu pic de sucre setmanal!).',
      accompanimentOptions: ['Fruita de temporada', 'Gelatina natural'],
    },
    snackEscola: {
      title: 'Dos plàtans amb una grapada de nous',
      description: 'Càrrega d’hidrats de carboni per afrontar els entrenaments de cap de setmana.',
      estimatedKcal: 310,
      hasSugar: false,
    },
    dinar: {
      title: 'Salmó al forn amb patata i verdures al gust',
      description: 'Llom de salmó ric en Omega 3 i proteïna, acompanyat de patata al forn i espàrrecs o bròquil.',
      estimatedKcal: 580,
      hasSugar: false,
      dessertOptions: ['Fruita de temporada', 'Gelatina protein Mercadona'],
    },
    sopar: {
      title: 'El plat esportiu equilibrat (1/3 Prot, 1/3 HC, 1/3 Verd)',
      description: 'Distribució òptima del plat: un terç de proteïna neta, un terç d’hidrats de carboni complexos i un terç de verdura.',
      estimatedKcal: 480,
      hasSugar: false,
      dessertOptions: ['Fruita de temporada', 'Gelatina'],
    },
    totalEstimatedKcal: 1820,
  },
];

export const FOODS_TO_AVOID = [
  { name: 'Galletes industrials', reason: 'Farinis refinats i sucres que causen caigudes d’energia' },
  { name: 'Sobres del vespre anterior pesades', reason: 'Aliments grassos o ultraprocessats reescalfats' },
  { name: 'Dolços, xocolatines i brioixeria', reason: 'Sucre afegit d’absorció ultraràpida i greixos trans' },
];

export const HYDRATION_GUIDELINES = {
  dailyRule: 'Beure 3 a 5 ml d’aigua per cada kg de pes corporal al dia.',
  urineColorTest: 'Utilitza el color de l’orina per saber si estàs ben hidratat: si és clara estàs hidratat; si és groc fosc has de beure aigua immediatament.',
  influencingFactors: ['Temperatura', 'Vent', 'Teixit de la roba', 'Salut', 'Condició física'],
  matchProtocol: {
    hoursBefore3_4: '250 ml d’aigua per començar la hidratació prèvia.',
    hourBefore1: 'Revisar el color de l’orina (+150 ml d’aigua segons la temperatura ambient).',
    duringMatch: '300 ml d’aigua cada 20 minuts. Combinar aigua amb beguda isotònica (hidrats de carboni + sodi per activar la bomba sodi-potassi).',
    postMatch: 'Cal ingerir 700 ml d’aigua per cada kg de pes corporal perdut. Beguda isotònica SENSE SUCRE (amb clorur, sodi i potassi). Menjar hidrats i proteïna en els primers 30 minuts per reparar teixits.',
  },
};

export const GOAL_NUTRITION_PROFILES: Record<UserGoalType, GoalDietGuideline> = {
  'massa-muscular': {
    goalType: 'massa-muscular',
    title: 'Guanyar Massa Muscular (Hipertròfia & Força)',
    tagline: 'Superàvit calòric net, alta proteïna i carbohidrats nets per recarregar glucogen',
    description:
      'Per construir teixit muscular magre cal un superàvit calòric controlat (+300 a +450 kcal sobre el teu manteniment) amb una ingesta de 1.8g a 2.2g de proteïna per kg de pes corporal. L’energia s’ha d’obtenir de fonts netes per maximitzar el rendiment a l’entrenament pesat.',
    dailyCalorieModifier: 350,
    proteinGPerKg: 2.0,
    carbsPercent: 50,
    fatPercent: 25,
    macroDistribution: {
      proteinPercent: 25,
      carbsPercent: 50,
      fatPercent: 25,
    },
    keyRules: [
      'Menja cada 3-4 hores per mantenir la síntesi proteica (MPS) activada durant tot el dia.',
      'Superàvit calòric moderat (+350 kcal): guanyar múscul requereix energia extra, però sense caure en el "dirty bulking".',
      'Consumeix carbohidrats complexos abans i després d’entrenar per omplir els dipòsits de glucogen muscular.',
      'Aprofita complements sans d’alta densitat calòrica com el formatge als entrepans (pepito de pollo amb formatge), nous i alvocat.',
      'Respecta la regla del sucre: el sucre afegit genera resistència a la insulina i inflamació que perjudica el creixement muscular.',
    ],
    foodsToEat: [
      {
        name: 'Pit de pollastre o gall d’indi i vedella magra',
        category: 'proteina',
        benefit: 'Proteïna d’altíssim valor biològic amb leucina per disparar la síntesi de nou teixit muscular.',
        recommendedPortion: '150 - 200g per àpat',
        exampleDish: 'Pepito de pollastre amb formatge o filet de vedella amb moniato',
      },
      {
        name: 'Ous sencers i clares pasteuritzades',
        category: 'proteina',
        benefit: 'El perfil d’aminoàcids més complet; el rovell aporta greixos clau per a la producció de testosterona.',
        recommendedPortion: '3 clares + 1-2 ous sencers',
        exampleDish: 'Tortilla proteica amb tonyina o remenat amb pernil salat',
      },
      {
        name: 'Arròs basmati, civada integral i moniato',
        category: 'carbohidrat',
        benefit: 'Recàrrega de glucogen muscular sostinguda sense pic ràpid d’insulina.',
        recommendedPortion: '80-100g en cru d’arròs / civada',
        exampleDish: 'Pancakes de civada amb plàtan o bol d’arròs amb pollastre',
      },
      {
        name: 'Formatge tendre o semicurat de qualitat',
        category: 'greix',
        benefit: 'Afegeix calories denses, proteïna de digestió lenta (caseïna) i calci per a la contracció muscular.',
        recommendedPortion: '30-40g',
        exampleDish: 'Complement ideal al pepito de pollo o remenat d’ous',
      },
      {
        name: 'Plàtans i fruits secs (nous, ametlles)',
        category: 'snack',
        benefit: 'Densitat energètica ràpida amb potassi i magnesi per evitar rampes i accelerar la recuperació.',
        recommendedPortion: '2 plàtans + 30g de nous crues',
        exampleDish: 'Berenar del matí o snack pre-entrenament',
      },
      {
        name: 'Salmó i peix blau',
        category: 'proteina',
        benefit: 'Àcids grassos Omega 3 que redueixen el mal muscular tardà (DOMS) i acceleren la reparació fibril·lar.',
        recommendedPortion: '180 - 220g',
        exampleDish: 'Salmó al forn amb patata i espàrrecs',
      },
    ],
    foodsToAvoid: [
      {
        name: 'Sucre blanc i brioixeria ("Bulking brut")',
        reason: 'El sucre genera pics i caigudes brusques de glucosa, resistència a la insulina i acumulació de greix visceral.',
        severity: 'critic',
        healthyAlternative: 'Plàtans amb nous o tortitas casolanes d’avena amb un filet de mel',
      },
      {
        name: 'Menjar per sota de les calories de manteniment',
        reason: 'Sense un balanç energètic positiu, el cos no té prou matèria primera per sintetitzar massa muscular.',
        severity: 'critic',
        healthyAlternative: 'Afegeix acompanyaments saludables com arròs, formatge o nous als plats principals',
      },
      {
        name: 'Fregits industrials i olis refinats de gira-sol/palma',
        reason: 'Indueixen inflamació cel·lular i alenteixen la digestió de la proteïna.',
        severity: 'moderat',
        healthyAlternative: 'Cuina sempre amb Oli d’Oliva Verge Extra (AOVE) o al forn/airfryer',
      },
      {
        name: 'Alcohol i begudes ensucrades',
        reason: 'L’alcohol redueix la síntesi proteica muscular fins a un 37% i deshidrata les cèl·lules.',
        severity: 'critic',
        healthyAlternative: 'Aigua amb llimona o beguda isotònica casolana sense sucre',
      },
    ],
    highPerformanceTips: [
      'Pre-entrena (60 min abans): 1-2 plàtans o pa torrat amb gall d’indi i una mica de cafè sol.',
      'Post-entrena immediat (primeres 2 hores): àpat sòlid amb 30-40g de proteïna neta i 60-80g d’hidrats nets.',
      'Descans: dorm mínim 8 hores; el 80% de l’hormona del creixement s’allibera durant les fases de son profund (ones lentes).',
    ],
    sampleDayMenu: {
      title: 'Menú Diari per a Guanyar Massa Muscular (~2.750 kcal)',
      totalKcal: 2750,
      esmorzar: {
        title: 'Tortilla de clares i pa torrat amb alvocat',
        items: 'Tortilla de 3 clares i 1 rovell amb tonyina + 2 llesques de pa integral amb alvocat i cafè sol',
        kcal: 480,
      },
      snackMati: {
        title: 'Snack energètic d’escola / feina',
        items: '2 plàtans de Canàries amb 35g de nous crues + 1 iogurt proteic',
        kcal: 420,
      },
      dinar: {
        title: 'Arròs amb pollastre i formatge o pasta amb vedella',
        items: '100g espaguetis amb salsa de tomàtiga casolana i 180g de carn de vedella picada magra + fruita',
        kcal: 750,
      },
      snackTarda: {
        title: 'Pepito de pollastre amb formatge (Pre/Post-entrenament)',
        items: 'Panet integral amb pit de pollastre a la planxa, formatge fos havarti i rodanxes de tomàquet natural',
        kcal: 490,
      },
      sopar: {
        title: 'Salmó al forn amb moniato i verdures',
        items: '180g de llom de salmó al forn sobre llit de moniato rostit (150g) i carbassó saltejat amb AOVE',
        kcal: 610,
      },
    },
  },

  'perdre-pes': {
    goalType: 'perdre-pes',
    title: 'Aprimar-se & Pèrdua de Greix (Definició Muscular)',
    tagline: 'Dèficit calòric controlat, màxima sacietat, verdures lliures i proteïna protectora',
    description:
      'Per aprimar-se de manera professional cal un dèficit calòric moderat (-350 a -500 kcal diàries respecte a la teva despesa total). La clau d’or és mantenir la proteïna molt alta (2.0 a 2.2 g/kg) per protegir el teu múscul i omplir el plat de verdures d’alta densitat de fibra per eliminar la sensació de gana.',
    dailyCalorieModifier: -400,
    proteinGPerKg: 2.2,
    carbsPercent: 35,
    fatPercent: 25,
    macroDistribution: {
      proteinPercent: 40,
      carbsPercent: 35,
      fatPercent: 25,
    },
    keyRules: [
      'Dèficit calòric estrictament controlat (-400 kcal): no mengis menys de 1.400 kcal per no alentir el metabolisme.',
      'Proteïna a cada àpat: és el macronutrient més saciant i té el major efecte tèrmic dels aliments (TEF).',
      'Vigila els complements enganyosos: formatges grassos, maioneses i salses poden afegir 200-300 kcal sense que te n’adonis.',
      '0 tolerància amb el sucre: només permès 1 pic setmanal. El sucre afegit bloqueja la lipòlisi (oxidació de greix).',
      'Beu un got gran d’aigua 15 minuts abans de dinar i sopar per afavorir la distensió gàstrica i la sacietat.',
    ],
    foodsToEat: [
      {
        name: 'Peix blanc (lluç, daurada, bacallà)',
        category: 'proteina',
        benefit: 'Gairebé 100% proteïna pura amb mínim greix (només ~80 kcal per cada 100g).',
        recommendedPortion: '180 - 220g per àpat',
        exampleDish: 'Daurada al forn amb verdures al vapor i llimona',
      },
      {
        name: 'Cremes de verdures casolanes (sense nata ni patata)',
        category: 'verdura',
        benefit: 'Fibra soluble i aigua que omplen l’estómac aportant menys de 100 kcal per plat.',
        recommendedPortion: 'Plat fondo gran (300ml)',
        exampleDish: 'Crema de carbassó, porros i espinacs amb un rajolí d’AOVE',
      },
      {
        name: 'Pit de pollastre o gall d’indi sense pell',
        category: 'proteina',
        benefit: 'Alta proteïna saciant amb zero carbohidrats i mínim greix saturat.',
        recommendedPortion: '150 - 180g',
        exampleDish: 'Pit de pollastre a la planxa amb espècies i amanida verda',
      },
      {
        name: 'Clares d’ou i formatge fresc batut 0%',
        category: 'proteina',
        benefit: 'Densitat proteica màxima amb zero sucres i zero greixos.',
        recommendedPortion: '4 clares d’ou o 200g de formatge batut',
        exampleDish: 'Truita francesa de clares amb herbes o formatge 0% amb canyella',
      },
      {
        name: 'Verdures crucíferes (bròquil, coliflor, espàrrecs)',
        category: 'verdura',
        benefit: 'Mastegació lenta, alt contingut en aigua i micronutrients que redueixen la retenció de líquids.',
        recommendedPortion: 'A voluntat (mínim 200g)',
        exampleDish: 'Bròquil al vapor amb un toc de pebre i all',
      },
      {
        name: 'Gelatina 0% o gelatina proteica',
        category: 'snack',
        benefit: 'Calma les ganes de dolç amb pràcticament zero calories i zero sucre afegit.',
        recommendedPortion: '1-2 unitats',
        exampleDish: 'Postres després de sopar per tancar la gana',
      },
    ],
    foodsToAvoid: [
      {
        name: 'Sucre afegit, refrescos i sucs envasats',
        reason: 'Són calories líquides sense fibra que disparen la insulina i bloquegen immediatament la crema de greix.',
        severity: 'critic',
        healthyAlternative: 'Aigua amb gas i rodanxa de llimona fresca o infusions digestives',
      },
      {
        name: 'Salses industrials (maionesa, ketchup ensucrat, cèsar)',
        reason: 'Dues cullerades de maionesa industrial sumen 180-200 kcal de greixos inflamatoris.',
        severity: 'critic',
        healthyAlternative: 'Mostassa antiga, vinagre de poma, llimona o espècies (orenga, pebre vermell)',
      },
      {
        name: 'Picar fruits secs sense pesar',
        reason: 'Tot i ser greixos sans, tenen 600 kcal per cada 100g. Menjar-ne sense mesura trenca el dèficit.',
        severity: 'alerta',
        healthyAlternative: 'Raciona exactament 15-20g comptats si els afegeixes com a snack',
      },
      {
        name: 'Farines refinades, pa blanc de motlle i pasta tradicional en excés',
        reason: 'Poca sacietat i ràpida absorció que reactiva la gana 90 minuts després.',
        severity: 'moderat',
        healthyAlternative: 'Patata bullida refredada (ric en midó resistent saciant) o llegums',
      },
      {
        name: 'Embotits grassos i formatges curats excessius',
        reason: 'Contenen una ràtio alta de greix saturat respecte a la proteïna que aporten.',
        severity: 'alerta',
        healthyAlternative: 'Pernil cuit extra (+85% carn), gall d’indi natural o formatge fresc desnatat',
      },
    ],
    highPerformanceTips: [
      'Passeja diàriament (NEAT): aconsegueix entre 8.000 i 12.000 passes diàries per cremar greix sense generar fatiga al SNC.',
      'Cronobiologia: concentra el gruix de calories i carbohidrats a l’esmorzar i al dinar; fes un sopar lleuger de proteïna i verdura.',
      'Somi i estrès: el cortisol elevat per falta de descans afavoreix la retenció de greix abdominal; prioritza 7.5-8h de son.',
    ],
    sampleDayMenu: {
      title: 'Menú Diari per a Pèrdua de Pes & Definició (~1.650 kcal)',
      totalKcal: 1650,
      esmorzar: {
        title: 'Truita proteica i fruita antioxidant',
        items: 'Tortilla de 3 clares i 1 rovell amb tonyina al natural + cafè sol sense sucre + mitja poma',
        kcal: 280,
      },
      snackMati: {
        title: 'Snack saciant 0% sucre',
        items: '1 Iogurt proteic 0% matèria grassa (Mercadona) + 1 infusió de te verd',
        kcal: 90,
      },
      dinar: {
        title: 'Crema de verdures i pit de pollastre al forn',
        items: 'Crema casolana de carbassó i porro (sense nata) + 160g de pit de pollastre al forn amb 100g de patata bullida',
        kcal: 490,
      },
      snackTarda: {
        title: 'Snack de proteïna i fibra',
        items: '1 poma gran a rodanxes amb canyella + 15g de nous crues',
        kcal: 180,
      },
      sopar: {
        title: 'Ensalada verda amb peix o ou bullit',
        items: 'Amanida gran d’enciam, tomàquet, ceba, llauna de tonyina al natural i 1 ou bullit + gelatina 0%',
        kcal: 380,
      },
    },
  },

  'alt-rendiment': {
    goalType: 'alt-rendiment',
    title: 'Alt Rendiment Esportiu & Competició',
    tagline: 'Energia sostinguda, recuperació cel·lular accelerada i hidratació mil·limètrica (Pauta CEA)',
    description:
      'Pauta dissenyada per esportistes d’alt rendiment que combinen sessions dobles d’entrenament, partits o sortides intenses de bicicleta i running. L’alimentació és el combustible essencial: «Es juga com s’entrena, es juga com menges». Màxim focus en la disponibilitat de carbohidrats, proteïna neta per reparar fibres i protocol d’electròlits.',
    dailyCalorieModifier: 450,
    proteinGPerKg: 1.8,
    carbsPercent: 55,
    fatPercent: 25,
    macroDistribution: {
      proteinPercent: 20,
      carbsPercent: 55,
      fatPercent: 25,
    },
    keyRules: [
      'Timing de carbohidrats: càrrega 3 hores abans de la competició i reposició immediata en els primers 30 minuts post-esforç.',
      'Protocol d’hidratació estricte: 3-5 ml per kg de pes al dia, 300 ml cada 20 minuts durant l’esforç i 700 ml per kg perdut.',
      'Control de l’orina: revisa el color de l’orina; si és groc fosc estàs deshidratat i perdràs entre un 10% i un 20% de rendiment aeròbic.',
      'Zero ultraprocessats: galletes, brioixeria i menjars pesats causen inflamació muscular i alenteixen la velocitat de recuperació.',
      'Respecta la finestra d’or de descans: recomanacions de son ampliades segons el volum d’esport realitzat.',
    ],
    foodsToEat: [
      {
        name: 'Pasta amb salsa de tomàquet casolana i carn de vedella picada',
        category: 'carbohidrat',
        benefit: 'Càrrega de glucogen òptima combinada amb ferro hemo i proteïna per a la capacitat d’oxigenació cel·lular.',
        recommendedPortion: '90-110g pasta crua + 130g carn',
        exampleDish: 'Dinar oficial del menú dimarts de la pauta CEA',
      },
      {
        name: 'Plàtans madurs amb nous crues',
        category: 'snack',
        benefit: 'Hidrats de carboni d’absorció ràpida-mitjana i magnesi per prevenir rampes i activar la bomba sodi-potassi.',
        recommendedPortion: '2 plàtans + grapada de nous',
        exampleDish: 'Snack oficial d’escola o pre-partit (CEA)',
      },
      {
        name: 'Salmó i peix blau al forn amb patata',
        category: 'proteina',
        benefit: 'Alt contingut en Omega-3 per modular la inflamació induïda per l’exercici d’alt impacte.',
        recommendedPortion: '180g peix + patata al forn',
        exampleDish: 'Sopar de divendres per preparar el cap de setmana de partits',
      },
      {
        name: 'Tacos de carn picada i verdures',
        category: 'carbohidrat',
        benefit: 'Blat de moro fàcil de digerir i proteïna neta per a una digestió lleugera sense pesadesa.',
        recommendedPortion: '2-3 tortilles amb farcit complet',
        exampleDish: 'Sopar de dijous de la pauta CEA',
      },
      {
        name: 'Crema de verdures i pollastre al forn amb moniato',
        category: 'proteina',
        benefit: 'El moniato és ric en betacarotens i té un índex glucèmic ideal per mantenir energia durant 4 hores.',
        recommendedPortion: 'Cuixa/pit de pollastre + moniato',
        exampleDish: 'Dinar oficial de dilluns CEA',
      },
      {
        name: 'Beguda isotònica casolana sense sucre afegit',
        category: 'snack',
        benefit: 'Aigua amb suc de llimona, una punta de sal marina (sodi) i una cullerada de mel per a partits intensos.',
        recommendedPortion: '500ml per cada hora d’esforç',
        exampleDish: 'Hidratació durant i després del partit',
      },
    ],
    foodsToAvoid: [
      {
        name: 'Galletes industrials i brioixeria abans d’entrenar',
        reason: 'Provoquen un pic brusc d’insulina seguit d’una hipoglucèmia reactiva als 35 minuts d’exercici.',
        severity: 'critic',
        healthyAlternative: 'Pa torrat amb alvocat i gall d’indi o plàtan amb civada',
      },
      {
        name: 'Sobres greixoses del vespre anterior',
        reason: 'Greixos reescalfats i salses feixugues alenteixen el buidatge gàstric i causen reflux durant la carrera.',
        severity: 'critic',
        healthyAlternative: 'Àpats frescos, al forn o al vapor segons la pauta CEA',
      },
      {
        name: 'Refrescos ensucrats i begudes energètiques artificials',
        reason: 'Carregats de sucre afegit que destrueix la hidratació cel·lular i augmenta el risc de deshidratació.',
        severity: 'critic',
        healthyAlternative: 'Aigua amb electròlits o infusió freda natural',
      },
      {
        name: 'Arribar a la competició sense hidratació prèvia',
        reason: 'Beure només quan es té set ja és símptoma d’un 2% de deshidratació (caiguda del 15% de rendiment).',
        severity: 'critic',
        healthyAlternative: 'Protocol CEA: 250ml 3h abans i 150ml 1h abans',
      },
    ],
    highPerformanceTips: [
      '2 hores abans de l’entrenament o partit: menjar digerible ric en hidrats nets i baix en fibra i greix.',
      'Durant l’exercici (>60 min): ingerir entre 30g i 60g d’hidrats per hora (plàtan o beguda isotònica).',
      'Post-partit: menjar proteïna i carbohidrats en els primers 30 minuts per aprofitar la finestra d’absorció cel·lular.',
    ],
    sampleDayMenu: {
      title: 'Menú Diari per a Alt Rendiment Esportiu (~2.600 kcal)',
      totalKcal: 2600,
      esmorzar: {
        title: 'Tortitas d’avena amb plàtan i nous',
        items: 'Tortitas casolanes d’avena i clares d’ou amb plàtan a rodanxes, nous i un filet de mel (Pauta Divendres CEA)',
        kcal: 440,
      },
      snackMati: {
        title: 'Snack de rendiment a l’escola / universitat',
        items: 'Dos plàtans d’origen canari amb una grapada de nous crues',
        kcal: 310,
      },
      dinar: {
        title: 'Espaguetis amb salsa casolana de tomàtiga i carn de vedella',
        items: 'Pasta (90g cru) amb carn picada de vedella magra i salsa de tomàquet natural triturada + gelatina protein',
        kcal: 680,
      },
      snackTarda: {
        title: 'Pre-entrenament / Berenar',
        items: 'Iogurt proteic Mercadona amb 30g de civada i 1 plàtan',
        kcal: 260,
      },
      sopar: {
        title: 'Plat esportiu equilibrat CEA (1/3 Prot, 1/3 HC, 1/3 Verd)',
        items: 'Lluç o daurada al forn sobre llit de patata i verdures variades amb oli d’oliva verge extra',
        kcal: 540,
      },
    },
  },

  'manteniment-salut': {
    goalType: 'manteniment-salut',
    title: 'Salut, Vitalitat & Recomposició Corporal',
    tagline: 'Equilibri isocalòric, màxima energia diària i hàbits sostenibles de per vida',
    description:
      'Per a persones que busquen mantenir un pes saludable, millorar la seva composició corporal (perdre greix mantenint múscul) i gaudir d’una vitalitat sostinguda durant tot el dia sense caigudes d’energia ni dietes extremes.',
    dailyCalorieModifier: 0,
    proteinGPerKg: 1.6,
    carbsPercent: 45,
    fatPercent: 30,
    macroDistribution: {
      proteinPercent: 25,
      carbsPercent: 45,
      fatPercent: 30,
    },
    keyRules: [
      'Seguir la regla del plat equilibrat: 1/3 proteïna neta, 1/3 carbohidrats complexos i 1/3 verdura fresca.',
      'Control estricte del sucre: màxim 1 sol comodí de dolç a la setmana.',
      'Beure entre 2.0 i 2.5 litres d’aigua diaris.',
      'Mantenir una rutina regular d’activitat física diària (força + cardio moderat).',
      'Sopar com a mínim 2 hores abans d’anar a dormir per facilitar el descans regeneratiu.',
    ],
    foodsToEat: [
      {
        name: 'Ous, peix i carns magres de proximitat',
        category: 'proteina',
        benefit: 'Manteniment de la tonicitat muscular i salut òssia.',
        recommendedPortion: '130 - 160g',
        exampleDish: 'Truita d’espinacs amb pernil o daurada a la planxa',
      },
      {
        name: 'Verdures i fruites de temporada',
        category: 'verdura',
        benefit: 'Antioxidants i polifenols que prevenen l’envelliment cel·lular prematur.',
        recommendedPortion: 'Mínim 400g diaris entre fruita i verdura',
        exampleDish: 'Amanida mediterrània fresca amb tomàquet i ceba',
      },
      {
        name: 'Oli d’Oliva Verge Extra (AOVE)',
        category: 'greix',
        benefit: 'Àcid oleic i vitamina E que protegeixen la salut cardiovascular.',
        recommendedPortion: '2-3 cullerades soperes diàries',
        exampleDish: 'Amanir en cru verdures i cremes',
      },
      {
        name: 'Llegums (cigrons, llenties, mongetes)',
        category: 'carbohidrat',
        benefit: 'Font excel·lent de proteïna vegetal i fibra fermentable per a la microbiota.',
        recommendedPortion: '150 - 200g cuits',
        exampleDish: 'Amanida de cigrons amb tonyina i tomàquet',
      },
    ],
    foodsToAvoid: [
      {
        name: 'Ultraprocessats i brioixeria industrial',
        reason: 'Aporten calories buides, additius i greixos modificats que inflamen el cos.',
        severity: 'critic',
        healthyAlternative: 'Pa integral de fleca amb confitura natural (només 1 cop/setmana)',
      },
      {
        name: 'Sopar tard i pesat',
        reason: 'Dificulta la digestió, interromp les fases REM del son i fa despertar fatigat.',
        severity: 'moderat',
        healthyAlternative: 'Crema de verdures o amanida lleugera amb peix blanc',
      },
    ],
    highPerformanceTips: [
      'Menja a hores regulars per sincronitzar els teus rellotges circadians metabòlics.',
      'Combina exercici de força 3 dies a la setmana amb activitat aeròbica.',
      'Desconnecta pantalles 30 minuts abans de dormir per assegurar un son reparador.',
    ],
    sampleDayMenu: {
      title: 'Menú Diari per a Manteniment & Vitalitat (~2.100 kcal)',
      totalKcal: 2100,
      esmorzar: {
        title: 'Pa integral amb gall d’indi i alvocat',
        items: 'Pa torrat integral amb mig alvocat i pit de gall d’indi de qualitat + te verd',
        kcal: 350,
      },
      snackMati: {
        title: 'Fruita i fruits secs',
        items: '1 poma gran cruixent amb 20g de nous crues',
        kcal: 190,
      },
      dinar: {
        title: 'Arròs integral amb verdures i tonyina',
        items: 'Arròs amb pebrots, ceba i tonyina natural amb un rajolí d’AOVE + fruita',
        kcal: 560,
      },
      snackTarda: {
        title: 'Iogurt proteic amb fruits vermells',
        items: 'Iogurt proteic natural amb un grapat de nabius o maduixes fresques',
        kcal: 130,
      },
      sopar: {
        title: 'Plat equilibrat CEA',
        items: 'Filet de peix al forn sobre patata tallada fina i verdures de temporada',
        kcal: 460,
      },
    },
  },
};

/**
 * Enhanced Food database with composite dishes and toppings/complements
 */
interface FoodLookup {
  keywords: string[];
  calories: number;
  hasSugar: boolean;
  name: string;
  category?: string;
  isComplement?: boolean;
}

const FOOD_DATABASE: FoodLookup[] = [
  // Plats compostos amb complements (ex: Pepito de pollo amb formatge)
  {
    keywords: [
      'pepito de pollo amb formatge',
      'pepito de pollo amb formatge fos',
      'pepito de pollastre amb formatge',
      'pepito de pollo con queso',
      'pepito pollo formatge',
    ],
    calories: 490,
    hasSugar: false,
    name: 'Pepito de pollastre amb formatge fos (Pa 180 + Pollastre 180 + Formatge 130)',
  },
  {
    keywords: ['pepito de pollo', 'pepito de pollastre', 'pepito pollo'],
    calories: 360,
    hasSugar: false,
    name: 'Pepito de pollastre (Pa 180 + Pit de pollastre 180)',
  },
  {
    keywords: [
      'pepito de vedella amb formatge',
      'pepito de ternera con queso',
      'pepito de vedella',
      'pepito de ternera',
    ],
    calories: 520,
    hasSugar: false,
    name: 'Pepito de vedella amb formatge',
  },
  {
    keywords: ['hamburguesa completa', 'burger completa'],
    calories: 620,
    hasSugar: false,
    name: 'Hamburguesa completa amb pa i formatge',
  },

  // Esmorzars / Berenars
  { keywords: ['tortilla', 'truita', 'ou', 'clares'], calories: 230, hasSugar: false, name: 'Truita d’ous' },
  { keywords: ['confitura', 'mermelada'], calories: 230, hasSugar: true, name: 'Pa amb confitura' },
  { keywords: ['sandwich mixt', 'bikini', 'pernil dolc i formatge', 'pernil dolç'], calories: 290, hasSugar: false, name: 'Sandwich mixt' },
  { keywords: ['gall d\'indi', 'alvocat', 'pavo', 'aguacate'], calories: 310, hasSugar: false, name: 'Pa amb gall d’indi i alvocat' },
  { keywords: ['tortitas', 'pancakes', 'avena', 'farina d\'avena'], calories: 380, hasSugar: false, name: 'Tortitas d’avena' },
  { keywords: ['mel', 'miel'], calories: 80, hasSugar: true, name: 'Mel' },
  { keywords: ['torrada', 'pa torrat', 'pa integral', 'tostada'], calories: 160, hasSugar: false, name: 'Pa torrat' },
  { keywords: ['cafe', 'cafè', 'te', 'infusio'], calories: 15, hasSugar: false, name: 'Cafè o te' },

  // Snacks & Lactis d'Alta Precisió (densitat nutricional calibrada)
  { keywords: ['platan', 'plàtan', 'platans', 'plàtans'], calories: 190, hasSugar: false, name: 'Plàtans' },
  { keywords: ['nous', 'nueces', 'fruits secs', 'ametlles', 'avellanes'], calories: 160, hasSugar: false, name: 'Grapada de fruits secs' },
  { keywords: ['iogurt grec 0%', 'iogurt grec desnatat', 'yogurt griego 0%', 'yogur griego 0%', 'yogurt griego desnatado', 'iogurt grec lleuger'], calories: 90, hasSugar: false, name: 'Iogurt grec 0% (~60 kcal/100g, 150g = 90 kcal)' },
  { keywords: ['iogurt grec', 'yogurt griego', 'yogur griego', 'iogurt grec natural'], calories: 170, hasSugar: false, name: 'Iogurt grec natural sencer (~115 kcal/100g, 150g = 170 kcal)' },
  { keywords: ['iogurt natural desnatat', 'yogur natural desnatado', 'iogurt 0%'], calories: 65, hasSugar: false, name: 'Iogurt natural desnatat (45 kcal/100g, 150g = 65 kcal)' },
  { keywords: ['iogurt natural', 'yogur natural', 'iogurt', 'yogur', 'yogurt'], calories: 90, hasSugar: false, name: 'Iogurt natural (~60 kcal/100g, 150g = 90 kcal)' },
  { keywords: ['iogurt proteic', 'iogurt protein', 'mercadona', 'pudding protein'], calories: 85, hasSugar: false, name: 'Iogurt proteic' },
  { keywords: ['formatge fresc batut 0%', 'queso fresco batido', 'formatge batut'], calories: 75, hasSugar: false, name: 'Formatge fresc batut 0% (50 kcal/100g)' },
  { keywords: ['skyr', 'kefir'], calories: 90, hasSugar: false, name: 'Skyr / Kèfir natural (~60 kcal/100g)' },
  { keywords: ['poma', 'manzana'], calories: 80, hasSugar: false, name: 'Poma' },
  { keywords: ['gelatina', 'gelatina protein'], calories: 40, hasSugar: false, name: 'Gelatina' },
  { keywords: ['sandwich vegetal', 'sanwich'], calories: 240, hasSugar: false, name: 'Sandwich vegetal' },

  // Dinars / Sopars
  { keywords: ['crema de verdures', 'puré', 'pure de verdures', 'puré de verdures'], calories: 140, hasSugar: false, name: 'Crema de verdures' },
  { keywords: ['pollastre al forn', 'pollastre forn patata', 'pollo al horno'], calories: 480, hasSugar: false, name: 'Pollastre al forn amb patata' },
  { keywords: ['espaguetis', 'pasta', 'macarrons', 'tomàtiga', 'tomatiga', 'tomaquet', 'ternera'], calories: 580, hasSugar: false, name: 'Pasta amb tomàquet i carn de vedella' },
  { keywords: ['arros', 'arròs', 'tonyina', 'atun'], calories: 490, hasSugar: false, name: 'Arròs amb verdures i tonyina' },
  { keywords: ['salmo', 'salmó', 'peix al forn'], calories: 460, hasSugar: false, name: 'Peix o salmó al forn amb guarnició' },
  { keywords: ['pizza'], calories: 680, hasSugar: false, name: 'Pizza de tonyina o pernil 0 salses' },
  { keywords: ['tacos', 'tortitas de blat de moro'], calories: 520, hasSugar: false, name: 'Tacos amb carn picada i verdures' },
  { keywords: ['amanida', 'ensalada'], calories: 220, hasSugar: false, name: 'Amanida fresca completa' },
  { keywords: ['carn picada', 'hamburguesa'], calories: 350, hasSugar: false, name: 'Carn picada magra' },

  // Complements individuals (afegits al plat)
  { keywords: ['formatge fos', 'formatge havarti', 'formatge tendre', 'formatge semicurat', 'formatge', 'queso'], calories: 130, hasSugar: false, name: 'Formatge fos (+130 kcal)', isComplement: true },
  { keywords: ['maionesa', 'mahonesa', 'mayonesa'], calories: 95, hasSugar: false, name: 'Maionesa (+95 kcal)', isComplement: true },
  { keywords: ['ketchup', 'quetxup'], calories: 35, hasSugar: true, name: 'Ketchup amb sucre (+35 kcal)', isComplement: true },
  { keywords: ['allioli', 'alioli'], calories: 110, hasSugar: false, name: 'Allioli (+110 kcal)', isComplement: true },
  { keywords: ['salsa barbacoa', 'salsa bbq', 'bbq'], calories: 50, hasSugar: true, name: 'Salsa barbacoa (+50 kcal)', isComplement: true },
  { keywords: ['patates fregides', 'patates cruixents'], calories: 250, hasSugar: false, name: 'Guarnició de patates fregides (+250 kcal)', isComplement: true },
  { keywords: ['bacon', 'beicon'], calories: 140, hasSugar: false, name: 'Bèicon cruixent (+140 kcal)', isComplement: true },
  { keywords: ['ou ferrat', 'ou fregit'], calories: 115, hasSugar: false, name: 'Ou ferrat (+115 kcal)', isComplement: true },

  // Aliments de Sucre / Prohibits / Avisos
  { keywords: ['sucre', 'azucar'], calories: 60, hasSugar: true, name: 'Sucre afegit' },
  { keywords: ['galletes', 'galletas', 'cookies'], calories: 260, hasSugar: true, name: 'Galletes industrials' },
  { keywords: ['dolços', 'dolcos', 'dolç', 'dolcet', 'xuxes', 'caramels'], calories: 200, hasSugar: true, name: 'Dolços' },
  { keywords: ['croissant', 'brioixeria', 'bolleria', 'donut', 'ensaimada'], calories: 380, hasSugar: true, name: 'Brioixeria industrial' },
  { keywords: ['xocolata', 'chocolate', 'nutella', 'nocilla'], calories: 250, hasSugar: true, name: 'Xocolata o crema de cacau' },
  { keywords: ['coca cola', 'refresc', 'fanta', 'nestea', 'red bull', 'monster'], calories: 140, hasSugar: true, name: 'Beguda ensucrada' },
  { keywords: ['pastis', 'pastís', 'tarta'], calories: 350, hasSugar: true, name: 'Pastís' },
  { keywords: ['gelat', 'helado'], calories: 220, hasSugar: true, name: 'Gelat ensucrat' },
];

/**
 * Calculates instantaneous "a ull" caloric estimate, taking into account composite dishes & complements
 */
export function estimateCaloriesAndSugar(text: string): {
  estimatedCalories: number;
  detectedSugar: boolean;
  sugarWarning?: string;
  detectedItems: string[];
  detectedComplements: string[];
} {
  if (!text || !text.trim()) {
    return {
      estimatedCalories: 0,
      detectedSugar: false,
      detectedItems: [],
      detectedComplements: [],
    };
  }

  const normalized = text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  let totalKcal = 0;
  let hasSugar = false;
  const items: string[] = [];
  const complements: string[] = [];
  const sugarAlerts: string[] = [];

  // Check composite dishes first (e.g. "pepito de pollo amb formatge")
  const compositeMatch = FOOD_DATABASE.find(
    (f) =>
      !f.isComplement &&
      f.keywords.some((kw) => {
        const nKw = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
        return normalized.includes(nKw);
      })
  );

  if (compositeMatch) {
    totalKcal += compositeMatch.calories;
    items.push(compositeMatch.name);
    if (compositeMatch.hasSugar) {
      hasSugar = true;
      sugarAlerts.push(compositeMatch.name);
    }

    // Now look for extra standalone complements that are NOT already in the composite name
    // e.g. if composite is "Pepito de pollastre" (without cheese) and text contains "formatge", add formatge!
    if (!compositeMatch.name.toLowerCase().includes('formatge') && normalized.includes('formatge')) {
      const cheese = FOOD_DATABASE.find((f) => f.keywords.includes('formatge'));
      if (cheese) {
        totalKcal += cheese.calories;
        complements.push(cheese.name);
      }
    }
  } else {
    // Check if user specified exact weight in grams (e.g. "150g", "150 grams")
    const gramMatch = normalized.match(/(\d{2,4})\s*(g|grams|gramos)\b/);
    const parsedGrams = gramMatch ? parseInt(gramMatch[1], 10) : null;

    // Special precision handler for Yogurts & Dairy
    const isYogurtOrDairy =
      normalized.includes('iogurt') ||
      normalized.includes('yogur') ||
      normalized.includes('yogurt') ||
      normalized.includes('skyr') ||
      normalized.includes('kefir') ||
      normalized.includes('formatge batut') ||
      normalized.includes('grec') ||
      normalized.includes('griego');

    if (isYogurtOrDairy && parsedGrams) {
      const is0PercentOrLight =
        normalized.includes('0%') ||
        normalized.includes('desnatat') ||
        normalized.includes('desnatado') ||
        normalized.includes('lleuger') ||
        normalized.includes('60kcal') ||
        normalized.includes('60 kcal') ||
        normalized.includes('60');

      const isGreekSencer =
        (normalized.includes('grec') || normalized.includes('griego')) && !is0PercentOrLight;

      const density = is0PercentOrLight ? 60 : isGreekSencer ? 115 : 60; // kcal per 100g
      const calculatedKcal = Math.round((parsedGrams * density) / 100);

      totalKcal += calculatedKcal;
      const dairyName = is0PercentOrLight
        ? `Iogurt grec 0% (${parsedGrams}g - ${calculatedKcal} kcal)`
        : isGreekSencer
        ? `Iogurt grec natural (${parsedGrams}g - ${calculatedKcal} kcal)`
        : `Iogurt natural (${parsedGrams}g - ${calculatedKcal} kcal)`;
      items.push(dairyName);
    } else {
      // Normal loop over individual ingredients
      for (const food of FOOD_DATABASE) {
        if (food.keywords.some((kw) => kw.includes('pepito'))) continue; // skip composite templates if not fully matched

        const matched = food.keywords.some((kw) => {
          const normalizedKw = kw.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
          return normalized.includes(normalizedKw);
        });

        if (matched && !items.includes(food.name) && !complements.includes(food.name)) {
          totalKcal += food.calories;
          if (food.isComplement) {
            complements.push(food.name);
          } else {
            items.push(food.name);
          }
          if (food.hasSugar) {
            hasSugar = true;
            sugarAlerts.push(food.name);
          }
        }
      }
    }
  }

  // Check standalone complement add-ons like extra sauces or sides
  const extraComplements: { kw: string; kcal: number; name: string; sugar?: boolean }[] = [
    { kw: 'formatge', kcal: 130, name: 'Formatge fos (+130 kcal)' },
    { kw: 'queso', kcal: 130, name: 'Formatge fos (+130 kcal)' },
    { kw: 'maionesa', kcal: 95, name: 'Maionesa (+95 kcal)' },
    { kw: 'mahonesa', kcal: 95, name: 'Maionesa (+95 kcal)' },
    { kw: 'ketchup', kcal: 35, name: 'Ketchup (+35 kcal, sucre)', sugar: true },
    { kw: 'quetxup', kcal: 35, name: 'Ketchup (+35 kcal, sucre)', sugar: true },
    { kw: 'patates fregides', kcal: 250, name: 'Patates fregides (+250 kcal)' },
    { kw: 'bacon', kcal: 140, name: 'Bèicon (+140 kcal)' },
    { kw: 'ou ferrat', kcal: 115, name: 'Ou ferrat (+115 kcal)' },
    { kw: 'allioli', kcal: 110, name: 'Allioli (+110 kcal)' },
  ];

  for (const c of extraComplements) {
    if (normalized.includes(c.kw)) {
      // make sure it wasn't already counted
      const alreadyCounted =
        complements.some((comp) => comp.toLowerCase().includes(c.kw)) ||
        items.some((it) => it.toLowerCase().includes(c.kw));
      if (!alreadyCounted) {
        totalKcal += c.kcal;
        complements.push(c.name);
        if (c.sugar) {
          hasSugar = true;
          sugarAlerts.push(c.name);
        }
      }
    }
  }

  // Fallback if typed something substantive but nothing matched
  if (totalKcal === 0 && text.trim().length > 3) {
    totalKcal = 260;
  }

  // Check explicit sugar keywords
  const sugarKeywords = [
    'sucre',
    'azucar',
    'dulce',
    'confitura',
    'mel',
    'miel',
    'xocolata',
    'gallet',
    'donut',
    'croissant',
    'refresc',
    'coca cola',
    'fanta',
    'nestea',
  ];
  for (const s of sugarKeywords) {
    if (normalized.includes(s)) {
      hasSugar = true;
    }
  }

  const warning =
    hasSugar && sugarAlerts.length > 0
      ? `S'ha detectat sucre afegit en: ${sugarAlerts.join(', ')}. Recorda la norma estricta: màxim 1 sol pic per setmana!`
      : hasSugar
      ? 'Aquest àpat conté sucre afegit. Vigila el teu límit d’1 pic a la setmana!'
      : undefined;

  return {
    estimatedCalories: totalKcal,
    detectedSugar: hasSugar,
    sugarWarning: warning,
    detectedItems: Array.from(new Set(items)),
    detectedComplements: Array.from(new Set(complements)),
  };
}

/**
 * Calculates scientific Daily Calorie & Macro Target based on Mifflin-St Jeor formula and active goal
 */
export function calculateDailyCalorieRecommendation(profile: UserProfile): {
  bmr: number;
  tdee: number;
  recommendedKcal: number;
  macros: {
    proteinG: number;
    carbsG: number;
    fatG: number;
  };
} {
  const weight = profile.weightKg || 70;
  const height = profile.heightCm || 175;
  const age = profile.age || 25;
  const isMale = profile.gender === 'home';

  // Mifflin - St Jeor BMR Formula
  const bmr = isMale
    ? Math.round(10 * weight + 6.25 * height - 5 * age + 5)
    : Math.round(10 * weight + 6.25 * height - 5 * age - 161);

  // Activity multipliers
  const activityMultipliers: Record<UserProfile['activityLevel'], number> = {
    sedentari: 1.2,
    moderat: 1.375,
    actiu: 1.55,
    'alt-rendiment': 1.725,
  };

  const mult = activityMultipliers[profile.activityLevel] || 1.45;
  const tdee = Math.round(bmr * mult);

  const guideline = GOAL_NUTRITION_PROFILES[profile.primaryGoal] || GOAL_NUTRITION_PROFILES['massa-muscular'];
  const recommendedKcal = profile.customCalorieTarget || Math.round(tdee + guideline.dailyCalorieModifier);

  // Calculate Macros
  const proteinG = Math.round(weight * guideline.proteinGPerKg);
  const proteinKcal = proteinG * 4;

  const fatKcal = Math.round((recommendedKcal * guideline.macroDistribution.fatPercent) / 100);
  const fatG = Math.round(fatKcal / 9);

  const remainingKcal = Math.max(200, recommendedKcal - proteinKcal - fatKcal);
  const carbsG = Math.round(remainingKcal / 4);

  return {
    bmr,
    tdee,
    recommendedKcal,
    macros: {
      proteinG,
      carbsG,
      fatG,
    },
  };
}

