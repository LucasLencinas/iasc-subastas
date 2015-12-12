
//Funciones que se ejcutan en el index.html

var subastasDeTerceros = [];
var idUsuario;
var misSubastas = [];

function initialize() {
  $('#modalLogin').modal('show');
  //mostrarContenido();
}

function renderizarSubastas(){
  $('#subastasActuales').empty();
  $.each(subastasDeTerceros[0],function(index, unaSubasta){
    console.log(unaSubasta);
        renderizarUnaSubasta(unaSubasta);
  });
}

function renderizarUnaSubasta(subasta){
  var vistaSubasta = sprintf("<div class=\"col-md-4 col-sm-8 col-xs-6 hero-feature\">");
  //  var vistaSubasta = sprintf("<div>");
  if (subasta.mejor_oferta == null) subasta.mejor_oferta = {precio: subasta.precio_base};
  vistaSubasta += sprintf("<div class=\"thumbnail %s\" id=\"thumbnail_%s\">", (subasta.terminada ? 'terminada' : 'activa'), subasta.id);
  vistaSubasta += sprintf("<div class=\"caption\" id=\"%s\">", subasta.id);
  vistaSubasta += sprintf("<h4>%s (id = %s)</h4><p>$ %s.</p><p>Vendedor: %s.</p><p><p>Finalizada: %s.</p><p>" +
        "<button class=\"btn btn-primary\" onclick=\"ofertar(%s)\"> Ofertar (+ $2)! </button></p>",
        subasta.titulo, subasta.id, subasta.mejor_oferta.precio, subasta.vendedor, (subasta.terminada ? 'Sí' : 'No'), subasta.id);
  if($("#nombreUsuarioLogueado").text() == subasta.vendedor && !subasta.terminada)
    vistaSubasta += sprintf("<button class=\"btn btn-default\" onclick=\"cancelarSubasta('%s')\">Cancelar Subasta</button>",subasta.id);
  vistaSubasta += "</div></div></div>";
  $('#subastasActuales').prepend(vistaSubasta);

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
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(oferta),
    url:   location.origin + "/api/subastas/"+ idSubasta + "/ofertas",
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
  var subasta = $.grep(subastasDeTerceros[0], function(elem){ return elem.id === idSubasta; })[0];
  return {oferta:  {precio: subasta.mejor_oferta.precio+2, comprador: idUsuario} };
}


function crearNuevaSubasta(){
  console.log("A punto de crear nueva subasta...");
  var subasta = armarSubasta();
  console.log("contenido del json subasta:" + JSON.stringify(subasta));
  $.ajax({
    headers: { 'id-usuario': idUsuario },
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(subasta),
    url: location.origin + "/api/subastas",
    success: function (data) {
      console.log("Se Creo al Subasta Correctamente.");
      vaciarForm();
      misSubastas.push(subasta);
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("Crear Subasta - Hubo un error en el servidor");
      console.log(JSON.stringify(jqXHR) + ". " + JSON.stringify(textStatus) + ". " + JSON.stringify(errorThrown));
    }
  });
}

function armarSubasta(){
  /*Armar algo del estilo:
  {"data":{"vendedor":"Juan",
  "titulo":"venta heladera",
  "terminada":false,
  "precio_base":200.0,
  "mejor_oferta":null,
  "id":9,"duracion":10}}
  */
  return {
      subasta:{
         vendedor: idUsuario,
         titulo: $("#tituloNuevaSubasta").val(),
         duracion: $("#duracionNuevaSubasta").val(),
         /*O si queres poner el tiempo final
         var xMinutesLater = new Date();
         xMinutesLater.setMinutes(xMinutesLater.getMinutes() + $("#duracionNuevaSubasta").val());*/
         precio_base: $("#precioNuevaSubasta").val(),
         terminada: false
       }
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
 /* subastasDeTerceros.push({id: 1, titulo:"pelota futbol", montoActual: 20.00});
  subastasDeTerceros.push({id: 2, titulo:"remera", montoActual: 50.00});
  /*Cambiar esas subastas de arriba por una peticion ajax al servidor despues de haberse logueado*/
  $.ajax({
    headers: { 'id-usuario': idUsuario },
    type: "GET",
    contentType: "application/json",
    url: "/api/subastas",
    success: function (data) {
      console.log("Se obtuvieron correctamente las subastas.");
      $.each(data,function(index, unaSubasta){
          subastasDeTerceros = []
          subastasDeTerceros.push(unaSubasta);
          renderizarSubastas(); //Descomentar este y borrar el otro renderizar que esta de prueba
      });

    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("Get de subastas - Hubo un error en el servidor");
      console.log(JSON.stringify(jqXHR) + ". " + JSON.stringify(textStatus) + ". " + JSON.stringify(errorThrown));
    }
  })
}

function cancelarSubasta(id){

  $.ajax({
    headers: { 'id-usuario': idUsuario },
    type: "POST",
    url: location.origin + "/api/subastas/" + id + "/cancelar",
    success: function (data) {
      console.log("Se Cancelo la Subasta Correctamente.");
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("Crear Subasta - Hubo un error en el servidor");
      console.log(JSON.stringify(jqXHR) + ". " + JSON.stringify(textStatus) + ". " + JSON.stringify(errorThrown));
    }
  });
}

function eliminarMiSubasta(id){
  $("#thumbnail_"+id).remove();
  misSubastas = $.grep(misSubastas, function(elem, index) {
   return elem.id != id;
  });

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


function readCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
    var c = ca[i];
    while (c.charAt(0)==' ') c = c.substring(1,c.length);
    if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
function createCookie(name,value,days) {
  if (days) {
    var date = new Date();
    date.setTime(date.getTime()+(days*24*60*60*1000));
    var expires = "; expires="+date.toGMTString();
  }
  else var expires = "";
  document.cookie = name+"="+value+expires+"; path=/";
}
