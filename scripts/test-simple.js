#!/usr/bin/env node

console.log("🧪 Teste simples de sincronização...\n");

// Dados locais (quantidades antigas)
const localData = {
  dollars: 25000,
  filter: 5,
  gasFilter: 5,
  tube: 3,
};

// Dados da API (quantidades atualizadas)
const apiData = {
  dollars: 50000,
  filter: 6,
  gasFilter: 10,
  tube: 6,
};

console.log("📊 Dados Locais (ANTES):");
console.log(`  • Dollars: ${localData.dollars}`);
console.log(`  • Military power filter: ${localData.filter}`);
console.log(`  • Gas mask air filter: ${localData.gasFilter}`);
console.log(`  • Military corrugated tube: ${localData.tube}`);

console.log("\n📡 Dados da API:");
console.log(`  • Dollars: ${apiData.dollars}`);
console.log(`  • Military power filter: ${apiData.filter}`);
console.log(`  • Gas mask air filter: ${apiData.gasFilter}`);
console.log(`  • Military corrugated tube: ${apiData.tube}`);

console.log("\n🔄 Comparando dados...");
const changes = [];

if (localData.dollars !== apiData.dollars) {
  changes.push(`Dollars: ${localData.dollars} → ${apiData.dollars}`);
}
if (localData.filter !== apiData.filter) {
  changes.push(
    `Military power filter: ${localData.filter} → ${apiData.filter}`
  );
}
if (localData.gasFilter !== apiData.gasFilter) {
  changes.push(
    `Gas mask air filter: ${localData.gasFilter} → ${apiData.gasFilter}`
  );
}
if (localData.tube !== apiData.tube) {
  changes.push(`Military corrugated tube: ${localData.tube} → ${apiData.tube}`);
}

console.log(`  • Quantidades alteradas: ${changes.length}`);
changes.forEach((change) => {
  console.log(`    - ${change}`);
});

console.log("\n⚡ Aplicando mudanças...");
const updatedData = {
  dollars: apiData.dollars,
  filter: apiData.filter,
  gasFilter: apiData.gasFilter,
  tube: apiData.tube,
};

console.log("\n✅ Dados Locais (DEPOIS):");
console.log(`  • Dollars: ${updatedData.dollars}`);
console.log(`  • Military power filter: ${updatedData.filter}`);
console.log(`  • Gas mask air filter: ${updatedData.gasFilter}`);
console.log(`  • Military corrugated tube: ${updatedData.tube}`);

console.log("\n🎯 Verificação:");
const finalChanges = [];
if (updatedData.dollars !== apiData.dollars) finalChanges.push("Dollars");
if (updatedData.filter !== apiData.filter) finalChanges.push("Filter");
if (updatedData.gasFilter !== apiData.gasFilter)
  finalChanges.push("Gas Filter");
if (updatedData.tube !== apiData.tube) finalChanges.push("Tube");

if (finalChanges.length === 0) {
  console.log(
    "✅ Sincronização concluída com sucesso! Todas as quantidades estão atualizadas."
  );
} else {
  console.log(`❌ Ainda há diferenças: ${finalChanges.join(", ")}`);
}

console.log("\n🎉 Teste concluído!");
