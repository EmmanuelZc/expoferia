import AuthService from "../src/class/Auth.js";
import { getDatabase } from "../src/services/database.js";

// Login Function
export const index = async function (context, req) {
  const { email, password } = req.body;

  try {
    const db = getDatabase();
    const container = db.container("users");

    // Query for user by email
    const { resources: users } = await container.items
      .query({
        query: "SELECT * FROM c WHERE c.email = @email",
        parameters: [{ name: "@email", value: email }],
      })
      .fetchAll();

    if (!users.length) {
      context.res = {
        status: 404,
        body: {
          message: "Usuario no encontrado.",
        },
      };
      return;
    }

    const user = users[0];

    // Verify password
    if (!AuthService.verifyPassword(password, user.password)) {
      context.res = {
        status: 401,
        body: {
          message: "Credenciales incorrectas.",
        },
      };
      return;
    }

    // Generate token
    const token = AuthService.generateToken(user);

    context.res = {
      status: 200,
      body: {
        message: "Inicio de sesión exitoso.",
        token,
      },
    };
  } catch (error) {
    context.res = {
      status: 500,
      body: {
        message: error.message || "Error en el inicio de sesión.",
      },
    };
  }
};
