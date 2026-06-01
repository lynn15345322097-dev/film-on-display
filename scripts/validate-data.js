#!/usr/bin/env node

const fs = require("node:fs");
const path = require("node:path");

const DATA_DIR = path.join(__dirname, "..", "data");

const REQUIRED_FILES = [
  "museums.json",
  "exhibitions.json",
  "photos.json",
  "categories.json",
  "references.csl.json",
];

const VALID_VISIBILITY = new Set([
  "public",
  "public_thumbnail_only",
  "restricted",
  "private",
  "internal_research_only",
]);

const VALID_COORD_SOURCES = new Set([
  "gps_field_measurement",
  "geocoding_from_address",
  "manual_estimation",
  "third_party_source",
  "pending_verification",
]);

const VALID_COORD_SYSTEMS = new Set(["WGS84", "GCJ02", "BD09", "unknown"]);

let errors = 0;
let warnings = 0;

function error(message) {
  errors += 1;
  console.error(`ERROR: ${message}`);
}

function warning(message) {
  warnings += 1;
  console.warn(`WARN: ${message}`);
}

function loadJson(filename) {
  const filepath = path.join(DATA_DIR, filename);
  try {
    return JSON.parse(fs.readFileSync(filepath, "utf8"));
  } catch (err) {
    error(`${filename} cannot be parsed: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

console.log("\n=== Film on Display data validation ===\n");

for (const filename of REQUIRED_FILES) {
  if (!fs.existsSync(path.join(DATA_DIR, filename))) {
    error(`Missing data file: data/${filename}`);
  }
}

const museums = loadJson("museums.json") ?? [];
const exhibitions = loadJson("exhibitions.json") ?? [];
const photos = loadJson("photos.json") ?? [];
const references = loadJson("references.csl.json") ?? [];
loadJson("categories.json");

const museumIds = new Set(museums.map((museum) => museum.id));
const exhibitionIds = new Set(exhibitions.map((exhibition) => exhibition.id));
const referenceIds = new Set(references.map((reference) => reference.id));

console.log(`museums: ${museums.length}`);
console.log(`exhibitions: ${exhibitions.length}`);
console.log(`photos: ${photos.length}`);
console.log(`references: ${references.length}\n`);

for (const [index, museum] of museums.entries()) {
  const prefix = `museums[${index}] ${museum.id ?? "(missing id)"}`;
  if (!museum.id) error(`${prefix}: missing id`);
  if (!museum.name_zh) error(`${prefix}: missing name_zh`);
  if (!museum.administrative_division?.province) {
    error(`${prefix}: missing administrative_division.province`);
  }
  if (!museum.administrative_division?.city) {
    error(`${prefix}: missing administrative_division.city`);
  }
  if (!museum.geo) {
    error(`${prefix}: missing geo`);
  } else {
    if (!VALID_COORD_SYSTEMS.has(museum.geo.coordinate_system)) {
      error(`${prefix}: invalid geo.coordinate_system`);
    }
    if (!VALID_COORD_SOURCES.has(museum.geo.coordinate_source)) {
      error(`${prefix}: invalid geo.coordinate_source`);
    }
    if (
      (museum.geo.latitude === null || museum.geo.longitude === null) &&
      museum.geo.coordinate_source !== "pending_verification"
    ) {
      warning(`${prefix}: null coordinates should use pending_verification as coordinate_source`);
    }
  }
  if (!museum.classification?.type) error(`${prefix}: missing classification.type`);
}

for (const [index, exhibition] of exhibitions.entries()) {
  const prefix = `exhibitions[${index}] ${exhibition.id ?? "(missing id)"}`;
  if (!exhibition.id) error(`${prefix}: missing id`);
  if (!exhibition.title_zh) error(`${prefix}: missing title_zh`);

  const museumReferences = Array.isArray(exhibition.museum_ids)
    ? exhibition.museum_ids
    : exhibition.museum_id
      ? [exhibition.museum_id]
      : [];

  if (!museumReferences.length) error(`${prefix}: missing museum_ids or museum_id`);

  for (const museumId of museumReferences) {
    if (!museumIds.has(museumId)) {
      error(`${prefix}: unknown museum reference ${museumId}`);
    }
  }

  for (const chapter of exhibition.chapters ?? []) {
    for (const museumId of chapter.museum_ids ?? []) {
      if (!museumIds.has(museumId)) {
        error(`${prefix}: unknown chapter museum reference ${museumId}`);
      }
    }
  }
}

for (const [index, photo] of photos.entries()) {
  const prefix = `photos[${index}] ${photo.id ?? "(missing id)"}`;
  if (!photo.id) error(`${prefix}: missing id`);
  if (!photo.museum_id || !museumIds.has(photo.museum_id)) {
    error(`${prefix}: invalid museum_id`);
  }
  if (photo.exhibition_id && !exhibitionIds.has(photo.exhibition_id)) {
    error(`${prefix}: unknown exhibition_id ${photo.exhibition_id}`);
  }
  if (!VALID_VISIBILITY.has(photo.visibility)) {
    error(`${prefix}: invalid visibility ${photo.visibility}`);
  }
  if (!photo.rights?.photographer_copyright) {
    error(`${prefix}: missing rights.photographer_copyright`);
  }
  if (!photo.rights?.institutional_restriction) {
    error(`${prefix}: missing rights.institutional_restriction`);
  }
  if (!photo.rights?.personality_rights) {
    error(`${prefix}: missing rights.personality_rights`);
  }
  for (const referenceId of photo.references ?? []) {
    if (!referenceIds.has(referenceId)) {
      error(`${prefix}: unknown reference ${referenceId}`);
    }
  }
}

console.log("\n=== Result ===");
console.log(`errors: ${errors}`);
console.log(`warnings: ${warnings}`);

process.exit(errors > 0 ? 1 : 0);
