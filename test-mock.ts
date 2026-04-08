import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMockSystem() {
  console.log('1. Testando chaves do .env...');
  const API_KEY = process.env.VITE_API_FOOTBALL_KEY;
  if (!API_KEY) {
    console.error('ERRO: VITE_API_FOOTBALL_KEY não encontrada nas variáveis de ambiente.');
    return;
  }
  
  console.log('2. Buscando dados da API-Football (Temporada 2024)...');
  try {
    const response = await fetch('https://v3.football.api-sports.io/fixtures?league=71&season=2024', {
      headers: {
        'x-apisports-key': API_KEY,
      }
    });

    if (!response.ok) {
       throw new Error(`HTTP Error: ${response.status}`);
    }

    const data = await response.json();
    console.log(`   - Recebido: ${data.results} partidas.`);

    if (data.results === 0) {
       console.log('   - Erro: nenhum dado retornado pela API.');
       return;
    }

    console.log('3. Estruturando dado do mock (SeasonCalendar)...');
    
    // Calcula rounds parecidos com o Context
    const rounds = new Set(data.response.map((f: any) => f.league.round));
    const calendarData = {
      leagueId: 71,
      season: 2024,
      fixtures: data.response,
      fetchedAt: new Date().toISOString(),
      totalFixtures: data.results,
      totalRounds: rounds.size,
      requestsUsed: 1,
    };

    console.log('4. Salvando json do mock...');
    const mocksDir = join(__dirname, 'src', 'services', 'api-football', 'mocks');
    mkdirSync(mocksDir, { recursive: true });
    
    const filepath = join(mocksDir, 'brasileirao-2024.json');
    writeFileSync(filepath, JSON.stringify(calendarData, null, 2), 'utf-8');
    
    console.log(`✅ Sucesso! Mock salvo em: ${filepath}`);
    console.log(`Tamanho do arquivo: ${(JSON.stringify(calendarData).length / 1024).toFixed(2)} kb`);

  } catch (error) {
    console.error('Erro durante o teste:', error);
  }
}

testMockSystem();
