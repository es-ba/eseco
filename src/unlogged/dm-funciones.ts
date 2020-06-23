"use strict";
import {RelPre, RelVis, RelAtr, Estructura, ProdAtr, QueVer} from "./dm-tipos";
import * as likeAr from "like-ar";

export const COLOR_ERRORES = "#FF3535";

export function puedeCopiarTipoPrecio(estructura:Estructura, relPre:RelPre){
    return relPre.tipoprecio==null && relPre.tipoprecioanterior!=null && estructura.tipoPrecio[relPre.tipoprecioanterior].puedecopiar
}

export function puedeCopiarAtributos(estructura:Estructura, relPre:RelPre){
    return !relPre.atributos.every(relAtr=>relAtr.valoranterior == null) && (!relPre.tipoprecio || estructura.tipoPrecio[relPre.tipoprecio].espositivo);
}

export function muestraFlechaCopiarAtributos(estructura:Estructura, relPre:RelPre){
    return relPre.cambio==null && puedeCopiarAtributos(estructura, relPre);
}

export function puedeCambiarPrecioYAtributos(estructura:Estructura, relPre:RelPre){
    return relPre.tipoprecio==null || estructura.tipoPrecio[relPre.tipoprecio].espositivo;
}

export function puedeCambiarTP(estructura:Estructura, relVis:RelVis){
    return relVis.razon && estructura.razones[relVis.razon].espositivoformulario;
}

export function tpNecesitaConfirmacion(estructura:Estructura, relPre:RelPre, tipoPrecioSeleccionado:string){
    return !estructura.tipoPrecio[tipoPrecioSeleccionado].espositivo && relPre.precio != null
}

export function calcularCambioAtributosEnPrecio(relPre:RelPre){
    //var hayAtributosActuales = relPre.atributos.some(relAtr=>relAtr.valor != null);
    var hayDiferenciasEntreAtributos = relPre.atributos.some(relAtr=>relAtr.valor!=relAtr.valoranterior);
    return hayDiferenciasEntreAtributos?'C':'='
}

export function precioTieneAtributosCargados(relPre:RelPre){
    return relPre.atributos.some(relAtr=>relAtr.valor!=null);
}

export function normalizarPrecio(relPre:RelPre, estructura:Estructura){
    if(!relPre.precio){
        return null
    }
    var vtope=0;
    var vacumulador:(number|null)[] = [];
    vacumulador[vtope]=relPre.precio;
    var atributosNormalizables = likeAr(estructura.productos[relPre.producto].atributos).filter((prodAtr:ProdAtr)=>prodAtr.normalizable).array()
    atributosNormalizables.forEach(function(prodAtr:ProdAtr){
        vtope++;
        var relAtr = relPre.atributos.find((relAtr:RelAtr)=>relAtr.atributo==prodAtr.atributo)!;
        if (prodAtr.tiponormalizacion=='Moneda' && relAtr.valor){
            relAtr.valor=String(estructura.relmon[relAtr.valor].valor_pesos);
        }
        if (relAtr.valor && !isNaN(parseFloat(relAtr.valor.toString()))){
            vacumulador[vtope]=Number(relAtr.valor)
        }else{
            vacumulador[vtope]=null                    
        }
        var voperacion=prodAtr.tiponormalizacion!.split(",");
        voperacion.forEach(function(operacion){
            switch (operacion){
                case '+':
                    vacumulador[vtope-1]=vacumulador[vtope-1]!+vacumulador[vtope]!;
                    vtope=vtope -1;
                    break;
                case '*':
                    vacumulador[vtope-1]=vacumulador[vtope-1]!*vacumulador[vtope]!;
                    vtope=vtope -1; 
                    break;
                case '1#':
                    vtope=vtope +1;
                    vacumulador[vtope]=1;
                    break;
                case '2/':
                    vacumulador[vtope]=vacumulador[vtope]!/2;
                    break;
                case '6/':
                    vacumulador[vtope]=vacumulador[vtope]!/6;   
                    break;
                case '12/':
                    vacumulador[vtope]=vacumulador[vtope]!/12;   
                    break;
                case '100/':
                    vacumulador[vtope]=vacumulador[vtope]!/100;   
                    break;
                case 'Normal':
                    if (vacumulador[vtope] != null && vacumulador[vtope]!=0){
                        vacumulador[vtope-1]=vacumulador[vtope-1]!/vacumulador[vtope]!*prodAtr.valornormal!;
                        vtope=vtope-1;
                    }else{
                        vacumulador[vtope-1]=null;
                        vtope=vtope-1;
                    }
                    break;
                case 'Moneda':
                    vacumulador[vtope-1]=vacumulador[vtope-1]!*vacumulador[vtope]!*prodAtr.valornormal!;
                    vtope=vtope-1;
                    break;
                case 'Bonificar':
                    vacumulador[vtope-1]=vacumulador[vtope-1]!*(100.0 - (vacumulador[vtope]||0))/100.0;
                    vtope=vtope-1;
                    break;
                case '#': 
                    null;
                    break;
                default:
                    throw new Error('Operador no considerado ' + operacion);
            }
        });
        if (vtope != 0){
           throw new Error('Queda informacion en el acumulador que no fue utilizada ' + vtope);
        };
    });
    return vacumulador[vtope];
};

