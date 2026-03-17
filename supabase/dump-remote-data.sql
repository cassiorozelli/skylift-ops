SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- \restrict 7E9G1RCRuBJGxduuC9IvrVXTtBAPMw2lIVjgq0OjtjrVnzuoMCugBftwhDgla34

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.6

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: email_processing_status; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."email_processing_status" ("tipo_operacao", "last_email_subject", "last_email_from", "last_email_received", "last_processed_at") VALUES
	('helicoptero', 'RE: ANEXO -', 'coordenacao@aerorio.com.br', '2026-03-05 14:37:12', '2026-03-06 18:42:09.425');


--
-- Data for Name: passengers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."passengers" ("id", "name", "cpf", "created_at") VALUES
	('0b4a1605-9b4c-4806-879b-136ac12c62b4', 'Cassio de Alcantara Roselli', '12345678900', '2026-03-06 23:22:20.642325+00'),
	('bd850091-43f7-47e0-96eb-ff828820401d', 'RMN', '12345678901', '2026-03-06 23:26:12.43779+00'),
	('3f617d43-e8bc-4dbf-92cb-b46554916ef0', 'Paulo M', '12345678902', '2026-03-06 23:36:34.719247+00'),
	('6e501169-a342-4dac-9bdc-2e963c3bc065', 'Paulo Robert M', '12345678903', '2026-03-06 23:41:17.407562+00'),
	('82ff04ba-54c1-4434-a8c9-e38da07fc198', 'Mariana M', '12345678904', '2026-03-06 23:41:17.648823+00');


--
-- Data for Name: flight_passengers; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: flights_history; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."flights_history" ("id", "flight_id", "tipo_detectado", "data", "dia_semana", "hora", "aeronave", "destino", "passageiros", "ordem_dia", "archived_at") VALUES
	('765ae1e6-18c7-4514-9014-91af329b62b9', '20260305_rmn_1', 'helicoptero', '2026-03-05', 'quinta-feira', '09:00', 'B3', 'TVGSP', 'RMN', 1, '2026-03-05 17:15:16.104669+00'),
	('cc7a040c-84ff-42f5-abc9-7f8c235d369b', '20260304_paulo_1', 'helicoptero', '2026-03-04', 'quarta-feira', '15:15', 'CGP', 'Golden Green/RJ', 'Paulo', 1, '2026-03-05 17:15:16.104669+00'),
	('5a4536a8-8bb5-4db7-9e6b-a78cadfb3789', '20260307_paulo_1', 'helicoptero', '2026-03-07', 'sábado', '10:00', 'CGP', 'Santos (Tribuna) para Golden Green/RJ', 'Paulo', 1, '2026-03-05 17:15:16.104669+00'),
	('a1b233e2-4775-4cd6-939d-f3d5b670c5fc', '20260306_paulo_e_marina_mansur_1', 'helicoptero', '2026-03-06', 'sexta-feira', '14:15', 'CGP', 'Golden Green para Santos (Tribuna Square)', 'Paulo e Marina Mansur', 1, '2026-03-05 17:15:16.104669+00'),
	('024d0f07-d433-4de0-86a7-c21f0e9d4665', '20260306_rmn_1', 'helicoptero', '2026-03-06', 'sexta-feira', '13:00', 'B3', 'TVGSP x Lagoa', 'RMN', 1, '2026-03-05 17:15:16.104669+00'),
	('cd311b02-7380-4807-9250-11d8e31a5808', '20260305_pedro_1', 'helicoptero', '2026-03-05', 'quinta-feira', '13:00', 'CGP', 'Lagoa x Cardeiros', 'Pedro', 1, '2026-03-05 17:15:16.104669+00'),
	('ec2640ba-5e03-45d7-8185-600d719dcb0d', '05032026_pedro_2', 'helicoptero', '2026-05-03', 'quinta-feira', '13:00', 'CGP', 'Cardeiros', 'Pedro', 2, '2026-03-05 17:15:16.104669+00'),
	('1a3b645a-f222-4487-b616-7862e705a4b2', '06032026_rmn_1', 'helicoptero', '2026-06-03', 'sexta-feira', '13:00', 'B3', 'Lagoa', 'RMN', 1, '2026-03-05 17:15:16.104669+00'),
	('e79b9534-b1e5-45bc-960a-f355818c832a', '05032026_pedro_1', 'helicoptero', '2026-05-03', 'quinta-feira', '', '', 'Cardeiros', 'Pedro', 1, '2026-03-05 17:15:16.104669+00'),
	('894ef08f-b0fd-4a5a-a53d-a13cf8eb7422', '07032026_paulo_1', 'helicoptero', '2026-07-03', 'sábado', '10:00', 'CGP', 'Golden Green/RJ', 'Paulo', 1, '2026-03-05 17:15:16.104669+00'),
	('e567e709-c1cc-43a6-a263-f9de38582ead', '06032026_paulo_e_marina_mansur_1', 'helicoptero', '2026-06-03', 'sexta-feira', '14:15', 'CGP', 'Santos (Tribuna Square)', 'Paulo e Marina Mansur', 1, '2026-03-05 17:15:16.104669+00'),
	('6b887ecb-1945-459c-9afc-45f55f28b3eb', '20260306_paulo_e_marina_mansur_2', 'helicoptero', '2026-03-06', 'sexta-feira', '14:15', 'CGP', 'decola do Golden Green para Santos (Tribuna Square)', 'Paulo e Marina Mansur', 2, '2026-03-05 17:50:28.312376+00'),
	('9ca2fde9-9da5-4ae7-9288-043f3147db66', '20260307_paulo_1', 'helicoptero', '2026-03-07', 'sábado', '10:00', 'CGP', 'Santos (Tribuna) para Golden Green/RJ', 'Paulo', 1, '2026-03-06 00:00:05.715154+00'),
	('fdbe7481-16dc-4ae7-a74d-0e6e61cd6a21', '20260306_paulo_e_marina_mansur_1', 'helicoptero', '2026-03-06', 'sexta-feira', '14:15', 'CGP', 'Golden Green para Santos (Tribuna Square)', 'Paulo e Marina Mansur', 1, '2026-03-06 00:00:05.715154+00'),
	('48101cf2-c3e3-482c-95e1-77bcecd76ed7', '20260306_rmn_1', 'helicoptero', '2026-03-06', 'sexta-feira', '13:00', 'B3', 'TVGSP x Lagoa', 'RMN', 1, '2026-03-06 00:00:05.715154+00'),
	('0d3647c7-ab89-453c-a0fe-002b2ed55814', '20260305_pedro_1', 'helicoptero', '2026-03-05', 'quinta-feira', '1300', 'CGP', 'Lagoa x Cardeiros', 'Pedro', 1, '2026-03-06 00:00:05.715154+00');


