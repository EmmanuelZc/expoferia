// src/config/config.js
export const config = {
  cosmosDb: {
    endpoint: process.env.COSMOSDB_ENDPOINT,
    key: process.env.COSMOSDB_KEY,
    databaseId: "mapadb",
    containers: {
      stands: "Stands",
      reservations: "Reservations",
      users: "Users",
    },
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  sendgrid: {
    apiKey: process.env.SENDGRID_API_KEY,
    templates: {
      reservationConfirmation: "d-1234567890",
    },
  },
  auth: {
    jwtSecret: process.env.JWT_SECRET,
    saltRounds: 10,
  },
};

export default config;
