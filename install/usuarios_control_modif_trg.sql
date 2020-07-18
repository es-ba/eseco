--set role eseco_owner;
--set search_path=encu;

CREATE OR REPLACE FUNCTION usuarios_control_modif_trg()
    RETURNS trigger AS
$BODY$
DECLARE
    v_user_conex   text;
    v_rol_conex    text;
    v_roles_sub    text[];
BEGIN
  select split_part(nullif(setting,''),' ',1) into v_user_conex 
    from pg_settings where name='application_name';
  select u.rol , array_agg(rol_subordinado) into v_rol_conex, v_roles_sub
    from usuarios u left join roles_subordinados s using (rol)
    where u.usuario=v_user_conex
	group by u.rol;

    CASE TG_OP
        WHEN 'INSERT' THEN
            --solo puede insertar registros con roles igual al suyo y roles subordinados
            if not (new.rol=v_rol_conex or array_position(v_roles_sub,new.rol)>0) then
              RAISE EXCEPTION 'Solo puede ingresar usuarios igual rol o de subordinados' ;
            end if;
        WHEN 'UPDATE' THEN
            --controlar que para rol si el registro es un subordinado , si no es el subordinado error;  solo puede modificar a subordinados
            if old.usuario = v_user_conex 
                and (new.rol is distinct from old.rol or new.usuario is distinct from old.usuario) and v_rol_conex is distinct from 'admin' then
              RAISE EXCEPTION 'No puede cambiar su rol ni usuario' ;
            end if;
        WHEN 'DELETE' THEN
            if v_rol_conex is distinct from 'admin' and array_position(v_roles_sub,old.rol) is null then 
              RAISE EXCEPTION 'No puede borrar usuarios no subordinados';
            end if;
            return old;
        ELSE
            RAISE NOTICE 'usuarios_control_modif: tg_op % sin tratamiento ', TG_OP;
    END CASE;
    RETURN new;
END;
$BODY$
  LANGUAGE plpgsql ;
  
CREATE TRIGGER usuarios_control_modif_trg 
    BEFORE UPDATE OR INSERT OR DELETE ON usuarios 
    FOR EACH ROW  
    EXECUTE PROCEDURE usuarios_control_modif_trg();
	