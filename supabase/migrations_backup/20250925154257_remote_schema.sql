drop extension if exists "pg_net";

revoke delete on table "public"."expense_items" from "anon";

revoke insert on table "public"."expense_items" from "anon";

revoke references on table "public"."expense_items" from "anon";

revoke select on table "public"."expense_items" from "anon";

revoke trigger on table "public"."expense_items" from "anon";

revoke truncate on table "public"."expense_items" from "anon";

revoke update on table "public"."expense_items" from "anon";

revoke delete on table "public"."expense_items" from "authenticated";

revoke insert on table "public"."expense_items" from "authenticated";

revoke references on table "public"."expense_items" from "authenticated";

revoke select on table "public"."expense_items" from "authenticated";

revoke trigger on table "public"."expense_items" from "authenticated";

revoke truncate on table "public"."expense_items" from "authenticated";

revoke update on table "public"."expense_items" from "authenticated";

revoke delete on table "public"."expense_items" from "service_role";

revoke insert on table "public"."expense_items" from "service_role";

revoke references on table "public"."expense_items" from "service_role";

revoke select on table "public"."expense_items" from "service_role";

revoke trigger on table "public"."expense_items" from "service_role";

revoke truncate on table "public"."expense_items" from "service_role";

revoke update on table "public"."expense_items" from "service_role";

revoke delete on table "public"."patient_expenses" from "anon";

revoke insert on table "public"."patient_expenses" from "anon";

revoke references on table "public"."patient_expenses" from "anon";

revoke select on table "public"."patient_expenses" from "anon";

revoke trigger on table "public"."patient_expenses" from "anon";

revoke truncate on table "public"."patient_expenses" from "anon";

revoke update on table "public"."patient_expenses" from "anon";

revoke delete on table "public"."patient_expenses" from "authenticated";

revoke insert on table "public"."patient_expenses" from "authenticated";

revoke references on table "public"."patient_expenses" from "authenticated";

revoke select on table "public"."patient_expenses" from "authenticated";

revoke trigger on table "public"."patient_expenses" from "authenticated";

revoke truncate on table "public"."patient_expenses" from "authenticated";

revoke update on table "public"."patient_expenses" from "authenticated";

revoke delete on table "public"."patient_expenses" from "service_role";

revoke insert on table "public"."patient_expenses" from "service_role";

revoke references on table "public"."patient_expenses" from "service_role";

revoke select on table "public"."patient_expenses" from "service_role";

revoke trigger on table "public"."patient_expenses" from "service_role";

revoke truncate on table "public"."patient_expenses" from "service_role";

revoke update on table "public"."patient_expenses" from "service_role";

revoke delete on table "public"."patients" from "anon";

revoke insert on table "public"."patients" from "anon";

revoke references on table "public"."patients" from "anon";

revoke select on table "public"."patients" from "anon";

revoke trigger on table "public"."patients" from "anon";

revoke truncate on table "public"."patients" from "anon";

revoke update on table "public"."patients" from "anon";

revoke delete on table "public"."patients" from "authenticated";

revoke insert on table "public"."patients" from "authenticated";

revoke references on table "public"."patients" from "authenticated";

revoke select on table "public"."patients" from "authenticated";

revoke trigger on table "public"."patients" from "authenticated";

revoke truncate on table "public"."patients" from "authenticated";

revoke update on table "public"."patients" from "authenticated";

revoke delete on table "public"."patients" from "service_role";

revoke insert on table "public"."patients" from "service_role";

revoke references on table "public"."patients" from "service_role";

revoke select on table "public"."patients" from "service_role";

revoke trigger on table "public"."patients" from "service_role";

revoke truncate on table "public"."patients" from "service_role";

revoke update on table "public"."patients" from "service_role";

revoke delete on table "public"."service_allocations" from "anon";

revoke insert on table "public"."service_allocations" from "anon";

revoke references on table "public"."service_allocations" from "anon";

revoke select on table "public"."service_allocations" from "anon";

revoke trigger on table "public"."service_allocations" from "anon";

revoke truncate on table "public"."service_allocations" from "anon";

revoke update on table "public"."service_allocations" from "anon";

revoke delete on table "public"."service_allocations" from "authenticated";

revoke insert on table "public"."service_allocations" from "authenticated";

revoke references on table "public"."service_allocations" from "authenticated";

revoke select on table "public"."service_allocations" from "authenticated";

revoke trigger on table "public"."service_allocations" from "authenticated";

revoke truncate on table "public"."service_allocations" from "authenticated";

revoke update on table "public"."service_allocations" from "authenticated";

revoke delete on table "public"."service_allocations" from "service_role";

revoke insert on table "public"."service_allocations" from "service_role";

revoke references on table "public"."service_allocations" from "service_role";

revoke select on table "public"."service_allocations" from "service_role";

revoke trigger on table "public"."service_allocations" from "service_role";

revoke truncate on table "public"."service_allocations" from "service_role";

revoke update on table "public"."service_allocations" from "service_role";

revoke delete on table "public"."trial_services" from "anon";

revoke insert on table "public"."trial_services" from "anon";

revoke references on table "public"."trial_services" from "anon";

revoke select on table "public"."trial_services" from "anon";

revoke trigger on table "public"."trial_services" from "anon";

revoke truncate on table "public"."trial_services" from "anon";

revoke update on table "public"."trial_services" from "anon";

revoke delete on table "public"."trial_services" from "authenticated";

revoke insert on table "public"."trial_services" from "authenticated";

revoke references on table "public"."trial_services" from "authenticated";

revoke select on table "public"."trial_services" from "authenticated";

revoke trigger on table "public"."trial_services" from "authenticated";

revoke truncate on table "public"."trial_services" from "authenticated";

revoke update on table "public"."trial_services" from "authenticated";

