require('dotenv').config();
const { Sequelize } = require('sequelize');

// Railway MySQL plugin exposes MYSQL_URL; fallback to individual vars for local
const dbUrl = process.env.DATABASE_URL || process.env.MYSQL_URL;
const sequelize = dbUrl
  ? new Sequelize(dbUrl, {
      dialect: 'mysql',
      logging: false,
      dialectOptions: { ssl: false },
    })
  : new Sequelize(
      process.env.DB_NAME,
      process.env.DB_USER,
      process.env.DB_PASS || '',
      {
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT) || 3306,
        dialect: 'mysql',
        logging: false,
      }
    );

module.exports = sequelize;