export function controlarAtributo(relAtr:RelAtr, relPre:RelPre, estructura:Estructura){
    var prodAtr = estructura.productos[relPre.producto].atributos[relAtr.atributo];
    var esValidoAtributo = function esValidoAtributo(relAtr:RelAtr, prodAtr:ProdAtr){
        return !((prodAtr.rangodesde && Number(relAtr.valor)<prodAtr.rangodesde) || (prodAtr.rangohasta && Number(relAtr.valor)>prodAtr.rangohasta))
    }
    var esValorNormal = function(relAtr:RelAtr, prodAtr:ProdAtr){
        return !prodAtr.mostrar_cant_um && prodAtr.valornormal && Number(relAtr.valor)==prodAtr.valornormal
    }
    var esNormalizableSinValor = function esNormalizableSinValor(relAtr:RelAtr, prodAtr:ProdAtr, relPre:RelPre){
        return prodAtr.valornormal && prodAtr.normalizable && relAtr.valor == null && relPre.tipoprecio && estructura.tipoPrecio[relPre.tipoprecio].espositivo;
    }
    var tieneAdvertencia:boolean=false;
    var color:string|undefined = undefined;
    var tpEsNegativo = !!(relPre.tipoprecio && !estructura.tipoPrecio[relPre.tipoprecio].espositivo);
    if(!tpEsNegativo){
        if(!esValidoAtributo(relAtr, prodAtr) && !esValorNormal(relAtr, prodAtr) && relAtr.valor != null){
            color='#FFCE33';
            tieneAdvertencia = true;
        }
        if(esNormalizableSinValor(relAtr, prodAtr, relPre)){
            tieneAdvertencia = true;
            color='#FF9333';
        }
    }
    return {tieneAdv: tieneAdvertencia, color}
}

export function controlarPrecio(relPre:RelPre, estructura:Estructura, esElActual?:boolean){
    var atributoTieneAdvertencia:boolean=false;
    var color:string|undefined = undefined;
    relPre.atributos.forEach(function(relAtr){
        atributoTieneAdvertencia = atributoTieneAdvertencia || controlarAtributo(relAtr, relPre, estructura).tieneAdv;
    });
    var tieneAdvertencias:boolean = false;
    var tieneErrores:boolean = false;
    if(!esElActual && !relPre.precio && relPre.tipoprecio && estructura.tipoPrecio[relPre.tipoprecio].espositivo){
        color=COLOR_ERRORES; //rojo   // color='#BA7AFF'; //violeta autorizado por Juli
        tieneAdvertencias = true;
        tieneErrores = true;
    }else if(relPre.precio && relPre.tipoprecio && estructura.tipoPrecio[relPre.tipoprecio].espositivo && relPre.precionormalizado && (
        (relPre.comentariosrelpre == null && relPre.precionormalizado_1 && (relPre.precionormalizado < relPre.precionormalizado_1/2 || relPre.precionormalizado > relPre.precionormalizado_1*2)) ||
        (relPre.comentariosrelpre == null && relPre.promobs_1 && (relPre.precionormalizado < relPre.promobs_1/2 || relPre.precionormalizado > relPre.promobs_1*2)) 
       ) || atributoTieneAdvertencia
    ){
        color='#FF9333'; //naranja
        tieneAdvertencias = true;
    }else{
        tieneAdvertencias = false;
    }
    return {tieneAdv: tieneAdvertencias, color: color, tieneErr: tieneErrores};
}

