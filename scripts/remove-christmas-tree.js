const fs = require("fs");
const path = require("path");

// Caminho para o arquivo de dados
const hideoutPath = path.join(__dirname, "../public/data/hideout.json");

// Ler o arquivo atual
const hideoutData = JSON.parse(fs.readFileSync(hideoutPath, "utf8"));

console.log("Removendo Christmas Tree dos dados...");

// Remover a estação Christmas Tree
hideoutData.stations = hideoutData.stations.filter(
  (station) => station.locales.en !== "Christmas Tree"
);

// Remover referências como módulo requisito (estrutura antiga)
if (hideoutData.modules) {
  hideoutData.modules = hideoutData.modules.filter(
    (module) => module.module !== "Christmas Tree"
  );
}

// Salvar o arquivo atualizado
const outputPath = path.join(
  __dirname,
  "../public/data/hideout-no-christmas.json"
);
fs.writeFileSync(outputPath, JSON.stringify(hideoutData, null, 2));

console.log(`✅ Christmas Tree removida com sucesso!`);
console.log(`📁 Arquivo salvo em: ${outputPath}`);
console.log(`📊 Estações restantes: ${hideoutData.stations.length}`);
console.log(
  `📊 Módulos restantes: ${
    hideoutData.modules ? hideoutData.modules.length : 0
  }`
);

// Mostrar as estações restantes
console.log("\n🏗️ Estações disponíveis:");
hideoutData.stations.forEach((station) => {
  console.log(`  - ${station.locales.en}`);
});
