const Pool = require('pg').Pool

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'students',
    password: 'Panupong23',
    port: 5432,
});

module.exports = pool;