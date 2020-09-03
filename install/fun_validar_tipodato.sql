set role to eseco201_produc_owner;
-- set role to eseco201_muleto_owner;
set search_path = "encu";

-- DROP FUNCTION encu.validar_tipodato(text, jsonb);

CREATE OR REPLACE FUNCTION encu.validar_tipodato(
	enc text,
	xjson_enc jsonb)
    RETURNS text
    LANGUAGE 'sql'
    SECURITY DEFINER 
AS $BODY$

with metad as (
    select var_name variable,tipovar,type_name, validar, 
        case when type_name='bigint'  then '^\d*$' 
             when type_name='date'    then '^([1-9]|0[1-9]|[12]\d|3[01])/([1-9]|1[012])/20\d\d$'
             when type_name='decimal' then '^(\d*\.)?\d+$'
             when type_name='text'    then '.*'  -- revisar
             when type_name='boolean' then '^(true|false|TRUE|FALSE|True|False)$'  
             --else  'sin_validacion' error 
         end str_reg_exp
        from casilleros left join tipovar using (tipovar)
        where var_name is not null 
), data as (
    select  null persona,key variable, value::text valor
        from jsonb_each_text(xjson_enc)
    union
    select persona, key variable, value::text valor
        from ( 
        select  ordinality persona, value per
            from jsonb_array_elements(xjson_enc->'personas') with ordinality xp
        ) xp, jsonb_each_text (per) 
)
 select string_agg(case when persona is null then '' else persona ||'_' end|| quote_literal(variable)||'- not '||type_name||':'||valor, ',')
    from data  join metad using(variable)
    where  valor is not null and  type_name in ('bigint','date','decimal') and  valor !~ str_reg_exp 
 ;
$BODY$;

ALTER FUNCTION encu.validar_tipodato(text, jsonb)
    OWNER TO eseco201_produc_owner;
