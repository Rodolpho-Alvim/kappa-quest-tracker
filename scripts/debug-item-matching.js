#!/usr/bin/env node

/**
 * Script para debugar matching de itens
 * Identifica problemas na comparação entre dados locais e API
 */

const fs = require("fs");
const path = require("path");

const API_URL = "https://api.tarkov.dev/graphql";
const HIDEOUT_FILE = path.join(__dirname, "../public/data/hideout.json");

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
      }
    }
  }
`;

async function fetchApiData() {
  try {
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
    const data = fs.readFileSync(HIDEOUT_FILE, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("❌ Erro ao carregar dados locais:", error.message);
    throw error;
  }
}

function findItemByName(items, itemName) {
  // Buscar item por nome (case-insensitive)
  const item = Object.values(items).find(
    (item) =>
      item.name.toLowerCase() === itemName.toLowerCase() ||
      item.shortName?.toLowerCase() === itemName.toLowerCase()
  );
  return item;
}

async function main() {
  try {
    console.log("🔍 DEBUG: Matching de itens\n");

    // Buscar dados da API
    const apiData = await fetchApiData();
    const localData = loadLocalData();
    const itemsData = JSON.parse(
      fs.readFileSync(path.join(__dirname, "../public/data/items.json"), "utf8")
    );

    // Focar na Air Filtering Unit para debug
    const airFilteringUnit = localData.modules.find(
      (m) => m.module === "Air Filtering Unit"
    );
    const apiAirFiltering = apiData.find(
      (s) => s.name === "Air Filtering Unit"
    );

    if (!airFilteringUnit || !apiAirFiltering) {
      console.log("❌ Air Filtering Unit não encontrada");
      return;
    }

    console.log("🏠 AIR FILTERING UNIT - NÍVEL 1");
    console.log("=".repeat(40));

    // Mostrar requisitos locais
    console.log("\n📂 REQUISITOS LOCAIS:");
    airFilteringUnit.require.forEach((req, index) => {
      if (req.type === "item") {
        const item = findItemByName(itemsData, req.name);
        console.log(
          `  ${index + 1}. ${item ? item.name : req.name}: ${req.quantity}`
        );
      }
    });

    // Mostrar requisitos da API
    console.log("\n📡 REQUISITOS DA API:");
    const apiLevel = apiAirFiltering.levels.find((l) => l.level === 1);
    if (apiLevel) {
      apiLevel.itemRequirements.forEach((req, index) => {
        console.log(`  ${index + 1}. ${req.item.name}: ${req.count}`);
      });
    }

    // Tentar fazer o matching
    console.log("\n🔄 TENTANDO MATCHING:");
    airFilteringUnit.require.forEach((localReq, reqIndex) => {
      if (localReq.type === "item") {
        const localItem = findItemByName(itemsData, localReq.name);

        if (!localItem) {
          console.log(`❌ Item local não encontrado: ${localReq.name}`);
          return;
        }

        console.log(
          `\n🔍 Procurando por: ${localItem.name} (${localItem.shortName})`
        );

        const apiReq = apiLevel.itemRequirements.find((apiReq) => {
          const matchByName =
            apiReq.item.name.toLowerCase() === localItem.name.toLowerCase();
          const matchByShortName =
            apiReq.item.name.toLowerCase() ===
            localItem.shortName?.toLowerCase();

          console.log(
            `  • API: ${apiReq.item.name} | Match por nome: ${matchByName} | Match por shortName: ${matchByShortName}`
          );

          return matchByName || matchByShortName;
        });

        if (apiReq) {
          console.log(
            `✅ MATCH ENCONTRADO: ${localItem.name} ←→ ${apiReq.item.name}`
          );
          console.log(
            `   Quantidade local: ${localReq.quantity} | Quantidade API: ${apiReq.count}`
          );

          if (localReq.quantity !== apiReq.count) {
            console.log(
              `   🔄 NECESSITA ATUALIZAÇÃO: ${localReq.quantity} → ${apiReq.count}`
            );
          } else {
            console.log(`   ✅ Quantidades iguais`);
          }
        } else {
          console.log(`❌ NENHUM MATCH ENCONTRADO para ${localItem.name}`);
        }
      }
    });
  } catch (error) {
    console.error("💥 Erro:", error.message);
  }
}

main();
