
CREATE TABLE IF NOT EXISTS maestra_departamentos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_dpto TEXT, 
    cod_dpto TEXT,
    created_at TEXT,
    update_at TEXT
);

INSERT or IGNORE INTO maestra_departamentos(id, name_dpto, cod_dpto) 
VALUES (1, 'Departamento de Pruebas', '1');

INSERT or IGNORE INTO maestra_departamentos(id, name_dpto, cod_dpto) 
VALUES (2, 'Departamento de Pruebas 2', '1');

CREATE TABLE IF NOT EXISTS maestra_clientes(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_cliente TEXT, 
    number_id TEXT,
    email TEXT,
    number_tlf TEXT
);
INSERT or IGNORE INTO maestra_clientes(id, name_cliente, number_id, email,number_tlf) 
VALUES (1, 'Egnis R Pinto H', 'V-20300215', 'egnis.pinto@gmail.com', '04242827763');

INSERT or IGNORE INTO maestra_clientes(id, name_cliente, number_id, email,number_tlf) 
VALUES (2, 'Egnis R Pinto H 2', 'V-20300215', 'egnis.pinto@gmail.com', '04242827763');

CREATE TABLE IF NOT EXISTS tienda_impuestos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_impuesto TEXT, 
    valor_impuesto TEXT,
    letra_impuesto TEXT
);

INSERT or IGNORE INTO tienda_impuestos(id, name_impuesto, valor_impuesto, letra_impuesto) 
VALUES (1, 'IVA 16%', '1600', 'G');
INSERT or IGNORE INTO tienda_impuestos(id, name_impuesto, valor_impuesto, letra_impuesto) 
VALUES (2, 'IVA 8%', '800', 'R');
INSERT or IGNORE INTO tienda_impuestos(id, name_impuesto, valor_impuesto, letra_impuesto) 
VALUES (3, 'IVA 31%', '3100', 'A');
INSERT or IGNORE INTO tienda_impuestos(id, name_impuesto, valor_impuesto, letra_impuesto) 
VALUES (4, 'IVA EXENTO', '0', 'E');

CREATE TABLE IF NOT EXISTS tienda_moneda(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_moneda TEXT, 
    simbolo TEXT,
    mdisabled TEXT,
    moneda_local TEXT,
    principal TEXT
);
INSERT or IGNORE INTO tienda_moneda(id, name_moneda, simbolo, mdisabled,moneda_local,principal) 
VALUES (1, 'BOLIVAR SOBERANO', 'Bs', 'yes', 'yes','yes');
INSERT or IGNORE INTO tienda_moneda(id, name_moneda, simbolo, mdisabled,moneda_local,principal) 
VALUES (2, 'DOLARES AMERICANO', 'USD', 'yes', 'no','yes');
INSERT or IGNORE INTO tienda_moneda(id, name_moneda, simbolo, mdisabled,moneda_local,principal) 
VALUES (3, 'REAIS', 'R$', 'yes', 'no','no');

CREATE TABLE IF NOT EXISTS tienda_fpago(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_fpago TEXT,
    mlocal TEXT,
    paridad TEXT
);

INSERT or IGNORE INTO tienda_fpago(id, name_fpago, mlocal,paridad) 
VALUES (1, 'EFECTIVO', 'true', '0');
INSERT or IGNORE INTO tienda_fpago(id, name_fpago, mlocal,paridad) 
VALUES (2, 'DEBITO', 'true', '0');
INSERT or IGNORE INTO tienda_fpago(id, name_fpago, mlocal,paridad) 
VALUES (3, 'CREDITO', 'true', '0');
INSERT or IGNORE INTO tienda_fpago(id, name_fpago, mlocal,paridad) 
VALUES (4, 'DOLARES', 'false', '1');

