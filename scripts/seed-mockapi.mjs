// Carga docs/seed-tickets.json en MockAPI usando EXPO_PUBLIC_API_URL del .env.
// Uso: node scripts/seed-mockapi.mjs [--reset]  (--reset borra los tickets existentes antes de cargar)
import { readFile } from 'node:fs/promises';

process.loadEnvFile('.env');

const baseUrl = process.env.EXPO_PUBLIC_API_URL;
if (!baseUrl) {
  throw new Error('Falta EXPO_PUBLIC_API_URL en .env');
}

const endpoint = `${baseUrl.replace(/\/$/, '')}/tickets`;
const shouldReset = process.argv.includes('--reset');

async function request(url, options = {}) {
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!response.ok) {
    throw new Error(`${options.method ?? 'GET'} ${url} → HTTP ${response.status}`);
  }
  return response.json();
}

const existing = await request(endpoint);

if (existing.length > 0 && !shouldReset) {
  throw new Error(
    `El recurso ya tiene ${existing.length} tickets. Usa --reset para reemplazarlos.`,
  );
}

for (const ticket of existing) {
  await request(`${endpoint}/${ticket.id}`, { method: 'DELETE' });
}

const seed = JSON.parse(await readFile(new URL('../docs/seed-tickets.json', import.meta.url)));

// Secuencial para que los ids de MockAPI respeten el orden del seed.
for (const ticket of seed) {
  const created = await request(endpoint, { method: 'POST', body: JSON.stringify(ticket) });
  console.log(
    `#${created.id} ${created.priority.padEnd(6)} ${created.status.padEnd(11)} ${created.title}`,
  );
}

console.log(`\n${seed.length} tickets cargados en ${endpoint}`);
