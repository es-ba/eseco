
export * from "backend-plus";
import * as BackendPlus from "backend-plus";

export type ProcedureDef = BackendPlus.ProcedureDef & {
    definedIn?:string
}