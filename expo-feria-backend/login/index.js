import AuthService from "../src/class/Auth.js";
import { getDatabase } from "../src/services/database.js";

export const index = async function (context, req) {
  try {
    // Verificar que el cuerpo de la solicitud no esté vacío
    if (!req.body) {
      context.res = {
        status: 400,
        body: { message: "Cuerpo de la solicitud faltante" },
      };
      return;
    }

    console.log("Datos recibidos para inicio de sesión:", req.body);

    // Validar que se ha proporcionado un email
    const { email, password } = req.body;

    if (!email || !password) {
      context.res = {
        status: 400,
        body: { message: "Email y contraseña son requeridos" },
      };
      return;
    }

    // Validación de formato de email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      context.res = {
        status: 400,
        body: { message: "El email no tiene un formato válido" },
      };
      return;
    }

    const db = getDatabase();
    const container = db.container("usuarios");

    // Buscar al usuario por su email
    const { resources: users } = await container.items
      .query(`SELECT * FROM c WHERE c.email = "${email}"`)
      .fetchAll();

    if (users.length === 0) {
      context.res = {
        status: 404,
        body: { message: "Usuario no encontrado" },
      };
      return;
    }

    const user = users[0];

    // Validar que la contraseña coincida
    const isPasswordValid = AuthService.verifyPassword(password, user.password);

    if (!isPasswordValid) {
      context.res = {
        status: 401,
        body: { message: "Contraseña incorrecta" },
      };
      return;
    }

    // Generar el token JWT
    const token = AuthService.generateToken(user);

    context.res = {
      status: 200,
      body: {
        message: "Inicio de sesión exitoso.",
        token,
        user: {
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          companyName: user.companyName,
        },
      },
    };
  } catch (error) {
    console.error("Error en el inicio de sesión:", error);
    context.res = {
      status: 500,
      body: {
        message: "Error interno del servidor",
        errorDetails: error.message,
      },
    };
  }
};
