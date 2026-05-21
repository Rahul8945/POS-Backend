const AuthService = require('./auth.service');
const { SendResponse } = require('../../common/utils/responseFormatter');

class AuthController {
  async register(req, res, next) {
    try {
      const result = await AuthService.register(req.body);

      // Set cookie for refresh token
      res.cookie('jwt', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
      });

      SendResponse(res, 201, true, 'User registered successfully', {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await AuthService.login(email, password);

      res.cookie('jwt', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000 
      });
      console.log('Login successful', {
        user: result.user,
        accessToken: result.accessToken,
      });
      

      SendResponse(res, 200, true, 'Login successful', {
        user: result.user,
        accessToken: result.accessToken,
      });
    } catch (error) {
      next(error);
    }
  }

  async logout(req, res, next) {
    try {
      let token;
      if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
      }
      
      if (token) {
        await AuthService.logout(token);
      }

      res.cookie('jwt', 'loggedout', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
      });

      SendResponse(res, 200, true, 'Logout successful');
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
