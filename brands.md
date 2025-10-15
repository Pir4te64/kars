GET
/brands/
Obtener marcas
Retorna una lista paginada de marcas. Permite filtrar por nombre de marca, si tiene precios 0km o no, si tiene precios usados o no, por año o rango de años de comercialización, por rango de precios 0km o usados y por cualquiera de los datos extras listados en /features/.

Parameters
Try it out
Name	Description
query_string
string
(query)
Nombre de marca

Default value :

query_string
query_mode
string
(query)
Modo de búsqueda

Available values : matching, similarity

Default value : matching


matching
list_price
boolean
(query)
Tiene precio 0km

Default value : null


--
prices
boolean
(query)
Tiene precios usados

Default value : null


--
price_at
integer($int32)
(query)
Tiene precio usado en un año dado

Default value : null

price_at
prices_from
integer($int32)
(query)
Tiene precios usados desde un año dado

Default value : null

prices_from
prices_to
integer($int32)
(query)
Tiene precios usados hasta un año dado

Default value : null

prices_to
prices_min
number
(query)
Tiene precios usados mayores o iguales a un valor dado

Default value : null

prices_min
prices_max
number
(query)
Tiene precios usados menores o iguales a un valor dado

Default value : null

prices_max
list_price_min
number
(query)
Tiene precio 0km mayor o igual a un valor dado

Default value : null

list_price_min
list_price_max
number
(query)
Tiene precio 0km menor o igual a un valor dado

Default value : null

list_price_max
feature_1
array[string]
(query)
Combustible

Available values : DSL, ELE, GNC, GNF, MHV, NAF, HYB, HID, PHV

--DSLELEGNCGNFMHVNAFHYBHIDPHV
feature_2
array[string]
(query)
Alimentación

Available values : BOM, CAR, IDI, IIN, SPI, MPI, TA, TD, TDI

--BOMCARIDIIINSPIMPITATDTDI
feature_3
array[string]
(query)
Tipo de vehículo

Available values : CAB, SPE, LIV, PES, COL, CUP, FUA, FUB, JEE, MBU, MIV, PKA, PKB, PB4, RUR, SED, VAN, WAG, WA4

--CABSPELIVPESCOLCUPFUAFUBJEEMBUMIVPKAPKBPB4RURSEDVANWAGWA4
feature_4
array[string]
(query)
Cabina (en Pick-Up)

Available values : CABD, CADO, CAEX, CABS, SCAB

--CABDCADOCAEXCABSSCAB
feature_5
array[string]
(query)
Dirección

Available values : ASI, NOR

--ASINOR
feature_6
array[string]
(query)
Tracción

Available values : 4X2, 4X4, 6X2, 6X4, 8X2, 8X4, DEL, PER, TRA

--4X24X46X26X48X28X4DELPERTRA
feature_7
array[string]
(query)
Caja

Available values : AUT, MAN

--AUTMAN
feature_8
array[string]
(query)
Sensor de estacionamiento

Available values : AL, CA, NO

--ALCANO
feature_9
array[string]
(query)
Llantas de aleación

Available values : 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, NO

--1314151617181920212223NO
feature_10
array[string]
(query)
Techo panorámico

Available values : NO, EL, SI

--NOELSI
feature_11
array[string]
(query)
Cantidad de puertas

Available values : 1, 2, 3, 4, 5, 6

--123456
feature_12
array[number]
(query)
Cilindrada

feature_13
array[number]
(query)
Largo

feature_14
array[number]
(query)
Ancho

feature_15
array[number]
(query)
Alto

feature_16
array[integer]
(query)
Peso

feature_17
array[integer]
(query)
Velocidad máxima

feature_18
array[integer]
(query)
Potencia HP

feature_19
array[boolean]
(query)
Es usado para carga

feature_20
array[boolean]
(query)
Aire Acondicionado

feature_21
array[string]
(query)
Importado

Available values : SI, MX, NO

--SIMXNO
feature_22
array[boolean]
(query)
Frenos ABS

feature_23
array[boolean]
(query)
AirBag

feature_24
array[string]
(query)
Climatizador

Available values : BIZ, CUA, NOR, NO, TRZ

--BIZCUANORNOTRZ
feature_25
array[boolean]
(query)
Faros antiniebla

feature_26
array[boolean]
(query)
Techo corredizo

feature_27
array[boolean]
(query)
AirBag lateral

feature_28
array[boolean]
(query)
AirBag Frontales

feature_29
array[boolean]
(query)
AirBag cortina

feature_30
array[boolean]
(query)
AirBag rodilla

feature_31
array[boolean]
(query)
Fijación ISOFIX

feature_32
array[boolean]
(query)
Control de tracción

feature_33
array[boolean]
(query)
Control de estabilidad

feature_34
array[boolean]
(query)
Control de descenso

feature_35
array[boolean]
(query)
Control dinámico de conducción

feature_36
array[boolean]
(query)
Sistema de arranque pendiente

feature_37
array[boolean]
(query)
Bloqueo diferencial

feature_38
array[boolean]
(query)
Rep. elec. de frenado

