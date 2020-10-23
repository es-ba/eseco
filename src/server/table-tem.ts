"use strict";

import {TableDefinition, TableContext} from "./types-eseco";

export function tem(context:TableContext, opts:any):TableDefinition {
    var opts=opts||{};
    var recepcion=opts.recepcion?'_recepcion':'';
    var be=context.be;
    var puedeEditar = context.forDump || context.puede.campo.administrar||context.user.rol==='recepcionista';

    var columnasAreasParaLaTem=['obs_recepcionista','verificado_rec','recepcionista'];

    var columnasNoRea=[
        {name:'cod_no_rea', expr: be.sqlNoreaCase('no_rea')},
        {name:'gru_no_rea', expr: be.sqlNoreaCase('grupo') }
    ];
    var columnasSoloTem=[
          'enc_original'   , 'json_encuesta'   , 'rea'     , 'norea'  , 'json_backup'
        , 'h4'             , 'hospital'        , 'x'       , 'y'      , 'dist_m'     , 'fexp'
    ];
    var def: TableDefinition= {
        name:`tem${recepcion}`,
        editable: puedeEditar,
        hiddenColumns:[
            'codviviendaparticular', 'casa', 'obsdatosdomicilio', 'obsconjunto', 'reserva', 'rotacion_etoi', 'rotacion_eah'
            , 'trimestre'   , 'procedencia', 'sel_etoi_villa'   , 'marco'      , 'semana' , 'periodicidad' , 'participacion'
            , 'cargado_dm'
        ],
        "fields": [
            {name:'operativo'     , typeName:'text'   , editable: false , nullable: false, defaultValue: 'ESECO'},
            {name:'enc'           , typeName:'text'   , editable: false , nullable: false                       },
            {name: "abrir"        , typeName:'text'   ,editable:false, inTable:false, clientSide:'abrir'},
            //{name: "cluster", typeName:'integer',editable:false, isName:true},
            {name:'area'                 , typeName:'integer' , editable: false  },
            {name:'rea_m'                , typeName:'integer' , editable: false  },
            {name:'cod_no_rea'           , typeName:'text'    , editable: false , inTable:false  },
            {name:'gru_no_rea'           , typeName:'text'    , editable: false , inTable:false  },
            {name:'habilitada'           , typeName:'boolean' , editable: false , inTable: false  },
            {name:'cargado'              , typeName:'boolean' , editable: false , inTable: false  },
            {name:'resumen_estado'       , typeName:'text'    , editable: false  },
            {name:'etiqueta'             , typeName:'text'    , editable: false , inTable: false  },
            {name:'relevador'            , typeName:'text'    , editable: false , inTable: false  },
            {name:'tipos_inconsist'      , typeName:'text'    , editable: false  },
            {name:'nombre_sel'           , typeName:'text'    , editable: false , inTable: false},
            {name:'sp1'                  , typeName:'bigint'  , editable: false , inTable: false},
            {name:'sp2_cel'              , typeName:'text'    , editable: false , inTable: false},
            {name:'sp3_tel'              , typeName:'text'    , editable: false , inTable: false},
            {name:'sp4_fecha'            , typeName:'text'    , editable: false , inTable: false},
            {name:'sp5_hora'             , typeName:'text'    , editable: false , inTable: false},
            {name:'sp6'                  , typeName:'bigint'  , editable: false , inTable: false},
            {name:'seleccionado'         , typeName:'bigint'  , editable: false  },
            {name:'sexo_sel'             , typeName:'bigint'  , editable: false  },
            {name:'edad_sel'             , typeName:'bigint'  , editable: false  },
            {name:'cant_p'               , typeName:'bigint'  , editable: false  },
            {name:'fecha_rel'            , typeName:'date'    , editable: false, inTable:false},
            {name:'codcalle'             , typeName:'integer' , editable: false  },
            {name:'nomcalle'             , typeName:'text'    , editable: false  },
            {name:'nrocatastral'         , typeName:'integer' , editable: false  },
            {name:'piso'                 , typeName:'text'    , editable: false  },
            {name:'departamento'         , typeName:'text'    , editable: false  },
            {name:'habitacion'           , typeName:'text'    , editable: false  },
            {name:'sector'               , typeName:'text'    , editable: false  },
            {name:'edificio'             , typeName:'text'    , editable: false  },
            {name:'entrada'              , typeName:'text'    , editable: false  },
            {name:'barrio'               , typeName:'text'    , editable: false  },
            //{name: "verificar"       , typeName:'boolean', editable:true, inTable:false, clientSide:'verificarCaso'},
            //{name: "finalizar_campo" , typeName:'boolean', editable:true, inTable:false, clientSide:'finalizarCampo'}, //fin_de_campo
            //{name: "procesamiento"   , typeName:'boolean', editable:true, inTable:false, clientSide:'pasarAProcesamiento', label: 'pasar a procesamiento'}, //procesamiento
            {name:'tipo_domicilio'       , typeName:'integer' , editable: false  },
            {name:'zona'                 , typeName:'text'    , editable: puedeEditar  },
            {name:'fexp'                 , typeName:'integer' , editable: false  },
            {name:'areaup'               , typeName:'text'    , editable: false  },
            {name:'codpos'               , typeName:'integer' , editable: false  },
            {name:'dominio'              , typeName:'integer' , editable: false  },
            {name:'estrato_ing'          , typeName:'integer' , editable: false  },
            {name:'id_marco'             , typeName:'bigint'  , editable: false  },
            {name:'obs'                  , typeName:'text'    , editable: false  },
            {name:'nrocomuna'            , typeName:'integer' , editable: false  },
            {name:'nrofraccion'          , typeName:'integer' , editable: false  },
            {name:'nroradio'             , typeName:'integer' , editable: false  },
            {name:'nromanzana'           , typeName:'integer' , editable: false  },
            {name:'nrolado'              , typeName:'integer' , editable: false  },
            {name:'usodomicilio'         , typeName:'integer' , editable: false  },
            {name:'orden_relevamiento'   , typeName:'integer' , editable: false  },
            {name:'mapa'                 , typeName:'integer' , editable: false  },
            {name: "consistido"          , typeName: 'timestamp', label:'consistido'   },
            {name:'cargado_dm'           , typeName:'text'    , editable: false , inTable: false  },
            //vacios o poco interesantes
            {name:'codviviendaparticular', typeName:'text'    , editable: false  },
            {name:'casa'                 , typeName:'text'    , editable: false  },
            {name:'obsdatosdomicilio'    , typeName:'text'    , editable: false  },
            {name:'obsconjunto'          , typeName:'text'    , editable: false  },
            {name:'reserva'              , typeName:'integer' , editable: false  },
            {name:'rotacion_etoi'        , typeName:'integer' , editable: false  ,visible: false  },
            {name:'rotacion_eah'         , typeName:'integer' , editable: false  ,visible: false  },
            {name:'trimestre'            , typeName:'integer' , editable: false  ,visible: false  },
            {name:'procedencia'          , typeName:'text'    , editable: false  ,visible: false  },
            {name:'sel_etoi_villa'       , typeName:'integer' , editable: false  ,visible: false  },
            {name:'marco'                , typeName:'integer' , editable: false  ,visible: false  },
            {name:'semana'               , typeName:'integer' , editable: false  ,visible: false  },
            {name:'periodicidad'         , typeName:'text'    , editable: false  ,visible: false  },
            {name:'participacion'        , typeName:'integer' , editable: false  ,visible: false  },
            //solo tem 
            {name:'enc_original'         , typeName:'text'    , editable: false  },
            {name:'json_encuesta'        , typeName:'jsonb'   , editable: false  },
            {name:'rea'                  , typeName:'bigint'  , editable: false  },
            {name:'norea'                , typeName:'text'    , editable: false  },
            {name:"json_backup"          , typeName:'jsonb'   , editable: false, visible:false},
            {name:"h4"                   , typeName:'text'    , editable: false  },
            {name:"hospital"             , typeName:'text'    , editable: false  },
            {name:"x"                    , typeName:'decimal' , editable: false  },
            {name:"y"                    , typeName:'decimal' , editable: false  },
            {name:"dist_m"               , typeName:'decimal' , editable: false  },
            //{ name: "modificado"   , label:'modificado'        , typeName: 'timestamp'},
            //{name:'obs_sup'        , typeName:'text' , editable: isSupervisor     },
            //{name:'obs_coor'       , typeName:'text' , editable: isCoordinador || isSubCoordinador },    
        ],
        "primaryKey": [ "operativo", "enc" ],
        foreignKeys:[
            {references:'areas' , fields:['area']},
        //    {references:'usuarios', fields:[{source:'carga_persona', target:'idper'}], displayFields:['apellido','nombre']},
        ], 
        softForeignKeys:[
            {references:'tokens', fields:[{source:'cargado_dm', target:'token'}], displayFields:['username'], displayAfterFieldName:'cargado'}
        ],
        "detailTables": [
            //{table: "inconsistencias", abr: "I", fields: ['operativo', 'enc']}
        ]
    };
    if (opts.recepcion) {
        def.fields=def.fields.filter(f=>!columnasSoloTem.includes(f.name) )
        def.hiddenColumns=[...def.hiddenColumns, ...columnasAreasParaLaTem.map(x=>`areas__${x}`), 'gru_no_rea']
        def.foreignKeys=def.foreignKeys?.map(function (f) {if (f.references='areas'){f.displayFields=columnasAreasParaLaTem}; return f}) 
    } else {
        def.detailTables?.unshift({table: "tareas_tem", abr: "T", fields: ['operativo', 'enc'], label:'tareas'})
        def.fields=def.fields.filter(f=>!columnasNoRea.map(fn=>fn.name).includes(f.name) )
    };
    const q=context.be.db.quoteIdent;
    def.sql= {
            isTable:!opts.recepcion,
            isReferable:true,
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
                    ,(json_encuesta->>'sp6')::bigint  sp6
                    ${opts.recepcion? columnasNoRea.map(v=>'\n     , '+ v.expr +' as '+ v.name).join('') :''}
                    from tem t left join tareas_tem tt on t.operativo=tt.operativo and t.enc=tt.enc and tt.tarea='rel'
                )
            `     
        };
        return def;
    }
    