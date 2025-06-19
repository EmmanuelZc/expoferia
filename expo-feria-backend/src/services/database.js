import { CosmosClient } from "@azure/cosmos"; // Usar la exportación nombrada
import config from "../config.js"; // Mantener la importación de config
const endpoint = "https://mapadb.documents.azure.com:443/";

const client = new CosmosClient({
  endpoint: endpoint,
  key: key,
});

const database = client.database("mapadb");

export const getDatabase = () => database;

// Contenedores para acceso a la base de datos
export const containers = {
  pagos: database.container("Pagos"), // Contenedor de pagos
  reservas: database.container("reservas"), // Contenedor de reservas
  stands: database.container("stands"), // Contenedor de stands
  usuarios: database.container("usuarios"), // Contenedor de usuarios
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
