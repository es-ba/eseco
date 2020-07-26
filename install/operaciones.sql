-- operaciones.sql
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
