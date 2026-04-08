// Cliente HTTP base para a API-Football v3
// Documentação: https://www.api-football.com/documentation-v3
// ⚠️  Limite: 100 requests/dia · 10 requests/minuto (plano Free)

const API_BASE = import.meta.env.VITE_API_FOOTBALL_URL as string;
const API_KEY  = import.meta.env.VITE_API_FOOTBALL_KEY as string;

if (!API_BASE || !API_KEY) {
  console.error('[API-Football] ⚠️ Variáveis de ambiente ausentes. Verifique o .env');
}

export async function apiGet<T>(
  endpoint: string,
  params: Record<string, string | number> = {}
): Promise<T> {
  const url = new URL(`${API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)));

  console.info(`[API-Football] GET /${endpoint}`, params);

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-apisports-key': API_KEY,
    },
  });

  if (!response.ok) {
    throw new Error(`API-Football: HTTP ${response.status} — ${response.statusText}`);
  }

  const data = await response.json() as T;

  // Log de cota restante (se disponível nos headers)
  const remaining = response.headers.get('x-ratelimit-requests-remaining');
  const limit     = response.headers.get('x-ratelimit-requests-limit');
  if (remaining !== null) {
    console.info(`[API-Football] 📊 Cota: ${remaining}/${limit} requests restantes hoje`);
  }

  return data;
}
