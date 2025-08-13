const fs = require("fs");
const path = require("path");

// Função para corrigir nomes e adicionar estações faltantes
function fixStationNames() {
  console.log("🔧 Corrigindo nomes das estações...\n");

  // Carregar dados atuais
  const currentDataPath = path.join(
    __dirname,
    "../public/data/hideout-updated.json"
  );
  const currentData = JSON.parse(fs.readFileSync(currentDataPath, "utf8"));

  console.log("📋 Estações antes da correção:", currentData.stations.length);

  // Correções de nomes
  const nameCorrections = {
    "Shooting range": "Shooting Range",
  };

  // Aplicar correções de nomes
  let correctionsApplied = 0;
  currentData.stations.forEach((station) => {
    const currentName = station.locales.en;
    if (nameCorrections[currentName]) {
      const oldName = currentName;
      station.locales.en = nameCorrections[currentName];
      console.log(`  ✏️  "${oldName}" → "${station.locales.en}"`);
      correctionsApplied++;
    }
  });

  // Adicionar estações faltantes (vazias, mas importantes para completude)
  const missingStations = [
    {
      name: "Hall of Fame",
      function: "Displays achievements and provides passive bonuses",
      imgSource: "/img/Hall_of_Fame_Portrait.png",
    },
    {
      name: "Defective Wall",
      function: "Special wall module with unique properties",
      imgSource: "/img/defective-wall.png",
    },
    {
      name: "Weapon Rack",
      function: "Stores and displays weapons",
      imgSource: "/img/Weapon_Rack_Portrait.png",
    },
    {
      name: "Gear Rack",
      function: "Stores and displays gear and equipment",
      imgSource: "/img/Gear_Rack_Portrait.png",
    },
    {
      name: "Cultist Circle",
      function: "Special module for cultist-related activities",
      imgSource: "/img/cultist-circle.png",
    },
    {
      name: "Gym",
      function: "Provides physical training bonuses",
      imgSource: "/img/Gym_Portrait.png",
    },
  ];

  console.log("\n➕ Adicionando estações faltantes...");

  missingStations.forEach((stationData) => {
    // Verificar se já existe
    const exists = currentData.stations.some(
      (s) => s.locales.en === stationData.name
    );

    if (!exists) {
      const newStation = {
        id: Date.now() + Math.random(), // ID temporário
        locales: {
          en: stationData.name,
        },
        function: stationData.function,
        imgSource: stationData.imgSource,
      };

      currentData.stations.push(newStation);
      console.log(`  ➕ Adicionada: ${stationData.name}`);
    } else {
      console.log(`  ✅ Já existe: ${stationData.name}`);
    }
  });

  // Salvar dados corrigidos
  const outputPath = path.join(__dirname, "../public/data/hideout-final.json");
  fs.writeFileSync(outputPath, JSON.stringify(currentData, null, 2));

  console.log("\n✅ Correções concluídas!");
  console.log(`📁 Dados salvos em: ${outputPath}`);
  console.log(`📊 Total de estações: ${currentData.stations.length}`);

  // Mostrar resumo das mudanças
  console.log("\n📋 Resumo das mudanças:");
  console.log(`  ✏️  Nomes corrigidos: ${correctionsApplied}`);
  console.log(`  ➕ Estações adicionadas: ${missingStations.length}`);

  // Mostrar todas as estações finais
  console.log("\n📋 Lista final de estações:");
  currentData.stations
    .sort((a, b) => a.locales.en.localeCompare(b.locales.en))
    .forEach((station, index) => {
      console.log(`  ${index + 1}. ${station.locales.en}`);
    });
}

// Executar correções
if (require.main === module) {
  fixStationNames();
}

module.exports = { fixStationNames };
