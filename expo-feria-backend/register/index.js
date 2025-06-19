// auth/register/index.js
import AuthService from "../src/class/Auth.js";
import { getDatabase } from "../src/services/database.js";

export const index = async function (context, req) {
  context.log("Solicitud de registro recibida:", req.method, req.originalUrl);

  try {
    // Verificar método POST
    if (req.method !== "POST") {
      context.res = {
        status: 405,
        body: { message: "Método no permitido" },
      };
      return;
    }

    // Verificar cuerpo de la solicitud
    if (!req.body) {
      context.res = {
        status: 400,
        body: { message: "El cuerpo de la solicitud no puede estar vacío" },
      };
      return;
    }

    context.log("Datos recibidos:", JSON.stringify(req.body, null, 2));

    // Campos requeridos con mensajes personalizados
    const requiredFields = {
      email: "El email es requerido",
      password: "La contraseña es requerida",
      firstName: "El nombre es requerido",
      lastName: "El apellido es requerido",
      phone: "El teléfono es requerido",
      address: "La dirección es requerida",
      rfc: "El RFC es requerido",
      companyName: "El nombre de la empresa es requerido",
      companyType: "El tipo de empresa es requerido",
      companyCategory: "La categoría de productos es requerida",
    };

    const missingFields = Object.keys(requiredFields).filter(
      (field) => !req.body[field]
    );

    if (missingFields.length > 0) {
      const errorMessages = missingFields.map((field) => requiredFields[field]);
      context.res = {
        status: 400,
        body: {
          message: "Faltan campos obligatorios",
          errors: errorMessages,
          receivedData: req.body,
        },
      };
      return;
    }

    // Validar email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(req.body.email)) {
      context.res = {
        status: 400,
        body: { message: "El email no tiene un formato válido" },
      };
      return;
    }

    // Validar contraseña (ejemplo mínimo 8 caracteres)
    if (req.body.password.length < 8) {
      context.res = {
        status: 400,
        body: { message: "La contraseña debe tener al menos 8 caracteres" },
      };
      return;
    }

    // Crear objeto usuario
    const user = {
      id: req.body.email.toLowerCase(), // Normalizar email
      email: req.body.email.toLowerCase(),
      firstName: req.body.firstName.trim(),
      lastName: req.body.lastName.trim(),
      role: req.body.role || "expositor",
      companyName: req.body.companyName.trim(),
      companyCategory: req.body.companyCategory,
      companyType: req.body.companyType,
      companyDescription: req.body.companyDescription || "",
      phone: req.body.phone,
      address: req.body.address,
      rfc: req.body.rfc.toUpperCase(), // Normalizar RFC
      password: AuthService.hashPassword(req.body.password),
      createdAt: new Date().toISOString(),
    };

    context.log("Usuario a registrar:", JSON.stringify(user, null, 2));

    // Guardar en Cosmos DB
    const db = getDatabase();
    const container = db.container("usuarios");

    // Verificar si el usuario ya existe
    const { resources: existingUsers } = await container.items
      .query(`SELECT * FROM c WHERE c.id = "${user.id}"`)
      .fetchAll();

    if (existingUsers.length > 0) {
      context.res = {
        status: 409,
        body: { message: "El email ya está registrado" },
      };
      return;
    }

    // Crear nuevo usuario
    const { resource: createdUser } = await container.items.create(user);
    context.log("Usuario creado:", createdUser.id);

    // Generar token
    const token = AuthService.generateToken(createdUser);

    context.res = {
      status: 201,
      body: {
        success: true,
        message: "Usuario registrado exitosamente",
        token,
        user: {
          email: createdUser.email,
          firstName: createdUser.firstName,
          lastName: createdUser.lastName,
          companyName: createdUser.companyName,
        },
      },
    };
  } catch (error) {
    context.log.error("Error en el registro:", error);
    context.res = {
      status: 500,
      body: {
        message: "Error interno del servidor",
        error: error.message,
      },
    };
  }
};
