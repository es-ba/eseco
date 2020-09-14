"use strict";
                
import {TableDefinition, TableContext} from "./types-eseco";

export function tem_recepcion(context:TableContext):TableDefinition {
    var be = context.be;
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
    var columnasAreasParaLaTem=['obs_recepcionista','verificado_rec','recepcionista'];

    var def:TableDefinition= {
      "name": "tem_recepcion",
      editable: true,
      tableName:'tem',
      //allow:{insert:hasCampoPermissions, delete:hasCampoPermissions},
      "hiddenColumns":[...columnasAreasParaLaTem.map(x=>`areas__${x}`), 'gru_no_rea','semana'],
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
        {name: "abrir", typeName:'text',editable:false, inTable:false, clientSide:'abrirRecepcion'},
        {name: "cluster", typeName:'integer',editable:false, isName:true},
        {
            "name": "area",
            "editable": false,
            "typeName": "integer"
        },
        { name:'rea_m'        , typeName:'integer'  },
        {name:'cod_no_rea'    , typeName:'text'      ,editable:false, inTable:false  },
        {name:'gru_no_rea'    , typeName:'text'      ,editable:false, inTable:false  },
        {name:'habilitada'    , typeName:'boolean'   ,editable:false, inTable:false  },
        {name:'cargado'       , typeName:'boolean'   ,editable:false, inTable:false  },
        {
            "name": "resumen_estado",
            editable: false,
            "typeName":"text"
        },
        { name:'etiqueta'      , typeName:'text', editable: false , inTable:false   },
        { name:'relevador'     , typeName:'text', editable: false , inTable:false   },
        {
            "name": "tipos_inconsist",
            editable: false,
            //inTable: false,
            "typeName":"text"
        },       
        {name:'nombre_sel'    , typeName:'text'   ,editable:false, inTable:false},
        {name:'sp1'           , typeName:'bigint' ,editable:false, inTable:false},
        {name:'sp2_cel'       , typeName:'text'   ,editable:false, inTable:false},
        {name:'sp3_tel'       , typeName:'text'   ,editable:false, inTable:false},
        {name:'sp4_fecha'     , typeName:'text'   ,editable:false, inTable:false},
        {name:'sp5_hora'      , typeName:'text'   ,editable:false, inTable:false},
        {name:'sp6'           , typeName:'bigint' ,editable:false, inTable:false},
        {name:'seleccionado'  , typeName:'bigint' ,editable: false   },
        {name:'sexo_sel'      , typeName:'bigint' ,editable:false    },
        {name:'edad_sel'      , typeName:'bigint' ,editable:false    },
        {name:'cant_p'        , typeName:'bigint' ,editable:false    },
        {name:'fecha_rel'     , typeName:'date'   ,editable:false, inTable:false   },
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
            "name": "barrio",
            "editable": false,
            "typeName": "text"
        },
//        {name: "verificar"    , typeName:'boolean',editable:true, inTable:false, clientSide:'verificarCaso'},
//        {name: "finalizar_campo", typeName:'boolean',editable:true, inTable:false, clientSide:'finalizarCampo'}, //fin_de_campo
//        {name: "procesamiento", typeName:'boolean',editable:true, inTable:false, clientSide:'pasarAProcesamiento', label: 'pasar a procesamiento'}, //procesamiento
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
            "name": "zona",
            "editable": hasProcesamientoPermission,
            "typeName": "text"
            ,visible: true
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
            "name": "dominio",
            "editable": false,
            "typeName": "integer"
            ,visible: true
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
        {name:'obs_sup'   , typeName:'text' ,editable: isSupervisor     },
        {name:'obs_coor'  , typeName:'text' ,editable: isCoordinador || isSubCoordinador },
        */
        { name: "consistido"    , label:'consistido'            , typeName: 'timestamp'},
        // { name: "modificado"    , label:'modificado'            , typeName: 'timestamp'},
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
            "name": "semana", //nullable false
            editable: hasSubCoordinadorPermission,
            "typeName": "integer"
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
        }
      ],
      "primaryKey": [
          "operativo",
          "enc"
      ],
      foreignKeys:[
          {references:'areas' , fields:['area'], displayFields:columnasAreasParaLaTem}
          //{references:'usuarios', fields:[{source:'carga_persona', target:'idper'}], displayFields:['apellido','nombre']},
      ],
      "detailTables": [
          {table: "inconsistencias", abr: "I", fields: ['operativo', 'enc']}
      ]
    };
    const q=context.be.db.quoteIdent;
    def.sql={
        isTable: false,
        isReferable:true,
        xfields:{
            cod_no_rea:{expr:be.sqlNoreaCase('no_rea')},
            gru_no_rea:{expr:be.sqlNoreaCase('grupo')}
        },

        from:`
            (select 
                ${def.fields.filter(f=>f.inTable==undefined && !f.clientSide).map(f=>'t.'+q(f.name)).join(',')}
                , tt.cargado, tt.cargado_dm, tt.habilitada, tt.asignado as relevador
                ,(json_encuesta->>'c6')::date as fecha_rel   
                ,json_encuesta->>'c5' etiqueta
                ,json_encuesta->>'p12' nombre_sel
                ,(json_encuesta->>'sp1')::bigint sp1
                ,json_encuesta->>'sp2' sp2_cel
                ,json_encuesta->>'sp3' sp3_tel 
                ,json_encuesta->>'sp4' sp4_fecha 
                ,json_encuesta->>'sp5' sp5_hora 
                ,(json_encuesta->>'sp6')::bigint sp6 
                , ${be.sqlNoreaCase('no_rea')} as cod_no_rea
                , ${be.sqlNoreaCase('grupo')} as gru_no_rea
                from tem t left join tareas_tem tt on t.operativo=tt.operativo and t.enc=tt.enc and tt.tarea='rel'
            )
        `, 
        postCreateSqls:`
            --create index "carga 4 tem IDX" ON tem (carga);
            --CREATE TRIGGER tem_cod_per_trg before UPDATE OF carga_rol, carga_persona  ON tem FOR EACH ROW  EXECUTE PROCEDURE tem_cod_per_trg();
        `
    }
    return def;
}
