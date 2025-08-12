#!/usr/bin/env node

/**
 * Script para testar a API do Tarkov.dev
 * Especificamente para verificar os dados da Air Filtering Unit
 */

const API_URL = "https://api.tarkov.dev/graphql";

// Query para buscar dados da Air Filtering Unit
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

async function testTarkovApi() {
  try {
    console.log("🧪 Testando API do Tarkov.dev...\n");

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

    const stations = data.data.hideoutStations;

    // Procurar pela Air Filtering Unit
    const airFilteringUnit = stations.find(
      (station) =>
        station.name.toLowerCase().includes("air") ||
        station.name.toLowerCase().includes("filter")
    );

    if (airFilteringUnit) {
      console.log(`🏠 Estação encontrada: ${airFilteringUnit.name}\n`);

      airFilteringUnit.levels.forEach((level) => {
        console.log(`📊 Nível ${level.level}:`);

        if (level.itemRequirements.length > 0) {
          console.log("  📦 Requisitos de Itens:");
          level.itemRequirements.forEach((req) => {
            console.log(`    • ${req.item.name}: ${req.count}`);
          });
        }

        if (level.traderRequirements.length > 0) {
          console.log("  🏪 Requisitos de Traders:");
          level.traderRequirements.forEach((req) => {
            console.log(`    • ${req.trader.name}: Nível ${req.level}`);
          });
        }

        if (level.skillRequirements.length > 0) {
          console.log("  🎯 Requisitos de Skills:");
          level.skillRequirements.forEach((req) => {
            console.log(`    • ${req.name}: Nível ${req.level}`);
          });
        }

        console.log("");
      });
    } else {
      console.log("❌ Air Filtering Unit não encontrada");

      console.log("\n🔍 Estações disponíveis:");
      stations.forEach((station) => {
        console.log(`  • ${station.name}`);
      });
    }

    // Mostrar estatísticas gerais
    console.log(`📊 Total de estações: ${stations.length}`);

    const totalItems = stations.reduce((total, station) => {
      return (
        total +
        station.levels.reduce((levelTotal, level) => {
          return levelTotal + level.itemRequirements.length;
        }, 0)
      );
    }, 0);

    console.log(`📦 Total de requisitos de itens: ${totalItems}`);
  } catch (error) {
    console.error("❌ Erro ao testar API:", error.message);
  }
}

// Executar o teste
testTarkovApi();
