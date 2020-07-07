import * as React from "react";
import * as ReactDOM from "react-dom";
import {  
    FocusOpts, RenderPrincipal, 
    clsx, memoize, adaptarTipoVarCasillero,
    ICON,
    focusToId,
    scrollToTop,
    scrollToBottom
} from "./render-general";
import {Bloque, BotonFormulario, 
    CasilleroBase, CasoState, Consistencia, DatosVivienda, FeedbackVariable, Filtro, ForPk, Formulario, 
    IdCaso, IdFormulario, IdVariable, InfoFormulario,
    ModoDespliegue,
    Opcion, OpcionMultiple, OpcionNo, OpcionSi, 
    Pregunta, PreguntaConOpciones, PreguntaConOpcionesMultiples, PreguntaSimple, 
    Respuestas, Valor, TEM, IdCarga, Carga, HojaDeRuta,
} from "./tipos";
import { dmTraerDatosFormulario, dispatchers, 
    getFuncionHabilitar, 
    toPlainForPk 
} from "./redux-formulario";
import { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux"; 
import * as likeAr from "like-ar";

import {
    AppBar, Badge, Button, ButtonGroup, Card, Chip, CircularProgress, CssBaseline, 
    Dialog, DialogActions, DialogContent, DialogContentText, 
    DialogTitle, Divider, Fab, Grid, IconButton, InputBase, 
    Link, List, ListItem, ListItemIcon, ListItemText, Drawer, 
    Menu, MenuItem, Paper, Popover,
    Step, Stepper, StepContent, StepLabel, 
    SvgIcon, Switch, 
    Table, TableBody, TableCell, TableHead, TableRow, TextField, Theme, Toolbar, Typography, Zoom,
    useScrollTrigger,
    createStyles, makeStyles
} from "@material-ui/core";

var useStyles = makeStyles((_theme: Theme) =>
    createStyles({
        root:{},
        errorCasillero:{
            backgroundColor:'#FDA'
        },
        F:{
            fontSize:'2rem'
        },
        aclaracion:{
            color:'gray'
        },
        idOpcionM:{
            fontWeight:'bold',
            margin:'4px',
            color:'gray'
        },
        textoOpcion:{
            margin:'6px'
        },
        buttonOpcion:{
            padding:'0px',
            paddingLeft:'3px',
            textTransform: 'none',
            color:'inherit'
        },

        itemOpciones:{
            border:'1px dashed red'
        },
        salto:{
            textAlign:'center',
            fontSize:'80%',
            '&::before':{
                content:'->'
            },
            '::before':{
                content:'=>'
            },
        }
    })
);

/*
// const takeElementOrDefault<K, T extends [K in], D>()
function isIn<V, T>(k:keyof T, object:T): object[k] is V{
    return true
}
*/
function takeElementOrDefault<V,K extends string,KO extends string>(k:K, object:{[k in KO]:V}, defaultValue:V):V{
    return k in object ? 
        // @ts-expect-error por alguna razón TS no quiere entender que si k está en object, object[k] existe
        object[k] 
    : defaultValue
}

function DespliegueEncabezado(props:{casillero:CasilleroBase, leer?:boolean}){
    const {casillero} = props;
    var classes = useStyles();
    return <Grid container alignItems="center" debe-leer={props.leer?'SI':'NO'}>
        <Grid item>
            <Button variant="outlined" className={takeElementOrDefault(casillero.tipoc, classes, classes.root)}>{casillero.ver_id || casillero.casillero}</Button>
        </Grid>
        <Grid item>
            <Typography className={takeElementOrDefault(casillero.tipoc, classes, classes.root)}>{casillero.nombre}</Typography>
            {casillero.aclaracion?
                <Typography className={classes.aclaracion}>{casillero.aclaracion}</Typography>
            :null}
        </Grid>
    </Grid>
}

function OpcionDespliegue(props:{casillero:CasilleroBase, valorOpcion:number, variable:IdVariable, forPk:ForPk, elegida:boolean, leer:boolean}){
    const {casillero} = props;
    var classes = useStyles();
    var dispatch = useDispatch();
    return <Grid className="opcion"> 
        <Button 
            variant="outlined"
            opcion-seleccionada={props.elegida?"SI":"NO"}
            className={classes.buttonOpcion}
            onClick={()=>{
                dispatch(dispatchers.REGISTRAR_RESPUESTA({respuesta:props.valorOpcion, variable:props.variable, forPk:props.forPk}))
            }}
        >
            <Grid container>
                <Grid className="id">
                    {casillero.ver_id || casillero.casillero}
                </Grid>
                <Grid className={classes.textoOpcion} debe-leer={casillero.despliegue?.includes('si_leer')?'SI':casillero.despliegue?.includes('no_leer')?'NO':props.leer?'SI':'NO'}>
                    <Typography>{casillero.nombre}</Typography>
                    {casillero.aclaracion?
                        <Typography className={classes.aclaracion}>{casillero.aclaracion}</Typography>
                    :null}
                </Grid>
            </Grid>
        </Button>
        {casillero.salto?
            <Typography className={classes.salto}>{casillero.salto}</Typography>
        :null}
    </Grid>
}
interface IcasilleroConOpciones{
    var_name:IdVariable,
    casilleros:Opcion[]
}


function SiNoDespliegue(props:{casilleroConOpciones:IcasilleroConOpciones, forPk:ForPk, valorActual:Valor}){
    return <OpcionesDespliegue 
        casilleroConOpciones={props.casilleroConOpciones} 
        forPk={props.forPk} 
        valorActual={props.valorActual}
        leer={false}
        horizontal={true}
    />
}

function OpcionMultipleDespliegue(props:{opcionM:OpcionMultiple, forPk:ForPk, valorActual:Valor, feedback:FeedbackVariable}){
    const {opcionM} = props;
    var classes = useStyles();
    return <div className="multiple" nuestro-validator={props.feedback.estado} esta-inhabilitada={props.feedback?.inhabilitada?'SI':'NO'}
>
        <EncabezadoDespliegue 
            casillero={opcionM} 
            verIdGuion={true} 
            leer={!opcionM.despliegue?.includes('no_leer')} 
            tieneValor={props.valorActual!=null?(props.feedback.conProblema?'invalido':'valido'):'NO'}
            feedback={props.feedback}
            forPk={props.forPk}
        />
        <div className="casilleros">
            <Grid container>
                <SiNoDespliegue 
                    casilleroConOpciones={opcionM} 
                    forPk={props.forPk}
                    valorActual={props.valorActual}
                />
            </Grid>
        </div>
    </div>
}

function EncabezadoDespliegue(props:{casillero:CasilleroBase, verIdGuion?:boolean, leer?:boolean, tieneValor?:string, feedback?:FeedbackVariable|null, forPk:ForPk}){
    var {casillero} = props;
    var dispatch = useDispatch()
    const [anchorEl, setAnchorEl] = useState<HTMLDivElement | null>(null);
    var key=(casillero.ver_id!='-' || props.verIdGuion) && casillero.ver_id || casillero.casillero;
    const handleClose=()=>{
        setAnchorEl(null);
    }
    const open = Boolean(anchorEl);
    return <div 
        className="encabezado" 
        debe-leer={props.leer?'SI':'NO'} 
        tiene-valor={props.tieneValor} 
    >
        <div id={casillero.var_name || undefined} className="id-div"
            onClick={event=>{
                if(casillero.var_name!=null && props.tieneValor=='invalido'){
                    dispatch(dispatchers.REGISTRAR_RESPUESTA({forPk:props.forPk, variable:casillero.var_name, respuesta:null}))
                }else if(casillero.var_name!=null){
                    setAnchorEl(event.currentTarget);
                }
            }}
        >
            <div className="id">
                {key}
            </div>
        </div>
        <div className="nombre-div">
            <div className="nombre">{casillero.nombre}</div>
            {casillero.aclaracion?
                <div className="aclaracion">{casillero.aclaracion}</div>
            :null}
            <div los-metadatos="si">
                <span el-metadato="variable">{casillero.var_name}</span>
                {casillero.tipovar && casillero.tipovar!='opciones' && casillero.tipovar!='si_no'?
                    <span el-metadato="tipovar">{casillero.tipovar}</span>
                :null}
                {   //@ts-ignore una opción múltiple nunca lo a a ser, no tiene el campo, no importa
                    casillero.optativo?<span el-metadato="optativa">optativa</span>:null
                }
                {casillero.despliegue?.includes('calculada')?<span el-metadato="calculada">calculada</span>:null}
                {casillero.despliegue?.includes('oculta')?<span el-metadato="oculta">oculta</span>:null}
                {casillero.expresion_habilitar?<span el-metadato="expresion_habilitar">habilita: {casillero.expresion_habilitar}</span>:null}
            </div>
        </div>
        <Popover
            id={anchorEl && "popover-confirmar" || undefined}
            open={open}
            anchorEl={anchorEl}
            onClose={handleClose}
            anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
            }}
            transformOrigin={{
                vertical: 'top',
                horizontal: 'left',
            }}
        >   
            {props.tieneValor=="valido" && casillero.var_name?<div className="confirma-borrado">
                <Typography>La pregunta tiene registrada una respuesta</Typography>
                <div className="confirma-botones">
                    <Button color="primary"   variant="outlined" onClick={handleClose}>dejar así</Button>
                    <Button color="secondary" variant="outlined" onClick={()=>{
                        if(casillero.var_name){
                            dispatch(dispatchers.REGISTRAR_RESPUESTA({forPk:props.forPk, variable:casillero.var_name, respuesta:null}))
                        }
                        handleClose()
                    }}>Borrar respuesta</Button>
                </div>
            </div>:<div className="confirma-borrado">
                {props.feedback?.estado=="actual"?<>
                    <Typography>Esta es la pregunta actual {props.leer?"lea la respuesta y ":""} registre la respuesta </Typography>
                    <Typography>
                        {casillero.tipovar=="opciones"||casillero.tipovar=="si_no"?
                            "en el botón azul de la respuesta correspondiente "
                        :   "sobre la raya azul (pulse sobre ella para que aparezca el teclado)"}
                    </Typography>
                </>:props.feedback?.estado=="omitida"?<>
                    <Typography>Esta es la pregunta parece omitida.</Typography>
                    <Typography>Quizás falte ingresar la respuesta.</Typography>
                    <Typography>Quizás haya un error en una pregunta anterior.</Typography>
                </>:props.feedback?.estado=="fuera_de_rango"?<>
                    <Typography>La respuesta está fuera de rango</Typography>
                </>:props.feedback?.estado=="fuera_de_flujo_por_omitida"?<>
                    <Typography>Hay una respuesta omitida o un error más arriba.</Typography>
                    <Typography>Revise la pregunta marcada en amarillo.</Typography>
                </>:props.feedback?.estado=="todavia_no"?<>
                    <Typography>Todavía no hay que contestar esta pregunta.</Typography>
                    <Typography>Ingresar la respuesta a la pregunta de fondo blanco.</Typography>
                </>:props.feedback?.estado=="salteada"?<>
                    <Typography>Esta pregunta está salteada debido a una respuesta marcada más arriba.</Typography>
                    <Typography>Buscar la siguiente pregunta de fondo blanco.</Typography>
                </>:
                null}
                <div className="confirma-botones">
                    <Button color="primary"   variant="outlined" onClick={handleClose}>continuar</Button>
                </div>
            </div>}
        </Popover>
    </div>
}

