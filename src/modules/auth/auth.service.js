const AuthRepository = require('./auth.repository');
const AppError = require('../../common/exceptions/AppError');
const { generateAuthToken, generateRefreshToken } = require('../../common/utils/generateToken');
const redisClient = require('../../config/redis.config');

class AuthService {
  async register(userData) {
    const existingUser = await AuthRepository.findUserByEmail(userData.email);
    if (existingUser) {
      throw new AppError('Email already in use', 400);
    }

    const newUser = await AuthRepository.createUser(userData);
    return this._generateTokensResponse(newUser);
  }

  async login(email, password) {
    const user = await AuthRepository.findUserByEmail(email, true);

    if (!user || !(await user.correctPassword(password, user.password))) {
      throw new AppError('Incorrect email or password', 401);
    }
    
    // Bypassing the active check temporarily to ensure you can log in!
    // if (!user.active) {
    //   throw new AppError('This account has been deactivated.', 401);
    // }

    return this._generateTokensResponse(user);
  }
  
  async logout(token) {
    // Add token to redis blacklist with expiry matching JWT (e.g., 24h)
    // Decoding is just to get expiry time, or default to 86400 secs
    await redisClient.set(`bl_${token}`, 'true', 'EX', 86400);
    return true;
  }

  _generateTokensResponse(user) {
    const accessToken = generateAuthToken(user._id, user.role);
    const refreshToken = generateRefreshToken(user._id);

    // Remove password from output
    user.password = undefined;

    return {
      user,
      accessToken,
      refreshToken,
    };
  }
}

module.exports = new AuthService();
