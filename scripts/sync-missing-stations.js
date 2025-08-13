const fs = require('fs');
const path = require('path');

// Função para buscar dados da API do Tarkov.dev
async function fetchFromAPI(query) {
  try {
    const response = await fetch('https://api.tarkov.dev/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erro ao buscar da API:', error);
    return null;
  }
}

// Função para buscar módulos de uma estação específica
async function getStationModules(stationName) {
  const query = `
    query {
      hideoutModules(module: "${stationName}") {
        id
        module
        level
        require {
          type
          name
          quantity
        }
      }
    }
  `;
  
  const result = await fetchFromAPI(query);
  return result?.data?.hideoutModules || [];
}

// Função principal para sincronizar
async function syncMissingStations() {
  console.log('🔄 Sincronizando estações faltantes...\n');
  
  // Estações que estão faltando
  const missingStations = [
    'Gear Rack',
    'Cultist Circle'
  ];
  
  // Estações com nomes que precisam ser corrigidos
  const nameCorrections = {
    'Water collector': 'Water Collector',
    'Rest space': 'Rest Space', 
    'Intelligence center': 'Intelligence Center',
    'Scav case': 'Scav Case',
    'Booze generator': 'Booze Generator',
    'Bitcoin farm': 'Bitcoin Farm',
    'Solar power': 'Solar Power'
  };
  
  // Carregar dados atuais
  const currentDataPath = path.join(__dirname, '../public/data/hideout.json');
  const currentData = JSON.parse(fs.readFileSync(currentDataPath, 'utf8'));
  
  console.log('📋 Estações atuais:', currentData.stations.length);
  currentData.stations.forEach(station => {
    console.log(`  - ${station.locales.en}`);
  });
  
  console.log('\n🔍 Verificando estações faltantes...');
  
  // Buscar dados das estações faltantes
  for (const stationName of missingStations) {
    console.log(`\n📡 Buscando dados para: ${stationName}`);
    
    const modules = await getStationModules(stationName);
    if (modules.length > 0) {
      console.log(`  ✅ Encontrados ${modules.length} módulos`);
      
      // Criar nova estação
      const newStation = {
        id: Date.now() + Math.random(), // ID temporário
        locales: {
          en: stationName
        },
        function: `Nova estação: ${stationName}`,
        imgSource: `/img/${stationName.replace(/\s+/g, '_')}_Portrait.png`
      };
      
      currentData.stations.push(newStation);
      console.log(`  ➕ Estação ${stationName} adicionada`);
    } else {
      console.log(`  ❌ Nenhum módulo encontrado para ${stationName}`);
    }
    
    // Aguardar um pouco para não sobrecarregar a API
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  console.log('\n🔧 Corrigindo nomes das estações...');
  
  // Aplicar correções de nomes
  currentData.stations.forEach(station => {
    const currentName = station.locales.en;
    if (nameCorrections[currentName]) {
      const oldName = currentName;
      station.locales.en = nameCorrections[currentName];
      console.log(`  ✏️  "${oldName}" → "${station.locales.en}"`);
    }
  });
  
  // Salvar dados atualizados
  const outputPath = path.join(__dirname, '../public/data/hideout-updated.json');
  fs.writeFileSync(outputPath, JSON.stringify(currentData, null, 2));
  
  console.log('\n✅ Sincronização concluída!');
  console.log(`📁 Dados salvos em: ${outputPath}`);
  console.log(`📊 Total de estações: ${currentData.stations.length}`);
  
  // Mostrar resumo das mudanças
  console.log('\n📋 Resumo das mudanças:');
  console.log('  ➕ Estações adicionadas:', missingStations.length);
  console.log('  ✏️  Nomes corrigidos:', Object.keys(nameCorrections).length);
}

// Executar sincronização
if (require.main === module) {
  syncMissingStations().catch(console.error);
}

module.exports = { syncMissingStations };