function calcularNuestraLongitud(longitud:string |null){
    var value = parseInt(longitud||'9999');
    if(isNaN(value)){
        return 'full';
    }else{
        return value<=10?'small'
            :value<=20?'medium':'full'
    }
}

function Campo(props:{disabled:boolean, pregunta:PreguntaSimple, valor:Valor, onChange:(valor:Valor)=>void}){
    var {pregunta, disabled } = props;
    var [valor, setValor] = useState(props.valor);
    var [editando, setEditando] = useState(false);
    useEffect(() => {
        setValor(props.valor)
    }, [props.valor]);
    const inputProps = {
        maxLength: pregunta.longitud,
    };
    var nuestraLongitud = calcularNuestraLongitud(pregunta.longitud)
    return <div className="campo" nuestra-longitud={nuestraLongitud}>
        <div className="input-campo">
            <TextField 
                disabled={disabled}
                className="variable" 
                //var-length={pregunta.longitud} 
                fullWidth={true}
                inputProps={inputProps}
                value={valor?valor:''} 
                type={adaptarTipoVarCasillero(pregunta.tipovar)}
                onChange={(event)=>setValor(event.target.value || null)}
                onFocus={(_event)=>setEditando(true)}
                onBlur={(_event)=>{
                    props.onChange(valor)
                    setEditando(false)
                }}
            />
        </div>
        {disabled?null:
            <div className="boton-confirmar-campo">
                <Button variant={editando?"contained":'outlined'} size="small" color={editando?'primary':'default'}><ICON.Check/></Button>
            </div>
        }
    </div>
}

