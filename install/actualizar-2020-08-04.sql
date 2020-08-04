set search_path = encu;

alter table parametros add column  mail_aviso_texto text;
alter table parametros add column  mail_aviso_asunto text;

--update parametros 
--	set mail_aviso_texto = 'Sr/Sra #nombre #apellido nos comunicamos con usted por el test realizado. El resultado fue #resultado. Lo saluda atentamente. Dirección General de Estadística y Censos.',
--	mail_aviso_asunto = 'Resultado del test de covid de #nombre #apellido.'
--	where unico_registro;

insert into parametros (mail_aviso_texto, mail_aviso_asunto) 
values (
	'Sr/Sra #nombre #apellido nos comunicamos con usted por el test realizado. El resultado fue #resultado. Lo saluda atentamente. Dirección General de Estadística y Censos.',
	'Resultado del test de covid de #nombre #apellido.'
);