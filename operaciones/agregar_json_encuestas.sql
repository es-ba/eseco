set search_path = encu;

update tem
  set json_encuesta=jsonb_build_object(
	  'personas','[]'::jsonb,    -- cemento                   geriatricos            inquilinato     vulnerables
	  'tipo_relevamiento',case when area<=699 then 1 when area<=799 then 1 when area<=899 then 1 else 2 end,
	  'tipo_seleccion'   ,case when area<=699 then 1 when area<=799 then 1 when area<=899 then 2 else 1 end,
	  'g1'               ,case when area<=699 then 1 when area<=799 then 5 when area<=899 then 4 else 3 end
  )
  where json_encuesta is null and area<900;

update tem
  set json_encuesta=jsonb_build_object(
	  'personas','[]'::jsonb,   -- vulnerables
	  'tipo_relevamiento',2,
	  'tipo_seleccion'   ,1,
	  'g1'               ,3,
	  'ug2', nomcalle,
	  'ug3', nrocomuna,
	  'ug4', nrofraccion,
	  'ug5', nroradio,
	  'ug6', nromanzana 
  )
  where json_encuesta is null and area>=900;


insert into tareas_tem (operativo, enc, tarea, habilitada, operacion, fecha_asignacion,asignado)
  select operativo, enc, ta.tarea, true, operacion, fecha_asignacion,asignado
  from (select * from tareas ta, tem t) ta left join tareas_areas x on x.tarea=ta.tarea and x.area=ta.area
  where not (operativo, enc, ta.tarea) in (select operativo, enc, tarea from tareas_tem)
    and (ta.tarea<>'sup');

update tareas_tem t
  set fecha_asignacion = a.fecha_asignacion,
      operacion = a.operacion,
	  asignado = a.asignado
  from tareas_areas a,
       tem
  where tem.enc=t.enc
    and tem.operativo=t.operativo
    and tem.area=a.area
    and t.tarea=a.tarea
	and a.asignado is not null;
