create table "public"."Posts" (
    "id" uuid not null default gen_random_uuid(),
    "title" text not null,
    "description" text not null,
    "images" text[],
    "tags" text[],
    "type" text not null,
    "author_id" uuid not null,
    "created_at" timestamp with time zone default now(),
    "updated_at" timestamp with time zone default now(),
    "visibility" text
);


alter table "public"."Accounts" disable row level security;

CREATE UNIQUE INDEX "Posts_pkey" ON public."Posts" USING btree (id);

alter table "public"."Posts" add constraint "Posts_pkey" PRIMARY KEY using index "Posts_pkey";

alter table "public"."Posts" add constraint "Posts_author_id_fkey" FOREIGN KEY (author_id) REFERENCES "Accounts"(id) ON DELETE CASCADE not valid;

alter table "public"."Posts" validate constraint "Posts_author_id_fkey";

alter table "public"."Posts" add constraint "Posts_type_check" CHECK ((type = ANY (ARRAY['announcement'::text, 'highlight'::text]))) not valid;

alter table "public"."Posts" validate constraint "Posts_type_check";

grant delete on table "public"."Posts" to "anon";

grant insert on table "public"."Posts" to "anon";

grant references on table "public"."Posts" to "anon";

grant select on table "public"."Posts" to "anon";

grant trigger on table "public"."Posts" to "anon";

grant truncate on table "public"."Posts" to "anon";

grant update on table "public"."Posts" to "anon";

grant delete on table "public"."Posts" to "authenticated";

grant insert on table "public"."Posts" to "authenticated";

grant references on table "public"."Posts" to "authenticated";

grant select on table "public"."Posts" to "authenticated";

grant trigger on table "public"."Posts" to "authenticated";

grant truncate on table "public"."Posts" to "authenticated";

grant update on table "public"."Posts" to "authenticated";

grant delete on table "public"."Posts" to "service_role";

grant insert on table "public"."Posts" to "service_role";

grant references on table "public"."Posts" to "service_role";

grant select on table "public"."Posts" to "service_role";

grant trigger on table "public"."Posts" to "service_role";

grant truncate on table "public"."Posts" to "service_role";

grant update on table "public"."Posts" to "service_role";


