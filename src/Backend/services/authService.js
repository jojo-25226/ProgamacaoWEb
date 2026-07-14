import bcrypt from "bcryptjs";
import authRepository from "../repositories/authRepository.js";
import { generateToken } from "../utils/generateToken.js";

class AuthService {

  async register(data) {
    const userExists = await authRepository.findUserByEmail(data.email);

    if (userExists) {
      throw new Error("Usuário já existe");
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await authRepository.createUser({
      ...data,
      birthDate: new Date(data.birthDate),
      password: hashedPassword,
    });

    const token = generateToken(user.id);

    return { user, token };
  }

  async login(data) {
    // findUserByEmail sem select para obter a password
    const user = await authRepository.findUserByEmail(data.email);

    if (!user) {
      throw new Error("Email ou senha inválidos");
    }

    const passwordMatch = await bcrypt.compare(data.password, user.password);

    if (!passwordMatch) {
      throw new Error("Email ou senha inválidos");
    }

    const token = generateToken(user.id);

    // Não devolver a password ao cliente
    const { password, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }
}

export default new AuthService();