// models/Reserva.js
module.exports = (sequelize, DataTypes) => {
  const Reserva = sequelize.define('Reserva', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    dataCheckIn: { type: DataTypes.DATEONLY, allowNull: false },
    dataCheckOut: { type: DataTypes.DATEONLY, allowNull: false },
    valorTotal: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    status: { type: DataTypes.ENUM('Confirmada', 'Check-In', 'Check-Out', 'Cancelada'), allowNull: false, defaultValue: 'Confirmada' },
    // Chaves estrangeiras definidas nas associações
    clienteId: { type: DataTypes.INTEGER, allowNull: false },
    quartoId: { type: DataTypes.INTEGER, allowNull: false },
  });

  Reserva.associate = (models) => {
    Reserva.belongsTo(models.Cliente, { foreignKey: 'clienteId', as: 'cliente' });
    Reserva.belongsTo(models.Quarto, { foreignKey: 'quartoId', as: 'quarto' });
  };

  return Reserva;
};