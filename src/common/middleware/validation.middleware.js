const { SendResponse } = require('../utils/responseFormatter');

const validate = (schema) => (req, res, next) => {
  try {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const formattedErrors = result.error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }));
      
      return SendResponse(res, 400, false, 'Validation Failed', null, { errors: formattedErrors });
    }

    // Replace req parameters with parsed & sanitized versions
    req.body = result.data.body;
    req.query = result.data.query;
    req.params = result.data.params;

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = { validate };
