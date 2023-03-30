
export interface Generaldb {
}
//de maestra_departamentos
export interface DptoInterface{
    id:string;
    name_dpto:string; 
    cod_dpto:string;
    created_at:string;
    updated_at:string;
}
//tienda_impuestos
export interface Impuestos{
    id:string;
    name_impuesto:string; 
    valor_impuesto:any;
    letra_impuesto:string;
}
//de tienda_fpago
export interface Pagos{
    id:string;
    name_fpago:string; 
    mlocal:string;
    paridad:string;
    recargo:string;
    porcentaje_recargo:string;
}
//de tienda_moneda
export interface Moneda{
    id:string;
    name_moneda:string; 
    simbolo:string;
    mdisabled:string;
    moneda_local:string;
    principal:string;
}
//de maestra_articulos
export interface Articulos{
    id:string;
    name_articulo:string;
    price_bs:any;
    price_usd:string;
    id_dpto:string;
    id_impuesto:string;
    url_img:string;
    requiere_peso:string;
    requiere_precio:string;
}
//de maestra_barras
export interface Barras{
    id:string;
    id_articulo:string;
    cod_barra:string;
}

export interface saledate{
    id: Number;
    begin_date: string;
    end_date: string;
}
export interface Header{
    trans :Number;
    pos :Number ;
    linetrans :Number;
    saletype :Number;
    salestatus :Number;
    printerstatus :Number;
    fechainicio :string;
    horainicio :string;
    fechaculminacion :string;
    horaculminacion :string;
    cajero :string;
    id_salebusiness :Number;
    recargo : string;
    porcentaje_recargo : Number;
} 
export interface Items{
    trans :Number;
    pos :Number;
    linetrans :Number;
    articulo :Number;
    pludesc :string;
    price1 :Number;
    deptid :string;
    impuestoid :Number;
    amtsold :Number;
    totalivaproducto :Number;
    cantidadvendido :Number;
    devueltos :Number;
    anulado :Number;
    totalreal :Number;
    descuentoitem :Number;
}
export interface Payments{
    trans :Number;
    pos :Number;
    linetrans :Number;
    formapagoid :Number;
    descformapago :string;
    monto :Number;
    vuelto:Number;
    moneda_local:string;
    monto_divisa:string;
    tasa_calculo:string;
    valor_recargo_igtf:string;
    porcentaje_recargo_igtf:string;
}
export interface Foot{
    trans :Number;
    pos :Number;
    linetrans :Number;
    hora :string;
    fecha :string;
    neto :Number;
    bruto :Number;
    iva :Number;
    montoimpuesto :Number;
    numeroz :Number;
    factura :Number;
    impresora :string;
    clienteid :string;
    nombre :string;
}

export interface Acumuladores{
    valid : boolean;
    TOTAL  : any;
    IVA : any;
    SUBTOTAL : any;
}

export interface LibraryItem {
    id: string;
    photoURL: string;
    thumbnailURL: string;
    fileName: string;
    width: number;
    height: number;
    creationDate: Date;
    latitude?: number;
    longitude?: number;
    albumIds?: string[];
  }

export interface GetLibraryOptions {
    thumbnailWidth?: number;
    thumbnailHeight?: number;
    quality?: number;
    itemsInChunk?: number;
    chunkTimeSec?: number;
    useOriginalFileNames?: boolean;
    includeImages?: boolean;
    includeAlbumData?: boolean;
    includeCloudData?: boolean;
    includeVideos?: boolean;
    maxItems?: number;
}

export interface RequestAuthorizationOptions {
    read?: boolean;
    write?: boolean;
}

export interface Configuracion{
    clave : string;
    valor  : string;
}


export interface BufferPrinter{
    fecha : string;
    hora : string;
    ipconexion:string;
    puertoconexion:string;
    accion:string;
    trama:string;
}

export interface CloudConfiguracion{
    clave : string;
    valor  : string;
}
export interface cloud_task_sendfile{
    id : Number;
    id_send  : string;
    statussend  : string;
}