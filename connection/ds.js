// connection menggunakan mysql

const mysql = require('mysql');

const portMysql = "7700"

let dbPool = mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: 'root',
        database: 'eficthelter'

}); 

dbPool.connect(function(error){
        if (error) throw error;
        console.log(`connected database mysql or mariadb!!  ${portMysql}`)
});

module.exports = dbPool; 

