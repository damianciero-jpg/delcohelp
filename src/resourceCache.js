const PUBLIC_RESOURCE_FIELDS = [
  "id",
  "zip",
  "category",
  "name",
  "address",
  "phone",
  "website",
  "mapsUrl",
  "hours",
  "lat",
  "lng",
  "latitude",
  "longitude",
  "lastUpdated",
  "verified",
  "verifiedBy",
  "requiresID",
  "requiresProofOfAddress",
  "appointmentRequired",
  "residencyRestrictions",
  "walkInAvailable",
  "notes",
  "nearestBusRoute",
  "nearestTransitStop",
  "transitNotes",
  "tags",
  "color",
  "description",
  "openDays",
  "openStart",
  "openEnd",
  "miles",
];

function sanitizeResource(resource) {
  return PUBLIC_RESOURCE_FIELDS.reduce((safe, field) => {
    if (resource[field] !== undefined) safe[field] = resource[field];
    return safe;
  }, {});
}

export function cachePublicResources(cacheKey, resources) {
  if (!Array.isArray(resources) || resources.length === 0) return;
  try {
    const payload = {
      savedAt: new Date().toISOString(),
      resources: resources.map(sanitizeResource),
    };
    localStorage.setItem(cacheKey, JSON.stringify(payload));
  } catch {}
}

export function readCachedPublicResources(cacheKey) {
  try {
    const payload = JSON.parse(localStorage.getItem(cacheKey) || "null");
    if (!payload || !Array.isArray(payload.resources)) return [];
    return payload.resources;
  } catch {
    return [];
  }
}

export function getInitialPublicResources(cacheKey, resources) {
  if (Array.isArray(resources) && resources.length > 0) {
    return { resources, usingCache: false };
  }
  const cached = readCachedPublicResources(cacheKey);
  return { resources: cached, usingCache: cached.length > 0 };
}
