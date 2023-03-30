export class Dpto{
    id:string;
    name_dpto:string; 
    cod_dpto:string;
    created_at:string;
    updated_at:string;
}
export class Impuestos{
    id:string;
    name_impuesto:string; 
    valor_impuesto:string;
    letra_impuesto:string;
}
export class FPago{
    id:string;
    name_fpago:string; 
    img_fpago:string;
    id_literal:string;
    moneda_local:string;
}
export class Articulos{
    id:string;
    namename_articulos_fpago:string; 
    price_bs:string;
    price_usd:string;
    id_dpto:string;
    id_impuesto:string;
}
export class Barras{
    id:string;
    cod_barra:string; 
    id_articulo:string;
}

export class Clientes{
    id:string;
    name_cliente:string; 
    number_id:string;
    email:string;
    number_tlf:string;
}