interface IcasilleroConOpciones{
    var_name:IdVariable,
    casilleros:Opcion[]
}

function OpcionesDespliegue(
    {casilleroConOpciones, forPk, valorActual, leer, horizontal}:
    {casilleroConOpciones:IcasilleroConOpciones, forPk:ForPk, valorActual:Valor, leer:boolean, horizontal:boolean}
    // {casilleroConOpciones:PreguntaConOpciones|OpcionMultiple, forPk:ForPk, valorActual:Valor, leer:boolean, horizontal:boolean}
){
    return <Grid container direction={horizontal?"row":"column"} wrap={horizontal?"nowrap":"wrap"}>{
        casilleroConOpciones.casilleros.map((opcion:Opcion)=>
            <Grid key={opcion.casillero} item
                ocultar-salteada={opcion.despliegue?.includes('ocultar')?(opcion.expresion_habilitar?'INHABILITAR':'SI'):'NO'}
            >
                <OpcionDespliegue 
                    casillero={opcion} 
                    valorOpcion={opcion.casillero} 
                    variable={casilleroConOpciones.var_name} 
                    forPk={forPk} 
                    elegida={valorActual==opcion.casillero}
                    leer={leer}
                />
            </Grid>
        )
    }</Grid>
}

function PreguntaDespliegue(props:{
    pregunta:Pregunta, 
    forPk:ForPk, 
    valorActual:Valor, 
    respuestas:Respuestas|null, 
    feedback:FeedbackVariable|null,
    feedbackRow:{[v in IdVariable]:FeedbackVariable}|null
}){
    var {pregunta} = props;
    var dispatch=useDispatch();
    return <div 
        className="pregunta" 
        nuestro-tipovar={pregunta.tipovar||"multiple"} 
        nuestro-validator={props.feedback?.estado}
        ocultar-salteada={pregunta.despliegue?.includes('ocultar')?(pregunta.expresion_habilitar?'INHABILITAR':'SI'):'NO'}
        esta-inhabilitada={props.feedback?.inhabilitada?'SI':'NO'}
    >
        <EncabezadoDespliegue 
            casillero={pregunta} 
            leer={!pregunta.despliegue?.includes('no_leer')}  
            tieneValor={props.valorActual!=null && props.feedback!=null?(props.feedback.conProblema?'invalido':'valido'):'NO'}
            feedback={props.feedback}
            forPk={props.forPk}
        />
        <div className="casilleros">{
            pregunta.tipovar=="si_no"?<Grid container>
                <SiNoDespliegue 
                    casilleroConOpciones={pregunta} 
                    forPk={props.forPk} 
                    valorActual={props.valorActual}
                />
            </Grid>:
            pregunta.tipovar=="opciones" ?
                <OpcionesDespliegue 
                    casilleroConOpciones={pregunta} 
                    forPk={props.forPk} 
                    valorActual={props.valorActual}
                    leer={!!pregunta.despliegue?.includes('si_leer')}
                    horizontal={!!pregunta.despliegue?.includes('horizontal')}
                />:
            pregunta.tipovar==null?
                (pregunta.casilleros as OpcionMultiple[]).map((opcionMultiple)=>
                    <OpcionMultipleDespliegue
                        key={opcionMultiple.casillero} 
                        opcionM={opcionMultiple} 
                        forPk={props.forPk} 
                        valorActual={props.respuestas?.[opcionMultiple.var_name]!}
                        feedback={props.feedbackRow?.[opcionMultiple.var_name]!}
                    />
                )
            :
            ((preguntaSimple:PreguntaSimple)=>
                <Campo
                    disabled={preguntaSimple.despliegue?.includes('calculada')?true:false}
                    pregunta={preguntaSimple}
                    valor={props.valorActual}
                    onChange={(nuevoValor)=>
                        dispatch(dispatchers.REGISTRAR_RESPUESTA({forPk:props.forPk, variable:preguntaSimple.var_name, respuesta:nuevoValor}))
                    }
                />
            )(pregunta)
        }</div>
    </div>
}

