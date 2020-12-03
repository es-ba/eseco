-- operaciones.sql
set search_path = encu; set role to eseco201_muleto_owner;
set search_path = encu; set role to eseco201_produc_owner;

-- unión de tokens con changes
select *
  from his.changes inner join tokens t on cha_new_value = to_jsonb(t.token)
  limit 2;

-- en el histórico buscando sincronizaciones antes de tener la tabla
select idper, apellido, nombre
       , max(cha_when)
  from his.changes inner join tokens t on cha_new_value = to_jsonb(t.token)
       inner join usuarios on username = usuario
  where cha_table='tem' 
    and cha_column='cargado_dm'
    and cha_op='UPDATE'
    and cha_new_value is not null
    --  and cha_when > current_date
  group by idper, apellido, nombre
  order by apellido, nombre;

-- ver qué tokens tiene un usuario
select token, date, username, useragent->>'source'
  from tokens
  where username='yortega'
  order by username desc;

-- matarle la carga a un usuario para un token
/* reviso 
 ca6f8cab05d35a7ed6267cd921524616 | 2020-07-22 17:15:44.371 | yortega  | Mozilla/5.0 (Linux; Android 9; SM-T295) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36
 bc38adc4813b1c69d9d5bae33d009ac6 | 2020-07-22 17:15:46.856 | yortega  | Mozilla/5.0 (Linux; Android 9; SM-T295) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36
 dc3b9413f74df070efc77dd94f78ac2f | 2020-07-22 19:14:35.424 | yortega  | Mozilla/5.0 (Linux; Android 8.1.0; Moto G (5S) Plus) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Mobile Safari/537.36
 sospecho que es el último
*/

select * from tem where cargado_dm='dc3b9413f74df070efc77dd94f78ac2f'; -- no tiene
select * from tem where cargado_dm='bc38adc4813b1c69d9d5bae33d009ac6'; -- no tiene
select * from tem where cargado_dm='ca6f8cab05d35a7ed6267cd921524616'; -- tiene 24

update tem set cargado_dm=null where cargado_dm='ca6f8cab05d35a7ed6267cd921524616'; 

select tem.enc, t.username, t.token
  from tem inner join tokens t on tem.cargado_dm=t.token
  where area=134;


-- ver qué tokens tiene un usuario
select token, date, username, useragent->>'source'
  from tokens
  where username='asalas'
  order by username desc;


select to_date(json_encuesta->>'dv2', 'dd/mm/yyyy'), 
        sum(case when rea_m=1 then 1 else null end) as reas,
        count(distinct relevador) as relevadores,
        round(sum(case when rea_m=1 then 1 else null end)*1.0/count(distinct relevador),1) as efectividad,
        array_agg(distinct nrocomuna order by nrocomuna) as comunas
  from tem 
  where json_encuesta->>'dv2' is not null
  group by to_date(json_encuesta->>'dv2', 'dd/mm/yyyy')
  order by 1;

select etiqueta, count(*)
  from tem
  group by etiqueta
  order by count(*) desc, etiqueta;

create table comunas(
    comuna integer primary key,
    zona text
);

insert into comunas(comuna) select num from generate_series(1,15) num;

update comunas set zona = case when comuna in (2, 13, 14) then 'Norte' when comuna in (4, 8, 9, 10) then 'Sur' else 'Centro' end;

select grupo
       , count(rea_m) as realizadas
       , count(resultado) as con_resultado
       , count(case when resultado ilike 'positivo' then 1 else null end) as positivos
       , round(count(case when resultado ilike 'positivo' then 1 else null end)*100.0/count(resultado),1) as "%"
    from (
        select comunas.zona as grupo, *
            from tem inner join etiquetas using (etiqueta) inner join comunas on (nrocomuna=comuna)
    ) x
    group by cube (grupo)
    order by grupo;

select grupo, grupo2
       , count(rea_m) as realizadas
       , count(resultado) as con_resultado
       , sum(case when resultado ilike 'positivo' then 1 else null end) as positivos
       , round(count(case when resultado ilike 'positivo' then 1 else null end)*100.0/nullif(count(resultado),0),1) as "%"
    from (
        select comunas.zona as grupo, case tipo_domicilio when 3 then 'BV' when 4 then 'I' when 5 then 'G' else 'BC' end as grupo2, *
            from tem inner join etiquetas using (etiqueta) left join comunas on (nrocomuna=comuna)
    ) x
    group by cube (grupo, grupo2)
    order by grupo2, grupo;

select comunas.zona, count(distinct area),sum(count(distinct area)) over (), 
        round(count(distinct area)*100.0/sum(count(distinct area)) over (),1) as "%"
    from tem inner join areas using (area) inner join comunas on nrocomuna=comuna
    where area<900
    group by comunas.zona;


