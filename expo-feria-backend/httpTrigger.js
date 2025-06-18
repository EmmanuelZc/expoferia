import app from "./index.js"; // Importar la app de Express

module.exports = function (context, req) {
  app(req, context.res);
};
