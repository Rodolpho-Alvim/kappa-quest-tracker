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

// Função para buscar todas as estações com seus níveis
async function fetchStationsWithLevels() {
  console.log("🔍 Buscando estações com níveis da API...\n");

  const query = `
    query {
      hideoutStations {
        id
        name
        normalizedName
        imageLink
        levels {
          id
          level
          constructionTime
          description
          itemRequirements {
            id
            item {
              id
              name
              normalizedName
            }
            count
          }
          stationLevelRequirements {
            id
            station {
              id
              name
            }
            level
          }
          skillRequirements {
            id
            skill {
              id
              name
            }
            level
          }
          traderRequirements {
            id
            trader {
              id
              name
            }
            level
          }
        }
      }
    }
  `;

  const result = await fetchFromAPI(query);

  if (result?.data?.hideoutStations) {
    const stations = result.data.hideoutStations;
    console.log(`✅ Encontradas ${stations.length} estações`);

    let totalLevels = 0;
    let totalItemRequirements = 0;

    stations.forEach((station) => {
      const levelCount = station.levels?.length || 0;
      totalLevels += levelCount;

      console.log(`\n🏗️  ${station.name}:`);
      console.log(`  📊 Níveis: ${levelCount}`);

      if (station.levels) {
        station.levels.forEach((level) => {
          const itemReqCount = level.itemRequirements?.length || 0;
          const stationReqCount = level.stationLevelRequirements?.length || 0;
          const skillReqCount = level.skillRequirements?.length || 0;
          const traderReqCount = level.traderRequirements?.length || 0;

          totalItemRequirements += itemReqCount;

          console.log(`    📋 Nível ${level.level}:`);
          console.log(`      🎯 Itens: ${itemReqCount}`);
          console.log(`      🏗️  Estações: ${stationReqCount}`);
          console.log(`      💪 Skills: ${skillReqCount}`);
          console.log(`      🛒 Traders: ${traderReqCount}`);

          // Mostrar alguns requisitos de exemplo
          if (level.itemRequirements && level.itemRequirements.length > 0) {
            console.log(`      📦 Exemplos de itens:`);
            level.itemRequirements.slice(0, 3).forEach((req) => {
              console.log(
                `        - ${req.item?.name || "Item desconhecido"} (${
                  req.count
                }x)`
              );
            });
            if (level.itemRequirements.length > 3) {
              console.log(
                `        ... e mais ${level.itemRequirements.length - 3} itens`
              );
            }
          }
        });
      }
    });

    console.log(`\n📊 RESUMO FINAL:`);
    console.log(`  🏗️  Total de estações: ${stations.length}`);
    console.log(`  📋 Total de níveis: ${totalLevels}`);
    console.log(`  🎯 Total de requisitos de itens: ${totalItemRequirements}`);

    // Salvar resultados
    const outputPath = path.join(
      __dirname,
      "../public/data/stations-with-levels.json"
    );
    fs.writeFileSync(outputPath, JSON.stringify(result.data, null, 2));

    console.log(`\n💾 Dados salvos em: ${outputPath}`);

    return result.data;
  } else {
    console.log("❌ Falha ao buscar dados da API");
    if (result?.errors) {
      console.log("⚠️  Erros encontrados:");
      result.errors.forEach((error) => {
        console.log(`  - ${error.message}`);
      });
    }
    return null;
  }
}

// Função para integrar os dados ao arquivo hideout.json
async function integrateToHideout() {
  console.log("\n🔗 Integrando dados ao arquivo hideout.json...\n");

  // Carregar dados da API
  const apiDataPath = path.join(
    __dirname,
    "../public/data/stations-with-levels.json"
  );
  if (!fs.existsSync(apiDataPath)) {
    console.log(
      "❌ Arquivo de dados da API não encontrado. Execute primeiro fetchStationsWithLevels()"
    );
    return;
  }

  const apiData = JSON.parse(fs.readFileSync(apiDataPath, "utf8"));

  // Carregar arquivo hideout.json atual
  const hideoutPath = path.join(__dirname, "../public/data/hideout.json");
  const hideoutData = JSON.parse(fs.readFileSync(hideoutPath, "utf8"));

  let updatedStations = 0;

  // Atualizar cada estação com os dados da API
  hideoutData.stations.forEach((station) => {
    const apiStation = apiData.hideoutStations.find(
      (api) => api.name === station.locales.en
    );

    if (apiStation && apiStation.levels) {
      console.log(
        `📋 Atualizando ${station.locales.en} com ${apiStation.levels.length} níveis`
      );

      // Mapear níveis da API para o formato do nosso sistema
      station.levels = apiStation.levels.map((level) => {
        const mappedLevel = {
          level: level.level,
          requirements: [],
        };

        // Mapear requisitos de itens
        if (level.itemRequirements) {
          level.itemRequirements.forEach((req) => {
            mappedLevel.requirements.push({
              type: "item",
              itemId: req.item?.id || req.item?.name,
              quantity: req.count,
            });
          });
        }

        // Mapear requisitos de estação
        if (level.stationLevelRequirements) {
          level.stationLevelRequirements.forEach((req) => {
            mappedLevel.requirements.push({
              type: "module",
              module: req.station?.name,
              level: req.level,
            });
          });
        }

        // Mapear requisitos de skill
        if (level.skillRequirements) {
          level.skillRequirements.forEach((req) => {
            mappedLevel.requirements.push({
              type: "skill",
              skill: req.skill?.name,
              level: req.level,
            });
          });
        }

        // Mapear requisitos de trader
        if (level.traderRequirements) {
          level.traderRequirements.forEach((req) => {
            mappedLevel.requirements.push({
              type: "trader",
              traderId: req.trader?.name,
              level: req.level,
            });
          });
        }

        return mappedLevel;
      });

      updatedStations++;
    }
  });

  // Salvar arquivo atualizado
  const outputPath = path.join(
    __dirname,
    "../public/data/hideout-complete.json"
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
      // Primeiro buscar dados da API
      await fetchStationsWithLevels();

      // Depois integrar ao arquivo hideout.json
      await integrateToHideout();

      console.log(
        "\n🎉 Processo completo! Todas as estações foram atualizadas com seus níveis e requisitos."
      );
    } catch (error) {
      console.error("❌ Erro durante o processo:", error);
    }
  })();
}

module.exports = { fetchStationsWithLevels, integrateToHideout };