function FiltroDespliegue(props:{filtro:Filtro, forPk:ForPk}){
    var {filtro} = props;
    return <Paper>
        <DespliegueEncabezado casillero={filtro}/>
    </Paper>
}

function ConsistenciaDespliegue(props:{casillero:Consistencia, forPk:ForPk}){
    var {casillero, forPk} = props;
    var habilitador = casillero.expresion_habilitar?getFuncionHabilitar(casillero.expresion_habilitar):()=>true;
    var {respuestas} = useSelectorVivienda(forPk);
    var habilitado = habilitador(respuestas);
    return habilitado?<div 
        className="consistencia" 
    >
        <DespliegueEncabezado casillero={casillero} leer={false}/>
    </div>:null
}

function BotonFomulario(props:{casillero:BotonFormulario, forPk:ForPk}){
    var {casillero, forPk} = props;
    var habilitador = casillero.expresion_habilitar?getFuncionHabilitar(casillero.expresion_habilitar):()=>true;
    var {respuestas} = useSelectorVivienda(forPk);
    var habilitado = habilitador(respuestas);
    var dispatch = useDispatch();
    var [confirmarForzarIr, setConfirmarForzarIr] = useState(false);
    const ir = ()=>{
        dispatch(dispatchers.CAMBIAR_FORMULARIO({forPk:{...forPk, formulario:'F:'+casillero.salto! as IdFormulario}}));
        if(confirmarForzarIr){setConfirmarForzarIr(false)}
    };
    return <div 
        className="seccion-boton-formulario" 
        nuestro-validator={habilitado?'actual':'todavia_no'}
        ocultar-salteada={casillero.despliegue?.includes('ocultar')?(casillero.expresion_habilitar?'INHABILITAR':'SI'):'NO'}
    >
        <div className="aclaracion">{casillero.aclaracion}</div>
        <Button
            variant="contained"
            color={habilitado?"primary":"default"}
            disabled={!casillero.salto}
            onClick={()=>{
                if(habilitado) ir(); 
                else setConfirmarForzarIr(true);
            }}
        >{casillero.nombre}<ICON.Send/></Button>
        <Dialog 
            open={confirmarForzarIr}
            onClose={()=>setConfirmarForzarIr(false)}
        >
            <Typography>No se puede avanzar al siguiente formulario.</Typography>
            <Typography>Quizás no terminó de contestar las preguntas correspondientes</Typography>
            <Typography>Quizás no corresponde en base a las respuestas obtenidas</Typography>
            <Button color="secondary" onClick={ir}>forzar</Button>
            <Button color="primary" variant="contained" onClick={()=>setConfirmarForzarIr(false)}>Entendido</Button>
        </Dialog>
    </div>
}

