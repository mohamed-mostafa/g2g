/**
 * The dataaccess methods of g2g
 */

var mysql = require('mysql');

// creates a new connection
var createConnection = function() {
	var connection = mysql.createConnection({
	host     : process.env.OPENSHIFT_MYSQL_DB_HOST || 'localhost',
	port     : process.env.OPENSHIFT_MYSQL_DB_PORT || 3306,
	user     : process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'root',
	password : process.env.OPENSHIFT_MYSQL_DB_PASSWORD || 'root'
	});
	return connection;
};

exports.createConnection = createConnection;