--sql2tabla_datos($esquema,$tabla,$operativo)
--   para cargar tabla_datos y variables
select sql2tabla_datos('encu', 'tem', 'ESECO');
select sql2tabla_datos('encu', 'viviendas', 'ESECO');
select sql2tabla_datos('encu', 'personas' , 'ESECO');

-- correr script /meta_enc/install/complete_variables.sql
--   para  cargar variables_opciones