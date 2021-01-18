const { Pool } = require('pg');

const pool = new Pool();

const database = async (query) => {
    let result;
    const client = await pool.connect();
    try {
        result = await client.query(query);
    }catch(err){
        throw new TypeError(err.message);
    }
    finally{
        client.release() ;
    }
    return result;
};

module.exports = database;