const fs = require("fs");
const path = require("path");

const filePath = path.join(__dirname, "public", "data", "items.json");
const items = JSON.parse(fs.readFileSync(filePath, "utf8"));

Object.entries(items).forEach(([key, item]) => {
  item.icon = `https://assets.tarkov.dev/${key}-icon.webp`;
});

fs.writeFileSync(filePath, JSON.stringify(items, null, 2), "utf8");
console.log('Campo "icon" atualizado para todos os itens!');
