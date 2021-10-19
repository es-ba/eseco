set search_path= encu;
SET role eseco211_produc_owner;

alter table tem
  add column if not exists grupo_edad integer,
  add column if not exists dias_dosis_1 integer,
  add column if not exists dias_dosis_2 integer,
  add column if not exists dias_ult_dosis integer
;  
--para control luego de la importacion
select sum(grupo_edad), sum(dias_dosis_1), sum(dias_dosis_2), sum(dias_ult_dosis)
from tem;