export function precioTieneError(relPre:RelPre, relVis: RelVis, estructura:Estructura){
    return relPre.err && estructura.razones[relVis.razon!].espositivoformulario;
}

export function precioTieneAdvertencia(relPre:RelPre, relVis: RelVis, estructura:Estructura){
    return relPre.adv && estructura.razones[relVis.razon!].espositivoformulario;
}

export function precioEstaPendiente(relPre:RelPre, relVis: RelVis, estructura:Estructura){
    return (relPre.tipoprecio == null || estructura.tipoPrecio[relPre.tipoprecio].espositivo && !relPre.precio) && relVis.razon && estructura.razones[relVis.razon!].espositivoformulario;
}

export function razonNecesitaConfirmacion(estructura:Estructura, _relVis:RelVis, razon:number){
    return razon && !estructura.razones[razon].espositivoformulario
}

export var criterio = (relPre:RelPre, relVis: RelVis, estructura:Estructura, searchString:string, queVer:QueVer) => 
(searchString?estructura.productos[relPre.producto].nombreproducto.toLocaleLowerCase().search(searchString.toLocaleLowerCase())>-1:true)
&& (queVer !='advertencias' || precioTieneAdvertencia(relPre, relVis, estructura))
&& (queVer !='pendientes' || precioEstaPendiente(relPre, relVis, estructura));

export function getObservacionesFiltradas(otrosFormulariosInformanteIdx:{[key: string]: RelVis}, observaciones:RelPre[], relVis: RelVis, estructura:Estructura, allForms:boolean, searchString:string, queVer:QueVer){
    var observacionesFiltradasIdx:{iRelPre:number}[]=observaciones.map((relPre:RelPre, iRelPre:number) =>
        ((allForms?estructura.razones[otrosFormulariosInformanteIdx[relPre.formulario].razon!].espositivoformulario:relPre.formulario==relVis.formulario) &&
        criterio(relPre, relVis, estructura, searchString, queVer))?{iRelPre}:null
    ).filter(filterNotNull);
    var observacionesFiltradasEnOtrosIdx:{iRelPre:number}[]=observaciones.map((relPre:RelPre, iRelPre:number) =>
        (!(allForms?true:relPre.formulario==relVis.formulario) && 
        (relPre.observacion==1 || queVer!='todos') && // si son todos no hace falta ver las observaciones=2
        estructura.razones[otrosFormulariosInformanteIdx[relPre.formulario].razon!].espositivoformulario && //omito buscar en otros forms con razon negativa
        criterio(relPre, relVis, estructura, searchString, queVer))?{iRelPre}:null
    ).filter(filterNotNull);
    return {observacionesFiltradasIdx, observacionesFiltradasEnOtrosIdx}
}

export function filterNotNull<T extends {}>(x:T|null):x is T {
    return x != null
}

