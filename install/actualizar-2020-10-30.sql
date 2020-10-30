set search_path=encu;
set role eseco203_muleto_owner;

alter table tem
  add column if not exists etiqueta text,
  add column if not exists fecha_rel date;
