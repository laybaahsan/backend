const dns = require('dns');

const checkInternet = (req, res, next) => {
  dns.resolve('cloudflare.com', (err) => {
    if (err) {
      return res.status(503).json({ error: 'No internet connection. Please check internet connection' });
    }
    next();
  });
};

module.exports = checkInternet;