--- buscando en HIS los números de documento de un área

-- ahora
select enc, json_encuesta->>'e7'
  from tem
  where area=166
    and json_encuesta->>'e7' is not null;

-- en his
select enc, h.cha_new_value::jsonb->>'e7'
  from his.changes h inner join tem on enc = cha_new_pk->>'enc'
  where cha_table='tem'
    and cha_column='json_encuesta'
    and area=166
  limit 10;

--- cuántos tuvieron síntomas

select resultado, tuvo_sintomas,
        -- grouping(resultado),
        -- grouping(tuvo_sintomas),
        count(*) cantidad,
        -- nullif(sum(count(*)) over (partition by resultado) ,0) denominador,
        round(count(*)*100.0/nullif(sum(count(*)) over (partition by resultado, grouping(tuvo_sintomas)) ,0),1) as "%"
    from (
select resultado, case when (json_encuesta->>'d6_1' = '1' 
        or json_encuesta->>'d6_2' = '1'
        or json_encuesta->>'d6_3' = '1'
        or json_encuesta->>'d6_4' = '1'
        or json_encuesta->>'d6_5' = '1'
        or json_encuesta->>'d6_6' = '1'
        or json_encuesta->>'d6_7' = '1'
        or json_encuesta->>'d6_8' = '1'
        or json_encuesta->>'d6_9' = '1') then 'SI' else 'NO' end
        as tuvo_sintomas
  from tem inner join etiquetas using (etiqueta)
  where resultado is not null) x 
  group by grouping sets ((),(tuvo_sintomas),(resultado,tuvo_sintomas) )
    order by 1,2;

-- ver qué tokens tiene un usuario
select token, date, username, useragent->>'source'
  from tokens
  where username='wmamani'
  order by username desc;

select  sincro ,token,usuario,cuando,substr(datos::text,1,30) as d
  from sincronizaciones
  where usuario='wmamani'
  order by cuando desc
  limit 10;

select enc, h.cha_new_value::jsonb->>'c5', k.username
  from his.changes h inner join tem on enc = cha_new_pk->>'enc'
       left join tokens k on token=cargado_dm
  where cha_table='tem'
    and cha_column='json_encuesta'
    -- and  h.cha_new_value::jsonb->>'c5' like '3216%'  -- 4642-68, 4643-45 y 4644-22
    and  h.cha_new_value::jsonb->>'c5' like '4643%'  -- 4642-68, 4643-45 -> 32613 y 4644-22 -> 
  limit 10;

select tokens.*
  from tem inner join tokens on cargado_dm=token
  where enc='53401';


select enc, h.cha_when, h.cha_new_value -- ::jsonb->>'c5'
       , k.*
  from his.changes h inner join tem on enc = cha_new_pk->>'enc'
       left join tokens k on token=cargado_dm
  where cha_table='tem'
    and cha_column='json_encuesta'
    and h.cha_new_pk::jsonb->>'enc' = '22225'
  order by cha_when desc
  limit 10;



select enc, h.cha_when, h.cha_new_value::jsonb->>'c5'
       , k.*
  from his.changes h inner join tem on enc = cha_new_pk->>'enc'
       left join tokens k on token=cargado_dm
  where cha_table='tem'
    and cha_column='json_encuesta'
    and h.cha_new_pk::jsonb->>'enc' = '32613'
  order by cha_when desc
  limit 10; -- relevador 31

  22225

select enc
       , k.username
  from  tem 
       left join tokens k on token=cargado_dm
  where enc like '134%'
  limit 10; -- relevador 31

  select enc, h.cha_when, h.cha_new_value::jsonb->>'c5'
       , k.*
  from his.changes h inner join tem on enc = cha_new_pk->>'enc'
       left join tokens k on token=cargado_dm
  where cha_table='tem'
    and cha_column='json_encuesta'
    and h.cha_new_pk::jsonb->>'enc' in ('35601','35604' ,'35614') 
  order by cha_when desc
  limit 10; -- relevador 31


select grupo, grupo2
       , count(rea_m) as realizadas
       , count(resultado) as con_resultado
       , sum(case when resultado ilike 'positivo' then 1 else null end) as positivos
       , round(count(case when resultado ilike 'positivo' then 1 else null end)*100.0/nullif(count(resultado),0),1) as "%"
    from (
        select case 
            when (json_encuesta->'personas'->((json_encuesta->>'p11')::integer - 1)->>'p3') between '18' and '39' then '18-39' 
            when (json_encuesta->'personas'->((json_encuesta->>'p11')::integer - 1)->>'p3') between '40' and '64' then '40-64' 
            when (json_encuesta->'personas'->((json_encuesta->>'p11')::integer - 1)->>'p3') >= '65' then '65+' 
            else '-' end as grupo, 
           case (json_encuesta->'personas'->((json_encuesta->>'p11')::integer - 1)->>'p4') when '1' then 'V' else 'M' end as grupo2, *
            from tem inner join etiquetas using (etiqueta) left join comunas on (nrocomuna=comuna)
    ) x
    group by cube (grupo, grupo2)
    order by grupo2, grupo;

