const fs = require("fs");

// Função para buscar dados da API do Tarkov.dev
async function fetchFromAPI(query) {
  try {
    const response = await fetch("https://api.tarkov.dev/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ query }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Erro ao buscar da API:", error);
    return null;
  }
}

// Função para testar consultas básicas
async function testSimpleQueries() {
  console.log("🧪 Testando consultas básicas na API...\n");

  // Teste 1: Listar todas as estações
  console.log("📡 Teste 1: Listar todas as estações");
  const stationsQuery = `
    query {
      hideoutStations {
        id
        name
      }
    }
  `;

  const stationsResult = await fetchFromAPI(stationsQuery);
  if (stationsResult?.data?.hideoutStations) {
    console.log(
      `  ✅ Encontradas ${stationsResult.data.hideoutStations.length} estações`
    );
    stationsResult.data.hideoutStations.slice(0, 5).forEach((station) => {
      console.log(`    - ${station.name} (ID: ${station.id})`);
    });
  } else {
    console.log("  ❌ Falha ao buscar estações");
  }

  console.log("");

  // Teste 2: Buscar módulos sem filtro
  console.log("📡 Teste 2: Buscar módulos sem filtro");
  const modulesQuery = `
    query {
      hideoutModules {
        id
        module
        level
      }
    }
  `;

  const modulesResult = await fetchFromAPI(modulesQuery);
  if (modulesResult?.data?.hideoutModules) {
    console.log(
      `  ✅ Encontrados ${modulesResult.data.hideoutModules.length} módulos`
    );
    modulesResult.data.hideoutModules.slice(0, 5).forEach((module) => {
      console.log(`    - ${module.module} (Nível ${module.level})`);
    });
  } else {
    console.log("  ❌ Falha ao buscar módulos");
  }

  console.log("");

  // Teste 3: Buscar módulos com filtro específico (usando um nome que sabemos que existe)
  console.log("📡 Teste 3: Buscar módulos com filtro específico");
  const specificQuery = `
    query {
      hideoutModules(module: "Generator") {
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

  const specificResult = await fetchFromAPI(specificQuery);
  if (specificResult?.data?.hideoutModules) {
    console.log(
      `  ✅ Encontrados ${specificResult.data.hideoutModules.length} módulos para Generator`
    );
    specificResult.data.hideoutModules.forEach((module) => {
      const reqCount = module.require?.length || 0;
      console.log(`    - Nível ${module.level}: ${reqCount} requisitos`);
    });
  } else {
    console.log("  ❌ Falha ao buscar módulos específicos");
  }

  console.log("");

  // Teste 4: Verificar se há erros na resposta
  if (stationsResult?.errors) {
    console.log("⚠️  ERROS ENCONTRADOS:");
    stationsResult.errors.forEach((error) => {
      console.log(`  - ${error.message}`);
    });
  }

  // Salvar resultados para análise
  const results = {
    stations: stationsResult?.data?.hideoutStations || [],
    modules: modulesResult?.data?.hideoutModules || [],
    specificModules: specificResult?.data?.hideoutModules || [],
    errors: stationsResult?.errors || [],
  };

  const outputPath = "./public/data/api-test-results.json";
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n💾 Resultados salvos em: ${outputPath}`);

  return results;
}

// Executar testes
if (require.main === module) {
  testSimpleQueries().catch(console.error);
}

module.exports = { testSimpleQueries };