--
-- Data for Name: pilots; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."pilots" ("id", "name", "license_number", "base", "created_at") VALUES
	('df05dc76-510c-4761-97d6-781df8737c24', 'Roselli', NULL, 'monomotores', '2026-03-07 00:48:08.828988+00'),
	('48a8b6ed-060d-4b00-91d1-b2f35657a632', 'Pinho', NULL, 'monomotores', '2026-03-07 00:48:08.828988+00'),
	('878643fb-1f3d-48d2-b7f4-086a03c92015', 'Anderson', NULL, 'monomotores', '2026-03-07 00:48:08.828988+00'),
	('ead93de7-2581-40ac-a910-0dba26dbe684', 'Toscano', NULL, 'monomotores', '2026-03-07 00:48:08.828988+00'),
	('0b7ab3a0-a64f-4ee4-936c-6b802b4c5804', 'Fabiano', NULL, 'monomotores', '2026-03-07 00:48:08.828988+00'),
	('fa1d3abe-9f9d-49e7-b0fc-ad465ca21965', 'Igor', NULL, 'monomotores', '2026-03-07 00:48:08.828988+00'),
	('5c887478-81ab-43c0-baa1-ac4e0099638b', 'Luna', NULL, 'helicopteros', '2026-03-07 00:48:08.828988+00'),
	('3df008a0-5de4-425e-bbf4-f164439f29b8', 'Raineri', NULL, 'helicopteros', '2026-03-07 00:48:08.828988+00'),
	('45894c5d-548d-4c1c-be52-95e0dab12507', 'Ubatuba', NULL, 'helicopteros', '2026-03-07 00:48:08.828988+00'),
	('1161bb27-c652-4328-91bb-38027de383f8', 'Kevin', NULL, 'helicopteros', '2026-03-07 00:48:08.828988+00'),
	('00b971af-171a-4927-ba67-616c233bbe4f', 'Thiago', NULL, 'helicopteros', '2026-03-07 00:48:08.828988+00'),
	('ab6ed037-53f2-40f9-90e9-0a6897d5039f', 'Babaioff', NULL, 'helicopteros', '2026-03-07 00:48:08.828988+00'),
	('4a574b66-2ef5-408f-b25f-13227b814727', 'Miranda', NULL, 'helicopteros', '2026-03-07 00:48:08.828988+00'),
	('505048d1-9d3e-4abf-8abc-38d20d93fb96', 'Claudinho', NULL, 'helicopteros', '2026-03-07 00:48:08.828988+00'),
	('bb828b82-0d4d-4f16-bcf4-356d07086441', 'GustavoEmilio', NULL, 'helicopteros', '2026-03-07 00:48:08.828988+00');


