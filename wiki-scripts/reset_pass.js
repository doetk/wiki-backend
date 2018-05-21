const { Pool } = require('pg'); // Importing node postgress

//Makes a Pool, which is the conncetion info to the postgress
const pool = new Pool({
    user: 'docker',
    host: 'postgres',
    database: 'wiki',
    password: 'dragon',
    port: 5432, //Postgress is automatically at this port.
});

const bcrypt = require('bcrypt');

var userName = process.argv[2];
let hash = bcrypt.hashSync('NCC-1701', 10);
const text = 'UPDATE users SET passhash = $1 WHERE username = $2'

// promise
pool.query(text, [hash, userName])
.then(res => {
  console.log(res.rows[0])
})
.catch(e => console.error(e.stack))
