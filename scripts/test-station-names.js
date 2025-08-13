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

// Função para testar diferentes variações de nomes
async function testStationNames() {
  console.log("🧪 Testando diferentes variações de nomes de estações...\n");

  // Variações de nomes para testar
  const testVariations = [
    "Generator",
    "generator",
    "GENERATOR",
    "Air Filtering Unit",
    "air filtering unit",
    "AirFilteringUnit",
    "Bitcoin Farm",
    "bitcoin farm",
    "BitcoinFarm",
    "Booze Generator",
    "booze generator",
    "BoozeGenerator",
    "Heating",
    "heating",
    "HEATING",
    "Illumination",
    "illumination",
    "ILLUMINATION",
    "Lavatory",
    "lavatory",
    "LAVATORY",
    "Library",
    "library",
    "LIBRARY",
    "Medstation",
    "medstation",
    "MEDSTATION",
    "Nutrition Unit",
    "nutrition unit",
    "NutritionUnit",
    "Rest Space",
    "rest space",
    "RestSpace",
    "Scav Case",
    "scav case",
    "ScavCase",
    "Security",
    "security",
    "SECURITY",
    "Shooting Range",
    "shooting range",
    "ShootingRange",
    "Solar Power",
    "solar power",
    "SolarPower",
    "Stash",
    "stash",
    "STASH",
    "Vents",
    "vents",
    "VENTS",
    "Water Collector",
    "water collector",
    "WaterCollector",
    "Workbench",
    "workbench",
    "WORKBENCH",
    "Intelligence Center",
    "intelligence center",
    "IntelligenceCenter",
    "Hall of Fame",
    "hall of fame",
    "HallOfFame",
    "Defective Wall",
    "defective wall",
    "DefectiveWall",
    "Weapon Rack",
    "weapon rack",
    "WeaponRack",
    "Gear Rack",
    "gear rack",
    "GearRack",
    "Cultist Circle",
    "cultist circle",
    "CultistCircle",
    "Gym",
    "gym",
    "GYM",
  ];

  const results = {};
  let foundModules = 0;

  for (const testName of testVariations) {
    console.log(`🔍 Testando: "${testName}"`);

    const query = `
      query {
        hideoutModules(module: "${testName}") {
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

    if (modules.length > 0) {
      console.log(`  ✅ ENCONTRADO! ${modules.length} módulos`);
      results[testName] = modules;
      foundModules += modules.length;

      // Mostrar detalhes dos módulos
      modules.forEach((module) => {
        const reqCount = module.require?.length || 0;
        console.log(`    📋 Nível ${module.level}: ${reqCount} requisitos`);
      });
    } else {
      console.log(`  ❌ Sem módulos`);
    }

    // Aguardar um pouco para não sobrecarregar a API
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log(`\n📊 RESUMO DOS TESTES:`);
  console.log(`  🧪 Total de variações testadas: ${testVariations.length}`);
  console.log(
    `  ✅ Variações com módulos encontrados: ${Object.keys(results).length}`
  );
  console.log(`  📋 Total de módulos encontrados: ${foundModules}`);

  if (Object.keys(results).length > 0) {
    console.log("\n🎯 VARIAÇÕES QUE FUNCIONARAM:");
    Object.entries(results).forEach(([name, modules]) => {
      console.log(`  ✅ "${name}": ${modules.length} módulos`);
    });
  }

  // Salvar resultados
  const outputPath = path.join(__dirname, "../public/data/test-results.json");
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n💾 Resultados salvos em: ${outputPath}`);

  return results;
}

// Executar testes
if (require.main === module) {
  testStationNames().catch(console.error);
}

module.exports = { testStationNames };
