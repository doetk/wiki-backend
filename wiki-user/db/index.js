const { Pool } = require('pg'); // Importing node postgress

//Makes a Pool, which is the conncetion info to the postgress
const pool = new Pool({
    user: 'docker',
    host: 'postgres',
    database: 'wiki',
    password: 'dragon',
    port: 5432, //Postgress is automatically at this port.
  });
  
//exports query so anything that includes this file can do a query.
module.exports = {
  query: (text, params) => pool.query(text, params)
}

  
