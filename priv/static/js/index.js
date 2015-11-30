
//Funciones que se ejcutan en el index.html

var subastasDeTerceros = [];
var idUsuario;
var misSubastas = [];

function initialize() {
  $('#modalLogin').modal('show');
}

function renderizarSubastas(){
  $.each(subastasDeTerceros[0],function(index, unaSubasta){
    console.log(unaSubasta);
        renderizarUnaSubasta(unaSubasta);
  });
}

function renderizarUnaSubasta(subasta){
  var vistaSubasta = sprintf("<div class=\"col-md-4 col-sm-8 hero-feature\">");
  //  var vistaSubasta = sprintf("<div>");
  if (subasta.mejor_oferta == null) subasta.mejor_oferta = subasta.precio_base;
  vistaSubasta += sprintf("<div class=\"thumbnail\">");
  vistaSubasta += sprintf("<div class=\"caption\" id=\"%s\">", subasta.id);
  vistaSubasta += sprintf("<h3>%s</h3><p>$ %s.</p><p>Finalizada: %s.</p><p>" +
        "<button class=\"btn btn-primary\" onclick=\"ofertar(%s)\"> Ofertar (+ $2)! </button></p>",
        subasta.titulo, subasta.mejor_oferta.precio, subasta.terminada, subasta.id);
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
      agregarAlDivMisSubastas(subasta);
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

function agregarAlDivMisSubastas(unaSubasta){
  var vistaSubasta = sprintf("<div class=\"form-group\" id=\"div%s\">", unaSubasta.titulo);
  vistaSubasta += sprintf("<label class=\"control-label col-sm-2\">%s</label>", unaSubasta.titulo);
  vistaSubasta += sprintf("<div class=\"col-sm-10\">");
  vistaSubasta += sprintf("<button class=\"btn btn-default\" onclick=\"cancelarSubasta('%s')\">Cancelar Subasta</button>",unaSubasta.titulo);
  vistaSubasta += "</div></div>";
  $('#misSubastas').append(vistaSubasta);

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

function cancelarSubasta(titulo){

  $.ajax({
    headers: { 'id-usuario': idUsuario },
    type: "POST",
    url: location.origin + "/api/subastas/" + titulo + "/cancelar",
    success: function (data) {
      console.log("Se Cancelo la Subasta Correctamente.");
      eliminarMiSubasta(titulo);
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("Crear Subasta - Hubo un error en el servidor");
      console.log(JSON.stringify(jqXHR) + ". " + JSON.stringify(textStatus) + ". " + JSON.stringify(errorThrown));
    }
  });


}

function eliminarMiSubasta(titulo){
  $("#div"+titulo).remove();
  misSubastas = $.grep(misSubastas, function(elem, index) {
   return elem.titulo != titulo;
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
