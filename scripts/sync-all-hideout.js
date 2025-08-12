#!/usr/bin/env node

/**
 * Script de Sincronização em Massa do Hideout
 * Atualiza TODAS as estações com dados da API do Tarkov.dev
 */

const fs = require("fs");
const path = require("path");

const API_URL = "https://api.tarkov.dev/graphql";
const HIDEOUT_FILE = path.join(__dirname, "../public/data/hideout.json");
const BACKUP_FILE = path.join(__dirname, "../public/data/hideout-backup.json");

// Query para buscar TODAS as estações do hideout
const query = `
  query {
    hideoutStations {
      id
      name
      levels {
        level
        itemRequirements {
          item {
            id
            name
            shortName
          }
          count
        }
        traderRequirements {
          trader {
            id
            name
          }
          level
        }
        skillRequirements {
          name
          level
        }
      }
    }
  }
`;

async function fetchApiData() {
  try {
    console.log("📡 Buscando dados da API do Tarkov.dev...");

    const response = await fetch(API_URL, {
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

    if (data.errors) {
      throw new Error(data.errors[0].message);
    }

    return data.data.hideoutStations;
  } catch (error) {
    console.error("❌ Erro ao buscar dados da API:", error.message);
    throw error;
  }
}

function loadLocalData() {
  try {
    console.log("📂 Carregando dados locais...");
    const data = fs.readFileSync(HIDEOUT_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Erro ao carregar dados locais:", error.message);
    throw error;
  }
}

function createBackup(localData) {
  try {
    console.log("💾 Criando backup dos dados atuais...");
    fs.writeFileSync(BACKUP_FILE, JSON.stringify(localData, null, 2));
    console.log(`✅ Backup criado: ${BACKUP_FILE}`);
  } catch (error) {
    console.error("❌ Erro ao criar backup:", error.message);
    throw error;
  }
}

function findStationByName(apiData, localName) {
  // Buscar estação por nome com diferentes estratégias
  let station = apiData.find(
    (station) => station.name.toLowerCase() === localName.toLowerCase()
  );

  if (station) return station;

  // Tentar com nomes similares
  const similarNames = {
    "Bitcoin farm": "Bitcoin Farm",
    "Booze generator": "Booze Generator",
    "Intelligence center": "Intelligence Center",
    "Nutrition unit": "Nutrition Unit",
    "Rest space": "Rest Space",
    "Scav case": "Scav Case",
    "Shooting range": "Shooting Range",
    "Solar power": "Solar Power",
    "Water collector": "Water Collector",
  };

  const mappedName = similarNames[localName];
  if (mappedName) {
    station = apiData.find((s) => s.name === mappedName);
  }

  return station;
}

function syncHideoutData(localData, apiData, itemsData) {
  console.log("🔄 Iniciando sincronização em massa...\n");

  const changes = {
    stationsUpdated: 0,
    itemsUpdated: 0,
    totalChanges: 0,
    details: [],
  };

  // Processar cada estação local
  localData.modules.forEach((localModule, moduleIndex) => {
    // Buscar estação correspondente na API
    const apiStation = findStationByName(apiData, localModule.module);

    if (!apiStation) {
      console.log(`⚠️ Estação não encontrada na API: ${localModule.module}`);
      return;
    }

    // Buscar nível correspondente
    const apiLevel = apiStation.levels.find(
      (level) => level.level === localModule.level
    );

    if (!apiLevel) {
      console.log(
        `⚠️ Nível ${localModule.level} não encontrado na API para ${localModule.module}`
      );
      return;
    }

    let moduleChanged = false;

    // Processar requisitos de itens
    localModule.require.forEach((localReq, reqIndex) => {
      if (localReq.type === "item") {
        // Buscar item na API por nome
        const apiReq = apiLevel.itemRequirements.find((apiReq) => {
          // Primeiro tentar encontrar por ID (se o nome local for um ID)
          if (localReq.name.length === 24) {
            // IDs do MongoDB têm 24 caracteres
            return apiReq.item.id === localReq.name;
          }

          // Se não for ID, tentar por nome
          const localItem = itemsData[localReq.name];
          if (localItem) {
            return (
              apiReq.item.name.toLowerCase() === localItem.name.toLowerCase() ||
              apiReq.item.name.toLowerCase() ===
                localItem.shortName?.toLowerCase()
            );
          }

          return false;
        });

        if (apiReq && apiReq.count !== localReq.quantity) {
          const oldQuantity = localReq.quantity;
          const newQuantity = apiReq.count;

          // Atualizar quantidade
          localData.modules[moduleIndex].require[reqIndex].quantity =
            newQuantity;

          changes.itemsUpdated++;
          moduleChanged = true;

          console.log(
            `🔄 ${localModule.module} Nível ${localModule.level}: ${apiReq.item.name} (${oldQuantity} → ${newQuantity})`
          );

          changes.details.push({
            station: localModule.module,
            level: localModule.level,
            item: apiReq.item.name,
            oldQuantity,
            newQuantity,
          });
        }
      }
    });

    if (moduleChanged) {
      changes.stationsUpdated++;
    }
  });

  changes.totalChanges = changes.itemsUpdated;
  return changes;
}

function saveUpdatedData(data) {
  try {
    console.log("💾 Salvando dados atualizados...");
    fs.writeFileSync(HIDEOUT_FILE, JSON.stringify(data, null, 2));
    console.log("✅ Dados salvos com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao salvar dados:", error.message);
    throw error;
  }
}

function generateReport(changes) {
  console.log("\n📊 RELATÓRIO DE SINCRONIZAÇÃO");
  console.log("=".repeat(50));
  console.log(`🏠 Estações atualizadas: ${changes.stationsUpdated}`);
  console.log(`📦 Itens atualizados: ${changes.itemsUpdated}`);
  console.log(`🔄 Total de mudanças: ${changes.totalChanges}`);

  if (changes.details.length > 0) {
    console.log("\n📋 Detalhes das mudanças:");
    changes.details.forEach((change, index) => {
      console.log(
        `${index + 1}. ${change.station} Nível ${change.level}: ${
          change.item
        } (${change.oldQuantity} → ${change.newQuantity})`
      );
    });
  }

  console.log("\n🎉 Sincronização em massa concluída!");
}

async function main() {
  try {
    console.log("🚀 INICIANDO SINCRONIZAÇÃO EM MASSA DO HIDEOUT");
    console.log("=".repeat(60) + "\n");

    // 1. Buscar dados da API
    const apiData = await fetchApiData();
    console.log(`✅ ${apiData.length} estações encontradas na API\n`);

    // 2. Carregar dados locais
    const localData = loadLocalData();
    console.log(
      `✅ ${localData.modules.length} módulos carregados localmente\n`
    );

    // 3. Carregar dados de itens
    const itemsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../public/data/items.json"), "utf8")
    );
    console.log(`✅ ${Object.keys(itemsData).length} itens carregados\n`);

    // 4. Criar backup
    createBackup(localData);

    // 5. Sincronizar dados
    const changes = syncHideoutData(localData, apiData, itemsData);

    // 6. Salvar dados atualizados
    saveUpdatedData(localData);

    // 7. Gerar relatório
    generateReport(changes);
  } catch (error) {
    console.error("\n💥 ERRO CRÍTICO:", error.message);
    console.log("\n🔄 Para restaurar o backup, execute:");
    console.log(`cp ${BACKUP_FILE} ${HIDEOUT_FILE}`);
    process.exit(1);
  }
}

// Executar sincronização
main();
