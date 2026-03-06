drop extension if exists "pg_net";


  create table "public"."email_processing_status" (
    "tipo_operacao" text not null,
    "last_email_subject" text,
    "last_email_from" text,
    "last_email_received" timestamp without time zone,
    "last_processed_at" timestamp without time zone default now()
      );



  create table "public"."flights_history" (
    "id" uuid not null default gen_random_uuid(),
    "flight_id" text,
    "tipo_detectado" text,
    "data" date,
    "dia_semana" text,
    "hora" text,
    "aeronave" text,
    "destino" text,
    "passageiros" text,
    "ordem_dia" integer,
    "archived_at" timestamp with time zone default now()
      );



  create table "public"."helicoptero_flights_history" (
    "id" uuid not null default gen_random_uuid(),
    "flight_id" text,
    "data" date,
    "dia_semana" text,
    "hora" text,
    "aeronave" text,
    "destino" text,
    "passageiros" text,
    "ordem_dia" integer,
    "removido_em" timestamp with time zone default now()
      );



  create table "public"."jato_flights_history" (
    "id" uuid not null default gen_random_uuid(),
    "flight_id" text,
    "data" date,
    "dia_semana" text,
    "hora" text,
    "aeronave" text,
    "destino" text,
    "passageiros" text,
    "ordem_dia" integer,
    "removido_em" timestamp with time zone default now()
      );



  create table "public"."mono_flights_history" (
    "id" uuid not null default gen_random_uuid(),
    "flight_id" text,
    "data" date,
    "dia_semana" text,
    "hora" text,
    "aeronave" text,
    "destino" text,
    "passageiros" text,
    "ordem_dia" integer,
    "removido_em" timestamp with time zone default now()
      );


alter table "public"."helicoptero_flights" add column "active" boolean default true;

alter table "public"."helicoptero_flights" add column "dia_semana" text;

alter table "public"."helicoptero_flights" add column "last_seen_email" timestamp with time zone;

alter table "public"."helicoptero_flights" add column "updated_at" timestamp with time zone default now();

alter table "public"."helicoptero_flights" alter column "data" drop not null;

alter table "public"."jato_flights" add column "active" boolean default true;

alter table "public"."jato_flights" add column "dia_semana" text;

alter table "public"."jato_flights" add column "last_seen_email" timestamp with time zone;

alter table "public"."jato_flights" add column "updated_at" timestamp with time zone default now();

alter table "public"."jato_flights" alter column "data" drop not null;

alter table "public"."mono_flights" add column "active" boolean default true;

alter table "public"."mono_flights" add column "dia_semana" text;

alter table "public"."mono_flights" add column "last_seen_email" timestamp with time zone;

alter table "public"."mono_flights" add column "updated_at" timestamp with time zone default now();

alter table "public"."mono_flights" alter column "data" drop not null;

CREATE UNIQUE INDEX email_processing_status_pkey ON public.email_processing_status USING btree (tipo_operacao);

CREATE UNIQUE INDEX flights_history_pkey ON public.flights_history USING btree (id);

CREATE UNIQUE INDEX helicoptero_flights_history_pkey ON public.helicoptero_flights_history USING btree (id);

CREATE UNIQUE INDEX jato_flights_history_pkey ON public.jato_flights_history USING btree (id);

CREATE UNIQUE INDEX mono_flights_history_pkey ON public.mono_flights_history USING btree (id);

CREATE UNIQUE INDEX unique_flight_id_heli ON public.helicoptero_flights USING btree (flight_id);

CREATE UNIQUE INDEX unique_flight_id_jato ON public.jato_flights USING btree (flight_id);

CREATE UNIQUE INDEX unique_flight_id_mono ON public.mono_flights USING btree (flight_id);

alter table "public"."email_processing_status" add constraint "email_processing_status_pkey" PRIMARY KEY using index "email_processing_status_pkey";

alter table "public"."flights_history" add constraint "flights_history_pkey" PRIMARY KEY using index "flights_history_pkey";

alter table "public"."helicoptero_flights_history" add constraint "helicoptero_flights_history_pkey" PRIMARY KEY using index "helicoptero_flights_history_pkey";

alter table "public"."jato_flights_history" add constraint "jato_flights_history_pkey" PRIMARY KEY using index "jato_flights_history_pkey";

alter table "public"."mono_flights_history" add constraint "mono_flights_history_pkey" PRIMARY KEY using index "mono_flights_history_pkey";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.archive_flight()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin

