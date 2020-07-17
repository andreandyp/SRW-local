var electron = require("electron");
var win,
	app = electron.app;

function crearVentana() {
	win = new electron.BrowserWindow({
		width: 1024,
		height: 600,
		webPreferences: {
			nodeIntegration: true,
		},
	});
	win.loadFile("fragmentacion2.html");
	//win.setMenu(null);
}

app.on("ready", crearVentana);
app.on("window-all-closed", function () {
	if (process.platform !== "darwin") {
		app.quit();
	}
});
