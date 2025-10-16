'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const dialect = queryInterface.sequelize.getDialect();
    const isSQLite = dialect === 'sqlite';

    // Check if table exists
    const tables = await queryInterface.showAllTables();
    const tableExists = tables.includes('ERConfig');

    if (!tableExists) {
      // Create table if it doesn't exist
      await queryInterface.createTable('ERConfig', {
        id: {
          allowNull: false,
          autoIncrement: true,
          primaryKey: true,
          type: Sequelize.INTEGER
        },
        uniqueId: {
          type: Sequelize.STRING(128),
          allowNull: true,         
          defaultValue: null
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false
        },
        appliedImagesData: isSQLite
          ? { type: Sequelize.TEXT, allowNull: false, defaultValue: '[]' }
          : { type: Sequelize.JSON, allowNull: false, defaultValue: [] 
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: isSQLite
            ? Sequelize.literal('CURRENT_TIMESTAMP')
            : Sequelize.fn('NOW'),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: isSQLite
            ? Sequelize.literal('CURRENT_TIMESTAMP')
            : Sequelize.fn('NOW'),
        },
      });

      await queryInterface.addIndex('ERConfig', ['uniqueId'], {
        name: 'ERConfig_uniqueId_idx'
      });
    } else {
      // Table exists, check if uniqueId column exists
      const tableDescription = await queryInterface.describeTable('ERConfig');
      
      if (!tableDescription.uniqueId) {
        // Add missing uniqueId column
        await queryInterface.addColumn('ERConfig', 'uniqueId', {
          type: Sequelize.STRING(128),
          allowNull: true,
          defaultValue: null
        });
        
        // Add index for uniqueId
        await queryInterface.addIndex('ERConfig', ['uniqueId'], {
          name: 'ERConfig_uniqueId_idx'
        });
      }
    }
  },
  
  async down(queryInterface) {
    await queryInterface.removeIndex('ERConfig', 'ERConfig_uniqueId_idx').catch(() => {});
    await queryInterface.dropTable('ERConfig');
  }
};