insert into flights_history (
 flight_id,
 tipo_detectado,
 data,
 dia_semana,
 hora,
 aeronave,
 destino,
 passageiros,
 ordem_dia
)
values (
 old.flight_id,
 old.tipo_detectado,
 old.data,
 old.dia_semana,
 old.hora,
 old.aeronave,
 old.destino,
 old.passageiros,
 old.ordem_dia
);

return old;

end;
$function$
;

CREATE OR REPLACE FUNCTION public.archive_flight_to_history()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
DECLARE
  tipo TEXT;
BEGIN

tipo :=
CASE TG_TABLE_NAME
  WHEN 'helicoptero_flights' THEN 'helicoptero'
  WHEN 'mono_flights' THEN 'mono'
  WHEN 'jato_flights' THEN 'jato'
END;

INSERT INTO flights_history (
  flight_id,
  tipo_detectado,
  data,
  dia_semana,
  hora,
  aeronave,
  destino,
  passageiros,
  ordem_dia,
  archived_at
)

VALUES (
  OLD.flight_id,
  tipo,
  OLD.data,
  OLD.dia_semana,
  OLD.hora,
  OLD.aeronave,
  OLD.destino,
  OLD.passageiros,
  OLD.ordem_dia,
  now()
);

RETURN OLD;

END;
$function$
;

CREATE OR REPLACE FUNCTION public.deactivate_old_flights()
 RETURNS void
 LANGUAGE plpgsql
AS $function$
begin

update helicoptero_flights
set active = false
where active = true
and last_seen_email < now() - interval '6 hours';

update mono_flights
set active = false
where active = true
and last_seen_email < now() - interval '6 hours';

update jato_flights
set active = false
where active = true
and last_seen_email < now() - interval '6 hours';

end;
$function$
;

CREATE OR REPLACE FUNCTION public.update_timestamp()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
begin
  new.updated_at = now();
  return new;
end;
$function$
;

grant delete on table "public"."email_processing_status" to "anon";

grant insert on table "public"."email_processing_status" to "anon";

grant references on table "public"."email_processing_status" to "anon";

grant select on table "public"."email_processing_status" to "anon";

grant trigger on table "public"."email_processing_status" to "anon";

grant truncate on table "public"."email_processing_status" to "anon";

grant update on table "public"."email_processing_status" to "anon";

grant delete on table "public"."email_processing_status" to "authenticated";

grant insert on table "public"."email_processing_status" to "authenticated";

grant references on table "public"."email_processing_status" to "authenticated";

grant select on table "public"."email_processing_status" to "authenticated";

grant trigger on table "public"."email_processing_status" to "authenticated";

grant truncate on table "public"."email_processing_status" to "authenticated";

grant update on table "public"."email_processing_status" to "authenticated";

grant delete on table "public"."email_processing_status" to "service_role";

grant insert on table "public"."email_processing_status" to "service_role";

grant references on table "public"."email_processing_status" to "service_role";

grant select on table "public"."email_processing_status" to "service_role";

grant trigger on table "public"."email_processing_status" to "service_role";

grant truncate on table "public"."email_processing_status" to "service_role";

grant update on table "public"."email_processing_status" to "service_role";

grant delete on table "public"."flights_history" to "anon";

grant insert on table "public"."flights_history" to "anon";

grant references on table "public"."flights_history" to "anon";

grant select on table "public"."flights_history" to "anon";

grant trigger on table "public"."flights_history" to "anon";

grant truncate on table "public"."flights_history" to "anon";

grant update on table "public"."flights_history" to "anon";

grant delete on table "public"."flights_history" to "authenticated";

grant insert on table "public"."flights_history" to "authenticated";

grant references on table "public"."flights_history" to "authenticated";

grant select on table "public"."flights_history" to "authenticated";

grant trigger on table "public"."flights_history" to "authenticated";

grant truncate on table "public"."flights_history" to "authenticated";

grant update on table "public"."flights_history" to "authenticated";

grant delete on table "public"."flights_history" to "service_role";

grant insert on table "public"."flights_history" to "service_role";

grant references on table "public"."flights_history" to "service_role";

grant select on table "public"."flights_history" to "service_role";

grant trigger on table "public"."flights_history" to "service_role";

grant truncate on table "public"."flights_history" to "service_role";

grant update on table "public"."flights_history" to "service_role";

grant delete on table "public"."helicoptero_flights_history" to "anon";

grant insert on table "public"."helicoptero_flights_history" to "anon";

grant references on table "public"."helicoptero_flights_history" to "anon";

grant select on table "public"."helicoptero_flights_history" to "anon";

grant trigger on table "public"."helicoptero_flights_history" to "anon";

grant truncate on table "public"."helicoptero_flights_history" to "anon";

grant update on table "public"."helicoptero_flights_history" to "anon";

