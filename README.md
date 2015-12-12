# IascSubastas - IASC-2c-2015


##  Instalación

  1. Instalar dependencias `mix deps.get`
  2. Crear y migrar la base de datos con `mix ecto.create && mix ecto.migrate` (es necesario tener PostgreSQL)

## Levantar la aplicación

  1. Levantar el server principal:
    ```bash
      > iex --sname main -S mix phoenix.server
    ```

  2. Levantar el server de backup:
    ```bash
      > failover='main@<hostname>' iex --sname backup -S mix phoenix.server
    ```

  El server de backup pinguea al server principal, cuando detecta que está caido el se inicia el server http en el server de backup.

## Aclaraciones

  1. Los registros de usuario son implícitos: Para simplificar, no considerando cuestiones de seguridad, asumimos que quien está mandando la petición http puede realizar la acción y mandará su nombre en el cuerpo cuando sea necesario. Consideramos al nombre cómo identificador de los compradores o vendedores.
  2. No encontramos la forma de ejecutar una app phoenix distribuida por lo que implementamos manualmente el server de failover.

## Api

### Crear una subasta

```
POST /api/subastas

body:

{
    "subasta": {
        "titulo": "subasta 2",
        "precio_base": 100,
        "duracion": 5000,
        "vendedor": "pablo"
    }
}
```

### Cancelar una subasta

```
POST /api/subastas/:id_subasta/cancelar
```

### Ofertar

```
POST /api/subastas/:id_subasta/ofertas

body:

{
    "oferta": {
        "precio": 20000,
        "comprador": "pablo"
    }
}
```

## Subasta worker

Es un GenServer que se encarga de notificar a la app http que se termina una subasta.
Cuando inicia carga las subastas activas de la db y cada vez que se agrega una hay que mandarle un cast con {:nueva_subasta, subasta_id}.


# Enunciado
TP final de Arquitecturas Concurrentes

1. El problema
2. Las tecnologías
3. Formato de entrega y evaluación
4. Dominio
* Escenario 1: Adjudicación Simple
* Escenario 2: Adjudicación con Competencia
* Escenario 3: Cancelación de la Subasta
* Escenario 4: Registración en tiempo real
* Escenario 5: Subastas múltiples
* Escenario 6: Caída del servidor

##1 El problema

Queremos implementar un API HTTP para un servicio de subastas de elementos on-line. Momentáneamente queremos concentrarnos sólo en:
- el protocolo de comunicación
- persistencia

No vamos preocuparnos por ahora por:
- cuestiones de UI
- cuestiones de seguridad
- cuestiones de performance

En esta primera etapa vamos a construir una prueba de concepto de la arquitectura; los únicos requerimientos no funcionales son:
- que soporte acceso concurrente de múltiples usuarios
- que proponga una forma de escalar horizontalmente
- que sea tolerante a fallos tanto de red como de implementación

##2 Las tecnologías

Se podrá utilizar cualquier tecnología que aplique alguno de los siguientes conceptos vistos en la cursada:
- Paso de mensajes basado en actores
- Continuaciones explícitas (CPS)
- Promises
- Memoria transaccional

Obviamente, lo más simple es basarse en Elixir/OTP, Haskell, o Node.js, que son las tecnologías principales que vimos en la materia.
Otras opciones son tecnologías basadas en Scala/Akka, Go, Clojure, etc, pero ahi te podremos dar menos soporte

##3 Formato de entrega y evaluación

Se deberá construir el sistema descrito, tanto el servidor como clientes de prueba. No es obligatoria la construcción de casos de prueba automatizados, pero constituye un gran plus.
Se evaluará que:
- el sistema cumpla con los requerimientos planteados
- haga un uso adecuado de la tecnología y los conceptos explicados en la materia

##4 Dominio

En lugar de describir el dominio, vamos a presentarlo a través de algunos escenarios.

###4.1 Escenario 1: Adjudicación Simple

1. Un comprador A se registra en el sistema,  expresando así su interés por participar en subastas. Indica al menos:
- un nombre
- una forma de contacto
2. Otro comprador B se registra de igual forma en el sistema
3. Un vendedor crea una subasta, con la siguiente información
- Un título
- Un precio base (que puede ser cero)
- La duración máxima de la subasta
4. El sistema publica el título y expiración de la subasta a todos los compradores (en este caso, a los compradores A y B).
5. El comprador A publica un precio X
- El sistema le notifica que su oferta fue aceptada
- los demás compradores (B en este caso) son notificados de un nuevo precio
6. Al cumplirse el timeout,
- la subasta cierra,
- Se adjudica a A como el comprador, y se le notifica apropiadamente
- B es notificado de la finalización de la subasta y de que no le fue adjudicada

###4.2 Escenario 2: Adjudicación con Competencia

Similar al escenario anterior, pero antes de terminar la subasta, B oferta un precio mayor, y al cumplirse el plazo, se le adjudica a éste.
Obviamente, este proceso de superar la oferta anterior puede repetirse indefinidamente mientras la subasta esté abierta.

###4.3 Escenario 3: Cancelación de la Subasta

Similar a los escenarios anteriores, pero el vendedor cancela la subasta antes de la expiración de la subasta y adjudicación del ganador. En este caso, obviamente, nadie gana la subasta, y todos los compradores son notificados.

###4.4 Escenario 4: Registración en tiempo real

Similar a los escenarios anteriores, pero un tercer participante, C, se registra después de que la subasta inició y antes de que termine. C podrá hacer ofertas y ganar la subasta como cualquier otro participante (A y B, en este caso)

###4.5 Escenario 5: Subastas múltiples

Mientras una subasta está en progreso, un vendedor (que puede ser el mismo de la anterior u otro) crea una nueva subasta, y las dos subastas estarán en progreso en simultáneo, funcionando cada una de ellas como siempre.  

###4.6 Escenario 6: Caída del servidor

Con la subasta ya en progreso, el servidor abruptamente falla por un error de hardware. En no más de 5 segundos un segundo servidor debe levantarse y continuar con la subasta.
Esto significa que de alguna forma los clientes tienen que dejar de hablar con el servidor caído, para empezar a hablar con el nuevo servidor.

Vamos a considerar en el error kernel (es decir, los datos que no podemos perder) a:
- la existencia de la subasta
- si empezó
- y si terminó, con qué precio y a quien se le adjudicó
- la mayor oferta aceptada hasta ahora dentro de la subasta

Cuando se produce una caída, se debería extender el plazo de la subasta en 5 segundos.
