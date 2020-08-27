"use strict";
                
import {TableDefinition, TableContext} from "./types-eseco";

export function tem(context:TableContext):TableDefinition {
    var isAdmin=context.user.rol==='admin';
    var isProcesamiento=context.user.rol==='procesamiento'
    var isCoordinador=context.user.rol==='direccion'
    var isSubCoordinador=context.user.rol==='coor_campo'
    var isRecepcionista=context.user.rol==='recepcionista'
    var isSupervisor=context.user.rol==='supervisor'
    
    var hasCampoPermissions = isAdmin||isCoordinador||isSubCoordinador

    var hasProcesamientoPermission=isProcesamiento || isAdmin;
    var hasCoordinadorPermission=isCoordinador || hasProcesamientoPermission;
    var hasSubCoordinadorPermission=isSubCoordinador || hasCoordinadorPermission;
    var hasRecepcionistaPermission=isRecepcionista || hasSubCoordinadorPermission;
    // var hasSupervisorPermission=isSupervisor || hasRecepcionistaPermission;

    return {
    "name": "tem",
    editable: true,
    //allow:{insert:hasCampoPermissions, delete:hasCampoPermissions},
    //"hiddenColumns":['carga_rol','carga_persona','cod_enc','cod_recu','cod_sup','result_sup','dispositivo','estado','tipo_estado' ],
    "fields": [
        {
            "name": "operativo",
            "editable": false,
            "typeName": "text",
            "nullable": false,
            "defaultValue": 'ESECO'
        },
        {
            "name": "enc",  // enc (integer)? 
            "editable": false,
            "typeName": "text",
            "nullable": false
        },
        {name: "abrir", typeName:'text',editable:false, inTable:false, clientSide:'abrir'},
        {name: "cluster", typeName:'integer',editable:false, isName:true},
        {
            "name": "enc_original",
            "editable": false,
            "typeName": "text",
        },
//        { name: "ver", typeName: 'text'    , clientSide:'verCaso', editable:false },
        {
            "name": "nrocomuna",
            editable: false,
            "typeName": "integer"
        },
        {
            "name": "nrofraccion",
            editable: false,
            "typeName": "integer"
        },
        {
            "name": "nroradio",
            editable: false,
            "typeName": "integer"
        },
        {
            "name": "nromanzana",
            editable: false,
            "typeName": "integer"
        },
        {
            "name": "nrolado",
            editable: false,
            "typeName": "integer"
        },
        {
            "name": "codviviendaparticular",
            editable: false,
            "typeName": "text"
        },
        {
            "name": "codcalle",
            editable: false,
            "typeName": "integer"
        },
        {
            "name": "nomcalle",
            editable: false,
            "typeName": "text"
        },
        {
            "name": "nrocatastral",
            "editable": false,
            "typeName": "integer"
        },
        {
            "name": "piso",
            "editable": false,
            "typeName": "text" 
        },
        {
            "name": "departamento",
            "editable": false,
            "typeName": "text"
        },
        {
            "name": "habitacion",
            "editable": false,
            "typeName": "text"
        },
        {
            "name": "sector",
            editable: false,
            "typeName": "text"
        },
        {
            "name": "edificio",
            editable: false,
            "typeName": "text"
        },
        {
            "name": "entrada",
            editable: false,
            "typeName": "text"
        },
        {
            "name": "casa",
            editable: false,
            "typeName": "text"
        },
        {
            "name": "obsdatosdomicilio",
            editable: false,
            "typeName": "text"
        },
        {
            "name": "obsconjunto",
            editable: false,
            "typeName": "text"
        },
        {
            "name": "usodomicilio",
            editable: false,
            "typeName": "integer"
        },
        {
            "name": "orden_relevamiento",
            editable: false,
            "typeName": "integer"
        },
        {
            "name": "mapa",
            editable: false,
            "typeName": "integer"
        },
        {
            "name": "barrio",
            "editable": false,
            "typeName": "text"
        },
        {
            "name": "json_encuesta",
            editable: false,
            "typeName":"jsonb"
        },
        {
            "name": "resumen_estado",
            editable: false,
            "typeName":"text"
        },
        { name:'etiqueta'         , typeName:'text'     },
        /*
        {
            "name": "operacion",
            editable: hasRecepcionistaPermission,
            "typeName": "text",
        },
        {
            "name": "carga_observaciones",  //va??? , pareceria por carga
            editable: hasRecepcionistaPermission,
            "typeName": "text"
        },
        {
            "name": "cargado_dm",
            editable: false,
            "typeName": "text"
        },
        {
            "name": "habilitada",
            editable: hasRecepcionistaPermission,
            "typeName": "boolean"
        },        
        
        {
            "name": "tipos_inconsist",
            editable: false,
            inTable: false,
            "typeName":"text"
        },        
        { name:'relevador'        , typeName:'text'     },
        { name:'rea_m'            , typeName:'integer'  },
        {name:'rea'           , typeName:'bigint' ,editable:false    },
        {name:'norea'         , typeName:'text'   ,editable:false    },
        {name:'rea_p'         , typeName:'bigint' ,editable:false      },
        {name:'norea_p'       , typeName:'text'   ,editable:false    },
        {name:'cant_p'        , typeName:'bigint' ,editable:false      },
        {name:'sexo_sel'      , typeName:'text'   ,editable:false    },
        {name:'edad_sel'      , typeName:'bigint' ,editable:false    },        
//        {name: "verificar"    , typeName:'boolean',editable:true, inTable:false, clientSide:'verificarCaso'},
//        {name: "finalizar_campo", typeName:'boolean',editable:true, inTable:false, clientSide:'finalizarCampo'}, //fin_de_campo
//        {name: "procesamiento", typeName:'boolean',editable:true, inTable:false, clientSide:'pasarAProcesamiento', label: 'pasar a procesamiento'}, //procesamiento
        {
        "name": "frel",
        editable: false,
        "typeName": "date"
        },
        */
        {
            "name": "tipo_domicilio",
            "editable": false,
            "typeName": "integer"
            //,visible: false
        },        
        {
            "name": "reserva",
            "editable": false,
            "typeName": "integer"
            //,visible: false
        },        
        {
            "name": "area",
            "editable": false,
            "typeName": "integer"
        },
        {
            "name": "dominio",
            "editable": false,
            "typeName": "integer"
            ,visible: true
        },
        {
            "name": "zona",
            "editable": hasProcesamientoPermission,
            "typeName": "text"
            ,visible: true
        },
        {
            "name": "periodicidad",
            "editable": false,
            "typeName": "text"
            ,visible: false
        },
        {
            "name": "participacion",
            "editable": false,
            "typeName": "integer"
            ,visible: false
        },
        {
            "name": "areaup",
            "editable": false,
            "typeName": "text"  //nullable por dominio 5
            ,visible: true
        },
        {
            "name": "rotacion_etoi",
            "editable": false,
            "typeName": "integer" 
            ,visible: false
        },
        {
            "name": "rotacion_eah",
            "editable": false,
            "typeName": "integer"
            ,visible: false
        },
        {
            "name": "trimestre",
            "editable": false,
            "typeName": "integer"
            ,visible: false
        },
        {
            "name": "procedencia",
            "editable": false,
            "typeName": "text" 
            ,visible: false
        },
        {
            "name": "sel_etoi_villa",
            "editable": false,
            "typeName": "integer"
            ,visible: false
        },
        {
            "name": "marco",
            "editable": false,
            "typeName": "integer"
            ,visible: true
        },
        {
            "name": "codpos",
            "editable": false,
            "typeName": "integer"
        },
        {
            "name": "estrato_ing",
            "editable": false,
            "typeName": "integer"
            ,visible: true
        },
        {
            "name": "id_marco",
            "editable": false,
            "typeName": "bigint"
        },
        {
            "name": "obs",
            "editable": false,
            "typeName": "text"
        },
        /*
        {name:'result_sup', typeName:'text' ,editable: hasRecepcionistaPermission  },
        {name:'obs_sup'   , typeName:'text' ,editable: isSupervisor     },
        {name:'obs_coor'  , typeName:'text' ,editable: isCoordinador || isSubCoordinador },
        {
            "name": "telefonos",
            "editable": false,
            "typeName": "text",
            visible: false,
            inTable: false
        },
        {
            "name": "seleccionado",
            "editable": false,
            "typeName": "text",
            visible: false,
            inTable: false
        },
        {
            "name": "dispositivo",
            "editable": false,
            "typeName": "text"
        },
        {
            "name": "estado",
            "editable": false,
            "typeName": "text",
            //"nullable": false
        },
        {name:'cod_enc'       , typeName:'text'   ,editable:isAdmin    },
        {name:'cod_recu'      , typeName:'text'   ,editable:false    },
        {name:'cod_sup'       , typeName:'text'   ,editable:false    },
        {
            "name": "carga_rol",
            editable: hasRecepcionistaPermission,
            "typeName": "text"
        },
        {
            "name": "carga_persona",
            editable: hasRecepcionistaPermission,
            "typeName": "text"
        },
        {
            "name": "carga",
            editable: hasRecepcionistaPermission,
            "typeName": "date"
        },
        {
            "name": "lote",
            "typeName": "integer",
            editable: hasSubCoordinadorPermission,
            //"nullable":false
        },
        */
        {
            "name": "semana", //nullable false
            editable: hasSubCoordinadorPermission,
            "typeName": "integer"
        },
        { name: "consistido"    , label:'consistido'            , typeName: 'timestamp'},
        // { name: "modificado"    , label:'modificado'            , typeName: 'timestamp'},
        //{ name: "json_backup"   , typeName:'jsonb', visible:false}
    ],
    "primaryKey": [
        "operativo",
        "enc"
    ],
    foreignKeys:[
        {references:'areas' , fields:['area']},
    //    {references:'operaciones' , fields:['operacion']},
    //    {references:'estados' , fields:['estado' ] , displayFields:['tipo_estado']},
    //    {references:'usuarios', fields:[{source:'carga_persona', target:'idper'}], displayFields:['apellido','nombre']},
    //    {references:'usuarios', fields:[{source:'carga_persona', target:'idper'},{source:'carga_rol', target:'rol'}], alias:'pertem', displayFields:[]},
    //    {references:'usuarios', fields:[{source:'cod_enc', target:'idper'}], alias:'per_enc', displayFields:[]},
    //    {references:'usuarios', fields:[{source:'cod_recu', target:'idper'}], alias:'per_recu', displayFields:[]},
    //    {references:'usuarios', fields:[{source:'cod_sup', target:'idper'}], alias:'per_sup', displayFields:[]},
    ], 
    "detailTables": [
        {table: "inconsistencias", abr: "I", fields: ['operativo', 'enc']}
    ],
    sql:{
        isTable: true,
        isReferable:true,
        from:`
            (select * , encu.validar_tipodato(enc,json_encuesta) tipos_inconsist, null telefonos, null seleccionado
                from tem t                
            )
        `, 
        postCreateSqls:`
           -- create index "carga 4 tem IDX" ON tem (carga);
            --CREATE TRIGGER tem_cod_per_trg before UPDATE OF carga_rol, carga_persona  ON tem FOR EACH ROW  EXECUTE PROCEDURE tem_cod_per_trg();
        `
    }
};
}