grant delete on table "public"."helicoptero_flights_history" to "authenticated";

grant insert on table "public"."helicoptero_flights_history" to "authenticated";

grant references on table "public"."helicoptero_flights_history" to "authenticated";

grant select on table "public"."helicoptero_flights_history" to "authenticated";

grant trigger on table "public"."helicoptero_flights_history" to "authenticated";

grant truncate on table "public"."helicoptero_flights_history" to "authenticated";

grant update on table "public"."helicoptero_flights_history" to "authenticated";

grant delete on table "public"."helicoptero_flights_history" to "service_role";

grant insert on table "public"."helicoptero_flights_history" to "service_role";

grant references on table "public"."helicoptero_flights_history" to "service_role";

grant select on table "public"."helicoptero_flights_history" to "service_role";

grant trigger on table "public"."helicoptero_flights_history" to "service_role";

grant truncate on table "public"."helicoptero_flights_history" to "service_role";

grant update on table "public"."helicoptero_flights_history" to "service_role";

grant delete on table "public"."jato_flights_history" to "anon";

grant insert on table "public"."jato_flights_history" to "anon";

grant references on table "public"."jato_flights_history" to "anon";

grant select on table "public"."jato_flights_history" to "anon";

grant trigger on table "public"."jato_flights_history" to "anon";

grant truncate on table "public"."jato_flights_history" to "anon";

grant update on table "public"."jato_flights_history" to "anon";

grant delete on table "public"."jato_flights_history" to "authenticated";

grant insert on table "public"."jato_flights_history" to "authenticated";

grant references on table "public"."jato_flights_history" to "authenticated";

grant select on table "public"."jato_flights_history" to "authenticated";

grant trigger on table "public"."jato_flights_history" to "authenticated";

grant truncate on table "public"."jato_flights_history" to "authenticated";

grant update on table "public"."jato_flights_history" to "authenticated";

grant delete on table "public"."jato_flights_history" to "service_role";

grant insert on table "public"."jato_flights_history" to "service_role";

grant references on table "public"."jato_flights_history" to "service_role";

grant select on table "public"."jato_flights_history" to "service_role";

grant trigger on table "public"."jato_flights_history" to "service_role";

grant truncate on table "public"."jato_flights_history" to "service_role";

grant update on table "public"."jato_flights_history" to "service_role";

grant delete on table "public"."mono_flights_history" to "anon";

grant insert on table "public"."mono_flights_history" to "anon";

grant references on table "public"."mono_flights_history" to "anon";

grant select on table "public"."mono_flights_history" to "anon";

grant trigger on table "public"."mono_flights_history" to "anon";

grant truncate on table "public"."mono_flights_history" to "anon";

grant update on table "public"."mono_flights_history" to "anon";

grant delete on table "public"."mono_flights_history" to "authenticated";

grant insert on table "public"."mono_flights_history" to "authenticated";

grant references on table "public"."mono_flights_history" to "authenticated";

grant select on table "public"."mono_flights_history" to "authenticated";

grant trigger on table "public"."mono_flights_history" to "authenticated";

grant truncate on table "public"."mono_flights_history" to "authenticated";

grant update on table "public"."mono_flights_history" to "authenticated";

grant delete on table "public"."mono_flights_history" to "service_role";

grant insert on table "public"."mono_flights_history" to "service_role";

grant references on table "public"."mono_flights_history" to "service_role";

grant select on table "public"."mono_flights_history" to "service_role";

grant trigger on table "public"."mono_flights_history" to "service_role";

grant truncate on table "public"."mono_flights_history" to "service_role";

grant update on table "public"."mono_flights_history" to "service_role";

CREATE TRIGGER archive_helicoptero_trigger AFTER UPDATE ON public.helicoptero_flights FOR EACH ROW WHEN (((old.active = true) AND (new.active = false))) EXECUTE FUNCTION public.archive_flight_to_history();

CREATE TRIGGER heli_update_trigger BEFORE UPDATE ON public.helicoptero_flights FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER archive_jato_trigger AFTER UPDATE ON public.jato_flights FOR EACH ROW WHEN (((old.active = true) AND (new.active = false))) EXECUTE FUNCTION public.archive_flight_to_history();

CREATE TRIGGER jato_update_trigger BEFORE UPDATE ON public.jato_flights FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();

CREATE TRIGGER archive_mono_trigger AFTER UPDATE ON public.mono_flights FOR EACH ROW WHEN (((old.active = true) AND (new.active = false))) EXECUTE FUNCTION public.archive_flight_to_history();

CREATE TRIGGER mono_update_trigger BEFORE UPDATE ON public.mono_flights FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();


