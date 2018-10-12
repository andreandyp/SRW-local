var mysql = require("mysql2/promise");
var base = null;

function conectar(host, usuario, nombreBD, password) {
	return mysql.createConnection({
		host: host,
		user: usuario,
		database: nombreBD,
		password: password
	}).then(function (conn) {
		alert("Conectado a la base");
		base = conn;
		return getTables(nombreBD);
	}).catch(function (err) {
		alert(err);
	});
}

function getTables(nombreBD){
	return base.query("SELECT table_name FROM information_schema.tables WHERE table_schema = ?", [nombreBD])
		.then(function (rows){
			return rows[0];
		});
}

function getAtributos(nombreBD, nombreTabla){
	return base.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = ? AND table_name = ?", 
	[nombreBD, nombreTabla]).then(function (rows) {
			return rows[0];
		});
}

module.exports = {
	conectar: conectar,
	getTables: getTables,
	getAtributos: getAtributos,
	desconectar: function(){
		base.end(function(){
			alert("Conexión terminada");
		});
	}
};