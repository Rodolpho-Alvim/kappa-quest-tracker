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

// Função para buscar todos os módulos de todas as estações
async function getAllStationModules() {
  console.log("🔍 Buscando módulos de todas as estações...\n");

  // Lista de todas as estações que queremos verificar
  const allStations = [
    "Generator",
    "Air Filtering Unit",
    "Bitcoin Farm",
    "Booze Generator",
    "Heating",
    "Illumination",
    "Lavatory",
    "Library",
    "Medstation",
    "Nutrition Unit",
    "Rest Space",
    "Scav Case",
    "Security",
    "Shooting Range",
    "Solar Power",
    "Stash",
    "Vents",
    "Water Collector",
    "Workbench",
    "Intelligence Center",
    "Hall of Fame",
    "Defective Wall",
    "Weapon Rack",
    "Gear Rack",
    "Cultist Circle",
    "Gym",
  ];

  const results = {};
  let totalModules = 0;

  for (const stationName of allStations) {
    console.log(`📡 Buscando módulos para: ${stationName}`);

    const modules = await getStationModules(stationName);
    results[stationName] = modules;

    if (modules.length > 0) {
      console.log(`  ✅ Encontrados ${modules.length} módulos`);
      totalModules += modules.length;

      // Mostrar detalhes dos módulos
      modules.forEach((module) => {
        const reqCount = module.require?.length || 0;
        console.log(`    📋 Nível ${module.level}: ${reqCount} requisitos`);
      });
    } else {
      console.log(`  ❌ Sem módulos (estação vazia)`);
    }

    // Aguardar um pouco para não sobrecarregar a API
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n📊 RESUMO:`);
  console.log(`  🏗️  Total de estações verificadas: ${allStations.length}`);
  console.log(`  📋 Total de módulos encontrados: ${totalModules}`);

  // Salvar resultados em arquivo
  const outputPath = path.join(
    __dirname,
    "../public/data/station-modules.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n💾 Resultados salvos em: ${outputPath}`);

  // Mostrar estações com mais módulos
  console.log("\n🏆 ESTAÇÕES COM MAIS MÓDULOS:");
  const stationStats = Object.entries(results)
    .map(([name, modules]) => ({ name, moduleCount: modules.length }))
    .sort((a, b) => b.moduleCount - a.moduleCount)
    .filter((station) => station.moduleCount > 0);

  stationStats.forEach((station, index) => {
    console.log(
      `  ${index + 1}. ${station.name}: ${station.moduleCount} módulos`
    );
  });

  return results;
}

// Função para integrar os módulos ao arquivo hideout.json
async function integrateModulesToHideout() {
  console.log("\n🔗 Integrando módulos ao arquivo hideout.json...\n");

  // Carregar arquivo hideout.json atual
  const hideoutPath = path.join(__dirname, "../public/data/hideout.json");
  const hideoutData = JSON.parse(fs.readFileSync(hideoutPath, "utf8"));

  // Carregar módulos da API
  const modulesPath = path.join(
    __dirname,
    "../public/data/station-modules.json"
  );
  if (!fs.existsSync(modulesPath)) {
    console.log(
      "❌ Arquivo de módulos não encontrado. Execute primeiro getAllStationModules()"
    );
    return;
  }

  const apiModules = JSON.parse(fs.readFileSync(modulesPath, "utf8"));

  // Atualizar cada estação com seus módulos
  let updatedStations = 0;

  hideoutData.stations.forEach((station) => {
    const stationName = station.locales.en;
    const apiModulesForStation = apiModules[stationName];

    if (apiModulesForStation && apiModulesForStation.length > 0) {
      console.log(
        `📋 Atualizando ${stationName} com ${apiModulesForStation.length} módulos`
      );

      // Mapear requisitos da API para o formato do nosso sistema
      const mapRequirements = (requirements) => {
        return requirements.map((req) => {
          if (req.type === "item") {
            return { type: "item", itemId: req.name, quantity: req.quantity };
          }
          if (req.type === "module") {
            return { type: "module", module: req.name, level: req.quantity };
          }
          if (req.type === "trader") {
            return { type: "trader", traderId: req.name, level: req.quantity };
          }
          if (req.type === "skill") {
            return { type: "skill", skill: req.name, level: req.quantity };
          }
          return req;
        });
      };

      // Atualizar níveis da estação
      station.levels = apiModulesForStation.map((module) => ({
        level: module.level,
        requirements: mapRequirements(module.require || []),
      }));

      updatedStations++;
    }
  });

  // Salvar arquivo atualizado
  const outputPath = path.join(
    __dirname,
    "../public/data/hideout-with-modules.json"
  );
  fs.writeFileSync(outputPath, JSON.stringify(hideoutData, null, 2));

  console.log(`\n✅ Integração concluída!`);
  console.log(`📁 Arquivo salvo em: ${outputPath}`);
  console.log(`🏗️  Estações atualizadas: ${updatedStations}`);
}

// Executar funções
if (require.main === module) {
  (async () => {
    try {
      // Primeiro buscar todos os módulos
      await getAllStationModules();

      // Depois integrar ao arquivo hideout.json
      await integrateModulesToHideout();

      console.log(
        "\n🎉 Processo completo! Todas as estações foram atualizadas com seus módulos."
      );
    } catch (error) {
      console.error("❌ Erro durante o processo:", error);
    }
  })();
}

module.exports = { getAllStationModules, integrateModulesToHideout };
