
export * from "backend-plus";
import * as BackendPlus from "backend-plus";

export type ProcedureDef = BackendPlus.ProcedureDef & {
    definedIn?:string
}

export type MenuInfoBase = BackendPlus.MenuInfoBase;

export interface Context extends BackendPlus.Context{
    puede:{
        encuestas:{
            relevar:boolean
        },
        lab_resultado:{
            editar:boolean
            ver:boolean
        }
    }
    superuser?:true
}
