import createHandler from "azure-function-express";
import app from "./index.js"; // tu app de Express

const handler = createHandler(app); // envuelve tu Express app como Azure Function

export default function (context, req) {
  return handler(context, req);
}
