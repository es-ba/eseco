set role to eseco201_produc_owner;
set search_path=encu;

alter table tem add column cluster bigint;

set application_name='emilio local psql'

--update tem set cluster = 1

select enc, etiqueta, json_encuesta->>'c5'
    ,(
        select string_agg(distinct cha_new_value::text, ', ')
            from his.changes 
            where cha_when < '2020-08-10'
                and cha_table='tem'
                and cha_column='etiqueta'
                and cha_new_value <> 'null'::jsonb
                and cha_new_pk->>'enc' = enc
    )

select count(*)
    from tem     --update tem set cluster = 1
    where cluster is null 
        and rea_m=1
        and exists (
        select 1 
            from his.changes 
            where cha_when < '2020-08-10'
                and cha_table='tem'
                and cha_column='etiqueta'
                and cha_new_value <> 'null'::jsonb
                and cha_new_pk->>'enc' = enc
    );

select count(*)
    from tem --update tem set cluster = 2
    where cluster is null
        and (rea_m = 1
            or cargado_dm is not null);

select cluster, case when cluster is null then 3 else 30+cluster end, count(*)
    from tem -- update tem set cluster = case when cluster is null then 3 else 30+cluster end
    where enc in (
    '10211',
    '10214',
    '10216', ...
    )
    group by cluster;

select area, count(*)
    from tem
    where 

alter table tem add column enc_original text;
alter table tem add unique (enc_original);

--------------------------------------------------------------------

alter table tem add column seleccionada_actual text;
alter table tem add column seleccionada_anterior text;
alter table tem add column confirmada boolean;
alter table areas add column auxiliar text;

update tem set seleccionada_actual = replace(observaciones_carga,'persona seleccionada: ','')
  where cluster = 4;


insert into areas (area) select area+1 from areas where area<700;


update tem c
    set (
  "nrocomuna" ,
  "nrofraccion" ,
  "nroradio" ,
  "nromanzana" ,
  "nrolado" ,
  "codviviendaparticular" ,
  "codcalle" ,
  "nomcalle" ,
  "nrocatastral" ,
  "piso" ,
  "departamento" ,
  "habitacion" ,
  "sector" ,
  "edificio" ,
  "entrada" ,
  "casa" ,
  "obsdatosdomicilio" ,
  "obsconjunto" ,
  "usodomicilio" ,
  "orden_relevamiento" ,
  "mapa" ,
  "barrio" ,
  "reserva" ,
  "dominio" ,
  "zona" ,
  "periodicidad" ,
  "participacion" ,
  "areaup" ,
  "rotacion_etoi" ,
  "rotacion_eah" ,
  "trimestre" ,
  "procedencia" ,
  "sel_etoi_villa" ,
  "marco" ,
  "codpos" ,
  "estrato_ing" ,
  "id_marco" 
    )=(select 
  "nrocomuna" ,
  "nrofraccion" ,
  "nroradio" ,
  "nromanzana" ,
  "nrolado" ,
  "codviviendaparticular" ,
  "codcalle" ,
  "nomcalle" ,
  "nrocatastral" ,
  "piso" ,
  "departamento" ,
  "habitacion" ,
  "sector" ,
  "edificio" ,
  "entrada" ,
  "casa" ,
  "obsdatosdomicilio" ,
  "obsconjunto" ,
  "usodomicilio" ,
  "orden_relevamiento" ,
  "mapa" ,
  "barrio" ,
  "reserva" ,
  "dominio" ,
  "zona" ,
  "periodicidad" ,
  "participacion" ,
  "areaup" ,
  "rotacion_etoi" ,
  "rotacion_eah" ,
  "trimestre" ,
  "procedencia" ,
  "sel_etoi_villa" ,
  "marco" ,
  "codpos" ,
  "estrato_ing" ,
  "id_marco" 
            from tem a
            where c.enc_original = a.enc)
    where enc_original is not null
      and cluster=4;

update tem t set seleccionada_anterior = 
	(select concat_ws(', ',
        json_encuesta->>'e1',
		json_encuesta->>'e2',
        'cel: '||(json_encuesta->>'c1')::text,
		'fijo: '||(json_encuesta->>'c3')::text,
		'alternativo: '||(json_encuesta->>'c4')::text,
		'mail: '||(json_encuesta->>'c2')::text)
	 	from tem a where a.enc=t.enc_original
	 ) 
  where cluster = 4; 




delete from areas a
    where not exists (select 1 from tem where area = a.area);


insert into roles (rol,nombre,superuser) values ('auxiliar','Auxiliar de campo',false);
insert into permisos (permiso, accion, predeterminado) values ('citas', 'programar', false);

insert into roles_permisos
    select 'auxiliar' as rol,permiso, accion, false as habilitado
        from roles_permisos
        where rol='recepcionista';
insert into roles_permisos
    select rol,'citas' as permiso, 'programar' as accion, false as habilitado
        from roles;

update roles_permisos set habilitado=true
    where (rol,permiso,accion) = ('auxiliar','citas','programar');