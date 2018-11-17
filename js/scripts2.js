var nombreBD, nombreTabla;
var BD = require("./config/bd");
var infoBD = require("./bases.json");
var minis = {};
var fragmentos = {
	disponibles: 1,
	seleccionados: 0
};

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
	inicializar();
}

function inicializar(){
	console.clear();
	var config = require("./bases.json");
	var basesLocales = infoBD.bases;
	var sitios = infoBD.sitios;

	for(var i = 0; i < basesLocales.length; i++){
		var bds = document.querySelector("#bds");
		var option = document.createElement("option");
		option.value = i;
		option.textContent = basesLocales[i].host + " - " + basesLocales[i].nombreBD;
		bds.appendChild(option);
	}

	for (var i = 0; i < sitios.length; i++) {
		var sitio = document.querySelector("#sitio");
		var option = document.createElement("option");
		option.value = i;
		option.textContent = sitios[i].host + " - " + sitios[i].nombreBD;
		sitio.appendChild(option);
	}
}

function conectar() {
	var indice = document.querySelector("#bds").value;
	var infoBase = infoBD.bases[indice];
	nombreBD = infoBase.nombreBD;
	BD.conectar(infoBase.host, infoBase.usuario, nombreBD, infoBase.password).then(tablas => {
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
		var nfragmentos = document.querySelector("#nfragmentos");
		fragmentos.disponibles = atributos.length - 1;
		nfragmentos.setAttribute("max", atributos.length - 1);
		nfragmentos.value = atributos.length - 1;
		
		var table = document.querySelector("#tablaAtributos tbody");
		var table2 = document.querySelector("#tablaAtributos2 tbody");

		while (table.children[0].firstChild) {
			table.children[0].removeChild(table.children[0].firstChild);
			table.children[1].removeChild(table.children[1].firstChild);
		}

		while (table2.firstChild) {
			table2.removeChild(table2.firstChild);
		}

		for(var i = 0; i < atributos.length; i++){
			var nombre = document.createElement("td");
			nombre.textContent = atributos[i].column_name;
			(table.children[0]).appendChild(nombre);
			
			var tipo = document.createElement("td");
			tipo.textContent = atributos[i].data_type;
			(table.children[1]).appendChild(tipo);

			var fila = document.createElement("tr");
			var nombre2 = document.createElement("td");
			var tipo2 = document.createElement("td");
			var seleccionar = document.createElement("input");
			seleccionar.type = "checkbox";
			nombre2.textContent = atributos[i].column_name;
			tipo2.textContent = atributos[i].data_type;
			fila.appendChild(nombre2);
			fila.appendChild(tipo2);
			fila.appendChild(seleccionar);
			table2.appendChild(fila);
		}

		table2.children[0].children[2].checked = true;
		table2.children[0].children[2].disabled = true;
	});
}
document.querySelector("#Relacion").onchange = añadirAtributos;

function generarFragmentos(){
	++fragmentos.seleccionados;
	if(fragmentos.seleccionados > fragmentos.disponibles){
		return alert("Ya no puedes seleccionar más fragmentos");	
	}
	var atributos = (document.querySelector("#tablaAtributos2 tbody")).children;
	var expresiones = document.querySelector("#EAlgebraicas");
	var tablaActual = document.querySelector("#Relacion").value;

	var tablaFrag = document.querySelector("#tabla-"+tablaActual);
	if(!tablaFrag){
		tablaFrag = document.createElement("div");
		tablaFrag.setAttribute("id", "tabla-"+tablaActual+fragmentos.seleccionados);
		
		var titulo = document.createElement("h3");
		titulo.textContent = tablaActual+fragmentos.seleccionados;
		titulo.style.color = "black";
		
		tablaFrag.appendChild(titulo);
		expresiones.appendChild(tablaFrag);
	}
	var sql = document.createElement("em");
	var columnas = document.createElement("strong");
	columnas.style.display = "block";
	for(var i = 0; i < atributos.length; i++){
		var atri = atributos[i];
		if(atri.children[2].checked){
			if(sql.textContent){
				sql.textContent += ", ";
			}
			if(columnas.textContent){
				columnas.textContent += ", ";
			}
			sql.textContent += atri.children[0].textContent + " " + atri.children[1].textContent + "(100)";
			columnas.textContent += atri.children[0].textContent;
			tablaFrag.appendChild(columnas);
			tablaFrag.appendChild(sql);
		}
	}


}

function fragmentar(){
	var tablas = document.querySelector("#EAlgebraicas").childNodes;
	var indice = document.querySelector("#sitio").value;
	for(var i = 0; i < tablas.length; i++){
		var tabla = tablas[i].children;

		var titulo = tabla[0].textContent;
		var proyeccion = tabla[1].textContent;
		var sql = tabla[2].textContent;

		BD.fragmentarV(infoBD.sitios[indice], titulo, proyeccion, sql).then(() => {
			alert("fragmento creado");
		}).catch(err => {
			alert("No se pudo crear el fragmento");
			alert(err);
		})
	}
}

function eliminarPredicado(elemento){
	elemento.parentElement.parentElement.removeChild(elemento.parentElement);
}

function eliminarMT(elemento) {
	elemento.parentElement.parentElement.parentElement.removeChild(elemento.parentElement.parentElement);
}