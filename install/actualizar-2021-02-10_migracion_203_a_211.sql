set search_path= encu;
set role to eseco211_muleto_owner;

drop table if exists tem_inquilinatos_reemplazadas;
drop table if exists encu_64902;
drop table if exists encu_64903;
drop table if exists tem_46606_auxiliar;
drop table if exists tem_46611_auxiliar;
--drop table if exists tem_reas_eseco202_participacion2;

alter table sincronizaciones disable trigger changes_trg;
delete from sincronizaciones;
alter table sincronizaciones enable trigger changes_trg;

alter table tokens disable trigger changes_trg;
delete from tokens;
alter table tokens enable trigger changes_trg;


--limpieza de campos
select * into etiquetas_bkp from etiquetas order by etiqueta;
alter table etiquetas disable trigger changes_trg;
update etiquetas
    set operativo='ESECO211',
    resultado            = null,
    fecha                = null,
    hora                 = null,
    laboratorista        = null,
    observaciones        = null,
    ingreso_lab          = null,
    rectificacion        = null,
    avisado_fecha        = null,
    avisado_quien        = null,
    avisado_observaciones= null;
alter table etiquetas enable trigger changes_trg;

--preparar tem de testeo
--Ver de recortar la tem???
select * into tem_bkp from tem order by enc;
alter table tem disable trigger changes_trg;
update tem
   set json_encuesta=null,
      seleccionado_anterior=null,
      nomcalle=translate(nomcalle,'ABCDEFGHIJKLMNOPQRSTUVW','XYZZYXXXXYYYZZZXYZXYZXX'),
      fexp=null,
      json_backup=null,
      panel=null,
      resumen_estado=null,
      cita=null
;

alter table tem enable trigger changes_trg;

--hay que limpiar campos de tablas tareas_tem, visitas


--his
--truncate  his.changes;--descarte de datos desde el dump

