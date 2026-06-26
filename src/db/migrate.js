const fs = require("fs");
const path = require("path");
const db = require("./index");

async function migrate() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf8");

  await db.query(schema);
  await db.pool.end();

  console.log("Database migration completed.");
}

migrate().catch(async (error) => {
  console.error("Database migration failed.");
  console.error(error);
  await db.pool.end();
  process.exit(1);
});