CREATE TABLE IF NOT EXISTS maestra_articulos(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name_articulo TEXT, 
    price_bs TEXT,
    price_usd TEXT,
    id_dpto TEXT,
    id_impuesto TEXT,
    url_img TEXT
);
INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (1, 'Hamburguesa Sencilla', '3000000','1','1','1','/assets/items/1.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (2, 'hamburguesa Especial', '4500000','1.5','1','1','/assets/items/2.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (3, 'Hamburguesa mas Bebida', '5400000','1.8','1','1','/assets/items/2.png');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (4, 'Hot Dogs', '2400000','0.8','1','1','/assets/items/3.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (5, 'Pepito', '6000000','2','1','1','/assets/items/4.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (6, 'Shawarma', '9000000','3','1','1','/assets/items/5.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (7, 'Enrollado', '3000000','1','1','1','/assets/items/7.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (8, 'Dulce Frio', '6000000','2','1','1','/assets/items/8.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (9, 'Dulce Frio', '4500000','1.5','1','1','/assets/items/9.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (10, 'Cerveza', '9000000','3','1','1','/assets/items/10.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (11, 'Cerveza', '10500000','3.5','1','1','/assets/items/11.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (12, 'Bebidas Varias', '3000000','1','1','1','/assets/items/12.jpg');

INSERT or IGNORE INTO maestra_articulos(id, name_articulo, price_bs, price_usd, id_dpto, id_impuesto, url_img) 
VALUES (13, 'Cerveza Ambar', '13500000','4.5','1','1','/assets/items/14.jpg');

--Se debe crear al menos una barra por articulo con el mismo codigo del articulo
CREATE TABLE IF NOT EXISTS maestra_barras(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    cod_barra TEXT, 
    id_articulo TEXT
);

/* SECCION DE TABLAS DE VENTAS */

CREATE TABLE IF NOT EXISTS salebusinessdate(
    id integer PRIMARY KEY  AUTOINCREMENT,
    begin_date text,
    end_date text
);

CREATE TABLE IF NOT EXISTS salereturn(
    id integer PRIMARY KEY  AUTOINCREMENT,
    trans_origin integer,
    pos_origin integer,
    trans_destination integer,
    pos_destination integer,
    date_return text
);
CREATE TABLE IF NOT EXISTS salereturn_detail(
    id_salereturn integer,
    trans_origin integer,
    trans_destination integer,
    linetrans_origin integer,
    articulo bigint,
    pludesc text,
    cantidadreturn integer,
    amtsold bigint,
    totalivaproducto bigint,
    totalreal integer
);
CREATE TABLE IF NOT EXISTS saleheader(
    trans integer PRIMARY KEY  AUTOINCREMENT,
    pos integer ,
    linetrans integer,
    saletype integer,
    salestatus integer,
    printerstatus integer,
    fechainicio text,
    horainicio text,
    fechaculminacion text,
    horaculminacion text,
    cajero text,
    id_salebusiness integer
);

CREATE TABLE IF NOT EXISTS saleitems(
    trans integer,
    pos integer,
    linetrans integer,
    articulo bigint,
    pludesc text,
    price1 bigint,
    deptid text,
    impuestoid integer,
    amtsold bigint,
    totalivaproducto bigint,
    cantidadvendido integer,
    devueltos integer,
    anulado integer,
    totalreal integer,
    descuentoitem integer
);

CREATE TABLE IF NOT EXISTS salepayments(
    trans integer,
    pos integer,
    linetrans integer,
    formapagoid integer,
    descformapago text,
    monto bigint,
    vuelto bigint,
    moneda_local text,
    monto_divisa text,
    tasa_calculo text
);

CREATE TABLE IF NOT EXISTS salefoot(
    trans integer,
    pos integer,
    linetrans integer,
    hora text,
    fecha text,
    neto bigint,
    bruto bigint,
    iva bigint,
    montoimpuesto bigint,
    numeroz bigint,
    factura bigint,
    impresora text,
    clienteid text,
    nombre text
);

--add 14/05/21
--Primero una tabla para el manejo de las tasas
CREATE TABLE IF NOT EXISTS tienda_tasas(
    id  integer PRIMARY KEY  AUTOINCREMENT,
    monto_tasa  text,
    fecha_cambio   text,
    hora_cambio     text,
    vigente text
);

INSERT or IGNORE INTO tienda_tasas(id, monto_tasa, fecha_cambio,hora_cambio, vigente) 
VALUES (1, '3000000', '2021/05/14','16:11','true');

CREATE TABLE IF NOT EXISTS tienda_configuracion(
    clave  text PRIMARY KEY,
    valor   text
);
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('STORE_NAME','');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('MONEDA_LOCAL','VEF');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('MONEDA_EXTRANJERA','USD');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('SIMBOLO_MONEDA_LOCAL','Bs');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('SIMBOLO_MONEDA_EXTRANJERA','$');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('ORIENTACION','portrait');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('TRABAJAR_SIN_IMPRESORA','false');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('IP_IMPRESORA','192.168.1.2');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('PUERTO_IMPRESORA','5000');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('CONECTAR_IMPRESORA_INICIAR','false');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('IMPRIMIR_TRANSACCION','true');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('IMPRIMIR_PAGOS','false');
INSERT or IGNORE INTO tienda_configuracion(clave, valor) 
VALUES ('IMPRIMIR_ESPACIO_FIRMA','false');

CREATE TABLE IF NOT EXISTS tienda_bufferprinter(
    fecha  text,
    hora   text,
    ipconexion text,
    puertoconexion text,
    accion   text,
    trama text
);
