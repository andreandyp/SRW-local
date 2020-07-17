var nombreBD, nombreTabla;
var BD = require("./config/bd");
var infoBD = require("../bases.json");
var minis = {};

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

function inicializar() {
	console.clear();
	var config = require("./bases.json");
	var basesLocales = infoBD.bases;
	var sitios = infoBD.sitios;

	for (var i = 0; i < basesLocales.length; i++) {
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
	BD.conectar(infoBase.host, infoBase.usuario, nombreBD, infoBase.password).then((tablas) => {
		añadirTablas(tablas);
	});
}

function añadirTablas(tablas) {
	var relacion = document.querySelector("#Relacion");
	for (var i = 0; i < tablas.length; i++) {
		var option = document.createElement("option");
		option.value = tablas[i].table_name;
		option.textContent = tablas[i].table_name;
		relacion.appendChild(option);
	}
}

function desconectar() {
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

function añadirAtributos(e) {
	nombreTabla = e.target.value;
	BD.getAtributos(nombreBD, nombreTabla).then((atributos) => {
		var Atributo = document.querySelector("#Atributo");
		var tablaNAtributos = document.querySelector("#numeroAtributo");
		var tablaAtributos = document.querySelector("#nombreAtributo");
		var tablaTipo = document.querySelector("#tipoAtributo");

		//Limpiar los antiguos
		while (Atributo.firstChild) {
			Atributo.removeChild(Atributo.firstChild);
		}

		while (tablaNAtributos.firstChild) {
			tablaNAtributos.removeChild(tablaNAtributos.firstChild);
		}

		while (tablaAtributos.firstChild) {
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
			th.textContent = "Atributo " + i;
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

function añadirPredicado() {
	var atributo = document.querySelector("#Atributo").value;
	var operador = document.querySelector("#Operador").value;
	var valor = document.querySelector("#Valor").value;

	if (!valor) {
		return alert("Inserta un valor");
	}

	var predicado = document.createElement("p");
	var tabla = document.querySelector("#" + nombreTabla);

	if (!tabla) {
		tabla = document.createElement("div");
		tabla.setAttribute("id", nombreTabla);
		var label = document.createElement("h4");
		label.textContent = nombreTabla;
		tabla.appendChild(label);
		var predicados = document.querySelector("#predicados");
		predicados.appendChild(tabla);
	}

	var input = document.createElement("input");
	input.type = "checkbox";
	input.disabled = true;
	predicado.append(input);

	var opTexto = document.createElement("span");
	opTexto.textContent = operador;
	opTexto.classList.add("operador");

	var strong = document.createElement("strong");
	strong.appendChild(document.createTextNode(atributo));
	strong.appendChild(opTexto);
	strong.appendChild(document.createTextNode(valor));
	predicado.appendChild(strong);

	var opSQL = document.createElement("span");
	opSQL.textContent = operador;
	var em = document.createElement("em");
	em.style.display = "block";
	em.appendChild(document.createTextNode(nombreTabla + "." + atributo));
	em.appendChild(opSQL);
	em.appendChild(document.createTextNode("'" + valor + "'"));
	predicado.appendChild(em);

	var eliminarPS = document.createElement("button");
	eliminarPS.classList.add("btn", "btn-danger");
	eliminarPS.textContent = "Eliminar";
	eliminarPS.onclick = function () {
		eliminarPredicado(this);
	};
	predicado.appendChild(eliminarPS);

	tabla.appendChild(predicado);
}

function obtenerOperador(op, negacion) {
	if (!negacion) {
		return op;
	}

	switch (op) {
		case "<":
			return ">";
		case "<=":
			return ">=";
		case ">":
			return "<";
		case ">=":
			return "<=";
		case "=":
			return "<>";
		case "<>":
			return "=";
	}
}

function validarPS() {
	var predicados = document.querySelector("#predicados");
	var tablas = predicados.childNodes;
	var predis, sql;

	for (var i = 0; i < tablas.length; i++) {
		predis = tablas[i].childNodes;
		for (var j = 1; j < predis.length; j++) {
			var elem = predis[j];
			sql = elem.childNodes[elem.childNodes.length - 2].textContent;
			BD.validarPredicado(sql.split(".")[0], sql, elem).then((filas) => {
				if (filas[0].length !== 0) {
					filas.elemento.firstChild.disabled = false;
					filas.elemento.style.backgroundColor = "green";
					filas.elemento.style.color = "white";
				} else {
					filas.elemento.style.backgroundColor = "red";
					filas.elemento.style.color = "white";
				}
			});
		}
	}
}

function obtenerPS(minitermino) {
	var tablas = document.querySelector("#predicados").childNodes;

	for (var i = 0; i < tablas.length; i++) {
		var predicados = [];
		var tabla = tablas[i].childNodes;
		//Desde 1 para omitir el nombre de la tabla
		for (var j = 1; j < tabla.length; j++) {
			var predicado = tabla[j].querySelector("input");
			if (predicado.checked) {
				predicados.push(tabla[j]);
			}
		}

		if (predicados.length >= 2) {
			crearMinis(predicados, tabla[0].textContent);
		}
	}
}

function crearMinis(predicados, nombreTabla) {
	var pred1, pre2;
	var tablaActual = document.querySelector("#" + nombreTabla + "-minis");
	if (!tablaActual) {
		tablaActual = document.createElement("div");
		tablaActual.id = nombreTabla + "-minis";
		tablaActual.style.backgroundColor = "white";
		tablaActual.style.color = "black";
		var h4 = document.createElement("h4");
		h4.textContent = nombreTabla;
		tablaActual.appendChild(h4);

		document.querySelector("#FragM").appendChild(tablaActual);
	}
	for (var i = 0, j = 1; i < predicados.length; i++, j++) {
		pred1 = predicados[i];
		pred2 = predicados[j];
		if (!pred2) {
			return;
		}

		var num = 0;
		while (num < 4) {
			var negacion1, negacion2;
			switch (num) {
				case 0:
					negacion1 = false;
					negacion2 = false;
					break;
				case 1:
					negacion1 = true;
					negacion2 = false;
					break;
				case 2:
					negacion1 = false;
					negacion2 = true;
					break;
				case 3:
					negacion1 = true;
					negacion2 = true;
			}
			var p = document.createElement("p"),
				input = document.createElement("input"),
				texto = document.createElement("strong"),
				sql = document.createElement("em");

			input.type = "checkbox";
			input.disabled = true;

			texto.textContent = negacion1 ? "~(" : "";
			texto.textContent += pred1.querySelector("strong").textContent;
			texto.textContent += negacion1 ? ")" : "";
			texto.textContent += "^";
			texto.textContent += negacion2 ? "~(" : "";
			texto.textContent += pred2.querySelector("strong").textContent;
			texto.textContent += negacion2 ? ")" : "";

			sql.textContent = pred1.querySelector("em").childNodes[0].textContent;
			sql.textContent += obtenerOperador(
				pred1.querySelector("em").childNodes[1].textContent,
				negacion1,
			);
			sql.textContent += pred1.querySelector("em").childNodes[2].textContent;
			sql.textContent += " AND ";
			sql.textContent += pred2.querySelector("em").childNodes[0].textContent;
			sql.textContent += obtenerOperador(
				pred2.querySelector("em").childNodes[1].textContent,
				negacion2,
			);
			sql.textContent += pred2.querySelector("em").childNodes[2].textContent;
			sql.style.display = "block";

			var eliminarMini = document.createElement("button");
			eliminarMini.classList.add("btn", "btn-danger");
			eliminarMini.textContent = "Eliminar";
			eliminarMini.onclick = function () {
				eliminarMT(this);
			};

			p.appendChild(input);
			p.appendChild(texto);
			p.appendChild(sql);
			p.appendChild(eliminarMini);

			var div = document.createElement("div");
			div.style.backgroundColor = "white";
			div.style.color = "black";
			div.appendChild(p);

			tablaActual.appendChild(div);
			++num;
		}
	}
}

function validarMinis() {
	var tablas = document.querySelector("#FragM").childNodes;
	for (var n = 0; n < tablas.length; n++) {
		var minis = tablas[n].childNodes;
		//Desde 1 para omitir el título
		for (var i = 1; i < minis.length; i++) {
			var elem = minis[i].querySelector("p em");
			var sql = elem.textContent;
			BD.validarPredicado(sql.split(".")[0], sql, minis[i]).then((filas) => {
				if (filas[0].length !== 0) {
					filas.elemento.firstChild.firstChild.disabled = false;
					filas.elemento.style.backgroundColor = "green";
					filas.elemento.style.color = "white";
				} else {
					filas.elemento.style.backgroundColor = "red";
					filas.elemento.style.color = "white";
				}
			});
		}
	}
}

function fragmentar() {
	var tablas = document.querySelector("#FragM").childNodes;
	for (var i = 0; i < tablas.length; i++) {
		var fragmentos = tablas[i].childNodes;
		for (var j = 1; j < fragmentos.length; j++) {
			var fragmento = fragmentos[j].querySelector("input");
			if (fragmento.checked) {
				var sql = fragmentos[j].querySelector("p em").textContent;
				var indice = document.querySelector("#sitio").value;
				BD.fragmentar(infoBD.sitios[indice], sql.split(".")[0], sql)
					.then(() => {
						alert("fragmento creado");
					})
					.catch((err) => {
						alert("No se pudo crear el fragmento");
						alert(err);
					});
			}
		}
	}
}

function eliminarPredicado(elemento) {
	elemento.parentElement.parentElement.removeChild(elemento.parentElement);
}

function eliminarMT(elemento) {
	elemento.parentElement.parentElement.parentElement.removeChild(
		elemento.parentElement.parentElement,
	);
}
