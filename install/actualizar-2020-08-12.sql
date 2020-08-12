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

insert into areas (area) select area+1 from areas where area<700;


update tem
   set ()