select *
    from tem
    limit 20;    

select enc, 
        -- max(case when h.cha_new_value::jsonb->>'c5' is null then h.cha_when else null end) ult_vacio, 
        -- max(case when h.cha_new_value::jsonb->>'c5' is not null then h.cha_when else null end) ult_lleno,
        string_agg(distinct h.cha_new_value::jsonb->>'c5', ', ') etiqueta,
        max(h.cha_new_value::jsonb->>'e1') as apellido,
        max(h.cha_new_value::jsonb->>'e2') as nombre,
        max(h.cha_new_value::jsonb->>'e3') as DNI
  from his.changes h inner join tem on enc = cha_new_pk->>'enc'
       left join tokens k on token=cargado_dm
  where cha_table='tem'
    and cha_column='json_encuesta'
  group by enc
  having max(case when h.cha_new_value::jsonb->>'c5' is null then h.cha_when else null end)>
        max(case when h.cha_new_value::jsonb->>'c5' is not null then h.cha_when else null end)
  order by enc;

select tem.enc, etiqueta, 
    json_encuesta->>'e1' as apellido,
    json_encuesta->>'e2' as nombre,
    json_encuesta->>'e3' as DNI,
    tem.area,
    tem.relevador, resultado
    from tem left join etiquetas using(etiqueta)
    where etiqueta in (
        select etiqueta from tem where etiqueta is not null group by etiqueta having count(*)>1
    )
    order by etiqueta;


select e.etiqueta, resultado, enc,
    json_encuesta->>'e1' as apellido,
    json_encuesta->>'e2' as nombre,
    json_encuesta->>'e7' as documento,
    fecha, plancha
  from etiquetas e left join tem using(etiqueta)
--  where plancha = (select plancha from etiquetas where etiqueta = '4708-21')
  where plancha between '203' and '206'
  order by etiqueta;

select e.etiqueta, resultado, enc,
    json_encuesta->>'e1' as apellido,
    json_encuesta->>'e2' as nombre,
    json_encuesta->>'e7' as documento,
    fecha, plancha
  from etiquetas e right join tem using(etiqueta)
--  where plancha = (select plancha from etiquetas where etiqueta = '4708-21')
  where enc in(
    '22225'
    ,'22226'
    ,'32613'
    ,'35601'
    ,'35604'
    ,'45821'
  )
  order by etiqueta, enc;

select e.etiqueta, resultado, enc,
    json_encuesta->>'e1' as apellido,
    json_encuesta->>'e2' as nombre,
    json_encuesta->>'e7' as documento,
    e.fecha, plancha, a.relevador,
    json_encuesta->>'dv2' as fecha_rea
  from etiquetas e left join tem using(etiqueta) left join areas a using(area)
  where plancha in (select plancha from etiquetas where etiqueta in ('4642-68','4644-22','4660-46'))
  -- where plancha between '200' and '202'
  order by enc, etiqueta;


select username, idper
  from tem left join tokens on cargado_dm=token 
    inner join usuarios on usuario=username
  where area=156;

select enc, h.cha_when, h.cha_new_value::jsonb->>'c5', 
        (select cha_new_value from his.changes z where cha_table='tem' and cha_column='relevador' and z.cha_new_pk=h.cha_new_pk and z.cha_when<=h.cha_when order by cha_when desc limit 1)
       , k.*
  from his.changes h inner join tem on enc = cha_new_pk->>'enc'
       left join tokens k on token=cargado_dm
  where cha_table='tem'
    and cha_column='json_encuesta'
    and h.cha_new_pk::jsonb->>'enc' in ('32414','48802') 
  order by cha_when desc
  limit 10;

select grupo, grupo2
       , count(rea_m) as realizadas
       , count(resultado) as con_resultado
       , sum(case when resultado ilike 'positivo' then 1 else null end) as positivos
       , round(count(case when resultado ilike 'positivo' then 1 else null end)*100.0/nullif(count(resultado),0),1) as "%"
    from (
        select comunas.zona as grupo, case tipo_domicilio when 3 then 'BV' when 4 then 'I' when 5 then 'G' else 'BC' end as grupo2, *
            from tem inner join etiquetas using (etiqueta) left join comunas on (nrocomuna=comuna)
            where tem.cluster=4
    ) x
    group by cube (grupo, grupo2)
    order by grupo2, grupo;

