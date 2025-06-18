import AuthService from "../../class/Auth.js";
import { getDatabase } from "../../services/database.js";

// Login Function
export const loginFunction = async function (context, req) {
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

// Register Function
export const registerFunction = async function (context, req) {
  const {
    email,
    password,
    firstName,
    lastName,
    role,
    companyName,
    companyCategory,
    companyType,
    companyDescription,
    phone,
    address,
    rfc,
  } = req.body;

  try {
    // Validate registration data
    AuthService.validateRegistrationData(email, password);

    // Hash the password
    const hashedPassword = AuthService.hashPassword(password);

    // Create the user object
    const user = {
      id: email, // You can use email or another unique ID
      email,
      firstName,
      lastName,
      role: role || "expositor", // Default to 'exhibitor' if no role is provided
      companyName,
      companyCategory,
      companyType,
      companyDescription,
      phone,
      address,
      rfc,
      password: hashedPassword,
      createdAt: new Date().toISOString(),
    };

    // Store the user in Cosmos DB
    const db = getDatabase();
    const container = db.container("users");
    await container.items.create(user); // Save to Cosmos DB

    // Generate a JWT token for the user
    const token = AuthService.generateToken(user);

    context.res = {
      status: 201,
      body: {
        message: "Usuario registrado exitosamente.",
        token,
      },
    };
  } catch (error) {
    context.res = {
      status: 400,
      body: { message: error.message || "Error en el registro." },
    };
  }
};
