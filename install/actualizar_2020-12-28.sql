set search_path=encu;
set role eseco203_produc_owner;

alter table tem  
  add column if not exists panel integer
  --, add column if not exists personas_completo jsonb,
  --,add column if not exists cant_pers_completo integer
;

GRANT SELECT ON TABLE tem_reas_eseco202_participacion2 TO eseco203_produc_admin;


