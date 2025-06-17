const { CosmosClient } = require("@azure/cosmos");
const config = require("../config");

const client = new CosmosClient({
  endpoint: config.cosmosDb.endpoint,
  key: config.cosmosDb.key,
});

const database = client.database(config.cosmosDb.databaseId);

module.exports = {
  containers: {
    stands: database.container(config.cosmosDb.containers.stands),
    reservations: database.container(config.cosmosDb.containers.reservations),
    users: database.container(config.cosmosDb.containers.users),
  },

  // Helper para queries comunes
  queryItems: async (container, querySpec) => {
    const { resources } = await container.items.query(querySpec).fetchAll();
    return resources;
  },

  // Helper para operaciones geoespaciales
  queryStandsInArea: async (polygonCoordinates) => {
    const querySpec = {
      query: `SELECT * FROM s WHERE ST_WITHIN(s.geojson, { 
        "type": "Polygon", 
        "coordinates": @polygon 
      })`,
      parameters: [{ name: "@polygon", value: polygonCoordinates }],
    };
    return module.exports.queryItems(
      module.exports.containers.stands,
      querySpec
    );
  },
};
