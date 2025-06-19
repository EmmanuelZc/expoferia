import AuthService from "../src/class/Auth.js";
import { getDatabase } from "../src/services/database.js";
export const index = async function (context, req) {
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