function CasilleroDesconocido(props:{casillero:CasilleroBase}){
    var classes = useStyles();
    return <Paper className={classes.errorCasillero}>
        <Typography>Tipo de casillero no implementado: "{props.casillero.tipoc}" para "{props.casillero.casillero}"</Typography>
        <DespliegueEncabezado casillero={props.casillero}/>
    </Paper>
}

function useSelectorVivienda(forPk:ForPk){
    return useSelector((state:CasoState)=>{
        var respuestas=state.datos.hdr[forPk.vivienda].respuestas;
        //TODO: generalizar
        if(forPk.persona){
            // @ts-ignore
            respuestas = respuestas.personas[forPk.persona-1]
        }
        return {
            respuestas,
            feedbackRow: state.feedbackRowValidator[toPlainForPk(forPk)].feedback,
            actual: state.feedbackRowValidator[toPlainForPk(forPk)].actual,
            completo: !state.feedbackRowValidator[toPlainForPk(forPk)].feedbackResumen.pendiente,
            resumen: state.feedbackRowValidator[toPlainForPk(forPk)].resumen,
            formulario: state.estructura.formularios[forPk.formulario].casilleros,
            modoDespliegue: state.modo.demo?state.opciones.modoDespliegue:'relevamiento',
            modo: state.modo
        }
    })
}

