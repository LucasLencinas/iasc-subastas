
//Funciones que se ejcutan en el index.html

var subastas = [];
var idUsuario;


function initialize() {

  $('#modalLogin').modal('toggle');
}

function renderizarSubastas(){
  $.each(subastas,function(index, unaSubasta){
        renderizarUnaSubasta(unaSubasta);
  });
}

function renderizarUnaSubasta(subasta){
  var vistaSubasta = sprintf("<div class=\"col-md-4 col-sm-8 hero-feature\">");
//  var vistaSubasta = sprintf("<div>");
  vistaSubasta += sprintf("<div class=\"thumbnail\">");
  vistaSubasta += sprintf("<div class=\"caption\" id=\"%s\">", subasta.id);
  vistaSubasta += sprintf("<h3>%s</h3><p>$ %s.</p><p>Hasta las %s.</p><p>" +
        "<button class=\"btn btn-primary\" onclick=\"ofertar(%s)\"> Ofertar (+ $2)! </button></p>",
        subasta.titulo, subasta.montoActual, subasta.tiempoFin, subasta.id);
  vistaSubasta += "</div></div></div>";
  $('#subastasActuales').append(vistaSubasta);

}

/*Cuando oferto,y sale todo bien, cambiar el valor del monto actual*/
function renderizarOfertaEnSubasta(idOferta){
  console.log("A punto de renderizar el cambio del monto actual de la subasta");

}


function ofertar(idSubasta){

  console.log("A punto de ofertar...");
  var oferta = armarOferta(idSubasta);

  $.ajax({
    headers: { 'id-usuario': idUsuario },
    type: "PUT",
    contentType: "application/json",
    data: JSON.stringify(oferta),
    url: "/oferta/" + oferta.id,
    success: function (data) {
      console.log("Se Oferto Correctamente.");
      renderizarOfertaEnSubasta(oferta.id);
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("Ofertar - Hubo un error en el servidor");
      console.log(JSON.stringify(jqXHR) + ". " + JSON.stringify(textStatus) + ". " + JSON.stringify(errorThrown));
    }
  });

}

function armarOferta(idSubasta){
  var subasta = $.grep(subastas, function(elem){ return elem.id === idSubasta; });
  return {id: subasta.id, precio: subasta.montoActual+2, usuario: idUsuario};
}


function crearNuevaSubasta(){
  console.log("A punto de crear nueva subasta...");
  var subasta = armarSubasta();

  $.ajax({
    headers: { 'id-usuario': idUsuario },
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(subasta),
    url: "/subastas",
    success: function (data) {
      console.log("Se Creo al Subasta Correctamente.");
      vaciarForm();
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("Crear Subasta - Hubo un error en el servidor");
      console.log(JSON.stringify(jqXHR) + ". " + JSON.stringify(textStatus) + ". " + JSON.stringify(errorThrown));
    }
  });

  $("#duracionNuevaSubasta").val()

}

function armarSubasta(){
  return {
     idSubastador: idUsuario,
     titulo: $("#tituloNuevaSubasta").val(),
     duracion: $("#duracionNuevaSubasta").val(),
     /*O si queres poner el tiempo final
     var xMinutesLater = new Date();
     xMinutesLater.setMinutes(xMinutesLater.getMinutes() + $("#duracionNuevaSubasta").val());*/
     precioBase: $("#precioNuevaSubasta").val()
     };
}
function vaciarForm(){
  titulo: $("#tituloNuevaSubasta").val("");
  duracion: $("#duracionNuevaSubasta").val("");
  precioBase: $("#precioNuevaSubasta").val("");

}


function login(){
  var nombreUsuario = $("#nombreUsuario").val();
  $("#nombreUsuarioLogueado").text($("#nombreUsuario").val());
  idUsuario = $("#nombreUsuarioLogueado").text();
  $('#modalLogin').modal('toggle');

  mostrarContenido();
}

function mostrarContenido(){
  subastas.push({id: 1, titulo:"pelota futbol", montoActual: 20.00});
  subastas.push({id: 2, titulo:"remera", montoActual: 50.00});
  /*Cambiar esas subastas de arriba por una peticion ajax al servidor despues de haberse logueado*/
  $.ajax({
    headers: { 'id-usuario': idUsuario },
    type: "GET",
    contentType: "application/json",
    url: "/subastas",
    success: function (data) {
      console.log("Se obtuvieron correctamente las subastas.");
      $.each(data,function(index, unaSubasta){
          subastas.push(unaSubasta);
          //renderizarSubastas(); Descomentar este y borrar el otro renderizar que esta de prueba
      });

    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("Get de subastas - Hubo un error en el servidor");
      console.log(JSON.stringify(jqXHR) + ". " + JSON.stringify(textStatus) + ". " + JSON.stringify(errorThrown));
    }
  })

  /*Renderizar esas nuevas subastas */

  renderizarSubastas();
}



/* Un comprador A se registra.
    un nombre
    una forma de contacto

Un vendedor crea una subasta, con la siguiente información
Un título
Un precio base (que puede ser cero)
La duración máxima de la subasta
*/

function sprintf( format ){
  for( var i=1; i < arguments.length; i++ ) {
    format = format.replace( /%s/, arguments[i] );
  }
  return format;
}