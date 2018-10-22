var nombreBD, nombreTabla;
var BD = require("./config/bd");

function openFragmento(evt, fragName) {
	var i, tabcontent, tablinks;
	tabcontent = document.getElementsByClassName("tabcontent");
	for (i = 0; i < tabcontent.length; i++) {
		tabcontent[i].style.display = "none";
	}
	tablinks = document.getElementsByClassName("tablinks");
	for (i = 0; i < tablinks.length; i++) {
		tablinks[i].className = tablinks[i].className.replace(" active", "");
	}
	document.getElementById(fragName).style.display = "block";
	evt.currentTarget.className += " active";
}

function conectar() {
	//Ruta relativa al archivo html
	nombreBD = document.querySelector("#bd").value;
	BD.conectar("localhost", "root", nombreBD, "Andy94").then(tablas => {
		añadirTablas(tablas);
	});
}

function añadirTablas(tablas) {
	var relacion = document.querySelector("#Relacion");
	for(var i = 0; i < tablas.length; i++){
		var option = document.createElement("option");
		option.value = tablas[i].table_name;
		option.textContent = tablas[i].table_name;
		relacion.appendChild(option);
	}
}

function desconectar(){
	BD.desconectar();
	var relacion = document.querySelector("#Relacion");
	while (relacion.firstChild) {
		relacion.removeChild(relacion.firstChild);
	}

	var Atributo = document.querySelector("#Atributo");
	while (Atributo.firstChild) {
		Atributo.removeChild(Atributo.firstChild);
	}
}

function añadirAtributos(e){
	nombreTabla = e.target.value;
	BD.getAtributos(nombreBD, nombreTabla).then(atributos => {
		var Atributo = document.querySelector("#Atributo");
		var tablaNAtributos = document.querySelector("#numeroAtributo");
		var tablaAtributos = document.querySelector("#nombreAtributo");
		var tablaTipo = document.querySelector("#tipoAtributo");

		//Limpiar los antiguos
		while (Atributo.firstChild) {
			Atributo.removeChild(Atributo.firstChild);
		}

		while (tablaNAtributos.firstChild){
			tablaNAtributos.removeChild(tablaNAtributos.firstChild);
		}

		while (tablaAtributos.firstChild){
			tablaAtributos.removeChild(tablaAtributos.firstChild);
		}

		while (tablaTipo.firstChild) {
			tablaTipo.removeChild(tablaTipo.firstChild);
		}

		for (var i = 0; i < atributos.length; i++) {
			var option = document.createElement("option");
			option.value = atributos[i].column_name;
			option.textContent = atributos[i].column_name;
			Atributo.appendChild(option);

			var th = document.createElement("th");
			th.textContent = "Atributo "+i;
			tablaNAtributos.appendChild(th);

			var nombre = document.createElement("td");
			nombre.textContent = atributos[i].column_name;
			tablaAtributos.appendChild(nombre);

			var tipo = document.createElement("td");
			tipo.textContent = atributos[i].data_type;
			tablaTipo.appendChild(tipo);
		}
	});
}
document.querySelector("#Relacion").onchange = añadirAtributos;

function añadirPredicado(){
	var atributo = document.querySelector("#Atributo").value;
	var operador = document.querySelector("#Operador").value;
	var valor = document.querySelector("#Valor").value;
	var negacion = document.querySelector("#Negacion").checked;

	if(!valor){
		return alert("Inserta un valor");
	}

	var predicado = document.createElement("p");
	var tabla = document.querySelector("#"+nombreTabla);

	if(!tabla){
		tabla = document.createElement("div");
		tabla.setAttribute("id", nombreTabla);
		var label = document.createElement("h4");
		label.textContent = nombreTabla;
		tabla.appendChild(label);
		var predicados = document.querySelector("#predicados");
		predicados.appendChild(tabla);
	}

	var texto = negacion ? "~(" : "";
	texto += atributo + " " + operador + " " + valor;
	texto += negacion ? ")" : "";
	var strong = document.createElement("strong");
	strong.style = "display: block;"
	strong.textContent = texto;
	predicado.appendChild(strong);
	
	var sql = nombreTabla + "." + atributo + obtenerOperador(operador, negacion) + "'" + valor + "'";
	var em = document.createElement("em");
	em.style = "display: block;"
	em.textContent = sql;
	predicado.appendChild(em);

	tabla.appendChild(predicado);
}

function obtenerOperador(op, negacion){
	if(!negacion){
		return op;
	}

	switch(op){
		case "<":
			return ">";
		case "<=":
			return ">=";
		case ">":
			return "<";
		case ">=;":
			return "<=";
		case "=":
			return "<>";
		case "<>":
			return "=";
	}
}

function validarPS(){
	var predicados = document.querySelector("#predicados");
	var tablas = predicados.childNodes;
	var predis, sql;

	for(var i = 0; i < tablas.length; i++){
		predis = tablas[i].childNodes;
		for(var j = 1; j < predis.length; j++){
			var elem = predis[j];
			sql = elem.lastChild.textContent;
			//console.log(sql);
			//console.log(sql.split(".")[0]);
			BD.validarPredicado(sql.split(".")[0], sql, elem).then(filas => {
				if(filas[0].length !== 0){
					filas.elemento.style = "color: green";
				}else{
					filas.elemento.style = "color: red";
				}
			});
		}
	}
	
}

function formarMinis(minitermino){
	var fragmentos = document.querySelector("#FragM");
	
	var mini = document.createElement("option");
	mini.textContent = minitermino[0].textContent + " ^ " + minitermino[1].textContent;
	mini.value = minitermino[0].value + " AND " + minitermino[1].value;

	fragmentos.appendChild(mini);
}