
//Funciones que se ejcutan en el index.html

var idUsuario;
var clienteA = {subastas: [], sufijoDiv: "1A"};
var clienteB = {subastas: [], sufijoDiv: "1B"};
var vendedor1 = {subastas: []};
/*
cliente: {nombre:, socket:, channel:, subastas}
vendedor: {nombre:, socket:, channel:, subastas}
*/

function initialize() {

}

function renderizarSubasta(subasta, cliente){
  /*
  <div class="thumbnail">
    <div class="caption" id="asd">
    <h3>casa</h3><p>$ 5.</p><p>Finalizada: si.</p><p>
    <button class="btn btn-primary" onclick="ofertar(asd)"> Ofertar (+ $2)! </button></p>
    </div>
  </div>
  */
  if (subasta.mejor_oferta == null) subasta.mejor_oferta = {precio: subasta.precio_base};
  var vistaSubasta = sprintf("<div class=\"thumbnail\" id=\"%s\">", "thumbnail_" + cliente.sufijoDiv + "_"  + subasta.titulo);
  vistaSubasta += sprintf("<div class=\"caption\" id=\"%s\">", cliente.sufijoDiv + "_"  + subasta.titulo);
  vistaSubasta += sprintf("<h3>%s</h3><p id= \"%s \">$ %s.</p><p id=\"%s\">%s.</p><p>" +
        "<button class=\"btn btn-primary\" onclick=\"ofertar(%s,%s)\"> Ofertar (+ $2)! </button></p>",
        subasta.titulo,"precio_" + cliente.sufijoDiv + "_" + subasta.titulo , subasta.mejor_oferta.precio,
        "estado_" + cliente.sufijoDiv + "_" + subasta.titulo, estadoDeSubasta(subasta), cliente.nombre, subasta.titulo);
  vistaSubasta += "</div></div>";
  $('#subastasCliente' + cliente.sufijoDiv).append(vistaSubasta);
/*para modificar el precio actual despues hayu que buscar el elemento precio_sufijoDiv_titulo
*/
/*para eliminarla subasta actual hay que buscar el elemento "thumbnail_sufijoDiv_titulo
*/
/*para modificar el estado actual despues hayu que buscar el elemento estado_sufijoDiv_titulo
*/
}

function estadoDeSubasta(subasta){
  return subasta.terminada ? "Finalizada" : "Activa";
}

/*Cuando oferto,y sale todo bien, cambiar el valor del monto actual*/
function renderizarOfertaEnSubasta(oferta, cliente){
  /*para modificar el precio actual despues hayu que buscar el elemento precio_sufijoDiv_titulo
  */
  console.log("A punto de renderizar el cambio del monto actual de la subasta");
  $("#precio_" + cliente.sufijoDiv +"_" + oferta.titulo ).html("$" + oferta.precio);

  var subasta = $.grep(cliente.subastas, function(elem){ return elem.titulo === tituloSubasta; })[0];
  subasta.precio = oferta.precio; //Update del precio en la pagina

}


function ofertar(nombreCliente,tituloSubasta){

  var clienteDeLaOferta;
  if(nombreCliente == clienteA.nombre)
    cilenteDeLaOferta = clienteA;
  else
    clienteDeLaOferta = clienteB;

  console.log("A punto de ofertar...");
  var oferta = armarOferta(tituloSubasta, clienteDeLaOferta);
  $.ajax({
    headers: { 'id-usuario': clienteDeLaOferta.nombre },
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(oferta),
    url:   location.origin + "/api/subastas/"+ tituloSubasta + "/ofertas",
    success: function (data) {
      console.log("Se Oferto Correctamente.");
      renderizarOfertaEnSubasta(JSON.parse(oferta),clienteDeLaOferta);
    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("Ofertar - Hubo un error en el servidor");
      console.log(JSON.stringify(jqXHR) + ". " + JSON.stringify(textStatus) + ". " + JSON.stringify(errorThrown));
    }
  });
}

function armarOferta(tituloSubasta, cliente){

  var subasta = $.grep(cliente.subastas, function(elem){ return elem.titulo === tituloSubasta; })[0];
  return {oferta:  {precio: subasta.mejor_oferta.precio+2, comprador: cliente.nombre, titulo: tituloSubasta} };
}