revoke delete on table "public"."trial_services" from "service_role";

revoke insert on table "public"."trial_services" from "service_role";

revoke references on table "public"."trial_services" from "service_role";

revoke select on table "public"."trial_services" from "service_role";

revoke trigger on table "public"."trial_services" from "service_role";

revoke truncate on table "public"."trial_services" from "service_role";

revoke update on table "public"."trial_services" from "service_role";

revoke delete on table "public"."trials" from "anon";

revoke insert on table "public"."trials" from "anon";

revoke references on table "public"."trials" from "anon";

revoke select on table "public"."trials" from "anon";

revoke trigger on table "public"."trials" from "anon";

revoke truncate on table "public"."trials" from "anon";

revoke update on table "public"."trials" from "anon";

revoke delete on table "public"."trials" from "authenticated";

revoke insert on table "public"."trials" from "authenticated";

revoke references on table "public"."trials" from "authenticated";

revoke select on table "public"."trials" from "authenticated";

revoke trigger on table "public"."trials" from "authenticated";

revoke truncate on table "public"."trials" from "authenticated";

revoke update on table "public"."trials" from "authenticated";

revoke delete on table "public"."trials" from "service_role";

revoke insert on table "public"."trials" from "service_role";

revoke references on table "public"."trials" from "service_role";

revoke select on table "public"."trials" from "service_role";

revoke trigger on table "public"."trials" from "service_role";

revoke truncate on table "public"."trials" from "service_role";

revoke update on table "public"."trials" from "service_role";

revoke delete on table "public"."visit_types" from "anon";

revoke insert on table "public"."visit_types" from "anon";

revoke references on table "public"."visit_types" from "anon";

revoke select on table "public"."visit_types" from "anon";

revoke trigger on table "public"."visit_types" from "anon";

revoke truncate on table "public"."visit_types" from "anon";

revoke update on table "public"."visit_types" from "anon";

revoke delete on table "public"."visit_types" from "authenticated";

revoke insert on table "public"."visit_types" from "authenticated";

revoke references on table "public"."visit_types" from "authenticated";

revoke select on table "public"."visit_types" from "authenticated";

revoke trigger on table "public"."visit_types" from "authenticated";

revoke truncate on table "public"."visit_types" from "authenticated";

revoke update on table "public"."visit_types" from "authenticated";

revoke delete on table "public"."visit_types" from "service_role";

revoke insert on table "public"."visit_types" from "service_role";

revoke references on table "public"."visit_types" from "service_role";

revoke select on table "public"."visit_types" from "service_role";

revoke trigger on table "public"."visit_types" from "service_role";

revoke truncate on table "public"."visit_types" from "service_role";

revoke update on table "public"."visit_types" from "service_role";

alter table "public"."patients" drop column "name";

alter table "public"."patients" add column "first_name" character varying(255);

alter table "public"."patients" add column "first_surname" character varying(255);

alter table "public"."patients" add column "modified_at" timestamp with time zone default now();

alter table "public"."patients" add column "second_name" character varying(255);

alter table "public"."patients" add column "second_surname" character varying(255);

alter table "public"."patients" add column "status" character varying(20) default 'active'::character varying;

alter table "public"."patients" enable row level security;

alter table "public"."service_allocations" disable row level security;

alter table "public"."trial_services" disable row level security;

alter table "public"."trials" enable row level security;

CREATE INDEX idx_patients_name_search ON public.patients USING btree (first_surname, first_name, second_surname, second_name);

CREATE INDEX idx_patients_status ON public.patients USING btree (status);

alter table "public"."patients" add constraint "patients_status_check" CHECK (((status)::text = ANY ((ARRAY['active'::character varying, 'inactive'::character varying])::text[]))) not valid;

alter table "public"."patients" validate constraint "patients_status_check";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.check_max_allocations_per_service()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    IF (SELECT COUNT(*) FROM service_allocations WHERE trial_service_id = NEW.trial_service_id) >= 2 THEN
        RAISE EXCEPTION 'Maximum of 2 service allocations allowed per service';
    END IF;
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_modified_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.modified_at = NOW();
    RETURN NEW;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$function$
;


  create policy "Allow all operations on expense_items"
  on "public"."expense_items"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Allow all operations on patient_expenses"
  on "public"."patient_expenses"
  as permissive
  for all
  to public
using (true)
with check (true);



  create policy "Allow insert to patients"
  on "public"."patients"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow read access to patients"
  on "public"."patients"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete access for all users"
  on "public"."patients"
  as permissive
  for delete
  to public
using (true);



  create policy "Enable insert access for all users"
  on "public"."patients"
  as permissive
  for insert
  to public
with check (true);



  create policy "Enable read access for all users"
  on "public"."patients"
  as permissive
  for select
  to public
using (true);



  create policy "Enable update access for all users"
  on "public"."patients"
  as permissive
  for update
  to public
using (true)
with check (true);



  create policy "Allow insert to trials"
  on "public"."trials"
  as permissive
  for insert
  to public
with check (true);



  create policy "Allow read access to trials"
  on "public"."trials"
  as permissive
  for select
  to public
using (true);



  create policy "Enable delete access for all users"
  on "public"."trials"
  as permissive
  for delete
  to public
using (true);



  create policy "Enable insert access for all users"
  on "public"."trials"
  as permissive
  for insert
  to public
with check (true);



  create policy "Enable read access for all users"
  on "public"."trials"
  as permissive
  for select
  to public
using (true);



  create policy "Enable update access for all users"
  on "public"."trials"
  as permissive
  for update
  to public
using (true)
with check (true);


CREATE TRIGGER update_patients_modified_at BEFORE UPDATE ON public.patients FOR EACH ROW EXECUTE FUNCTION update_modified_at_column();


