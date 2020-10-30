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

/*
update tem t
  set json_encuesta=jsonb_set(t.json_encuesta,'{personas}',jsonb_build_array((a.json_encuesta->'personas'->((a.json_encuesta->>'p11')::integer - 1))))
    ||jsonb_build_object('cp',1, 'p11',1, 'p12',a.json_encuesta->>'p12')
  from tem_reas_eseco202_participacion2 a
  where t.enc=a.enc and t.participacion=2 and t.clase='Rea202'; 
-- quizas haya que presetear las preguntas ei y ci de contacto al final del cuestionario
-- al probar, se despliegan valores preseteados de p11,p12 despues de poner si en p9
-- cp? 1 o cp anterior? 
*/

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