function DesplegarContenidoInternoBloqueOFormulario(props:{bloqueOFormulario:Bloque|Formulario, forPk:ForPk, multiple:boolean}){
    var {respuestas, feedbackRow} = useSelectorVivienda(props.forPk);
    return <div className="casilleros">{
        props.bloqueOFormulario.casilleros.map((casillero)=>
            <Grid key={casillero.casillero} item>
                {
                    casillero.tipoc == "P"?
                        <PreguntaDespliegue 
                            pregunta={casillero} 
                            forPk={props.forPk} 
                            valorActual={casillero.var_name && respuestas[casillero.var_name] || null} 
                            respuestas={(!casillero.var_name || null) && respuestas}
                            feedback={casillero.var_name && feedbackRow[casillero.var_name] || null}
                            feedbackRow={!casillero.var_name && feedbackRow || null}
                        />:
                    casillero.tipoc == "B"?<BloqueDespliegue bloque={casillero} forPk={props.forPk}/>:
                    casillero.tipoc == "FILTRO"?<FiltroDespliegue filtro={casillero} forPk={props.forPk}/>:
                    casillero.tipoc == "BF"?<BotonFomulario casillero={casillero} forPk={props.forPk}/>:
                    casillero.tipoc == "CONS"?<ConsistenciaDespliegue casillero={casillero} forPk={props.forPk}/>:
                    <CasilleroDesconocido casillero={casillero}/>
                }
            </Grid>
        )
    }</div>
}

function BloqueDespliegue(props:{bloque:Bloque, forPk:ForPk}){
    var {bloque, forPk} = props;
    var key=bloque.ver_id!='-' && bloque.ver_id || bloque.casillero;
    var activeStep=0;
    var multiple = !!bloque.unidad_analisis;
    var lista = [{forPk, key:0, multiple:false}];
    if(multiple){
        var {respuestas} = useSelectorVivienda(forPk);
        // TODO: GENERALIZAR
        // @ts-ignore 
        lista=respuestas.personas.map((_persona, i)=>(
            {forPk:{...forPk, persona:i+1}, key:i+1, multiple:true}
        ))
    }
    return <div className="bloque" nuestro-bloque={bloque.casillero} es-multiple={multiple?'SI':'NO'}>
        <EncabezadoDespliegue casillero={bloque} forPk={forPk}/>
        {lista.map(({key, forPk, multiple})=>
            <DesplegarContenidoInternoBloqueOFormulario key={key} bloqueOFormulario={bloque} forPk={forPk} multiple={multiple}/>
        )}
    </div>
}

const FormularioEncabezado = DespliegueEncabezado;

function FormularioDespliegue(props:{forPk:ForPk}){
    var forPk = props.forPk;
    var {formulario, modoDespliegue, modo, feedbackRow, actual, completo} = useSelectorVivienda(props.forPk);
    const dispatch = useDispatch();
    useEffect(() => {
        if(actual){
            focusToId(actual, {moveToElement:true, moveBehavior:'smooth'});            
        }else if(completo && forPk.formulario!=('F:F2' as IdFormulario)){ // TODO generalizar los que van siempre arriba
            scrollToBottom()
        }else{
            scrollToTop()
        }
    }, [formulario]);
    var listaModos:ModoDespliegue[]=['metadatos','relevamiento','PDF'];
    return (
        <>
            <AppBar position="fixed">
                <Toolbar>
                    <IconButton
                        color="inherit"
                        onClick={()=>
                            dispatch(dispatchers.VOLVER_HDR({}))
                        }
                    >
                        <ICON.ChevronLeft/>
                    </IconButton>
                    <Typography variant="h6">
                        Vivienda
                    </Typography>
                </Toolbar>
            </AppBar>
            <main>
                <Paper className="formulario" modo-despliegue={modoDespliegue}>
                    {modo.demo?<div>
                        <Typography component="span">Modo de despliegue:</Typography>
                        <ButtonGroup>
                        {listaModos.map(modo=>
                            <Button key={modo} variant={modo==modoDespliegue?"contained":"outlined"} onClick={
                                ()=>dispatch(dispatchers.MODO_DESPLIEGUE({modoDespliegue:modo}))
                            }>{modo}</Button>
                        )}
                        </ButtonGroup>
                    </div>:null}
                    <FormularioEncabezado casillero={formulario}/>
                    <DesplegarContenidoInternoBloqueOFormulario bloqueOFormulario={formulario} forPk={forPk} multiple={false}/>
                </Paper>
                <div className='espacio-final-formulario'></div>
            </main>
        </>
    );
}