export function simplificateText(text:string):string{
    var simplificatedChars={
        "\u00a0":" ",
        "Á":"A","Ă":"A","Ắ":"A","Ặ":"A","Ằ":"A","Ẳ":"A","Ẵ":"A","Ǎ":"A","Â":"A","Ấ":"A","Ậ":"A","Ầ":"A","Ẩ":"A","Ẫ":"A","Ä":"A","Ǟ":"A","Ȧ":"A","Ǡ":"A","Ạ":"A","Ȁ":"A","À":"A","Ả":"A","Ȃ":"A","Ā":"A","Ą":"A","Å":"A","Ǻ":"A","Ḁ":"A","Ⱥ":"A","Ã":"A",
        "Ꜳ":"AA","Æ":"AE","Ǽ":"AE","Ǣ":"AE","Ꜵ":"AO","Ꜷ":"AU","Ꜹ":"AV","Ꜻ":"AV","Ꜽ":"AY",
        "Ḃ":"B","Ḅ":"B","Ɓ":"B","Ḇ":"B","Ƀ":"B","Ƃ":"B",
        "Ć":"C","Č":"C","Ç":"C","Ḉ":"C","Ĉ":"C","Ċ":"C","Ƈ":"C","Ȼ":"C",
        "Ď":"D","Ḑ":"D","Ḓ":"D","Ḋ":"D","Ḍ":"D","Ɗ":"D","Ḏ":"D","ǲ":"D","ǅ":"D","Đ":"D","Ƌ":"D","Ǳ":"DZ","Ǆ":"DZ",
        "É":"E","Ĕ":"E","Ě":"E","Ȩ":"E","Ḝ":"E","Ê":"E","Ế":"E","Ệ":"E","Ề":"E","Ể":"E","Ễ":"E","Ḙ":"E","Ë":"E","Ė":"E","Ẹ":"E","Ȅ":"E","È":"E","Ẻ":"E","Ȇ":"E","Ē":"E","Ḗ":"E","Ḕ":"E","Ę":"E","Ɇ":"E","Ẽ":"E","Ḛ":"E","Ꝫ":"ET",
        "Ḟ":"F","Ƒ":"F",
        "Ǵ":"G","Ğ":"G","Ǧ":"G","Ģ":"G","Ĝ":"G","Ġ":"G","Ɠ":"G","Ḡ":"G","Ǥ":"G",
        "Ḫ":"H","Ȟ":"H","Ḩ":"H","Ĥ":"H","Ⱨ":"H","Ḧ":"H","Ḣ":"H","Ḥ":"H","Ħ":"H",
        "Í":"I","Ĭ":"I","Ǐ":"I","Î":"I","Ï":"I","Ḯ":"I","İ":"I","Ị":"I","Ȉ":"I","Ì":"I","Ỉ":"I","Ȋ":"I","Ī":"I","Į":"I","Ɨ":"I","Ĩ":"I","Ḭ":"I",
        "Ꝺ":"D","Ꝼ":"F","Ᵹ":"G","Ꞃ":"R","Ꞅ":"S","Ꞇ":"T","Ꝭ":"IS",
        "Ĵ":"J","Ɉ":"J",
        "Ḱ":"K","Ǩ":"K","Ķ":"K","Ⱪ":"K","Ꝃ":"K","Ḳ":"K","Ƙ":"K","Ḵ":"K","Ꝁ":"K","Ꝅ":"K",
        "Ĺ":"L","Ƚ":"L","Ľ":"L","Ļ":"L","Ḽ":"L","Ḷ":"L","Ḹ":"L","Ⱡ":"L","Ꝉ":"L","Ḻ":"L","Ŀ":"L","Ɫ":"L","ǈ":"L","Ł":"L","Ǉ":"LJ",
        "Ḿ":"M","Ṁ":"M","Ṃ":"M","Ɱ":"M",
        "Ń":"N","Ň":"N","Ņ":"N","Ṋ":"N","Ṅ":"N","Ṇ":"N","Ǹ":"N","Ɲ":"N","Ṉ":"N","Ƞ":"N","ǋ":"N","Ǌ":"NJ",
        "Ó":"O","Ŏ":"O","Ǒ":"O","Ô":"O","Ố":"O","Ộ":"O","Ồ":"O","Ổ":"O","Ỗ":"O","Ö":"O","Ȫ":"O","Ȯ":"O","Ȱ":"O","Ọ":"O","Ő":"O","Ȍ":"O","Ò":"O","Ỏ":"O","Ơ":"O","Ớ":"O","Ợ":"O","Ờ":"O","Ở":"O","Ỡ":"O","Ȏ":"O","Ꝋ":"O","Ꝍ":"O","Ō":"O","Ṓ":"O","Ṑ":"O","Ɵ":"O","Ǫ":"O","Ǭ":"O","Ø":"O","Ǿ":"O","Õ":"O","Ṍ":"O","Ṏ":"O","Ȭ":"O","Ƣ":"OI","Ꝏ":"OO","Ɛ":"E","Ɔ":"O","Ȣ":"OU",
        "Ṕ":"P","Ṗ":"P","Ꝓ":"P","Ƥ":"P","Ꝕ":"P","Ᵽ":"P","Ꝑ":"P",
        "Ꝙ":"Q","Ꝗ":"Q",
        "Ŕ":"R","Ř":"R","Ŗ":"R","Ṙ":"R","Ṛ":"R","Ṝ":"R","Ȑ":"R","Ȓ":"R","Ṟ":"R","Ɍ":"R","Ɽ":"R",
        "Ꜿ":"C","Ǝ":"E",
        "Ś":"S","Ṥ":"S","Š":"S","Ṧ":"S","Ş":"S","Ŝ":"S","Ș":"S","Ṡ":"S","Ṣ":"S","Ṩ":"S",
        "Ť":"T","Ţ":"T","Ṱ":"T","Ț":"T","Ⱦ":"T","Ṫ":"T","Ṭ":"T","Ƭ":"T","Ṯ":"T","Ʈ":"T","Ŧ":"T",
        "Ɐ":"A","Ꞁ":"L","Ɯ":"M","Ʌ":"V","Ꜩ":"TZ",
        "Ú":"U","Ŭ":"U","Ǔ":"U","Û":"U","Ṷ":"U","Ü":"U","Ǘ":"U","Ǚ":"U","Ǜ":"U","Ǖ":"U","Ṳ":"U","Ụ":"U","Ű":"U","Ȕ":"U","Ù":"U","Ủ":"U","Ư":"U","Ứ":"U","Ự":"U","Ừ":"U","Ử":"U","Ữ":"U","Ȗ":"U","Ū":"U","Ṻ":"U","Ų":"U","Ů":"U","Ũ":"U","Ṹ":"U","Ṵ":"U",
        "Ꝟ":"V","Ṿ":"V","Ʋ":"V","Ṽ":"V","Ꝡ":"VY",
        "Ẃ":"W","Ŵ":"W","Ẅ":"W","Ẇ":"W","Ẉ":"W","Ẁ":"W","Ⱳ":"W",
        "Ẍ":"X","Ẋ":"X","Ý":"Y","Ŷ":"Y","Ÿ":"Y","Ẏ":"Y","Ỵ":"Y","Ỳ":"Y","Ƴ":"Y","Ỷ":"Y","Ỿ":"Y","Ȳ":"Y","Ɏ":"Y","Ỹ":"Y"
        ,"Ź":"Z","Ž":"Z","Ẑ":"Z","Ⱬ":"Z","Ż":"Z","Ẓ":"Z","Ȥ":"Z","Ẕ":"Z","Ƶ":"Z","Ĳ":"IJ","Œ":"OE",
        "ᴀ":"A","ᴁ":"AE","ʙ":"B","ᴃ":"B","ᴄ":"C","ᴅ":"D","ᴇ":"E","ꜰ":"F","ɢ":"G","ʛ":"G","ʜ":"H","ɪ":"I","ʁ":"R","ᴊ":"J","ᴋ":"K","ʟ":"L","ᴌ":"L","ᴍ":"M","ɴ":"N","ᴏ":"O","ɶ":"OE","ᴐ":"O","ᴕ":"OU","ᴘ":"P","ʀ":"R","ᴎ":"N","ᴙ":"R","ꜱ":"S","ᴛ":"T","ⱻ":"E","ᴚ":"R","ᴜ":"U","ᴠ":"V","ᴡ":"W","ʏ":"Y","ᴢ":"Z",
        "á":"a","ă":"a","ắ":"a","ặ":"a","ằ":"a","ẳ":"a","ẵ":"a","ǎ":"a","â":"a","ấ":"a","ậ":"a","ầ":"a","ẩ":"a","ẫ":"a","ä":"a","ǟ":"a","ȧ":"a","ǡ":"a","ạ":"a","ȁ":"a","à":"a","ả":"a","ȃ":"a","ā":"a","ą":"a","ᶏ":"a","ẚ":"a","å":"a","ǻ":"a","ḁ":"a","ⱥ":"a","ã":"a","ꜳ":"aa","æ":"ae","ǽ":"ae","ǣ":"ae","ꜵ":"ao","ꜷ":"au","ꜹ":"av","ꜻ":"av","ꜽ":"ay",
        "ḃ":"b","ḅ":"b","ɓ":"b","ḇ":"b","ᵬ":"b","ᶀ":"b","ƀ":"b","ƃ":"b","ɵ":"o",
        "ć":"c","č":"c","ç":"c","ḉ":"c","ĉ":"c","ɕ":"c","ċ":"c","ƈ":"c","ȼ":"c",
        "ď":"d","ḑ":"d","ḓ":"d","ȡ":"d","ḋ":"d","ḍ":"d","ɗ":"d","ᶑ":"d","ḏ":"d","ᵭ":"d","ᶁ":"d","đ":"d","ɖ":"d","ƌ":"d",
        "ı":"i","ȷ":"j","ɟ":"j","ʄ":"j","ǳ":"dz","ǆ":"dz",
        "é":"e","ĕ":"e","ě":"e","ȩ":"e","ḝ":"e","ê":"e","ế":"e","ệ":"e","ề":"e","ể":"e","ễ":"e","ḙ":"e","ë":"e","ė":"e","ẹ":"e","ȅ":"e","è":"e","ẻ":"e","ȇ":"e","ē":"e","ḗ":"e","ḕ":"e","ⱸ":"e","ę":"e","ᶒ":"e","ɇ":"e","ẽ":"e","ḛ":"e","ꝫ":"et",
        "ḟ":"f","ƒ":"f","ᵮ":"f","ᶂ":"f",
        "ǵ":"g","ğ":"g","ǧ":"g","ģ":"g","ĝ":"g","ġ":"g","ɠ":"g","ḡ":"g","ᶃ":"g","ǥ":"g",
        "ḫ":"h","ȟ":"h","ḩ":"h","ĥ":"h","ⱨ":"h","ḧ":"h","ḣ":"h","ḥ":"h","ɦ":"h","ẖ":"h","ħ":"h","ƕ":"hv",
        "í":"i","ĭ":"i","ǐ":"i","î":"i","ï":"i","ḯ":"i","ị":"i","ȉ":"i","ì":"i","ỉ":"i","ȋ":"i","ī":"i","į":"i","ᶖ":"i","ɨ":"i","ĩ":"i","ḭ":"i","ꝺ":"d","ꝼ":"f","ᵹ":"g","ꞃ":"r","ꞅ":"s","ꞇ":"t","ꝭ":"is",
        "ǰ":"j","ĵ":"j","ʝ":"j","ɉ":"j",
        "ḱ":"k","ǩ":"k","ķ":"k","ⱪ":"k","ꝃ":"k","ḳ":"k","ƙ":"k","ḵ":"k","ᶄ":"k","ꝁ":"k","ꝅ":"k",
        "ĺ":"l","ƚ":"l","ɬ":"l","ľ":"l","ļ":"l","ḽ":"l","ȴ":"l","ḷ":"l","ḹ":"l","ⱡ":"l","ꝉ":"l","ḻ":"l","ŀ":"l","ɫ":"l","ᶅ":"l","ɭ":"l","ł":"l","ǉ":"lj","ſ":"s","ẜ":"s","ẛ":"s","ẝ":"s",
        "ḿ":"m","ṁ":"m","ṃ":"m","ɱ":"m","ᵯ":"m","ᶆ":"m",
        "ń":"n","ň":"n","ņ":"n","ṋ":"n","ȵ":"n","ṅ":"n","ṇ":"n","ǹ":"n","ɲ":"n","ṉ":"n","ƞ":"n","ᵰ":"n","ᶇ":"n","ɳ":"n","ǌ":"nj",
        "ó":"o","ŏ":"o","ǒ":"o","ô":"o","ố":"o","ộ":"o","ồ":"o","ổ":"o","ỗ":"o","ö":"o","ȫ":"o","ȯ":"o","ȱ":"o","ọ":"o","ő":"o","ȍ":"o","ò":"o","ỏ":"o","ơ":"o","ớ":"o","ợ":"o","ờ":"o","ở":"o","ỡ":"o","ȏ":"o","ꝋ":"o","ꝍ":"o","ⱺ":"o","ō":"o","ṓ":"o","ṑ":"o","ǫ":"o","ǭ":"o","ø":"o","ǿ":"o","õ":"o","ṍ":"o","ṏ":"o","ȭ":"o","ƣ":"oi","ꝏ":"oo","ɛ":"e","ᶓ":"e","ɔ":"o","ᶗ":"o","ȣ":"ou",
        "ṕ":"p","ṗ":"p","ꝓ":"p","ƥ":"p","ᵱ":"p","ᶈ":"p","ꝕ":"p","ᵽ":"p","ꝑ":"p",
        "ꝙ":"q","ʠ":"q","ɋ":"q","ꝗ":"q",
        "ŕ":"r","ř":"r","ŗ":"r","ṙ":"r","ṛ":"r","ṝ":"r","ȑ":"r","ɾ":"r","ᵳ":"r","ȓ":"r","ṟ":"r","ɼ":"r","ᵲ":"r","ᶉ":"r","ɍ":"r","ɽ":"r","ↄ":"c","ꜿ":"c","ɘ":"e","ɿ":"r",
        "ś":"s","ṥ":"s","š":"s","ṧ":"s","ş":"s","ŝ":"s","ș":"s","ṡ":"s","ṣ":"s","ṩ":"s","ʂ":"s","ᵴ":"s","ᶊ":"s","ȿ":"s","ɡ":"g","ᴑ":"o","ᴓ":"o","ᴝ":"u",
        "ť":"t","ţ":"t","ṱ":"t","ț":"t","ȶ":"t","ẗ":"t","ⱦ":"t","ṫ":"t","ṭ":"t","ƭ":"t","ṯ":"t","ᵵ":"t","ƫ":"t","ʈ":"t","ŧ":"t","ᵺ":"th",
        "ɐ":"a","ᴂ":"ae","ǝ":"e","ᵷ":"g","ɥ":"h","ʮ":"h","ʯ":"h","ᴉ":"i","ʞ":"k","ꞁ":"l","ɯ":"m","ɰ":"m","ᴔ":"oe","ɹ":"r","ɻ":"r","ɺ":"r","ⱹ":"r","ʇ":"t","ʌ":"v","ʍ":"w","ʎ":"y","ꜩ":"tz",
        "ú":"u","ŭ":"u","ǔ":"u","û":"u","ṷ":"u","ü":"u","ǘ":"u","ǚ":"u","ǜ":"u","ǖ":"u","ṳ":"u","ụ":"u","ű":"u","ȕ":"u","ù":"u","ủ":"u","ư":"u","ứ":"u","ự":"u","ừ":"u","ử":"u","ữ":"u","ȗ":"u","ū":"u","ṻ":"u","ų":"u","ᶙ":"u","ů":"u","ũ":"u","ṹ":"u","ṵ":"u","ᵫ":"ue","ꝸ":"um",
        "ⱴ":"v","ꝟ":"v","ṿ":"v","ʋ":"v","ᶌ":"v","ⱱ":"v","ṽ":"v","ꝡ":"vy",
        "ẃ":"w","ŵ":"w","ẅ":"w","ẇ":"w","ẉ":"w","ẁ":"w","ⱳ":"w","ẘ":"w",
        "ẍ":"x","ẋ":"x","ᶍ":"x",
        "ý":"y","ŷ":"y","ÿ":"y","ẏ":"y","ỵ":"y","ỳ":"y","ƴ":"y","ỷ":"y","ỿ":"y","ȳ":"y","ẙ":"y","ɏ":"y","ỹ":"y",
        "ź":"z","ž":"z","ẑ":"z","ʑ":"z","ⱬ":"z","ż":"z","ẓ":"z","ȥ":"z","ẕ":"z","ᵶ":"z","ᶎ":"z","ʐ":"z","ƶ":"z","ɀ":"z",
        "ﬀ":"ff","ﬃ":"ffi","ﬄ":"ffl","ﬁ":"fi","ﬂ":"fl","ĳ":"ij","œ":"oe","ﬆ":"st",
        "ₐ":"a","ₑ":"e","ᵢ":"i","ⱼ":"j","ₒ":"o","ᵣ":"r","ᵤ":"u","ᵥ":"v","ₓ":"x"
    };
    return text.replace(/[^A-Za-z0-9\[\] ]/g,function(a){return simplificatedChars[a]||a});
}