function crearNuevaSubasta(){
  console.log("A punto de crear nueva subasta...");
  var subasta = armarSubasta();
  console.log("contenido del json subasta:" + JSON.stringify(subasta));

  $.ajax({
    //headers: { 'id-usuario': idUsuario },
    type: "POST",
    contentType: "application/json",
    data: JSON.stringify(subasta),
    url: location.origin + "/api/subastas",
    success: function (data) {
      console.log("Se Creo al Subasta Correctamente.");
      vaciarForm();
      agregarAlDivSubastasVendedor(JSON.parse(subasta));
      vendedor1.subastas.push(JSON.parse(subasta));
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
         vendedor: $("#nombreVendedor1").val(),
         titulo: $("#tituloNuevaSubasta").val(),
         duracion: $("#duracionNuevaSubasta").val(),
         /* EN segundos
         O si queres poner el tiempo final
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

function agregarAlDivSubastasVendedor(unaSubasta){
  var vistaSubasta = sprintf("<div class=\"form-group\" id=\"div%s\">", "vendedeor_" + unaSubasta.titulo);
  vistaSubasta += sprintf("<label class=\"control-label col-sm-2\">%s</label>", unaSubasta.titulo);
  vistaSubasta += sprintf("<div class=\"col-sm-10\">");
  vistaSubasta += sprintf("<button class=\"btn btn-default\" onclick=\"cancelarSubasta('%s')\">Cancelar Subasta</button>",unaSubasta.titulo);
  vistaSubasta += "</div></div>";
  $('#subastasVendedor').append(vistaSubasta);

}




function cancelarSubasta(titulo){

  $.ajax({
    headers: { 'id-usuario': $("#nombreVendedor1").val() },
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


function registrarA(nombre){
  clienteA.nombre = $("#nombreCliente1A").val();
  clienteA.socket = new Phoenix.Socket("ws://" + location.host + "/ws");
  clienteA.socket.join("subastas", "general", {}, function(chann){

    chann.on("nueva:subasta", function(subasta){
      renderizarNuevaSubasta(subasta, clienteA);
    });

    chann.on("nueva:oferta", function(oferta){
      renderizarOfertaEnSubasta(oferta,clienteA);
    });

    chann.on("subasta:cancelada", function(subasta){
      renderizarCancelacionDeSubasta(subasta,clienteA);
    });

    chann.on("subasta:finalizada", function(subasta){
      renderizarFinalizacionDeSubasta(subasta,clienteA);
    });

    clienteA.channel = chann;
    /*los eventos de envio al servidor los pongo a parte, cuado se hacen los clicks en los botones.
    Todavia no se cuales son, asi que no peudo saberlo. Ejemplo:
    channelA.send("nueva:oferta", {
      content: $messageInput.val(),
      username: $usernameInput.val()
    });
    */
  });

  $.ajax({
    headers: { 'id-usuario': clienteA.nombre },
    type: "GET",
    contentType: "application/json",
    url: "/api/subastas",
    success: function (data) {
      console.log("Se obtuvieron correctamente las subastas.");
      $.each(data,function(index, unaSubasta){
          clienteA.subastas.push(unaSubasta);
          renderizarSubasta(unaSubasta,clienteA);
      });

    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("Get de subastas - Hubo un error en el servidor");
      console.log(JSON.stringify(jqXHR) + ". " + JSON.stringify(textStatus) + ". " + JSON.stringify(errorThrown));
    }
  });

}

function registrarB(nombre){
  clienteB.nombre = $("#nombreCliente1B").val();
  clienteB.socket = new Phoenix.Socket("ws://" + location.host + "/ws");
  clienteB.socket.join("subastas", "general", {}, function(chann){

    chann.on("nueva:subasta", function(subasta){
      renderizarNuevaSubasta(subasta, clienteB);
    });

    chann.on("nueva:oferta:", function(oferta){
      renderizarOfertaEnSubasta(oferta,clienteB);
    });

    chann.on("subasta:cancelada", function(subasta){
      renderizarCancelacionDeSubasta(subasta,clienteB);
    });

    chann.on("subasta:finalizada", function(subasta){
      renderizarFinalizacionDeSubasta(subasta,clienteB);
    });

    clienteB.channel = chann;
    /*los eventos de envio al servidor los pongo a parte, cuado se hacen los clicks en los botones.
    Todavia no se cuales son, asi que no peudo saberlo. Ejemplo:
    channelA.send("nueva:oferta", {
      content: $messageInput.val(),
      username: $usernameInput.val()
    });
    */
  });

  $.ajax({
    headers: { 'id-usuario': clienteB.nombre },
    type: "GET",
    contentType: "application/json",
    url: "/api/subastas",
    success: function (data) {
      console.log("Se obtuvieron correctamente las subastas.");
      $.each(data,function(index, unaSubasta){
          clienteA.subastas.push(unaSubasta);
          renderizarSubasta(unaSubasta,clienteA);
      });

    },
    error: function(jqXHR, textStatus, errorThrown){
      console.log("Get de subastas - Hubo un error en el servidor");
      console.log(JSON.stringify(jqXHR) + ". " + JSON.stringify(textStatus) + ". " + JSON.stringify(errorThrown));
    }
  });
}

function renderizarCancelacionDeSubasta(subasta, cliente){
  var subastaDeLista = $.grep(cliente.subastas, function(elem){ return elem.titulo === subasta.titulo; })[0];
  subastaDeLista.finalizada = true;
  $("thumbnail_" + cliente.sufijoDiv + "_"  + subasta.titulo).remove();
}

function renderizarFinalizacionDeSubasta(subasta,cliente){
  var subastaDeLista = $.grep(cliente.subastas, function(elem){ return elem.titulo === subasta.titulo; })[0];
  subastaDeLista.finalizada = true;
  if(ganadorDeLaSubasta(cliente,subasta))
    $("estado_" + cliente.sufijoDiv + "_"  + subasta.titulo).html("Ha ganado la Subasta");
  else
    $("estado_" + cliente.sufijoDiv + "_"  + subasta.titulo).html("Ha perdido la Subasta");
}

function ganadorDeLaSubasta(cliente,subasta){
  return subasta.nombreCliente === cliente.nombre;
}


function renderizarNuevaSubasta(subasta, cliente){
  cliente.subastas.push(subasta);
  renderizarSubasta(subasta,cliente);

}


function registrarVendedor1(nombre){
  vendedor1.nombre = $("#nombreVendedor1").val();
  vendedor1.socket = new Phoenix.Socket("ws://" + location.host + "/ws");
  vendedor1.socket.join("subastas", "general", {}, function(chann){
  vendedor1.channel = chann;
    /*los eventos de envio al servidor los pongo a parte, cuado se hacen los clicks en los botones.
    Todavia no se cuales son, asi que no peudo saberlo. Ejemplo:
    channelA.send("nueva:oferta", {
      content: $messageInput.val(),
      username: $usernameInput.val()
    });
    */
  });
}

function eliminarMiSubasta(titulo){
  $("#div"+titulo).remove();
  vendedor1.subastas = $.grep(vendedor1.subastas, function(elem, index) {
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
