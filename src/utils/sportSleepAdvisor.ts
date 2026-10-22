import { SportIntensity, TrainingType, SportFeeling } from '../types';

export interface SleepRecoveryRecommendation {
  recommendedSleepHours: number;
  recommendedSleepRange: string;
  restWindowHours: number;
  recoveryTip: string;
  sleepWhyTip: string;
  keyRecoveryBadges: string[];
}

export function computeSportSleepRecovery(params: {
  sport: string;
  durationMinutes: number;
  intensity: SportIntensity;
  trainingType: TrainingType;
  feeling: SportFeeling;
  distanceKm?: number;
  gymMuscleGroups?: string[];
  isRestDay?: boolean;
}): SleepRecoveryRecommendation {
  const {
    sport,
    durationMinutes,
    intensity,
    trainingType,
    feeling,
    distanceKm = 0,
    gymMuscleGroups = [],
    isRestDay = false,
  } = params;

  if (isRestDay) {
    return {
      recommendedSleepHours: 7.75,
      recommendedSleepRange: '7h 30m - 8h 00m',
      restWindowHours: 0,
      recoveryTip: 'Aprofita el dia de descans per assimilar les sessions anteriors, hidratar-te i fer estiraments suaus.',
      sleepWhyTip: 'Un son basal de 7h30-8h permet restaurar el sistema nerviós autònom i normalitzar els nivells de cortisol.',
      keyRecoveryBadges: ['Descans complet', 'Regeneració basal', '7h30 - 8h00 son'],
    };
  }

  const s = sport.toLowerCase();
  const isGym = s.includes('gimnàs') || s.includes('gimnas') || s.includes('peses') || s.includes('fitness');
  const isRunning = s.includes('córrer') || s.includes('correr') || s.includes('running');
  const isCycling = s.includes('bici') || s.includes('ciclisme') || s.includes('cycling');
  const isSwimming = s.includes('natació') || s.includes('natacio') || s.includes('swimming');
  const isPadelOrTennis = s.includes('pàdel') || s.includes('padel') || s.includes('tennis');
  const isFootball = s.includes('futbol') || s.includes('soccer');

  // Base sleep hours
  let sleepHours = 8.0;
  let restHours = 24;
  const badges: string[] = [];

  // Duration impact
  if (durationMinutes >= 90) {
    sleepHours += 0.75;
    restHours += 12;
    badges.push('+45 min son per volum alt');
  } else if (durationMinutes >= 60) {
    sleepHours += 0.5;
  }

  // Intensity impact
  if (intensity === 'maxima') {
    sleepHours += 0.5;
    restHours += 24;
    badges.push('SNC exhaurit (alta intensitat)');
  } else if (intensity === 'alta') {
    sleepHours += 0.25;
    restHours += 12;
  }

  // Feeling impact
  if (feeling === 'cansat' || feeling === 'pesadesa') {
    sleepHours += 0.25;
    restHours += 12;
    badges.push('Fatiga acumulada');
  } else if (feeling === 'amb-molesties') {
    restHours += 24;
    badges.push('Alerta molèsties: +24h descans');
  }

  // Sport-specific adjustments
  let sleepWhyTip = '';
  let recoveryTip = '';

  if (isGym) {
    const hasLegs = gymMuscleGroups.some((g) => g.toLowerCase().includes('cames') || g.toLowerCase().includes('glutis'));
    const hasBackChest = gymMuscleGroups.some(
      (g) => g.toLowerCase().includes('esquena') || g.toLowerCase().includes('pit') || g.toLowerCase().includes('força')
    );

    if (hasLegs) {
      sleepHours = Math.max(sleepHours, 8.75);
      restHours = Math.max(restHours, 48);
      badges.push('48h-72h tren inferior');
      sleepWhyTip =
        'El treball de cames i glutis produeix el major volum de microtrencaments musculars del cos. El pic de secreció d’hormona del creixement (GH) durant la fase de son profund NREM 3 és imprescindible per reconstruir les miofibril·les sense pèrdua de força.';
      recoveryTip =
        'Descans recomanat de 48 a 72 hores abans de tornar a carregar cames. Pren una ració de proteïna neta (ou, pollastre o caseïna) abans de dormir i fes mobilitat de maluc demà.';
    } else if (hasBackChest) {
      sleepHours = Math.max(sleepHours, 8.5);
      restHours = Math.max(restHours, 48);
      badges.push('48h descans tren superior');
      sleepWhyTip =
        'Les càrregues en grups musculars grans (pectoral, dorsal) fatiguen fortament la transmissió neuromuscular. Un son llarg de 8h30 garanteix la resíntesi de proteïnes musculars.';
      recoveryTip =
        'Descans recomanat de 48 hores per al tren superior. Estira pectorals i dorsal ample per mantenir la postura escapular.';
    } else {
      sleepHours = Math.max(sleepHours, 8.25);
      restHours = Math.max(restHours, 36);
      sleepWhyTip =
        'L’entrenament de força exigeix reparació estructural nocturna. 8h15 a 8h30 de son profund afavoreixen la recuperació sense rigidesa.';
      recoveryTip =
        'Descans de 24 a 36 hores. Mantén una ingesta hídrica de 2.5L i sopar ric en magnesi (espinacs, fruits secs).';
    }
  } else if (isRunning) {
    if (distanceKm >= 12 || durationMinutes >= 70) {
      sleepHours = Math.max(sleepHours, 9.0);
      restHours = Math.max(restHours, 48);
      badges.push('+60 min son (llarga tirada)');
      badges.push('48h recuperació articular');
      sleepWhyTip =
        'L’impacte repetitiu del running castiga tendons, cartílags i gasta completament els dipòsits de glicogen hepàtic i muscular. Necessites com a mínim 8h45 - 9h de son per regenerar teixit connectiu i reduir la inflamació sistemàtica.';
      recoveryTip =
        'No facis cap sessió d’impacte demà (48h de descans recomanat per a impactes). Opta per caminar suau, estiraments de bessons i isquiotibials i dutxa d’aigua freda a les cames.';
    } else {
      sleepHours = Math.max(sleepHours, 8.25);
      restHours = Math.max(restHours, 24);
      badges.push('24h-36h entre rodatges');
      sleepWhyTip =
        'Els quilòmetres acumulats necessiten una fase de son profunda per reposar el to muscular i calmar la freqüència cardíaca basal.';
      recoveryTip =
        '24 a 36 hores abans de la propera cursa. Beu líquids amb electròlits per recuperar el sodi perdut per la suor.';
    }
  } else if (isCycling) {
    if (distanceKm >= 50 || durationMinutes >= 90) {
      sleepHours = Math.max(sleepHours, 9.0);
      restHours = Math.max(restHours, 48);
      badges.push('48h descans cames (llarga ruta)');
      sleepWhyTip =
        'Una ruta llarga en bicicleta esgota les reserves d’energia aeròbica i fatiga la zona lumbar i cervical per la posició sostinguda. 8h45 - 9h al llit són vitals per reposar la musculatura postural.';
      recoveryTip =
        '48 hores de marge abans d’un altre esforç en bici de més d’1 hora. Descàrrega lumbar i quàdriceps amb corró d’escuma (foam roller).';
    } else {
      sleepHours = Math.max(sleepHours, 8.25);
      restHours = Math.max(restHours, 24);
      sleepWhyTip =
        'La bicicleta té zero impacte articular però alta demanda metabòlica. 8h15 de son reparador permetran assimilar el consum de greixos i carbohidrats.';
      recoveryTip = '24 hores abans de tornar a pedalar. Mantén bona hidratació.';
    }
  } else if (isSwimming) {
    sleepHours = Math.max(sleepHours, 8.5);
    restHours = Math.max(restHours, 36);
    badges.push('Descàrrega d’espatlles');
    sleepWhyTip =
      'La natació implica resistència hidrodinàmica i una forta demanda a la cintura escapular i pulmó. Dormir 8h30 permet la desinflamació del manegot dels rotatoris.';
    recoveryTip = '36 hores de recuperació abans d’una altra sessió intensa de natació.';
  } else if (isPadelOrTennis || isFootball) {
    sleepHours = Math.max(sleepHours, 8.5);
    restHours = Math.max(restHours, 36);
    badges.push('Frenades i girs (adductors)');
    sleepWhyTip =
      'Els canvis continus de direcció, arrencades i frenades causen estrès excèntric en adductors, genolls i turmells. Un son d’almenys 8h30 atura l’augment de creatina-cinasa en sang.';
    recoveryTip =
      'Descans recomanat de 36 a 48 hores abans d’un altre partit competitiu. Estira piramidal i gluti mitjà.';
  } else {
    // Other sport
    if (intensity === 'alta' || intensity === 'maxima') {
      sleepHours = Math.max(sleepHours, 8.5);
      restHours = Math.max(restHours, 36);
    } else {
      sleepHours = Math.max(sleepHours, 8.0);
      restHours = Math.max(restHours, 24);
    }
    sleepWhyTip =
      `La pràctica d’activitat física (${durationMinutes} min) necessita un descans adequat per assimilar la càrrega cardiovascular i mantenir el to vital.`;
    recoveryTip =
      `Mantingues ${restHours} hores de marge abans d’un esforç similar. Sopar equilibrat i descans nocturn complet.`;
  }

  // Format nice string
  const wholeHours = Math.floor(sleepHours);
  const minutes = Math.round((sleepHours - wholeHours) * 60);
  const minMin = minutes >= 45 ? 45 : minutes >= 30 ? 30 : minutes >= 15 ? 15 : 0;
  const maxHours = minMin === 45 ? wholeHours + 1 : wholeHours;
  const maxMin = minMin === 45 ? 15 : minMin + 30;

  const padMin = (m: number) => (m < 10 ? `0${m}` : `${m}`);
  const rangeStr = `${wholeHours}h ${padMin(minMin)}m - ${maxHours}h ${padMin(maxMin)}m`;

  return {
    recommendedSleepHours: Math.round(sleepHours * 10) / 10,
    recommendedSleepRange: rangeStr,
    restWindowHours: restHours,
    recoveryTip,
    sleepWhyTip,
    keyRecoveryBadges: badges,
  };
}
