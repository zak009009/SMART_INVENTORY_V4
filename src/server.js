const app = require("./app");
const { connectToDatabase } = require("./config/database");
const config = require("./config/config");

async function start() {
  try {
    await connectToDatabase(config.mongoUri);

    app.listen(config.port, () => {
      console.log(
        `Environement de : [${config.env}] - Smart Inventory API en écoute sur le port ${config.port}`
      );
    });
  } catch (err) {
    console.error("Erreur de démarrage :", err.message);
    process.exit(1);
  }
}

start();
