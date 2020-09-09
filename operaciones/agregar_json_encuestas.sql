set search_path = encu;

update tem
  set json_encuesta=jsonb_build_object(
	  'personas','[]'::jsonb,    -- cemento                   geriatricos            inquilinato     vulnerables
	  'tipo_relevamiento',case when area<=699 then 1 when area<=799 then 1 when area<=899 then 1 else 2 end,
	  'tipo_seleccion'   ,case when area<=699 then 1 when area<=799 then 1 when area<=899 then 2 else 1 end,
	  'g1'               ,case when area<=699 then 1 when area<=799 then 5 when area<=899 then 4 else 3 end
  )
  where json_encuesta is null;
