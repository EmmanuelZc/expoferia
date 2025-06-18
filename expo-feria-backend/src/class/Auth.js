// src/auth/AuthService.js
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

class AuthService {
  static generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {
      return null;
    }
  }

  static hashPassword(password) {
    return bcrypt.hashSync(password, 10);
  }

  static verifyPassword(password, hashedPassword) {
    return bcrypt.compareSync(password, hashedPassword);
  }

  static validateRegistrationData(email, password) {
    if (!email || !password) {
      throw new Error("Email y password son requeridos.");
    }
  }

  static validateRegistrationData(email, password) {
    if (!email || !password) {
      throw new Error("Correo electrónico y contraseña son obligatorios.");
    }
  }
}

export default AuthService;
