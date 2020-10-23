set role to eseco202_produc_owner;
set search_path = encu;

alter table tem add column rea_anterior bigint;
alter table tem add column seleccionado_anterior jsonb;