select resultado, count(*), count(*)*100/sum(count(*)) over () as "%"
  from tem inner join etiquetas using (etiqueta)
  where cluster=4
  group by resultado;

select count(*)
  from tem
  where cluster=4 and rea_m=1;


select *
  from tem
  where json_backup::text like '%7999-45%';

  

select enc, h.cha_new_value::jsonb->>'c5', k.username, h.cha_column, h.cha_when
  from his.changes h inner join tem on enc = cha_new_pk->>'enc'
       left join tokens k on token=cargado_dm
  where cha_table='tem'
    and cha_column in ('json_encuesta', 'json_backup')
    and  h.cha_new_value::jsonb->>'c5' like '5296%'  -- 4642-68, 4643-45 y 4644-22
    -- and  h.cha_new_value::jsonb->>'c5' like '1001%'  -- 4642-68, 4643-45 -> 32613 y 4644-22 -> 
  limit 10;


set search_path = encu;

select  sincro ,token,usuario,cuando,substr(datos::text,1,30) as d
  from sincronizaciones
  -- where token='f53f40bafef0376dbd30acbb953ccb7d'
  where usuario='rnina'
  order by cuando desc
  limit 10;

update tareas_tem
  set cargado_dm=null
  where asignado=39::text;

---- sobre el recepcionista
select *
  from his.changes h
  where cha_table='areas'
    -- and cha_column='recepcionista'
    and cha_new_pk='{"area": 394}';

select cha_who, cha_when, cha_context
  from his.changes
  where cha_new_value::text not like '%7998-68%' 
    and cha_old_value::text like '%7998-68%' 
    and cha_table='tem' 
    and cha_column='json_encuesta'
    ;

/*
-- update tem set json_encuesta = json_backup
  select json_backup->>'c5', enc, json_encuesta from tem
  where json_backup->>'c5' in ('7997-80','7998-68','7999-45');
-- */


set search_path = encu;

select * 
  from tem
  where area=710;

update tem
  set obs='RESIDENCIA GERIATRICA SANTA PATRICIA',
    nomcalle='HUMBERTO PRIMO 3140',
    json_encuesta='{"d5": null, "g1": 5, "d5c": null, "p11": null, "p12": null, "c5ok": null, "dv3otros": null, "personas": [{}], "_edad_maxima": null, "_edad_minima": null, "tipo_seleccion": 1, "tipo_relevamiento": 1, "_personas_incompletas": 1}'
  where area=718;

update tem
  set obs='RESIDENCIA GERIATRICA SAN JULIAN',
    nomcalle='NAHUEL HUAPI 5581',
    json_encuesta='{"d5": null, "g1": 5, "d5c": null, "p11": null, "p12": null, "c5ok": null, "dv3otros": null, "personas": [{}], "_edad_maxima": null, "_edad_minima": null, "tipo_seleccion": 1, "tipo_relevamiento": 1, "_personas_incompletas": 1}'
  where area=717;


update tem
  set obs='ESTABLECIMIENTO GERIATRICO NUESTRA SRA DE LUJAN',
    nomcalle='AV. LARRAZABAL 451',
    json_encuesta='{"d5": null, "g1": 5, "d5c": null, "p11": null, "p12": null, "c5ok": null, "dv3otros": null, "personas": [{}], "_edad_maxima": null, "_edad_minima": null, "tipo_seleccion": 1, "tipo_relevamiento": 1, "_personas_incompletas": 1}'
  where area=706;

select enc, h.cha_new_value::jsonb->>'c5', h.cha_column, h.cha_when
  from his.changes h inner join tem on enc = cha_new_pk->>'enc'
       -- left join tokens k on token=cargado_dm
  where cha_table='tem'
    and cha_column in ('json_encuesta', 'json_backup')
    and  h.cha_new_value::jsonb->>'c5' like '8333-92%'  -- 4642-68, 4643-45 y 4644-22
    -- and  h.cha_new_value::jsonb->>'c5' like '1001%'  -- 4642-68, 4643-45 -> 32613 y 4644-22 -> 
  limit 10;


select json_backup->>'c5', enc, json_encuesta
  from  tem 
       -- left join tokens k on token=cargado_dm
  where json_backup->>'c5' = '8335-57'
  limit 10;

--intercambiar encuestas
set search_path = encu;

select json_encuesta into encu_64902 from tem where enc = '64902';
select json_encuesta into encu_64903 from tem where enc = '64903';

update tem set json_encuesta = (select json_encuesta from encu_64902) where enc='64903';
update tem set json_encuesta = (select json_encuesta from encu_64903) where enc='64902';
--luego abrir la encuesta desde tem_recepcion y guardarla para que se actualicen los datos que se copian en el resto de la grilla