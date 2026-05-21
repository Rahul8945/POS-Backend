const SendResponse = (res, statusCode, success, message, data = null, meta = null) => {
  const payload = {
    success,
    message,
  };
  
  if (data) {
    payload.data = data;
  }
  
  if (meta) {
    payload.meta = meta;
  }
  
  return res.status(statusCode).json(payload);
};

module.exports = { SendResponse };
