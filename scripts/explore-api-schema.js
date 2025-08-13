const fs = require("fs");

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

// Função para explorar o schema da API
async function exploreAPISchema() {
  console.log("🔍 Explorando o schema da API GraphQL...\n");

  // Teste 1: Introspection query para descobrir tipos disponíveis
  console.log("📡 Teste 1: Introspection query para tipos");
  const introspectionQuery = `
    query IntrospectionQuery {
      __schema {
        types {
          name
          description
          fields {
            name
            description
            type {
              name
            }
          }
        }
      }
    }
  `;

  const introspectionResult = await fetchFromAPI(introspectionQuery);
  if (introspectionResult?.data?.__schema) {
    console.log(
      `  ✅ Schema encontrado com ${introspectionResult.data.__schema.types.length} tipos`
    );

    // Filtrar tipos relacionados ao hideout
    const hideoutTypes = introspectionResult.data.__schema.types.filter(
      (type) =>
        type.name.toLowerCase().includes("hideout") ||
        type.name.toLowerCase().includes("module") ||
        type.name.toLowerCase().includes("station")
    );

    console.log(`  🏗️  Tipos relacionados ao hideout: ${hideoutTypes.length}`);
    hideoutTypes.forEach((type) => {
      console.log(`    - ${type.name}: ${type.description || "Sem descrição"}`);
      if (type.fields) {
        console.log(
          `      Campos: ${type.fields.map((f) => f.name).join(", ")}`
        );
      }
    });
  } else {
    console.log("  ❌ Falha ao buscar schema");
  }

  console.log("");

  // Teste 2: Tentar diferentes variações de consultas
  console.log("📡 Teste 2: Tentando diferentes consultas");

  const testQueries = [
    {
      name: "hideoutModules (sem filtro)",
      query: `
        query {
          hideoutModules {
            id
            module
            level
          }
        }
      `,
    },
    {
      name: "hideoutModules (com filtro)",
      query: `
        query {
          hideoutModules(module: "Generator") {
            id
            module
            level
          }
        }
      `,
    },
    {
      name: "hideoutModule (singular)",
      query: `
        query {
          hideoutModule(module: "Generator") {
            id
            module
            level
          }
        }
      `,
    },
    {
      name: "modules (sem prefixo)",
      query: `
        query {
          modules {
            id
            module
            level
          }
        }
      `,
    },
    {
      name: "hideoutStations com módulos",
      query: `
        query {
          hideoutStations {
            id
            name
            modules {
              id
              level
            }
          }
        }
      `,
    },
  ];

  for (const test of testQueries) {
    console.log(`  🔍 Testando: ${test.name}`);

    const result = await fetchFromAPI(test.query);
    if (result?.data) {
      const dataKeys = Object.keys(result.data);
      if (dataKeys.length > 0) {
        console.log(`    ✅ Sucesso! Dados retornados: ${dataKeys.join(", ")}`);
        const firstKey = dataKeys[0];
        const dataLength = Array.isArray(result.data[firstKey])
          ? result.data[firstKey].length
          : "N/A";
        console.log(`    📊 ${firstKey}: ${dataLength} itens`);
      } else {
        console.log(`    ⚠️  Sucesso mas sem dados`);
      }
    } else if (result?.errors) {
      console.log(
        `    ❌ Erro: ${result.errors[0]?.message || "Erro desconhecido"}`
      );
    } else {
      console.log(`    ❌ Falha na consulta`);
    }

    // Aguardar um pouco entre consultas
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  console.log("");

  // Teste 3: Verificar se há erros específicos
  console.log("📡 Teste 3: Verificando erros específicos");

  const errorQuery = `
    query {
      hideoutModules(module: "Generator") {
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

  const errorResult = await fetchFromAPI(errorQuery);
  if (errorResult?.errors) {
    console.log("  ⚠️  Erros encontrados:");
    errorResult.errors.forEach((error) => {
      console.log(`    - ${error.message}`);
      if (error.locations) {
        error.locations.forEach((loc) => {
          console.log(`      Linha: ${loc.line}, Coluna: ${loc.column}`);
        });
      }
    });
  } else {
    console.log("  ✅ Nenhum erro específico encontrado");
  }

  // Salvar resultados para análise
  const results = {
    schema: introspectionResult?.data?.__schema || null,
    testResults: testQueries.map((test) => ({
      name: test.name,
      success: false,
      data: null,
      errors: null,
    })),
    errorDetails: errorResult?.errors || [],
  };

  const outputPath = "./public/data/api-schema-exploration.json";
  fs.writeFileSync(outputPath, JSON.stringify(results, null, 2));

  console.log(`\n💾 Resultados salvos em: ${outputPath}`);

  return results;
}

// Executar exploração
if (require.main === module) {
  exploreAPISchema().catch(console.error);
}

module.exports = { exploreAPISchema };
