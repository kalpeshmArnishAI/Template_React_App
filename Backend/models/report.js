const { DataTypes } = require("sequelize");
const sequelize = require("../utilities/db");
const { v4: uuidv4 } = require("uuid");

const Report = sequelize.define("Report", {
  id: {
    type: DataTypes.UUID,
    defaultValue: () => uuidv4(),
    primaryKey: true
  },
  templateId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: { notEmpty: true }
  },
  text: {
    type: DataTypes.JSON, // key-value pairs of placeholders and input values
    allowNull: false
  }
}, {
  timestamps: true,
  tableName: 'reports',
  freezeTableName: true
});

module.exports = Report;


