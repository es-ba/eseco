"use strict";

import {TableDefinition, TableContext} from "./types-eseco";
import {resultados_test} from './table-resultados_test';
import {changing} from 'best-globals';

export const VALOR_BLANQUEO = 'Blanquear Resultado';

export function resultados_test_nullables(context:TableContext, opts:null|{all:boolean, name:string}):TableDefinition {
    var be=context.be;
    var resultadosTestTableDef = resultados_test(context, {});
    return changing(resultadosTestTableDef,{
        name: 'resultados_test_nullables',
        elementName:'resultado_test_nullable',
        sql:{
            from:`(
                select * from resultados_test 
                union 
                select (${context.be.db.quoteLiteral(VALOR_BLANQUEO)}) as resultado, null as email_asunto, null as email_texto, null as pagina_texto
            )`,
            isTable: false
        }
    })
}

