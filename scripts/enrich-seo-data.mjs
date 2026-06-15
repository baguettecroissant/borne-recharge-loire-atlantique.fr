#!/usr/bin/env node
/**
 * Enriches communes.json with calculated SEO-unique fields for Loire-Atlantique (44):
 * - distanceNantes (distance to Nantes center)
 * - densiteBornes (public chargers per 1000 inhabitants)
 * - profilCommune (textual profile)
 * - marcheImmobilier (real estate market tier)
 * - tauxMaisonLabel (housing type description)
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const communesPath = resolve(__dirname, '../src/data/communes.json');
const communes = JSON.parse(readFileSync(communesPath, 'utf-8'));

// Nantes center coordinates
const NANTES_LAT = 47.218371;
const NANTES_LON = -1.553621;

function haversineKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function getProfilCommune(pop) {
  if (pop >= 100000) return 'métropole majeure';
  if (pop >= 30000) return 'ville majeure d\'agglomération';
  if (pop >= 15000) return 'ville moyenne résidentielle';
  if (pop >= 8000) return 'commune périurbaine dynamique';
  if (pop >= 4000) return 'bourg résidentiel';
  return 'village / commune rurale';
}

function getMarcheImmobilier(prixM2) {
  if (!prixM2) return 'non renseigné';
  if (prixM2 >= 5000) return 'extrêmement premium (côte)';
  if (prixM2 >= 3600) return 'très dynamique (Nantes métropole)';
  if (prixM2 >= 3000) return 'résidentiel recherché';
  if (prixM2 >= 2400) return 'intermédiaire';
  return 'accessible';
}

function getTauxMaisonLabel(pct) {
  if (pct === undefined || pct === null) return 'mixte';
  if (pct >= 80) return 'très majoritairement pavillonnaire';
  if (pct >= 60) return 'principalement pavillonnaire';
  if (pct >= 40) return 'mixte habitat individuel et collectif';
  if (pct >= 20) return 'majoritairement collectif';
  return 'très dense et collectif (métropolitain)';
}

let enriched = 0;
for (const c of communes) {
  // Distance to Nantes
  if (c.latitude && c.longitude) {
    c.distanceNantes = Math.round(haversineKm(c.latitude, c.longitude, NANTES_LAT, NANTES_LON) * 10) / 10;
  } else {
    c.distanceNantes = null;
  }

  // Density of public chargers per 1000 inhabitants
  if (c.bornesPubliques && c.population) {
    c.densiteBornes = Math.round((c.bornesPubliques / c.population) * 10000) / 10;
  } else {
    c.densiteBornes = null;
  }

  // Commune profile label
  c.profilCommune = getProfilCommune(c.population);

  // Real estate market tier
  c.marcheImmobilier = getMarcheImmobilier(c.prixM2Moyen);

  // Housing type label
  c.tauxMaisonLabel = getTauxMaisonLabel(c.logementsMaison);

  enriched++;
}

writeFileSync(communesPath, JSON.stringify(communes, null, 2) + '\n', 'utf-8');
console.log(`✅ Enriched ${enriched} communes with Loire-Atlantique (44) SEO data fields.`);

// Print sample
const sample = communes[0];
console.log('\nSample (Nantes):');
console.log(`  distanceNantes: ${sample.distanceNantes} km`);
console.log(`  densiteBornes: ${sample.densiteBornes} pour 1000 hab`);
console.log(`  profilCommune: ${sample.profilCommune}`);
console.log(`  marchéImmobilier: ${sample.marcheImmobilier}`);
console.log(`  tauxMaisonLabel: ${sample.tauxMaisonLabel}`);
