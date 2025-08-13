const fs = require("fs");
const path = require("path");

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

// Função para buscar todas as estações da API
async function getAllStationsFromAPI() {
  const query = `
    query {
      hideoutStations {
        id
        name
      }
    }
  `;

  const result = await fetchFromAPI(query);
  return result?.data?.hideoutStations || [];
}

// Função para verificar se uma estação tem módulos
async function checkStationHasModules(stationName) {
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
  const modules = result?.data?.hideoutModules || [];

  return {
    hasModules: modules.length > 0,
    moduleCount: modules.length,
    modules: modules,
  };
}

// Função principal para verificar todas as estações
async function checkAllStations() {
  console.log("🔍 Verificando todas as estações da API...\n");

  // Buscar todas as estações da API
  const apiStations = await getAllStationsFromAPI();
  console.log(`📡 Total de estações na API: ${apiStations.length}`);

  // Carregar nossas estações atuais
  const currentDataPath = path.join(__dirname, "../public/data/hideout.json");
  const currentData = JSON.parse(fs.readFileSync(currentDataPath, "utf8"));

  console.log(
    `📋 Total de estações que temos: ${currentData.stations.length}\n`
  );

  // Mapear nomes das estações que temos
  const ourStationNames = currentData.stations.map((s) => s.locales.en);

  console.log("📊 ANÁLISE DETALHADA:\n");

  // Estações que temos mas não estão na API (pode ser normal)
  const onlyInOurs = ourStationNames.filter(
    (name) => !apiStations.some((api) => api.name === name)
  );

  if (onlyInOurs.length > 0) {
    console.log("❌ Estações que temos mas não estão na API:");
    onlyInOurs.forEach((name) => console.log(`  - ${name}`));
    console.log("");
  }

  // Estações que estão na API mas não temos
  const onlyInAPI = apiStations.filter(
    (api) => !ourStationNames.some((ours) => ours === api.name)
  );

  if (onlyInAPI.length > 0) {
    console.log("🆕 Estações na API que não temos:");
    onlyInAPI.forEach((station) =>
      console.log(`  - ${station.name} (ID: ${station.id})`)
    );
    console.log("");
  }

  // Estações que estão em ambos
  const commonStations = apiStations.filter((api) =>
    ourStationNames.some((ours) => ours === api.name)
  );

  console.log(`✅ Estações em comum: ${commonStations.length}`);

  // Verificar estações específicas que podem estar faltando
  console.log("\n🔍 Verificando estações específicas...");

  const specificStations = [
    "Gym",
    "Weapon Rack",
    "Defective Wall",
    "Hall of Fame",
    "Christmas Tree",
  ];

  for (const stationName of specificStations) {
    console.log(`\n📡 Verificando: ${stationName}`);

    // Verificar se temos
    const weHave = ourStationNames.includes(stationName);
    console.log(`  📋 Temos: ${weHave ? "✅" : "❌"}`);

    // Verificar se está na API
    const inAPI = apiStations.some((api) => api.name === stationName);
    console.log(`  🌐 Na API: ${inAPI ? "✅" : "❌"}`);

    // Se não temos mas está na API, verificar se tem módulos
    if (!weHave && inAPI) {
      console.log(`  🔍 Verificando se ${stationName} tem módulos...`);
      const moduleCheck = await checkStationHasModules(stationName);

      if (moduleCheck.hasModules) {
        console.log(`    ✅ Tem ${moduleCheck.moduleCount} módulos`);
        console.log(
          `    📋 Módulos: ${moduleCheck.modules
            .map((m) => `Nível ${m.level}`)
            .join(", ")}`
        );
      } else {
        console.log(`    ❌ Sem módulos (estação vazia)`);
      }
    }

    // Aguardar um pouco para não sobrecarregar a API
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("\n📋 RESUMO FINAL:");
  console.log(`  🌐 Total na API: ${apiStations.length}`);
  console.log(`  📋 Total que temos: ${currentData.stations.length}`);
  console.log(`  ✅ Em comum: ${commonStations.length}`);
  console.log(`  🆕 Faltando: ${onlyInAPI.length}`);
  console.log(`  ❌ Só temos: ${onlyInOurs.length}`);
}

// Executar verificação
if (require.main === module) {
  checkAllStations().catch(console.error);
}

module.exports = { checkAllStations };
