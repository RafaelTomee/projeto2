// models/Quarto.js
module.exports = (sequelize, DataTypes) => {
  const Quarto = sequelize.define('Quarto', {
    id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    numero: { type: DataTypes.STRING, unique: true, allowNull: false },
    tipo: { type: DataTypes.ENUM('Solteiro', 'Duplo', 'Casal', 'Suite'), allowNull: false },
    valorDiaria: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
    capacidade: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 },
    status: { type: DataTypes.ENUM('Disponível', 'Ocupado', 'Manutenção'), allowNull: false, defaultValue: 'Disponível' }
  });

  Quarto.associate = (models) => {
    Quarto.hasMany(models.Reserva, { foreignKey: 'quartoId', as: 'reservas' });
  };

  return Quarto;
};