"use strict";

import { AppBackend, emergeAppMetaEnc, emergeAppOperativos, emergeAppRelEnc } from "meta-enc";
import { emergeAppConsistencias, emergeAppDatosExt, emergeAppProcesamiento, emergeAppVarCal, OperativoGenerator /*, pgWitheList */} from "procesamiento";
import { emergeAppEseco } from "./app-eseco";

OperativoGenerator.mainTD = 'defgen';
OperativoGenerator.mainTDPK = 'id_caso'; // TODO: hacer esto dinámico en paquete consistencias
OperativoGenerator.orderedIngresoTDNames = [OperativoGenerator.mainTD, 'defgen_calculada'];
OperativoGenerator.orderedReferencialesTDNames = ['lotes'];

//pgWitheList.push('abs');

var AppEseco = emergeAppEseco(
    emergeAppProcesamiento(
        emergeAppConsistencias(
            emergeAppDatosExt(
                emergeAppMetaEnc(
                    emergeAppRelEnc(
                        emergeAppVarCal(
                            emergeAppOperativos(AppBackend)
                        )
                    )
                )
            )
        )
    )
);

new AppEseco().start();