function calcularResumenVivienda(idCaso:IdCaso){
    var prioridades = {
        'con problemas':{prioridad: 1, cantidad:0},
        'incompleto':{prioridad: 2, cantidad:0},
        'vacio':{prioridad: 3, cantidad:0},
        'ok':{prioridad: 4, cantidad:0}
    }
    var {formularios} = useSelector((state:CasoState)=>({formularios: state.estructura.formularios}));
    var forms = likeAr(formularios).map((_infoFormulario:InfoFormulario, idFormulario: IdFormulario)=>
        idFormulario
    ).array();
    var min = 4
    var minResumen: 'vacio' | 'con problemas' | 'incompleto' | 'ok' = 'ok';
    forms.forEach((formulario:IdFormulario)=>{
        var {resumen} = useSelectorVivienda({vivienda:idCaso, formulario});    
        if(prioridades[resumen].prioridad<min){
            min=prioridades[resumen].prioridad;
            min=prioridades[resumen].cantidad++;
            minResumen=resumen;
        }
        minResumen = minResumen=='vacio'&& prioridades['ok'].cantidad?'incompleto':minResumen;
    })
    return minResumen
}

export function Atributo(props:{nombre:string, valor:string}){
    return props.valor!=null && props.valor!=''?<span className="atributo-par">
        <span className="atributo-nombre">{props.nombre}</span> <span className="atributo-valor">{props.valor}</span>
    </span>:null
}

export function DesplegarCarga(props:{carga:Carga, idCarga:IdCarga, hdr:HojaDeRuta, mainForm:IdFormulario}){
    const {carga, idCarga, hdr, mainForm} = props;
    const dispatch = useDispatch();
    return <Paper className="carga">
        <div className="informacion-carga">
            <div className="fecha">{carga.fecha}</div>
            <div className="observaciones">{carga.observaciones}</div>
        </div>
        <Table className="tabla-carga-hoja-de-ruta">
            <colgroup>
                <col style={{width:"15%"}}/>
                <col style={{width:"80%"}}/>
            </colgroup>
            <TableHead style={{fontSize: "1.2rem"}}>
                <TableRow className="tr-carga">
                    <TableCell>vivienda</TableCell>
                    <TableCell>domicilio</TableCell>
                </TableRow>
            </TableHead>
            <TableBody>
                {likeAr(hdr).filter((datosVivienda:DatosVivienda)=>datosVivienda.tem.carga==idCarga).map((datosVivienda: DatosVivienda, idCaso: IdCaso)=>
                    <TableRow>
                        <TableCell>
                            <Button
                                resumen-vivienda={calcularResumenVivienda(idCaso)}
                                variant="outlined"
                                onClick={()=>{
                                    dispatch(dispatchers.CAMBIAR_FORMULARIO({forPk:{vivienda:idCaso, formulario:mainForm}}))
                                }}
                            >
                                {idCaso}
                            </Button>
                        </TableCell>
                        <TableCell>
                            <DesplegarTem tem={datosVivienda.tem}/>
                        </TableCell>
                    </TableRow>
                ).array()}
            </TableBody>
        </Table>
    </Paper>
}

export function DesplegarTem(props:{tem:TEM}){
    const {tem} = props;
    return <div>
        <div className="tem-domicilio">{tem.nomcalle} {tem.nrocatastral} <Atributo nombre="piso" valor={tem.piso}/> <Atributo nombre="dpto" valor={tem.departamento}/> </div>
        <div>
            <Atributo nombre="sector" valor={tem.sector}/>
            <Atributo nombre="edificio" valor={tem.edificio}/>
            <Atributo nombre="casa" valor={tem.casa}/>
            <Atributo nombre="entrada" valor={tem.entrada}/>
            <Atributo nombre="habitacion" valor={tem.habitacion}/>
        </div>
        <div className="tem-observaciones">{tem.observaciones}</div>
    </div>
}

