'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // First, remove duplicate entries (keep only the first one)
    const [results] = await queryInterface.sequelize.query(`
      DELETE FROM ERConfig 
      WHERE id NOT IN (
        SELECT MIN(id) 
        FROM ERConfig 
        GROUP BY uniqueId
      )
    `);

    // Now add the unique constraint
    await queryInterface.addIndex('ERConfig', ['uniqueId'], {
  name: 'ERConfig_uniqueId_unique',
  unique: true,
  });
},

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex('ERConfig', 'ERConfig_uniqueId_unique');
  }
};