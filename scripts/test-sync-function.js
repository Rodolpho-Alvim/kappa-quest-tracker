#!/usr/bin/env node

/**
 * Script para testar a função de sincronização
 * Simula o processo de sincronização da Air Filtering Unit
 */

// Dados locais simulados (quantidades antigas)
const localData = [
  {
    id: "air-filtering-unit",
    name: "Air Filtering Unit",
    levels: [
      {
        level: 1,
        requirements: [
          {
            type: "item",
            itemId: "dollars",
            itemName: "Dollars",
            quantity: 25000,
          },
          {
            type: "item",
            itemId: "military-power-filter",
            itemName: "Military power filter",
            quantity: 5,
          },
          {
            type: "item",
            itemId: "gas-mask-air-filter",
            itemName: "Gas mask air filter",
            quantity: 5,
          },
          {
            type: "item",
            itemId: "military-corrugated-tube",
            itemName: "Military corrugated tube",
            quantity: 3,
          },
        ],
      },
    ],
  },
];

// Dados da API (quantidades atualizadas)
const apiData = [
  {
    id: "air-filtering-unit",
    name: "Air Filtering Unit",
    levels: [
      {
        level: 1,
        itemRequirements: [
          {
            item: {
              id: "dollars",
              name: "Dollars",
            },
            count: 50000,
          },
          {
            item: {
              id: "military-power-filter",
              name: "Military power filter",
            },
            count: 6,
          },
          {
            item: {
              id: "gas-mask-air-filter",
              name: "Gas mask air filter",
            },
            count: 10,
          },
          {
            item: {
              id: "military-corrugated-tube",
              name: "Military corrugated tube",
            },
            count: 6,
          },
        ],
      },
    ],
  },
];

// Função simulada de comparação
function compareHideoutData(localData, apiData) {
  const changedQuantities = [];

  apiData.forEach((apiStation) => {
    const localStation = localData.find((s) => s.id === apiStation.id);

    if (localStation) {
      apiStation.levels.forEach((apiLevel) => {
        const localLevel = localStation.levels.find(
          (l) => l.level === apiLevel.level
        );

        if (localLevel) {
          apiLevel.itemRequirements.forEach((apiReq) => {
            const localReq = localLevel.requirements.find(
              (r) => r.type === "item" && r.itemId === apiReq.item.id
            );

            if (localReq && localReq.quantity !== apiReq.count) {
              changedQuantities.push({
                station: apiStation.name,
                level: apiLevel.level,
                itemId: apiReq.item.id,
                oldQuantity: localReq.quantity,
                newQuantity: apiReq.count,
                itemName: apiReq.item.name,
              });
            }
          });
        }
      });
    }
  });

  return { changedQuantities };
}

// Função simulada de aplicação de mudanças
function applyApiChangesToLocalData(localData, apiData) {
  if (!localData || !Array.isArray(localData)) {
    return [];
  }

  return localData.map((localStation) => {
    const apiStation = apiData.find((s) => s.id === localStation.id);

    if (!apiStation) {
      return localStation;
    }

    return {
      ...localStation,
      levels: localStation.levels.map((localLevel) => {
        const apiLevel = apiStation.levels.find(
          (l) => l.level === localLevel.level
        );

        if (!apiLevel) {
          return localLevel;
        }

        return {
          ...localLevel,
          requirements: localLevel.requirements.map((localReq) => {
            if (localReq.type === "item") {
              const apiReq = apiLevel.itemRequirements.find(
                (r) => r.item.id === localReq.itemId
              );

              if (apiReq) {
                console.log(
                  `🔄 Atualizando ${localReq.itemName}: ${localReq.quantity} → ${apiReq.count}`
                );
                return {
                  ...localReq,
                  quantity: apiReq.count,
                  itemName: apiReq.item.name,
                };
              }
            }

            return localReq;
          }),
        };
      }),
    };
  });
}

// Testar a sincronização
console.log("🧪 Testando função de sincronização...\n");

console.log("📊 Dados Locais (ANTES):");
localData[0].levels[0].requirements.forEach((req) => {
  if (req.type === "item") {
    console.log(`  • ${req.itemName}: ${req.quantity}`);
  }
});

console.log("\n📡 Dados da API:");
apiData[0].levels[0].itemRequirements.forEach((req) => {
  console.log(`  • ${req.item.name}: ${req.count}`);
});

console.log("\n🔄 Comparando dados...");
const changes = compareHideoutData(localData, apiData);
console.log(`  • Quantidades alteradas: ${changes.changedQuantities.length}`);

changes.changedQuantities.forEach((change) => {
  console.log(
    `    - ${change.station} Nível ${change.level}: ${change.itemName} (${change.oldQuantity} → ${change.newQuantity})`
  );
});

console.log("\n⚡ Aplicando mudanças...");
const updatedData = applyApiChangesToLocalData(localData, apiData);

console.log("\n✅ Dados Locais (DEPOIS):");
updatedData[0].levels[0].requirements.forEach((req) => {
  if (req.type === "item") {
    console.log(`  • ${req.itemName}: ${req.quantity}`);
  }
});

console.log("\n🎯 Verificação:");
const finalChanges = compareHideoutData(updatedData, apiData);
if (finalChanges.changedQuantities.length === 0) {
  console.log(
    "✅ Sincronização concluída com sucesso! Todas as quantidades estão atualizadas."
  );
} else {
  console.log(
    `❌ Ainda há ${finalChanges.changedQuantities.length} diferenças não resolvidas.`
  );
}