--
-- Data for Name: helicoptero_flights; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."helicoptero_flights" ("id", "flight_id", "data", "hora", "aeronave", "destino", "passageiros", "piloto1", "piloto2", "ordem_dia", "created_at", "dia_semana", "updated_at", "last_seen_email", "active", "pilot_1_id", "pilot_2_id") VALUES
	('a9a22402-4d44-4483-9fb2-d9569fd78848', '20260306_paulo_e_marina_mansur_2', '2026-03-06', '14:15', 'CGP', 'decola do Golden Green para Santos (Tribuna Square)', 'Paulo e Marina Mansur', NULL, NULL, 2, '2026-03-05 17:15:51.08365+00', 'sexta-feira', '2026-03-05 17:50:28.312376+00', '2026-03-05 17:15:50.996+00', false, NULL, NULL),
	('ed140f44-6ca5-4c5d-9b70-0131093688fe', '20260305_rmn_1', '2026-03-05', '09:00', 'B3', 'TVGSP', 'RMN', 'Russi', NULL, 1, '2026-03-04 17:07:08.225996+00', 'quinta-feira', '2026-03-05 17:15:16.104669+00', '2026-03-04 23:57:49.453+00', false, NULL, NULL),
	('ea6e067d-7014-4a57-8d38-d57f78b2a136', '20260304_paulo_1', '2026-03-04', '15:15', 'CGP', 'Golden Green/RJ', 'Paulo', NULL, NULL, 1, '2026-03-04 17:07:08.224678+00', 'quarta-feira', '2026-03-05 17:15:16.104669+00', '2026-03-04 18:28:37.501+00', false, NULL, NULL),
	('c5278384-e168-45dc-a461-33bfbae0035e', '20260307_paulo_1', '2026-03-07', '10:00', 'CGP', 'decola de Santos (Tribuna) para Golden Green/RJ', 'Paulo', NULL, NULL, 1, '2026-03-04 17:07:08.228712+00', 'sábado', '2026-03-06 21:42:09.776708+00', '2026-03-06 21:42:09.711+00', true, NULL, NULL),
	('6b7206b7-d59c-404b-ad64-0635a1ec2fbd', '20260306_paulo_e_marina_mansur_1', '2026-03-06', '14:15', 'CGP', 'decola do Golden Green para Santos (Tribuna Square)', 'Paulo e Marina Mansur', NULL, NULL, 1, '2026-03-04 17:07:08.226198+00', 'sexta-feira', '2026-03-06 21:42:09.838241+00', '2026-03-06 21:42:09.708+00', true, NULL, NULL),
	('311e7e19-7ea3-4d7f-b13c-b6c576f707da', '20260306_rmn_1', '2026-03-06', '13:00', 'B3', 'TVGSP x Lagoa', 'RMN', 'Russi', '.', 1, '2026-03-04 17:07:08.224676+00', 'sexta-feira', '2026-03-06 21:42:09.790154+00', '2026-03-06 21:42:09.705+00', true, NULL, NULL),
	('8e802b39-3adc-4e42-beb9-6a912037b8f4', '20260305_pedro_1', '2026-03-05', '1300', 'CGP', 'Lagoa x Cardeiros', 'Pedro', 'Thiago', 'Luna', 1, '2026-03-04 23:57:50.059248+00', 'quinta-feira', '2026-03-06 21:42:09.855457+00', '2026-03-06 21:42:09.704+00', true, NULL, NULL),
	('f15bcd58-8336-4b90-9fad-bee39d687601', '05032026_pedro_2', '2026-05-03', '13:00', 'CGP', 'Cardeiros', 'Pedro', NULL, NULL, 2, '2026-03-05 14:34:52.584542+00', 'quinta-feira', '2026-03-05 17:15:16.104669+00', '2026-03-05 14:34:52.033+00', false, NULL, NULL),
	('22c1e1c2-613a-4f1d-8e0a-9a00f69207da', '06032026_rmn_1', '2026-06-03', '13:00', 'B3', 'Lagoa', 'RMN', NULL, NULL, 1, '2026-03-05 14:34:52.586031+00', 'sexta-feira', '2026-03-05 17:15:16.104669+00', '2026-03-05 14:34:52.036+00', false, NULL, NULL),
	('9504014b-d619-497a-bcff-1b85762f4936', '05032026_pedro_1', '2026-05-03', '', '', 'Cardeiros', 'Pedro', NULL, NULL, 1, '2026-03-05 14:34:52.584571+00', 'quinta-feira', '2026-03-05 17:15:16.104669+00', '2026-03-05 14:34:52.031+00', false, NULL, NULL),
	('15ab462c-69fd-49e0-a494-f624971d331e', '07032026_paulo_1', '2026-07-03', '10:00', 'CGP', 'Golden Green/RJ', 'Paulo', NULL, NULL, 1, '2026-03-05 14:34:52.584387+00', 'sábado', '2026-03-05 17:15:16.104669+00', '2026-03-05 14:34:52.045+00', false, NULL, NULL),
	('a393973e-7e15-4cbb-9b8a-688cbbecc0ba', '06032026_paulo_e_marina_mansur_1', '2026-06-03', '14:15', 'CGP', 'Santos (Tribuna Square)', 'Paulo e Marina Mansur', NULL, NULL, 1, '2026-03-05 14:34:52.58438+00', 'sexta-feira', '2026-03-05 17:15:16.104669+00', '2026-03-05 14:34:52.04+00', false, NULL, NULL);