export function HojaDeRutaDespliegue(){
    var {hdr, cargas, mainForm, modo} = useSelector((state:CasoState)=>({hdr:state.datos.hdr, cargas: state.datos.cargas, mainForm:state.estructura.mainForm, modo:state.modo}));
    var dispatch = useDispatch();
    const updateOnlineStatus = function(){
        setOnline(window.navigator.onLine);
    }
    const [online, setOnline] = useState(window.navigator.onLine);
    window.addEventListener('online',  updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return (
        <>
            <AppBar position="fixed">
                <Toolbar>
                    <Typography variant="h6">
                        Hoja de ruta
                    </Typography>
                    <IconButton style={{marginTop:'3px'}}
                        color="inherit"
                        //onClick={/*dispatch que lleva a pantalla opciones*/}
                    >
                        <ICON.Settings/>
                    </IconButton>
                    {online?
                        <IconButton
                            color="inherit"
                            onClick={()=>{
                                //PROVISORIO
                                history.replaceState(null, '', `${location.origin+location.pathname}/../menu#i=encuestadores,sincronizar_dm`);
                                location.reload();   
                            }}
                        >
                            <ICON.SyncAlt/>
                        </IconButton>
                    :null}
                </Toolbar>
            </AppBar>
            <div className="hoja-de-ruta">
                {modo.demo?<div>
                    <Typography>Modo demo </Typography>
                    <Button variant="outlined" color="secondary"
                        onClick={()=>dispatch(dispatchers.REINICIAR_DEMO({}))}
                    >
                        reiniciar
                    </Button>
                </div>:null}
                {likeAr(cargas).map((carga: Carga, idCarga: IdCarga)=>
                    <DesplegarCarga carga={carga} idCarga={idCarga} hdr={hdr} mainForm={mainForm}/>
                ).array()}
            </div>
        </>
    );
}

export function ListaTextos(props:{textos:string[]}){
    return <ul>
        {props.textos.map(t=><li><Typography>{t}</Typography></li>)}
    </ul>;
}

export function BienvenidaDespliegue(){
    var dispatch=useDispatch();
    return <Paper className="bienvenida">
        <Typography>DEMO del sistema de relevamiento de ESECO</Typography>
        <Typography>En esta demo:</Typography>
        <ListaTextos textos={[
            "Algunas viviendas aparecen relevadas (el botón está de color) sirven para ver cómo se ve",
            "Lo que se carguen se guardan localmente pero no se trasmiten a la base de datos",
            "Se puede volver a la versión inicial (o sea borrar lo que se guardó localmente) desde la hoja de ruta boton [reiniciar demo]",
            "Todavía hay cosas que faltan o pueden cambiar",
        ]} />
        <Button
            variant="contained"
            color="primary"
            onClick={()=>dispatch(dispatchers.SET_OPCION({opcion:'bienvenido', valor:true}))}
        >
            Continuar <ICON.Send/>
        </Button>
    </Paper>
}

export function AppEseco(){
    var {forPk, bienvenido} = useSelector((state:CasoState)=>({...state.opciones, ...state.modo}));
    if(!bienvenido){
        return <BienvenidaDespliegue /> 
    }else if(forPk==null){
        return <HojaDeRutaDespliegue /> 
    }else{
        return <FormularioDespliegue forPk={forPk}/>
    }
}

export async function desplegarFormularioActual(opts:{modoDemo:boolean}){
    // traer los metadatos en una "estructura"
    // traer los datos de localStorage
    // verificar el main Layout
    const store = await dmTraerDatosFormulario(opts)
    ReactDOM.render(
        <RenderPrincipal store={store} dispatchers={dispatchers} mensajeRetorno="Volver a la hoja de ruta">
            <AppEseco/>
        </RenderPrincipal>,
        document.getElementById('main_layout')
    )
}

if(typeof window !== 'undefined'){
    // @ts-ignore para hacerlo
    window.desplegarFormularioActual = desplegarFormularioActual;
    // window.desplegarHojaDeRuta = desplegarHojaDeRuta;
}