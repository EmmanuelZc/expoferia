const { database } = require("../../services/database");
const { handleError } = require("../../utils/errors");

module.exports = async function (context, req) {
  try {
    const { state, type } = req.query;

    let querySpec = {
      query: "SELECT * FROM c WHERE c.type = 'stand'",
    };

    if (state) {
      querySpec.query += " AND c.estado = @state";
      querySpec.parameters = [{ name: "@state", value: state }];
    }

    if (type) {
      querySpec.query += " AND c.tipo = @type";
      querySpec.parameters = querySpec.parameters || [];
      querySpec.parameters.push({ name: "@type", value: type });
    }

    const stands = await database.queryItems(
      database.containers.stands,
      querySpec
    );

    context.res = {
      body: stands,
      headers: { "Content-Type": "application/json" },
    };
  } catch (error) {
    handleError(context, error);
  }
};