--
-- Data for Name: helicoptero_flights_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jato_flights; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: jato_flights_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: mono_flights; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."mono_flights" ("id", "flight_id", "data", "hora", "aeronave", "destino", "passageiros", "piloto1", "piloto2", "ordem_dia", "created_at", "dia_semana", "updated_at", "last_seen_email", "active", "pilot_1_id", "pilot_2_id") VALUES
	('6e9dffdd-b52e-44f3-abb3-fbe6248ecf91', '20260218_paulo_ana_e_a_filha_1', '2026-02-18', '12:00', 'Pilatus', 'GIG', 'Paulo, Ana e a filha', NULL, NULL, 1, '2026-02-26 20:11:22.483536+00', 'quarta-feira', '2026-02-26 20:15:52.813327+00', NULL, true, NULL, NULL),
	('9d4f99d4-ac36-4ab9-9d34-214a789ec2a2', '20260301_paulo_1', '2026-03-01', 'A tarde', 'Caravan', 'JPA ou GIG', 'Paulo', NULL, NULL, 1, '2026-02-26 20:27:42.868369+00', 'domingo', '2026-02-26 20:27:42.868369+00', NULL, true, NULL, NULL),
	('46fd49c6-fece-4919-84ca-a7c07020996c', '20260308_rafael_marinho_1', '2026-03-08', 'último horário possível', 'Caravan', 'GIG', 'Rafael Marinho', NULL, NULL, 1, '2026-02-26 20:27:42.861355+00', 'domingo', '2026-02-26 20:27:42.861355+00', NULL, true, NULL, NULL),
	('3ccbfd14-c488-4380-81c9-3cfe6359cb5c', '20260324_fabio_1', '2026-03-24', '14:30', 'Pilatus', 'Trancoso', 'Fábio', NULL, NULL, 1, '2026-02-26 20:11:22.483536+00', 'terça', '2026-02-26 20:27:42.862067+00', NULL, true, NULL, NULL),
	('00406ae7-f029-46db-a314-98aa8f83f4bd', '20260327_fabio_1', '2026-03-27', '14:30', 'Pilatus', 'CGH', 'Fábio', NULL, NULL, 1, '2026-02-26 20:11:22.488715+00', 'sexta', '2026-02-26 20:27:42.861948+00', NULL, true, NULL, NULL),
	('a1b482c9-83e0-49ce-a3c8-57840fee0ab8', '20260307_rafael_marinho_1', '2026-03-07', '09:00', 'Caravan', 'Poços', 'Rafael Marinho', NULL, NULL, 1, '2026-02-26 20:27:42.861315+00', 'sábado', '2026-02-26 20:27:42.861315+00', NULL, true, NULL, NULL),
	('0ad98420-bab1-49c3-ba14-c38fd10212ab', '20260217_jp_e_a_mae_1', '2026-02-17', '11:00', 'Pilatus', 'T. Freitas', 'JP e a mãe', 'ROSELLI', 'ANDERSON', 1, '2026-02-26 20:11:22.484402+00', 'terça-feira', '2026-03-05 18:16:48.742653+00', NULL, true, NULL, NULL),
	('8d4ebfdc-3c51-4099-8510-a8eca91f0fbe', '20260214_paulo_ana_e_a_filha_1', '2026-02-14', '08:15', 'Pilatus', 'Jaguaruna SC', 'Paulo, Ana e a filha', 'Anderson', 'Fabiano', 1, '2026-02-26 20:11:22.484416+00', 'sábado', '2026-03-07 00:50:51.346042+00', NULL, true, '878643fb-1f3d-48d2-b7f4-086a03c92015', '0b7ab3a0-a64f-4ee4-936c-6b802b4c5804');


--
-- Data for Name: mono_flights_history; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "role", "created_at") VALUES
	('4d70974d-e299-424e-a5b4-25252af37d72', 'admin', '2026-02-26 16:30:00.700419+00'),
	('ea2d0628-49e3-42b5-9e5b-490622b107eb', 'operacoes', '2026-02-26 16:30:43.149772+00');


--
-- PostgreSQL database dump complete
--

-- \unrestrict 7E9G1RCRuBJGxduuC9IvrVXTtBAPMw2lIVjgq0OjtjrVnzuoMCugBftwhDgla34

RESET ALL;
