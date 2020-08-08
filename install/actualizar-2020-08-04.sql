set search_path = encu;

insert into parametros (unico_registro) SELECT true WHERE NOT EXISTS (select unico_registro from parametros);

update parametros 
	set mail_aviso_texto='Estimada/o vecina/o #nombre #apellido:
%0A%0A
Usted participó del Estudio de Seroprevalencia COVID-19 que lleva adelante el Gobierno de la Ciudad de Buenos Aires a través del Ministerio de Salud y la Dirección General de Estadística y Censos.
%0A%0A
El estudio que se le realizó arrojó un resultado #resultado.
%0A%0A
Esto significa que al momento en que se le realizó el test, usted no tenía anticuerpos contra el virus. 
%0A%0A
Esto no cambia en absolutamente nada todas las medidas preventivas que rigen para la Ciudad. Debe seguir cuidándose tomando los mismos recaudos. 
%0A%0A
Agradecemos su participación en el estudio que es de importancia para la salud pública ya que permite estimar la circulación del virus por la Ciudad en distintos momentos.
%0A%0A
Les agradecemos su colaboración.'
		,mail_aviso_asunto='Resultado del test de Seroprevalencia COVID-19 de #nombre #apellido.';