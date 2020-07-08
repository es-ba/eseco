CREATE OR REPLACE FUNCTION tem_cod_per_trg()
  RETURNS trigger AS
$BODY$
begin
  if new.carga_rol is not null and new.carga_persona is not null then
    case new.carga_rol
      when 'relevador'   then new.cod_enc=new.carga_persona;
      when 'supervisor'  then new.cod_sup=new.carga_persona;
      when 'recuperador' then new.cod_recu=new.carga_persona;
    end case; 
  end if;
  return new;
end;
$BODY$
  LANGUAGE plpgsql ;