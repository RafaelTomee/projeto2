// models/Cliente.js
module.exports = (sequelize, DataTypes) => {
  const Cliente = sequelize.define('Cliente', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING, allowNull: false },
    cpf: { type: DataTypes.STRING, unique: true, allowNull: false },
    telefone: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING, unique: true, validate: { isEmail: true } }
  });

  Cliente.associate = (models) => {
    Cliente.hasMany(models.Reserva, { foreignKey: 'clienteId', as: 'reservas' });
  };

  return Cliente;
};