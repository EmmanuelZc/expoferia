import { CosmosClient } from "@azure/cosmos"; // Usar la exportación nombrada
import config from "../config.js"; // Mantener la importación de config

const client = new CosmosClient({
  endpoint: config.cosmosDb.endpoint,
  key: config.cosmosDb.key,
});

const database = client.database(config.cosmosDb.databaseId);

export const getDatabase = () => database;

// Contenedores para acceso a la base de datos
export const containers = {
  stands: database.container(config.cosmosDb.containers.stands),
  reservations: database.container(config.cosmosDb.containers.reservations),
  users: database.container(config.cosmosDb.containers.users),
};

// Helper para queries comunes
export const queryItems = async (container, querySpec) => {
  const { resources } = await container.items.query(querySpec).fetchAll();
  return resources;
};

// Helper para operaciones geoespaciales
export const queryStandsInArea = async (polygonCoordinates) => {
  const querySpec = {
    query: `SELECT * FROM s WHERE ST_WITHIN(s.geojson, { 
      "type": "Polygon", 
      "coordinates": @polygon 
    })`,
    parameters: [{ name: "@polygon", value: polygonCoordinates }],
  };
  return queryItems(containers.stands, querySpec);
};
