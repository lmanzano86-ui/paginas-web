-- ============================================================
-- TABLERO VIVO DEL EQUIPO — activación de la base compartida
-- Portal de agentes (Supabase: ildviocjmqcyfknzlyrm)
-- Ejecutar UNA vez en: Supabase → SQL Editor → New query → Run
-- Es seguro volver a correrlo (no duplica la semilla).
-- ============================================================

create table if not exists public.tablero_tareas (
  id      bigint generated always as identity primary key,
  titulo  text not null,
  negocio text not null,
  dueno   text not null default 'Tiky',
  estado  text not null default 'por-hacer',
  nota    text default '',
  fecha   date not null default current_date,
  creado  timestamptz not null default now()
);

alter table public.tablero_tareas enable row level security;

-- Mismo patrón del portal: la clave publishable opera la tabla y
-- el acceso fino lo controla el login propio del panel.
drop policy if exists "tablero_lectura"    on public.tablero_tareas;
drop policy if exists "tablero_escritura"  on public.tablero_tareas;
drop policy if exists "tablero_actualizar" on public.tablero_tareas;
drop policy if exists "tablero_borrar"     on public.tablero_tareas;

create policy "tablero_lectura"    on public.tablero_tareas for select using (true);
create policy "tablero_escritura"  on public.tablero_tareas for insert with check (true);
create policy "tablero_actualizar" on public.tablero_tareas for update using (true) with check (true);
create policy "tablero_borrar"     on public.tablero_tareas for delete using (true);

-- Tiempo real: que un movimiento se vea al instante en todos los paneles
do $$
begin
  alter publication supabase_realtime add table public.tablero_tareas;
exception
  when duplicate_object then null;
  when others then null;
end $$;

-- Tarjetas iniciales (solo si la tabla está vacía)
insert into public.tablero_tareas (titulo, negocio, dueno, estado, nota, fecha)
select v.titulo, v.negocio, v.dueno, v.estado, v.nota, v.fecha::date
from (values
  ('Cargar el menú de desayuno real', 'Taqueria La Leyenda', 'Tiky', 'por-hacer', 'Falta que el dueño confirme platillos y precios (hoy va de ejemplo).', '2026-10-23'),
  ('Sumar demos de Tampa Burger y La Leyenda al panel', 'New Age · Panel', 'Tiky', 'por-hacer', 'Demos ya publicadas; falta registrarlas en paginas-web.', '2026-10-23'),
  ('Datos reales de Maya Travel', 'ViajeReady', 'Doky', 'por-hacer', 'Flota, zonas, tarifas y contacto — esperando a Lester.', '2026-10-15'),
  ('Restablecer acceso y clave del superadmin', 'CitasPro', 'Doky', 'en-curso', 'La API falla intermitente (502) y la clave del seed ya no entra. Pedido pasado por el canal.', '2026-10-23'),
  ('Recuperar el dominio hackeado de GoDaddy', 'La Semilla Bakery', 'Tiky', 'en-curso', 'Se hace con el dueño presente: restablecer su cuenta y cambiar nameservers.', '2026-10-22'),
  ('Copia de la auditoría para el cliente', 'La Semilla Bakery', 'Blacky', 'revision', 'Versión en lenguaje simple (segundos, clientes y dinero), con marca New Age.', '2026-10-22'),
  ('Enviar la propuesta al negocio', 'Tampa Burger', 'Tiky', 'esperando-si', 'Paquete completo en Drive y demo en vivo. Solo falta la orden de envío.', '2026-10-23'),
  ('Llevar la app instalable (PWA) a ViajeReady y CitasPro', 'Sistemas', 'Equipo', 'esperando-si', 'Ya funciona en MesaReady. ¿Se aplica a los otros dos?', '2026-10-23'),
  ('Paquete entregado hoy', 'Taqueria La Leyenda', 'Tiky', 'entregado', 'Demo en vivo, propuesta y contrato a $250 + $50/mes, sin garantía. QA 9.9/10.', '2026-10-23'),
  ('Sitio oficial en vivo', 'La Semilla Bakery', 'Tiky', 'entregado', 'semillabakerytampa.com — auditoría final 10.0/10. Primer cliente de New Age.', '2026-10-22')
) as v(titulo, negocio, dueno, estado, nota, fecha)
where not exists (select 1 from public.tablero_tareas);
