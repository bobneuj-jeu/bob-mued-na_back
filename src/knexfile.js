exports.up = function(knex) {
    return knex.schema.table('users', function(table) {
      table.string('allergies').defaultTo('none');
      table.enu('diabetes', ['none', 'type1', 'type2', 'gestational']).defaultTo('none').alter();
      table.string('other_conditions').defaultTo('none');
    });
  };
  
exports.down = function(knex) {
    return knex.schema.table('users', function(table) {
      table.dropColumn('allergies');
      table.dropColumn('other_conditions');
      // 'diabetes'는 ENUM으로 드랍 후 재생성 불가하므로 ALTER가 필요.
    });
};  