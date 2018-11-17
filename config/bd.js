var mysql = require("mysql2/promise");
var base = null;

function conectar(host, usuario, nombreBD, password) {
	return mysql.createConnection({
		host: host,
		user: usuario,
		database: nombreBD,
		password: password,
		dateStrings: true
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

function validarPredicado(tabla, predicado, elemento){
	return base.query("SELECT * FROM " + tabla + " WHERE " + predicado).then(rows => {
		rows.elemento = elemento;
		return rows;
	});
}

function fragmentar(sitio, nombreTabla, sql){
	var baseFragmento;
	return mysql.createConnection({
		host: sitio.host,
		user: sitio.usuario,
		database: sitio.nombreBD,
		password: sitio.password,
		dateStrings: true
	}).then(function (conn) {
		baseFragmento = conn;
		return base.query("SELECT * FROM "+nombreTabla+" WHERE "+sql);
	}).then(function (rows) {
		var filas = rows[0];
		var datos = [];
		console.log(filas.length);
		for(var i = 0; i < filas.length; i++){
			for(var key in filas[i]){
				datos.push("'"+filas[i][key]+"'");
			}
			baseFragmento.execute("INSERT INTO " + nombreTabla + " VALUES (" + datos.join(",") + ")");
			datos = [];
		}
	}).catch(function(error){
		return alert(error);
	})
}

function fragmentarV(sitio, titulo, proyeccion, sqlTabla){
	var baseFragmento;
	console.log(sitio);
	return mysql.createConnection({
		host: sitio.host,
		user: sitio.usuario,
		database: sitio.nombreBD,
		password: sitio.password,
		dateStrings: true
	}).then(function (conn) {
		baseFragmento = conn;
		var SQL = "CREATE TABLE "+titulo+"(" + sqlTabla +")";
		console.log(SQL);
		return baseFragmento.query(SQL);
	}).then(() => {
		return base.query("SELECT "+proyeccion+" FROM "+titulo.replace(/\w$/, ""));
	}).then(rows => {
		var filas = rows[0];
		var datos = [];
		console.log(filas.length);
		for(var i = 0; i < filas.length; i++){
			for(var key in filas[i]){
				datos.push("'"+filas[i][key]+"'");
			}
			baseFragmento.execute("INSERT INTO " + titulo + " VALUES (" + datos.join(",") + ")");
			datos = [];
		}
	}).catch(function(error){
		return alert(error);
	})
}

module.exports = {
	conectar: conectar,
	getTables: getTables,
	getAtributos: getAtributos,
	fragmentarV: fragmentarV,
	desconectar: function(){
		base.end(function(){
			alert("Conexión terminada");
		});
	},
	validarPredicado: validarPredicado,
	fragmentar: fragmentar
};