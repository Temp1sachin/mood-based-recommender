const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: 'dlj8ladoo',
  api_key: '861891121969282',
  api_secret: 'iIvPuHwjvuv7uYKq3ogtHWMHM2Y'
});

module.exports = cloudinary;