feature_39
array[boolean]
(query)
Asistente de frenado de emergencia

feature_40
array[boolean]
(query)
Reg. par de frenado

feature_41
array[boolean]
(query)
Tapizado de cuero

feature_42
array[boolean]
(query)
Asientos eléctricos

feature_43
array[boolean]
(query)
Computadora de abordo

feature_44
array[string]
(query)
Faros de xenón

Available values : LD, NO, XE

--LDNOXE
feature_45
array[boolean]
(query)
Sensor de lluvia

feature_46
array[boolean]
(query)
Sensor crepuscular

feature_47
array[boolean]
(query)
Indicador de presión en neumáticos

feature_48
array[boolean]
(query)
Volante con levas

feature_49
array[boolean]
(query)
Bluetooth

feature_50
array[boolean]
(query)
Asientos térmicos

feature_51
array[boolean]
(query)
Run flat

feature_52
array[boolean]
(query)
Alarma luces

feature_53
array[boolean]
(query)
Asistente estacionamiento

feature_54
array[boolean]
(query)
Botón de arranque

feature_55
array[boolean]
(query)
Cierre centralizado comando a distancia

feature_57
array[string]
(query)
Espejo exterior eléctricos

Available values : ABA, NOR, NO

--ABANORNO
feature_58
array[string]
(query)
Levanta vidrios eléctricos

Available values : 2, 4, NO

--24NO
feature_59
array[boolean]
(query)
Conectividad

feature_60
array[boolean]
(query)
Navegador satelital

feature_61
array[boolean]
(query)
Pantalla

feature_62
array[boolean]
(query)
Start/Stop

feature_64
array[string]
(query)
Apertura portón

Available values : INT, IML, MAL, MAN

--INTIMLMALMAN
feature_65
array[string]
(query)
Frenos delanteros

Available values : DIS, DIV, TAM

--DISDIVTAM
feature_66
array[string]
(query)
Frenos traseros

Available values : DIS, DIV, TAM

--DISDIVTAM
feature_67
array[number]
(query)
Relación peso / potencia (Kg/HP)

feature_68
array[number]
(query)
Autonomía

feature_69
array[integer]
(query)
Capacidad tanque combustible (litros)

feature_70
array[number]
(query)
Aceleración 0-100 km/h (segundos)

feature_71
array[number]
(query)
Consumo ciudad (litros cada 100 km)

feature_72
array[number]
(query)
Consumo promedio (litros cada 100 km)

feature_73
array[number]
(query)
Consumo ruta (litros cada 100 km)

feature_74
array[boolean]
(query)
Advertencia de colisión

feature_75
array[boolean]
(query)
Advertencia salida de carril

feature_76
array[boolean]
(query)
Alerta por cansancio

feature_77
array[boolean]
(query)
Bloqueo de puertas

feature_78
array[boolean]
(query)
Control de frenado en curva

feature_79
array[string]
(query)
Control velocidad de crucero

Available values : ADA, NOR, NO

--ADANORNO
feature_80
array[boolean]
(query)
Espejo interior fotocromático

feature_81
array[boolean]
(query)
Sistema mantenimiento de carril

feature_82
array[string]
(query)
Ópticas delanteras

Available values : LED, NOR, XEN

--LEDNORXEN
feature_83
array[integer]
(query)
Capacidad baúl (litros)

feature_84
array[string]
(query)
Ópticas traseras

Available values : LED, NOR, XEN

--LEDNORXEN
feature_85
array[boolean]
(query)
Limitador de velocidad

feature_89
array[integer]
(query)
Torque Nm

feature_90
array[string]
(query)
Admisión

Available values : ATM, SUP, TA

--ATMSUPTA
feature_91
array[integer]
(query)
Potencia Motor Electrico HP

feature_92
array[integer]
(query)
Potencia Combinada HP

feature_93
array[integer]
(query)
Torque Motor Electrico Nm

feature_94
array[integer]
(query)
Torque Combinado Nm

page
integer($int32)
(query)
Página

Default value : 1

1
page_size
integer($int32)
(query)
Tamaño de página

Default value : 10

10
Responses
Code	Description	Links
200	
OK

Media type

application/json
Controls Accept header.
Example Value
Schema
[
  {
    "id": 0,
    "list_price": true,
    "logo_url": "string",
    "name": "string",
    "prices": true,
    "prices_from": 0,
    "prices_to": 0,
    "summary": "string",
    "similarity": 0
  }
]
Headers:
Name	Description	Type
X-RateLimit-Limit	
El número de requests permitidas en la ventana actual

integer
X-RateLimit-Remaining	
El número de requests restantes en la ventana actual

integer
X-RateLimit-Reset	
Segundos desde epoch cuando la ventana será reiniciada

integer
Retry-After	
Segundos que se debe esperar para que la ventana sea reiniciada

integer
X-Pagination	
Metadatos de la paginación

object
No links
422	
Unprocessable Entity

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "status": "string",
  "errors": {},
  "code": 0
}
No links
default	
Default error response

Media type

application/json
Example Value
Schema
{
  "message": "string",
  "status": "string",
  "errors": {},
  "code": 0
}