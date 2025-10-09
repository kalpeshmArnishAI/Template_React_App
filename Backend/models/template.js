const { DataTypes } = require("sequelize");
const sequelize = require("../utilities/db");
const { v4: uuidv4 } = require("uuid");

const Template = sequelize.define("Template", {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  company: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  text: {
    type: DataTypes.TEXT,
    allowNull: false,
    validate: { notEmpty: true }
  },
  placeholders: {
    type: DataTypes.JSON,   // store array of placeholders
    allowNull: true
  },
  document: {
    type: DataTypes.STRING,  // file path
    allowNull: false,
    validate: {
      notEmpty: true,
      is: /\.(docx|doc)$/i
    }
  },
  logo: {
    type: DataTypes.STRING, // logo file path
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  timestamps: true
});

module.exports = Template;
