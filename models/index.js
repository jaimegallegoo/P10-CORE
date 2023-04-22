// Importar SEQUELIZE: Load ORM
const Sequelize = require('sequelize');

// To use SQLite data base:
// DATABASE_URL = sqlite:db-p5-orm.sqlite
const url = process.env.DATABASE_URL || "sqlite:blog.sqlite";

// CREACIÓN DB:
const sequelize = new Sequelize(url, { logging: false });

// // IMPORTAR DEFINICIONES DE MODELOS:
const Post = require('./post')(sequelize, Sequelize.DataTypes);
const Attachment = require('./attachment')(sequelize, Sequelize.DataTypes);

// Relation 1-to-1 between Post and Attachment
Attachment.hasOne(Post, {as: 'post', foreignKey: 'attachmentId'});
Post.belongsTo(Attachment, {as: 'attachment', foreignKey: 'attachmentId'});

module.exports = sequelize;