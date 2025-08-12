#!/usr/bin/env node

/**
 * Script para debugar nomes das estações
 * Identifica diferenças entre dados locais e API
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

async function main() {
  try {
    console.log("🔍 DEBUG: Comparando nomes das estações\n");

    // Buscar dados da API
    const apiData = await fetchApiData();
    console.log("📡 ESTAÇÕES DA API:");
    apiData.forEach((station) => {
      console.log(`  • ${station.name}`);
    });

    console.log("\n📂 ESTAÇÕES LOCAIS:");
    const localData = loadLocalData();

    // Extrair nomes únicos dos módulos locais
    const localStationNames = [
      ...new Set(localData.modules.map((m) => m.module)),
    ];
    localStationNames.forEach((name) => {
      console.log(`  • ${name}`);
    });

    console.log("\n🔄 COMPARAÇÃO:");
    localStationNames.forEach((localName) => {
      const found = apiData.find(
        (api) => api.name.toLowerCase() === localName.toLowerCase()
      );

      if (found) {
        console.log(`✅ ${localName} ←→ ${found.name}`);
      } else {
        console.log(`❌ ${localName} (não encontrado na API)`);
      }
    });

    console.log("\n📊 ESTATÍSTICAS:");
    console.log(`  • API: ${apiData.length} estações`);
    console.log(`  • Local: ${localStationNames.length} estações únicas`);

    const matched = localStationNames.filter((localName) =>
      apiData.find((api) => api.name.toLowerCase() === localName.toLowerCase())
    );
    console.log(`  • Correspondentes: ${matched.length} estações`);
  } catch (error) {
    console.error("💥 Erro:", error.message);
  }
}

main();
