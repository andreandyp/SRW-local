var nombreBD;
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
	BD.conectar("localhost", "root", nombreBD, "").then(tablas => {
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
	BD.getAtributos(nombreBD, e.target.value).then(atributos => {
		var Atributo = document.querySelector("#Atributo");
		//Limpiar los antiguos
		while (Atributo.firstChild) {
			Atributo.removeChild(Atributo.firstChild);
		}

		for (var i = 0; i < atributos.length; i++) {
			var option = document.createElement("option");
			option.value = atributos[i].column_name;
			option.textContent = atributos[i].column_name;
			Atributo.appendChild(option);
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

	var predicado = document.createElement("option");

	var texto = negacion ? "~(" : "";
	texto += atributo + " " + operador + " " + valor;
	texto += negacion ? ")" : "";
	predicado.textContent = texto;
	
	var valor = atributo + obtenerOperador(operador, negacion) + "'" + valor + "'";
	predicado.value = valor;

	var predicados = document.querySelector("#predicados");
	predicados.appendChild(predicado);
}

function obtenerOperador(op, negacion){
	if(!negacion){
		return op;
	}

	console.log(op);
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

function generarMinis(){
	var predicados = document.querySelector("#predicados");
	var opciones = predicados.options;
	var minitermino = [];

	for(var i = 0; i < opciones.length; i++){
		if(opciones[i].selected){
			minitermino.push(opciones[i]);
		}
	}
	if(minitermino.length !== 2){
		return alert("selecciona solo 2")
	}

	formarMinis(minitermino);
}

function formarMinis(minitermino){
	var fragmentos = document.querySelector("#FragM");
	
	var mini = document.createElement("option");
	mini.textContent = minitermino[0].textContent + " ^ " + minitermino[1].textContent;
	mini.value = minitermino[0].value + " AND " + minitermino[1].value;

	fragmentos.appendChild(mini);
}