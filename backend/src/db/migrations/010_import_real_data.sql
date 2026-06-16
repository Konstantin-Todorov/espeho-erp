-- Migration 010: Import real 2026 data from Numbers spreadsheet
-- Generated 2026-06-16
-- Clears demo data and imports 497 orders from 200 clients

-- Clear demo data (keep users, products, app_settings)
DELETE FROM notifications;
DELETE FROM defects;
DELETE FROM quality_checks;
DELETE FROM stock_movements WHERE order_id IS NOT NULL;
DELETE FROM quotations WHERE converted_to IS NOT NULL;
DELETE FROM orders;
DELETE FROM clients;

-- Temp tables for ID mapping
CREATE TEMP TABLE _client_map (orig_name TEXT, new_id UUID);
CREATE TEMP TABLE _order_map (orig_idx INT, new_id UUID);

-- Insert clients
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Алдин', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Алдин', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('БОЯРТ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'БОЯРТ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ВАЛМАН', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ВАЛМАН', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ВЕНКО', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ВЕНКО', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ВИОЛЕТА', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ВИОЛЕТА', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ЗДРАВКО', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ЗДРАВКО', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('КЕСТОН', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'КЕСТОН', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('МЕДЖИКОЙНТ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'МЕДЖИКОЙНТ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('МОМЧИЛ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'МОМЧИЛ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Миро', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Миро', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Мишо', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Мишо', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ОФИС', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ОФИС', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ПАВКАТА', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ПАВКАТА', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ПЕПО', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ПЕПО', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Пламен', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Пламен', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('РАЗВИТИЕ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'РАЗВИТИЕ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('РАЙЧО', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'РАЙЧО', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Сарина', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Сарина', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Скабрин', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Скабрин', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Стани', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Стани', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ЦИТАДЕЛ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ЦИТАДЕЛ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алемар', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алемар', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алсистемс', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алсистемс', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алуминтрейд', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алуминтрейд', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('бк', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'бк', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('богдан', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'богдан', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('булвас', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'булвас', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ваня', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ваня', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('вигомебел', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'вигомебел', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('виенви', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'виенви', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('влади', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'влади', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('гласмен', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'гласмен', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('гришата', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'гришата', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('данаил', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'данаил', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('диемкей', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'диемкей', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('дизайнмебел', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'дизайнмебел', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('жоро', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'жоро', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('зу', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'зу', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ивелин', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ивелин', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('илиян', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'илиян', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('интербилд', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'интербилд', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('йордан', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'йордан', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('коко', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'коко', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('кюпи', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'кюпи', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('лемез', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'лемез', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('любо', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'любо', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('майкъл', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'майкъл', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('мебелина', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'мебелина', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('мето', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'мето', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('методи', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'методи', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('митко', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'митко', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('младост', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'младост', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('монтаж', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'монтаж', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('нбр', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'нбр', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('нпн', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'нпн', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('оги', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'оги', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('перси', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'перси', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('поли', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'поли', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('попа', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'попа', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('разград', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'разград', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('рацата', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'рацата', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('румен', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'румен', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('систанс', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'систанс', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('тимбопарк', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'тимбопарк', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('христо', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'христо', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('юлиана', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'юлиана', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('АНГЕЛ ДЕЛИЕВ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'АНГЕЛ ДЕЛИЕВ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('БОРИСЛАВ ГЕОРГИЕВ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'БОРИСЛАВ ГЕОРГИЕВ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('БРАТЯ ЧИЧЕКЛИЕВИ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'БРАТЯ ЧИЧЕКЛИЕВИ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ВИКТОР ГЕОРГИЕВ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ВИКТОР ГЕОРГИЕВ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ВЛАДИСЛАВ ПЕЛОВ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ВЛАДИСЛАВ ПЕЛОВ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Георги Минчев', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Георги Минчев', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ЕДНА ПЛАСТ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ЕДНА ПЛАСТ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('КАДА ПЛАСТ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'КАДА ПЛАСТ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('КРАСИМИР КАНЧЕЛОВА', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'КРАСИМИР КАНЧЕЛОВА', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('МИЛЕН МАРИНОВ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'МИЛЕН МАРИНОВ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('НИКИ ШУМАНОВ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'НИКИ ШУМАНОВ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('НИКОЛАЙ ИЛИЕВ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'НИКОЛАЙ ИЛИЕВ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ПЕТЪР ТАСЕВ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ПЕТЪР ТАСЕВ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Румен Андонов', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Румен Андонов', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Румен Георгиев', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Румен Георгиев', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ТОДОР КОЛЕВ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ТОДОР КОЛЕВ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ТОНИ НИ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ТОНИ НИ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алвега дизайн', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алвега дизайн', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алумина глас', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алумина глас', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('вальо родопа', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'вальо родопа', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('далибор николов', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'далибор николов', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('дидо астера', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'дидо астера', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('дилиани мебел', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'дилиани мебел', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('димитър спешното', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'димитър спешното', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('дн стил', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'дн стил', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('драгън флай', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'драгън флай', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('евгени янев', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'евгени янев', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ес солюшън', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ес солюшън', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ет логи', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ет логи', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('жуни строй', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'жуни строй', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ива слав', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ива слав', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('иван иванов', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'иван иванов', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('иво градинар', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'иво градинар', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('иво кобрата', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'иво кобрата', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('интербилд ломско', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'интербилд ломско', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('кирил симчев', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'кирил симчев', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('крео декор', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'крео декор', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('кристиян аврамов', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'кристиян аврамов', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('кристиян павлов', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'кристиян павлов', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('лукс дизайн', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'лукс дизайн', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('митко дърво', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'митко дърво', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('митко мп', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'митко мп', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ники локорско', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ники локорско', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('николай димитров', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'николай димитров', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('нове терм', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'нове терм', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('от цех', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'от цех', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('петьо дидо', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'петьо дидо', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('пламен левски', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'пламен левски', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('пламен мп', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'пламен мп', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('поли глас', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'поли глас', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('си дизайн', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'си дизайн', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('тодор илийчев', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'тодор илийчев', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('тони своге', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'тони своге', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('федерико зуза', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'федерико зуза', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ПРИМА ПЛАСТ КОМЕРС', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ПРИМА ПЛАСТ КОМЕРС', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ди ем кей', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ди ем кей', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('интербилд ломско шосе', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'интербилд ломско шосе', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('миро и синове', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'миро и синове', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('дн стил 2103', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'дн стил 2103', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ДН СТИЛ 2248', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ДН СТИЛ 2248', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('дн стил 2277', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'дн стил 2277', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ДН СТИЛ 2279', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ДН СТИЛ 2279', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ДН СТИЛ 2282', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ДН СТИЛ 2282', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('дн стил 2287', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'дн стил 2287', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ДН СТИЛ 2294', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ДН СТИЛ 2294', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ДН СТИЛ 2296', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ДН СТИЛ 2296', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ПРИМА етап 3', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ПРИМА етап 3', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('диемкей ст.град', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'диемкей ст.град', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ДРУЖБА БЛ.42', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ДРУЖБА БЛ.42', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('дидо астера/андрейчо', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'дидо астера/андрейчо', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('дивийа 10', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'дивийа 10', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('младост 2002', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'младост 2002', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('метал 22', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'метал 22', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('трипласт 26', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'трипласт 26', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('МП 26-1100-098', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'МП 26-1100-098', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('МП 26-1199-0242', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'МП 26-1199-0242', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('МП 26-1807-1155', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'МП 26-1807-1155', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('МП 26-1907-0163', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'МП 26-1907-0163', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('МП 2632000071', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'МП 2632000071', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('МП 2632000766', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'МП 2632000766', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('трипласт 3-2', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'трипласт 3-2', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ТРИПЛАСТ 67', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ТРИПЛАСТ 67', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ПРОЕКТ 75', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ПРОЕКТ 75', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('гел 96', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'гел 96', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Емо-балкан', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Емо-балкан', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('М-Ж', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'М-Ж', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Тони-сестра', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Тони-сестра', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('д-ка', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'д-ка', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ишлеме-калин', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ишлеме-калин', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('кюпи-карлово', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'кюпи-карлово', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('кюпи-пазарджик', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'кюпи-пазарджик', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('тихомир-ишлеме', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'тихомир-ишлеме', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ДИЕМКЕЙ-РАВНО ПОЛЕ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ДИЕМКЕЙ-РАВНО ПОЛЕ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('М-Ж ПЛОВДИВ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'М-Ж ПЛОВДИВ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('М-Ж САРИНА', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'М-Ж САРИНА', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('м-ж Бистрица', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'м-ж Бистрица', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('м-ж Бъкстон', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'м-ж Бъкстон', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('м-ж Кривина', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'м-ж Кривина', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('м-ж Курило', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'м-ж Курило', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('м-ж банско', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'м-ж банско', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('м-ж папата', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'м-ж папата', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('м-ж пролеша', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'м-ж пролеша', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('М-Ж ТОНИ ВХОД', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'М-Ж ТОНИ ВХОД', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('боярт-ай ем ес', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'боярт-ай ем ес', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('м-ж Бачо Киро', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'м-ж Бачо Киро', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('м-ж бул.Б-я', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'м-ж бул.Б-я', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('Валман-етап 1', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'Валман-етап 1', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ВАЛМАН-ЕТАП 2', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ВАЛМАН-ЕТАП 2', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ТРЕЙДБИЛД-М-Ж', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ТРЕЙДБИЛД-М-Ж', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ТРИПЛАСТ-ПОР.11', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ТРИПЛАСТ-ПОР.11', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('трипласт-пор.16', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'трипласт-пор.16', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ВИЕНВИ-ЕТ.3', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ВИЕНВИ-ЕТ.3', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ВИЕНВИ-ЕТ.4', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ВИЕНВИ-ЕТ.4', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ВИЕНВИ-ЕТ.5', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ВИЕНВИ-ЕТ.5', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('дивийа-24', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'дивийа-24', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('трипласт-65', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'трипласт-65', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('трипласт-69', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'трипласт-69', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ВАЛМАН-73 ОУ', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ВАЛМАН-73 ОУ', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('трипласт-74', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'трипласт-74', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('ТРИПЛАСТ-77', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'ТРИПЛАСТ-77', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алдис-8161', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алдис-8161', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('боярт-84475', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'боярт-84475', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алдис-8625', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алдис-8625', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алдис-8715', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алдис-8715', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алдис-8719', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алдис-8719', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алдис-8729', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алдис-8729', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алдис-9270', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алдис-9270', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('алдис-9352', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'алдис-9352', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('АЛДИС-9353', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'АЛДИС-9353', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('АЛДИС-9520', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'АЛДИС-9520', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('а.петров', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'а.петров', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('к.волев', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'к.волев', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('д.н.стил 2255', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'д.н.стил 2255', id FROM ins;
WITH ins AS (INSERT INTO clients (name, source) VALUES ('NPN / НПН', 'office') RETURNING id)
INSERT INTO _client_map SELECT 'NPN / НПН', id FROM ins;

-- Insert orders
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 102.59, 'Оригинален №: 5-02546', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-01-09T08:00:00.000Z', '2026-01-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 0, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 547.58, 'Оригинален №: 626-00006-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-01-15T08:00:00.000Z', '2026-01-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ишлеме-калин'
  RETURNING id)
INSERT INTO _order_map SELECT 1, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 826.00, 'Оригинален №: 626-00094-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-01-20T08:00:00.000Z', '2026-01-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ДРУЖБА БЛ.42'
  RETURNING id)
INSERT INTO _order_map SELECT 2, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 235.80, 'Оригинален №: 700030', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-01-20T08:00:00.000Z', '2026-01-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 3, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 117.36, 'Оригинален №: 626-00017-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-01-26T08:00:00.000Z', '2026-01-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='поли'
  RETURNING id)
INSERT INTO _order_map SELECT 4, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 222.69, 'Оригинален №: 626-00015-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-01-26T08:00:00.000Z', '2026-01-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='д-ка'
  RETURNING id)
INSERT INTO _order_map SELECT 5, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 18.04, 'Оригинален №: 626-00156', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-01-28T08:00:00.000Z', '2026-01-28T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алдис-8625'
  RETURNING id)
INSERT INTO _order_map SELECT 6, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 81.78, 'Оригинален №: 5-02580', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-01-29T08:00:00.000Z', '2026-01-29T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 7, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1032.20, 'Оригинален №: 400932', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-01T08:00:00.000Z', '2026-02-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 8, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 96.00, 'Оригинален №: 626-00025-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-02T08:00:00.000Z', '2026-02-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='юлиана'
  RETURNING id)
INSERT INTO _order_map SELECT 9, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 56.04, 'Оригинален №: 326-00161', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-02T08:00:00.000Z', '2026-02-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='МЕДЖИКОЙНТ'
  RETURNING id)
INSERT INTO _order_map SELECT 10, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 748.17, 'Оригинален №: 326-00167', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-02T08:00:00.000Z', '2026-02-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='РАЗВИТИЕ'
  RETURNING id)
INSERT INTO _order_map SELECT 11, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 224.88, 'Оригинален №: 626-00238', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-02T08:00:00.000Z', '2026-02-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 12, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 29.33, 'Оригинален №: 626-00240', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-03T08:00:00.000Z', '2026-02-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алдис-8715'
  RETURNING id)
INSERT INTO _order_map SELECT 13, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 77.60, 'Оригинален №: 326-00183', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-03T08:00:00.000Z', '2026-02-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='митко'
  RETURNING id)
INSERT INTO _order_map SELECT 14, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 23.75, 'Оригинален №: 326-00172', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-03T08:00:00.000Z', '2026-02-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПЕПО'
  RETURNING id)
INSERT INTO _order_map SELECT 15, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 54.00, 'Оригинален №: 326-00171', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-03T08:00:00.000Z', '2026-02-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРИМА ПЛАСТ КОМЕРС'
  RETURNING id)
INSERT INTO _order_map SELECT 16, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 110.18, 'Оригинален №: 326-00172', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-03T08:00:00.000Z', '2026-02-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПЕПО'
  RETURNING id)
INSERT INTO _order_map SELECT 17, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 70.36, 'Оригинален №: 626-00255', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-04T08:00:00.000Z', '2026-02-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алдис-8729'
  RETURNING id)
INSERT INTO _order_map SELECT 18, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 68.43, 'Оригинален №: 626-00264', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-04T08:00:00.000Z', '2026-02-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 19, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 346.96, 'Оригинален №: 626-00260', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-04T08:00:00.000Z', '2026-02-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алдис-8719'
  RETURNING id)
INSERT INTO _order_map SELECT 20, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 24.64, 'Оригинален №: 326-00177', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-04T08:00:00.000Z', '2026-02-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кирил симчев'
  RETURNING id)
INSERT INTO _order_map SELECT 21, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 102.96, 'Оригинален №: 107028', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-04T08:00:00.000Z', '2026-02-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 22, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 116.12, 'Оригинален №: 5-02525', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-05T08:00:00.000Z', '2026-02-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 23, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 339.20, 'Оригинален №: 5-02559', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-05T08:00:00.000Z', '2026-02-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='м-ж пролеша'
  RETURNING id)
INSERT INTO _order_map SELECT 24, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 14.00, 'Оригинален №: 626-00268', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-05T08:00:00.000Z', '2026-02-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='йордан'
  RETURNING id)
INSERT INTO _order_map SELECT 25, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 134.19, 'Оригинален №: 5-02585', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-05T08:00:00.000Z', '2026-02-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 26, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 36.86, 'Оригинален №: 326-00180', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-05T08:00:00.000Z', '2026-02-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='рацата'
  RETURNING id)
INSERT INTO _order_map SELECT 27, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 43.18, 'Оригинален №: 326-00182', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-06T08:00:00.000Z', '2026-02-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='митко мп'
  RETURNING id)
INSERT INTO _order_map SELECT 28, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1306.20, 'Оригинален №: 400816_4', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-06T08:00:00.000Z', '2026-02-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='интербилд ломско шосе'
  RETURNING id)
INSERT INTO _order_map SELECT 29, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', NULL, 'Оригинален №: 326-00189', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-06T08:00:00.000Z', '2026-02-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРИМА ПЛАСТ КОМЕРС'
  RETURNING id)
INSERT INTO _order_map SELECT 30, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 31.22, 'Оригинален №: 326-00188', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-06T08:00:00.000Z', '2026-02-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='тимбопарк'
  RETURNING id)
INSERT INTO _order_map SELECT 31, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 60.80, 'Оригинален №: 626-00275', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-06T08:00:00.000Z', '2026-02-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='коко'
  RETURNING id)
INSERT INTO _order_map SELECT 32, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1576.07, 'Оригинален №: 400816_3', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-06T08:00:00.000Z', '2026-02-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='интербилд ломско шосе'
  RETURNING id)
INSERT INTO _order_map SELECT 33, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 71.84, 'Оригинален №: 626-00278', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-06T08:00:00.000Z', '2026-02-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 34, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 28.90, 'Оригинален №: 626-00290', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-09T08:00:00.000Z', '2026-02-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ТРИПЛАСТ-ПОР.11'
  RETURNING id)
INSERT INTO _order_map SELECT 35, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 8.40, 'Оригинален №: 326-00197', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-09T08:00:00.000Z', '2026-02-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='иван иванов'
  RETURNING id)
INSERT INTO _order_map SELECT 36, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 398.00, 'Оригинален №: 626-00027-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-09T08:00:00.000Z', '2026-02-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='иво градинар'
  RETURNING id)
INSERT INTO _order_map SELECT 37, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 21.92, 'Оригинален №: 326-00201', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-09T08:00:00.000Z', '2026-02-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 38, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 19.89, 'Оригинален №: 326-00193', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-09T08:00:00.000Z', '2026-02-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='петьо дидо'
  RETURNING id)
INSERT INTO _order_map SELECT 39, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 21.82, 'Оригинален №: 326-00186', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-09T08:00:00.000Z', '2026-02-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='митко дърво'
  RETURNING id)
INSERT INTO _order_map SELECT 40, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 2157.30, 'Оригинален №: 626-00299', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-10T08:00:00.000Z', '2026-02-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН-ЕТАП 2'
  RETURNING id)
INSERT INTO _order_map SELECT 41, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 48.75, 'Оригинален №: 326-00203', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-10T08:00:00.000Z', '2026-02-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дидо астера'
  RETURNING id)
INSERT INTO _order_map SELECT 42, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 22.08, 'Оригинален №: 326-00206', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-10T08:00:00.000Z', '2026-02-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='булвас'
  RETURNING id)
INSERT INTO _order_map SELECT 43, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 49.60, 'Оригинален №: 626-00308', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-10T08:00:00.000Z', '2026-02-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='к.волев'
  RETURNING id)
INSERT INTO _order_map SELECT 44, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 17.90, 'Оригинален №: 626-00322', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-10T08:00:00.000Z', '2026-02-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='христо'
  RETURNING id)
INSERT INTO _order_map SELECT 45, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 53.84, 'Оригинален №: 5-02588', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-10T08:00:00.000Z', '2026-02-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 46, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 13.32, 'Оригинален №: 5-02588', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-10T08:00:00.000Z', '2026-02-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 47, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 7.90, 'Оригинален №: 626-00314', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-11T08:00:00.000Z', '2026-02-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 48, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 7.12, 'Оригинален №: 700047', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-11T08:00:00.000Z', '2026-02-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 49, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 158.00, 'Оригинален №: 626-00312', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-11T08:00:00.000Z', '2026-02-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='разград'
  RETURNING id)
INSERT INTO _order_map SELECT 50, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 125.32, 'Оригинален №: 326-00208', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-11T08:00:00.000Z', '2026-02-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='трипласт 3-2'
  RETURNING id)
INSERT INTO _order_map SELECT 51, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 101.51, 'Оригинален №: 326-00207', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-11T08:00:00.000Z', '2026-02-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРИМА ПЛАСТ КОМЕРС'
  RETURNING id)
INSERT INTO _order_map SELECT 52, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 5320.43, 'Оригинален №: 626-00315', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-12T08:00:00.000Z', '2026-02-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОЯРТ'
  RETURNING id)
INSERT INTO _order_map SELECT 53, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 26.50, 'Оригинален №: 700051', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-12T08:00:00.000Z', '2026-02-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='д-ка'
  RETURNING id)
INSERT INTO _order_map SELECT 54, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 47.10, 'Оригинален №: 700049', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-12T08:00:00.000Z', '2026-02-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 55, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 87.00, 'Оригинален №: 626-00317', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-12T08:00:00.000Z', '2026-02-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 56, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 110.60, 'Оригинален №: 626-00319', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-12T08:00:00.000Z', '2026-02-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='вигомебел'
  RETURNING id)
INSERT INTO _order_map SELECT 57, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 41.40, 'Оригинален №: 626-00324', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-13T08:00:00.000Z', '2026-02-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОЯРТ'
  RETURNING id)
INSERT INTO _order_map SELECT 58, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 341.10, 'Оригинален №: 626-00325', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-13T08:00:00.000Z', '2026-02-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='трипласт-пор.16'
  RETURNING id)
INSERT INTO _order_map SELECT 59, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 48.30, 'Оригинален №: 626-00327', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-13T08:00:00.000Z', '2026-02-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 60, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 372.75, 'Оригинален №: 5-02592', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-13T08:00:00.000Z', '2026-02-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 61, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 60.52, 'Оригинален №: 626-00336', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='мето'
  RETURNING id)
INSERT INTO _order_map SELECT 62, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 660.32, 'Оригинален №: 626-00331', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 63, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 217.37, 'Оригинален №: 5-02595', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 64, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 341.40, 'Оригинален №: 626-00334', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='младост 2002'
  RETURNING id)
INSERT INTO _order_map SELECT 65, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 69.40, 'Оригинален №: 626-00344', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 66, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 107.01, 'Оригинален №: 326-00212', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПАВКАТА'
  RETURNING id)
INSERT INTO _order_map SELECT 67, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 201.30, 'Оригинален №: 326-00220', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Мишо'
  RETURNING id)
INSERT INTO _order_map SELECT 68, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 8.00, 'Оригинален №: 326-00216', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='тодор илийчев'
  RETURNING id)
INSERT INTO _order_map SELECT 69, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 286.93, 'Оригинален №: 5-02594', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 70, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 84.70, 'Оригинален №: 626-00332', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ЕДНА ПЛАСТ'
  RETURNING id)
INSERT INTO _order_map SELECT 71, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 741.20, 'Оригинален №: 326-00223', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-16T08:00:00.000Z', '2026-02-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='поли глас'
  RETURNING id)
INSERT INTO _order_map SELECT 72, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 26.62, 'Оригинален №: 326-00226', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-17T08:00:00.000Z', '2026-02-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРИМА ПЛАСТ КОМЕРС'
  RETURNING id)
INSERT INTO _order_map SELECT 73, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 35.64, 'Оригинален №: 326-00225', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-17T08:00:00.000Z', '2026-02-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='гласмен'
  RETURNING id)
INSERT INTO _order_map SELECT 74, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 59.14, 'Оригинален №: 5-02596', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-17T08:00:00.000Z', '2026-02-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 75, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 68.22, 'Оригинален №: 326-00229', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-17T08:00:00.000Z', '2026-02-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 76, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 28.63, 'Оригинален №: 626-00346', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-17T08:00:00.000Z', '2026-02-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='д.н.стил 2255'
  RETURNING id)
INSERT INTO _order_map SELECT 77, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 3650.20, 'Оригинален №: 626-00016-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-17T08:00:00.000Z', '2026-02-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='м-ж Кривина'
  RETURNING id)
INSERT INTO _order_map SELECT 78, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 73.00, 'Оригинален №: 626-00349', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-17T08:00:00.000Z', '2026-02-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кристиян аврамов'
  RETURNING id)
INSERT INTO _order_map SELECT 79, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 1373.80, 'Оригинален №: 626-00033-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-17T08:00:00.000Z', '2026-02-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='м-ж бул.Б-я'
  RETURNING id)
INSERT INTO _order_map SELECT 80, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 767.09, 'Оригинален №: 626-00350', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-18T08:00:00.000Z', '2026-02-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 81, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 173.24, 'Оригинален №: 5-02598', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-18T08:00:00.000Z', '2026-02-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 82, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 148.32, 'Оригинален №: 700057', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-18T08:00:00.000Z', '2026-02-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 83, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 63.88, 'Оригинален №: 326-00231', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-18T08:00:00.000Z', '2026-02-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПЕПО'
  RETURNING id)
INSERT INTO _order_map SELECT 84, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 56.28, 'Оригинален №: 626-00351', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-18T08:00:00.000Z', '2026-02-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 85, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 21.90, 'Оригинален №: 626-00361', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-19T08:00:00.000Z', '2026-02-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ивелин'
  RETURNING id)
INSERT INTO _order_map SELECT 86, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 5208.58, 'Оригинален №: 626-00031-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-19T08:00:00.000Z', '2026-02-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж ТОНИ ВХОД'
  RETURNING id)
INSERT INTO _order_map SELECT 87, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 16.31, 'Оригинален №: 326-00234', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-19T08:00:00.000Z', '2026-02-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 88, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 18.48, 'Оригинален №: 326-00243', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-19T08:00:00.000Z', '2026-02-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='вальо родопа'
  RETURNING id)
INSERT INTO _order_map SELECT 89, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 100.84, 'Оригинален №: 5-02601', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-19T08:00:00.000Z', '2026-02-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 90, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 106.93, 'Оригинален №: 326-00251', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-20T08:00:00.000Z', '2026-02-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 91, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 13.20, 'Оригинален №: 326-00246', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-20T08:00:00.000Z', '2026-02-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 92, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 163.40, 'Оригинален №: 326-00246', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-20T08:00:00.000Z', '2026-02-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 93, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 25.20, 'Оригинален №: 326-00250', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-20T08:00:00.000Z', '2026-02-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='РАЙЧО'
  RETURNING id)
INSERT INTO _order_map SELECT 94, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 118.24, 'Оригинален №: 626-00364', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-20T08:00:00.000Z', '2026-02-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 95, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 10.00, 'Оригинален №: 700066', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-20T08:00:00.000Z', '2026-02-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 96, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 52.57, 'Оригинален №: 5-02573', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-21T08:00:00.000Z', '2026-02-21T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 97, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 25.90, 'Оригинален №: 626-00369', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-23T08:00:00.000Z', '2026-02-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='младост 2002'
  RETURNING id)
INSERT INTO _order_map SELECT 98, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 73.36, 'Оригинален №: 400937', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-23T08:00:00.000Z', '2026-02-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 99, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 43.10, 'Оригинален №: 326-00258', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-23T08:00:00.000Z', '2026-02-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='лемез'
  RETURNING id)
INSERT INTO _order_map SELECT 100, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 45.05, 'Оригинален №: 326-00256', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-23T08:00:00.000Z', '2026-02-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дидо астера/андрейчо'
  RETURNING id)
INSERT INTO _order_map SELECT 101, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 267.80, 'Оригинален №: 626-00373', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-23T08:00:00.000Z', '2026-02-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='МОМЧИЛ'
  RETURNING id)
INSERT INTO _order_map SELECT 102, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 88.40, 'Оригинален №: 626-00378', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-23T08:00:00.000Z', '2026-02-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ес солюшън'
  RETURNING id)
INSERT INTO _order_map SELECT 103, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 8.60, 'Оригинален №: 626-00374', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-23T08:00:00.000Z', '2026-02-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Георги Минчев'
  RETURNING id)
INSERT INTO _order_map SELECT 104, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 18.75, 'Оригинален №: 326-00262', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='тони своге'
  RETURNING id)
INSERT INTO _order_map SELECT 105, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 35.49, 'Оригинален №: 326-00262', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='тони своге'
  RETURNING id)
INSERT INTO _order_map SELECT 106, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 105.70, 'Оригинален №: 626-00388', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='вигомебел'
  RETURNING id)
INSERT INTO _order_map SELECT 107, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 1266.80, 'Оригинален №: 626-00039-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Румен Георгиев'
  RETURNING id)
INSERT INTO _order_map SELECT 108, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 2162.34, 'Оригинален №: 326-00257', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='гласмен'
  RETURNING id)
INSERT INTO _order_map SELECT 109, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 233.40, 'Оригинален №: 626-00383', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОЯРТ'
  RETURNING id)
INSERT INTO _order_map SELECT 110, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 339.60, 'Оригинален №: 626-00382', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 111, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 30.59, 'Оригинален №: 700064', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 112, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 27.88, 'Оригинален №: 326-00263', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРИМА ПЛАСТ КОМЕРС'
  RETURNING id)
INSERT INTO _order_map SELECT 113, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 133.10, 'Оригинален №: 626-00389', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 114, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 118.31, 'Оригинален №: 5-02607', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 115, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 465.41, 'Оригинален №: 5-02606', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 116, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 57.72, 'Оригинален №: 326-00415', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-24T08:00:00.000Z', '2026-02-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПЕПО'
  RETURNING id)
INSERT INTO _order_map SELECT 117, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 171.00, 'Оригинален №: 626-00342', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-25T08:00:00.000Z', '2026-02-25T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОЯРТ'
  RETURNING id)
INSERT INTO _order_map SELECT 118, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 14.24, 'Оригинален №: 700071', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-25T08:00:00.000Z', '2026-02-25T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 119, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 18.48, 'Оригинален №: 700068', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-25T08:00:00.000Z', '2026-02-25T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 120, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 24.00, 'Оригинален №: 700070', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-25T08:00:00.000Z', '2026-02-25T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 121, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 59.58, 'Оригинален №: 326-00268', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-25T08:00:00.000Z', '2026-02-25T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='NPN / НПН'
  RETURNING id)
INSERT INTO _order_map SELECT 122, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 35.00, 'Оригинален №: 626-00346', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-26T08:00:00.000Z', '2026-02-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='жуни строй'
  RETURNING id)
INSERT INTO _order_map SELECT 123, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 166.74, 'Оригинален №: 626-00347', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-26T08:00:00.000Z', '2026-02-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 124, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 23.77, 'Оригинален №: 326-00276', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-26T08:00:00.000Z', '2026-02-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='НИКИ ШУМАНОВ'
  RETURNING id)
INSERT INTO _order_map SELECT 125, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 249.39, 'Оригинален №: 326-00271', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-26T08:00:00.000Z', '2026-02-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 126, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 293.41, 'Оригинален №: 326-00274', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-26T08:00:00.000Z', '2026-02-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ива слав'
  RETURNING id)
INSERT INTO _order_map SELECT 127, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 54.41, 'Оригинален №: 326-00273', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-26T08:00:00.000Z', '2026-02-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='крео декор'
  RETURNING id)
INSERT INTO _order_map SELECT 128, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 39.98, 'Оригинален №: 326-00288', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-02-27T08:00:00.000Z', '2026-02-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='а.петров'
  RETURNING id)
INSERT INTO _order_map SELECT 129, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 719.78, 'Оригинален №: 107048', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-02T08:00:00.000Z', '2026-03-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 130, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 50.43, 'Оригинален №: 626-00345', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-02T08:00:00.000Z', '2026-03-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кристиян павлов'
  RETURNING id)
INSERT INTO _order_map SELECT 131, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 59.29, 'Оригинален №: 626-00381', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-02T08:00:00.000Z', '2026-03-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='трипласт 26'
  RETURNING id)
INSERT INTO _order_map SELECT 132, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 184.15, 'Оригинален №: 326-00297', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-04T08:00:00.000Z', '2026-03-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 133, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 585.93, 'Оригинален №: 626-00357', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-04T08:00:00.000Z', '2026-03-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 134, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 236.00, 'Оригинален №: 626-00035-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-04T08:00:00.000Z', '2026-03-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Пламен'
  RETURNING id)
INSERT INTO _order_map SELECT 135, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 236.00, 'Оригинален №: 626-000035-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-04T08:00:00.000Z', '2026-03-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Пламен'
  RETURNING id)
INSERT INTO _order_map SELECT 136, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 719.00, 'Оригинален №: 626-00037-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-04T08:00:00.000Z', '2026-03-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Тони-сестра'
  RETURNING id)
INSERT INTO _order_map SELECT 137, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1175.19, 'Оригинален №: 107057', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-04T08:00:00.000Z', '2026-03-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 138, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 345.71, 'Оригинален №: 326-00293', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-04T08:00:00.000Z', '2026-03-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 139, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 22.58, 'Оригинален №: 326-00296', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-04T08:00:00.000Z', '2026-03-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='гришата'
  RETURNING id)
INSERT INTO _order_map SELECT 140, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 15.70, 'Оригинален №: 326-00291', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-04T08:00:00.000Z', '2026-03-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='драгън флай'
  RETURNING id)
INSERT INTO _order_map SELECT 141, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 18.19, 'Оригинален №: 5-02602', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-05T08:00:00.000Z', '2026-03-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 142, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 17.36, 'Оригинален №: 326-00316', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-05T08:00:00.000Z', '2026-03-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='МИЛЕН МАРИНОВ'
  RETURNING id)
INSERT INTO _order_map SELECT 143, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 67.59, 'Оригинален №: 626-00375', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-05T08:00:00.000Z', '2026-03-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алдис-8161'
  RETURNING id)
INSERT INTO _order_map SELECT 144, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 94.71, 'Оригинален №: 5-02614', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-05T08:00:00.000Z', '2026-03-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 145, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 54.65, 'Оригинален №: 5-02613', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-05T08:00:00.000Z', '2026-03-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 146, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 148.36, 'Оригинален №: 5-02612', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-05T08:00:00.000Z', '2026-03-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 147, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 36.84, 'Оригинален №: 326-00307', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-05T08:00:00.000Z', '2026-03-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='КАДА ПЛАСТ'
  RETURNING id)
INSERT INTO _order_map SELECT 148, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 294.59, 'Оригинален №: 326-00312', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-06T08:00:00.000Z', '2026-03-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 149, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1983.70, 'Оригинален №: 626-00353', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-06T08:00:00.000Z', '2026-03-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВИЕНВИ-ЕТ.3'
  RETURNING id)
INSERT INTO _order_map SELECT 150, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1945.00, 'Оригинален №: 626-00353', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-06T08:00:00.000Z', '2026-03-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВИЕНВИ-ЕТ.4'
  RETURNING id)
INSERT INTO _order_map SELECT 151, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1335.10, 'Оригинален №: 626-00353', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-06T08:00:00.000Z', '2026-03-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВИЕНВИ-ЕТ.5'
  RETURNING id)
INSERT INTO _order_map SELECT 152, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 85.21, 'Оригинален №: 326-00312', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-06T08:00:00.000Z', '2026-03-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 153, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 45.44, 'Оригинален №: 326-00313', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-06T08:00:00.000Z', '2026-03-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='РАЙЧО'
  RETURNING id)
INSERT INTO _order_map SELECT 154, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 15.95, 'Оригинален №: 626-00382', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-06T08:00:00.000Z', '2026-03-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='си дизайн'
  RETURNING id)
INSERT INTO _order_map SELECT 155, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 385.00, 'Оригинален №: 626-00045-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-09T08:00:00.000Z', '2026-03-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дилиани мебел'
  RETURNING id)
INSERT INTO _order_map SELECT 156, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 35.57, 'Оригинален №: 326-00323', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-09T08:00:00.000Z', '2026-03-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дидо астера/андрейчо'
  RETURNING id)
INSERT INTO _order_map SELECT 157, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 20.32, 'Оригинален №: 326-00329', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-09T08:00:00.000Z', '2026-03-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='митко мп'
  RETURNING id)
INSERT INTO _order_map SELECT 158, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 13.68, 'Оригинален №: 326-00321', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-09T08:00:00.000Z', '2026-03-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ники локорско'
  RETURNING id)
INSERT INTO _order_map SELECT 159, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 4.00, 'Оригинален №: 700081', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-09T08:00:00.000Z', '2026-03-09T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 160, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 521.00, 'Оригинален №: 626-00397', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-10T08:00:00.000Z', '2026-03-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОЯРТ'
  RETURNING id)
INSERT INTO _order_map SELECT 161, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 16.52, 'Оригинален №: 626-00404', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-10T08:00:00.000Z', '2026-03-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='к.волев'
  RETURNING id)
INSERT INTO _order_map SELECT 162, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 521.00, 'Оригинален №: 626-00397', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-10T08:00:00.000Z', '2026-03-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОЯРТ'
  RETURNING id)
INSERT INTO _order_map SELECT 163, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 918.51, 'Оригинален №: 326-00332', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-10T08:00:00.000Z', '2026-03-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРИМА ПЛАСТ КОМЕРС'
  RETURNING id)
INSERT INTO _order_map SELECT 164, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 87.88, 'Оригинален №: 326-00334', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-10T08:00:00.000Z', '2026-03-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 165, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 32.18, 'Оригинален №: 326-00336', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-10T08:00:00.000Z', '2026-03-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПЕТЪР ТАСЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 166, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 119.66, 'Оригинален №: 326-00337', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-10T08:00:00.000Z', '2026-03-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 167, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 204.29, 'Оригинален №: 5-02616', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-10T08:00:00.000Z', '2026-03-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 168, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 11.76, 'Оригинален №: 326-00339', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-11T08:00:00.000Z', '2026-03-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='гришата'
  RETURNING id)
INSERT INTO _order_map SELECT 169, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 19.20, 'Оригинален №: 626-00407', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-11T08:00:00.000Z', '2026-03-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='младост 2002'
  RETURNING id)
INSERT INTO _order_map SELECT 170, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 31.00, 'Оригинален №: 626-00415', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-11T08:00:00.000Z', '2026-03-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='иво кобрата'
  RETURNING id)
INSERT INTO _order_map SELECT 171, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1508.00, 'Оригинален №: 326-00326', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-12T08:00:00.000Z', '2026-03-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='МП 26-1100-098'
  RETURNING id)
INSERT INTO _order_map SELECT 172, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 6.00, 'Оригинален №: 700089', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-12T08:00:00.000Z', '2026-03-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 173, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 2645.90, 'Оригинален №: 326-00355', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-12T08:00:00.000Z', '2026-03-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ДН СТИЛ 2248'
  RETURNING id)
INSERT INTO _order_map SELECT 174, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 4316.90, 'Оригинален №: 626-00052-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-13T08:00:00.000Z', '2026-03-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='м-ж Бачо Киро'
  RETURNING id)
INSERT INTO _order_map SELECT 175, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 12.29, 'Оригинален №: 326-00364', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-13T08:00:00.000Z', '2026-03-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='крео декор'
  RETURNING id)
INSERT INTO _order_map SELECT 176, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 738.48, 'Оригинален №: 326-00360', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-13T08:00:00.000Z', '2026-03-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 177, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 120.70, 'Оригинален №: 326-00359', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-13T08:00:00.000Z', '2026-03-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кюпи'
  RETURNING id)
INSERT INTO _order_map SELECT 178, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 60.06, 'Оригинален №: 700084', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-15T08:00:00.000Z', '2026-03-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 179, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 3343.40, 'Оригинален №: 626-00425', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-16T08:00:00.000Z', '2026-03-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Валман-етап 1'
  RETURNING id)
INSERT INTO _order_map SELECT 180, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 14.55, 'Оригинален №: 326-00372', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-16T08:00:00.000Z', '2026-03-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 181, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 32.53, 'Оригинален №: 626-00430', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-16T08:00:00.000Z', '2026-03-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алвега дизайн'
  RETURNING id)
INSERT INTO _order_map SELECT 182, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 9.80, 'Оригинален №: 700086', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-16T08:00:00.000Z', '2026-03-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 183, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 41.00, 'Оригинален №: 626-00431', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-16T08:00:00.000Z', '2026-03-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Емо-балкан'
  RETURNING id)
INSERT INTO _order_map SELECT 184, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 60.50, 'Оригинален №: 626-00427', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-16T08:00:00.000Z', '2026-03-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='йордан'
  RETURNING id)
INSERT INTO _order_map SELECT 185, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 32.02, 'Оригинален №: 5-02628', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-17T08:00:00.000Z', '2026-03-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 186, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1065.31, 'Оригинален №: 326-00371', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-17T08:00:00.000Z', '2026-03-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дн стил 2103'
  RETURNING id)
INSERT INTO _order_map SELECT 187, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 13.12, 'Оригинален №: 326-00380', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-17T08:00:00.000Z', '2026-03-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 188, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 238.01, 'Оригинален №: 326-00380', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-17T08:00:00.000Z', '2026-03-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 189, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 33.58, 'Оригинален №: 326-00366', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-17T08:00:00.000Z', '2026-03-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='методи'
  RETURNING id)
INSERT INTO _order_map SELECT 190, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 6.00, 'Оригинален №: 700096', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-17T08:00:00.000Z', '2026-03-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 191, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 194.94, 'Оригинален №: 5-02628', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-17T08:00:00.000Z', '2026-03-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 192, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 2686.60, 'Оригинален №: 626-00058-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-18T08:00:00.000Z', '2026-03-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='м-ж Курило'
  RETURNING id)
INSERT INTO _order_map SELECT 193, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 354.47, 'Оригинален №: 626-00446', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-18T08:00:00.000Z', '2026-03-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 194, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 37.70, 'Оригинален №: 626-00447', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-18T08:00:00.000Z', '2026-03-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 195, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 92.71, 'Оригинален №: 5-02630', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-19T08:00:00.000Z', '2026-03-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 196, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 256.26, 'Оригинален №: 626-00448', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-19T08:00:00.000Z', '2026-03-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 197, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 87.40, 'Оригинален №: 326-00397', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-19T08:00:00.000Z', '2026-03-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дидо астера'
  RETURNING id)
INSERT INTO _order_map SELECT 198, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 94.86, 'Оригинален №: 400930', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-19T08:00:00.000Z', '2026-03-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 199, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 47.10, 'Оригинален №: 5-02630', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-19T08:00:00.000Z', '2026-03-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 200, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 40.95, 'Оригинален №: 326-00392', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-19T08:00:00.000Z', '2026-03-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='РАЙЧО'
  RETURNING id)
INSERT INTO _order_map SELECT 201, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 44.75, 'Оригинален №: 326-00393', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-19T08:00:00.000Z', '2026-03-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ива слав'
  RETURNING id)
INSERT INTO _order_map SELECT 202, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 77.66, 'Оригинален №: 326-00391', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-19T08:00:00.000Z', '2026-03-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ЗДРАВКО'
  RETURNING id)
INSERT INTO _order_map SELECT 203, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 26.70, 'Оригинален №: 326-00391', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-19T08:00:00.000Z', '2026-03-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ЗДРАВКО'
  RETURNING id)
INSERT INTO _order_map SELECT 204, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 28.40, 'Оригинален №: 626-00456', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-20T08:00:00.000Z', '2026-03-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='гел 96'
  RETURNING id)
INSERT INTO _order_map SELECT 205, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 55.90, 'Оригинален №: 626-00459', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-20T08:00:00.000Z', '2026-03-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кристиян аврамов'
  RETURNING id)
INSERT INTO _order_map SELECT 206, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 1065.39, 'Оригинален №: 326-00399', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-20T08:00:00.000Z', '2026-03-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Стани'
  RETURNING id)
INSERT INTO _order_map SELECT 207, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 411.66, 'Оригинален №: 626-00445', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-20T08:00:00.000Z', '2026-03-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 208, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 63.00, 'Оригинален №: 626-00062-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-20T08:00:00.000Z', '2026-03-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Румен Андонов'
  RETURNING id)
INSERT INTO _order_map SELECT 209, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 267.22, 'Оригинален №: 326-00394', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-20T08:00:00.000Z', '2026-03-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРИМА ПЛАСТ КОМЕРС'
  RETURNING id)
INSERT INTO _order_map SELECT 210, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 21.06, 'Оригинален №: 326-00400', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-20T08:00:00.000Z', '2026-03-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ТОДОР КОЛЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 211, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 58.93, 'Оригинален №: 326-00413', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кюпи-пазарджик'
  RETURNING id)
INSERT INTO _order_map SELECT 212, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 85.84, 'Оригинален №: 626-00468', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дивийа 10'
  RETURNING id)
INSERT INTO _order_map SELECT 213, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', NULL, 'Оригинален №: 326-00389', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='МП 2632000071'
  RETURNING id)
INSERT INTO _order_map SELECT 214, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 11.70, 'Оригинален №: 326-00410', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='румен'
  RETURNING id)
INSERT INTO _order_map SELECT 215, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 14.63, 'Оригинален №: 326-00406', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='пламен левски'
  RETURNING id)
INSERT INTO _order_map SELECT 216, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 1122.10, 'Оригинален №: 326-00405', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 217, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 81.62, 'Оригинален №: 326-00403', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='систанс'
  RETURNING id)
INSERT INTO _order_map SELECT 218, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 23.98, 'Оригинален №: 5-02634', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 219, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 96.46, 'Оригинален №: 626-00469', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 220, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 209.55, 'Оригинален №: 326-00414', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 221, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 34.01, 'Оригинален №: 326-00402', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-23T08:00:00.000Z', '2026-03-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='а.петров'
  RETURNING id)
INSERT INTO _order_map SELECT 222, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 177.66, 'Оригинален №: 5-02623', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-24T08:00:00.000Z', '2026-03-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 223, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 129.68, 'Оригинален №: 326-00422', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-24T08:00:00.000Z', '2026-03-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРОЕКТ 75'
  RETURNING id)
INSERT INTO _order_map SELECT 224, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1198.05, 'Оригинален №: 626-00472', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-24T08:00:00.000Z', '2026-03-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 225, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 110.88, 'Оригинален №: 5-02517', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-24T08:00:00.000Z', '2026-03-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 226, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 152.88, 'Оригинален №: 326-00425', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-24T08:00:00.000Z', '2026-03-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дидо астера'
  RETURNING id)
INSERT INTO _order_map SELECT 227, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 66.50, 'Оригинален №: 326-00430', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-25T08:00:00.000Z', '2026-03-25T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='далибор николов'
  RETURNING id)
INSERT INTO _order_map SELECT 228, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 272.30, 'Оригинален №: 626-00484', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-25T08:00:00.000Z', '2026-03-25T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='младост'
  RETURNING id)
INSERT INTO _order_map SELECT 229, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 32.80, 'Оригинален №: 626-00475', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-25T08:00:00.000Z', '2026-03-25T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВЕНКО'
  RETURNING id)
INSERT INTO _order_map SELECT 230, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 304.40, 'Оригинален №: 626-00485', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-25T08:00:00.000Z', '2026-03-25T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОЯРТ'
  RETURNING id)
INSERT INTO _order_map SELECT 231, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 172.78, 'Оригинален №: 326-00429', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-25T08:00:00.000Z', '2026-03-25T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 232, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 17.35, 'Оригинален №: 400948', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-26T08:00:00.000Z', '2026-03-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 233, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 11.80, 'Оригинален №: 326-00439', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-26T08:00:00.000Z', '2026-03-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='нбр'
  RETURNING id)
INSERT INTO _order_map SELECT 234, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 23.65, 'Оригинален №: 326-00441', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-26T08:00:00.000Z', '2026-03-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПЕПО'
  RETURNING id)
INSERT INTO _order_map SELECT 235, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 52.60, 'Оригинален №: 626-00489', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-26T08:00:00.000Z', '2026-03-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кюпи'
  RETURNING id)
INSERT INTO _order_map SELECT 236, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 111.93, 'Оригинален №: 626-00488', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-26T08:00:00.000Z', '2026-03-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 237, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 253.20, 'Оригинален №: 626-00492', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-26T08:00:00.000Z', '2026-03-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОЯРТ'
  RETURNING id)
INSERT INTO _order_map SELECT 238, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 12.00, 'Оригинален №: 700112', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-27T08:00:00.000Z', '2026-03-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 239, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 625.26, 'Оригинален №: 326-00434', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-27T08:00:00.000Z', '2026-03-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дн стил 2277'
  RETURNING id)
INSERT INTO _order_map SELECT 240, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 283.45, 'Оригинален №: 5-02642', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-27T08:00:00.000Z', '2026-03-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 241, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 104.10, 'Оригинален №: 5-02641', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-27T08:00:00.000Z', '2026-03-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 242, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 27.40, 'Оригинален №: 326-00464', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-30T08:00:00.000Z', '2026-03-30T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дидо астера'
  RETURNING id)
INSERT INTO _order_map SELECT 243, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 8.53, 'Оригинален №: 326-00461', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-30T08:00:00.000Z', '2026-03-30T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='а.петров'
  RETURNING id)
INSERT INTO _order_map SELECT 244, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 264.48, 'Оригинален №: 326-00468', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-30T08:00:00.000Z', '2026-03-30T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 245, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 33.27, 'Оригинален №: 626-00505', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-31T08:00:00.000Z', '2026-03-31T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='си дизайн'
  RETURNING id)
INSERT INTO _order_map SELECT 246, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 2416.60, 'Оригинален №: 626-00048-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-31T08:00:00.000Z', '2026-03-31T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВИКТОР ГЕОРГИЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 247, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 66.90, 'Оригинален №: 326-00470', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-31T08:00:00.000Z', '2026-03-31T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВЛАДИСЛАВ ПЕЛОВ'
  RETURNING id)
INSERT INTO _order_map SELECT 248, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 158.99, 'Оригинален №: 326-00474', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-31T08:00:00.000Z', '2026-03-31T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='НИКОЛАЙ ИЛИЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 249, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 862.58, 'Оригинален №: 5-02644', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-31T08:00:00.000Z', '2026-03-31T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 250, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 138.00, 'Оригинален №: 626-00079-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-31T08:00:00.000Z', '2026-03-31T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='оги'
  RETURNING id)
INSERT INTO _order_map SELECT 251, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 9.79, 'Оригинален №: 700120', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-03-31T08:00:00.000Z', '2026-03-31T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 252, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 158.79, 'Оригинален №: 5-02646', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-01T08:00:00.000Z', '2026-04-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 253, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 157.37, 'Оригинален №: 5-02639', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-01T08:00:00.000Z', '2026-04-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 254, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 158.79, 'Оригинален №: 5-02646', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-01T08:00:00.000Z', '2026-04-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 255, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 349.30, 'Оригинален №: 626-00516', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-01T08:00:00.000Z', '2026-04-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 256, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 58.70, 'Оригинален №: 326-00484', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-01T08:00:00.000Z', '2026-04-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ТОДОР КОЛЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 257, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 479.77, 'Оригинален №: 400816_6', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-01T08:00:00.000Z', '2026-04-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='интербилд ломско шосе'
  RETURNING id)
INSERT INTO _order_map SELECT 258, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 267.21, 'Оригинален №: 326-00476', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-01T08:00:00.000Z', '2026-04-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 259, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 81.03, 'Оригинален №: 326-00470-2', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-01T08:00:00.000Z', '2026-04-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВЛАДИСЛАВ ПЕЛОВ'
  RETURNING id)
INSERT INTO _order_map SELECT 260, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 579.47, 'Оригинален №: 107093', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-02T08:00:00.000Z', '2026-04-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ТРЕЙДБИЛД-М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 261, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 44.55, 'Оригинален №: 626-00520', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-02T08:00:00.000Z', '2026-04-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 262, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 743.45, 'Оригинален №: 626-00522', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-02T08:00:00.000Z', '2026-04-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей ст.град'
  RETURNING id)
INSERT INTO _order_map SELECT 263, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 871.08, 'Оригинален №: 326-00492', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-03T08:00:00.000Z', '2026-04-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='булвас'
  RETURNING id)
INSERT INTO _order_map SELECT 264, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 289.32, 'Оригинален №: 626-00534', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-03T08:00:00.000Z', '2026-04-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 265, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 106.54, 'Оригинален №: 5-02651', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-03T08:00:00.000Z', '2026-04-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 266, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 16.00, 'Оригинален №: 626-00545', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-06T08:00:00.000Z', '2026-04-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кристиян аврамов'
  RETURNING id)
INSERT INTO _order_map SELECT 267, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 55.57, 'Оригинален №: 5-02654', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-06T08:00:00.000Z', '2026-04-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 268, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 91.33, 'Оригинален №: 626-00546', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-06T08:00:00.000Z', '2026-04-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ДИЕМКЕЙ-РАВНО ПОЛЕ'
  RETURNING id)
INSERT INTO _order_map SELECT 269, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 380.56, 'Оригинален №: 5-02643', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-06T08:00:00.000Z', '2026-04-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 270, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 174.90, 'Оригинален №: 326-00498', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-06T08:00:00.000Z', '2026-04-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Стани'
  RETURNING id)
INSERT INTO _order_map SELECT 271, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 13.80, 'Оригинален №: 700141', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-06T08:00:00.000Z', '2026-04-06T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 272, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 35.20, 'Оригинален №: 626-00555', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-07T08:00:00.000Z', '2026-04-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='богдан'
  RETURNING id)
INSERT INTO _order_map SELECT 273, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 18.83, 'Оригинален №: 326-00505', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-07T08:00:00.000Z', '2026-04-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='петьо дидо'
  RETURNING id)
INSERT INTO _order_map SELECT 274, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 205.80, 'Оригинален №: 626-00087-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-07T08:00:00.000Z', '2026-04-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='иво кобрата'
  RETURNING id)
INSERT INTO _order_map SELECT 275, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 145.18, 'Оригинален №: 626-00551', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-07T08:00:00.000Z', '2026-04-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алсистемс'
  RETURNING id)
INSERT INTO _order_map SELECT 276, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 5.30, 'Оригинален №: 626-00548', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-07T08:00:00.000Z', '2026-04-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВИОЛЕТА'
  RETURNING id)
INSERT INTO _order_map SELECT 277, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 77.22, 'Оригинален №: 326-00510', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-08T08:00:00.000Z', '2026-04-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='НИКОЛАЙ ИЛИЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 278, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 159.12, 'Оригинален №: 400816_7', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-08T08:00:00.000Z', '2026-04-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='интербилд ломско'
  RETURNING id)
INSERT INTO _order_map SELECT 279, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 500.00, 'Оригинален №: 626-00091-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-08T08:00:00.000Z', '2026-04-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='АНГЕЛ ДЕЛИЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 280, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 421.98, 'Оригинален №: 326-00519', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-08T08:00:00.000Z', '2026-04-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='зу'
  RETURNING id)
INSERT INTO _order_map SELECT 281, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 32.93, 'Оригинален №: 626-00560', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-08T08:00:00.000Z', '2026-04-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='нове терм'
  RETURNING id)
INSERT INTO _order_map SELECT 282, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 27.72, 'Оригинален №: 700139', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-08T08:00:00.000Z', '2026-04-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 283, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 58.60, 'Оригинален №: 626-00558', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-08T08:00:00.000Z', '2026-04-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 284, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 304.54, 'Оригинален №: 326-00518', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-08T08:00:00.000Z', '2026-04-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПЕПО'
  RETURNING id)
INSERT INTO _order_map SELECT 285, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 9.60, 'Оригинален №: 626-00581', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-10T08:00:00.000Z', '2026-04-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кристиян павлов'
  RETURNING id)
INSERT INTO _order_map SELECT 286, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 142.90, 'Оригинален №: 626-00581', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-10T08:00:00.000Z', '2026-04-10T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кристиян павлов'
  RETURNING id)
INSERT INTO _order_map SELECT 287, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 8.20, 'Оригинален №: 326-00516', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-14T08:00:00.000Z', '2026-04-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='пламен мп'
  RETURNING id)
INSERT INTO _order_map SELECT 288, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 23.20, 'Оригинален №: 626-00568', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-14T08:00:00.000Z', '2026-04-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 289, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 1687.41, 'Оригинален №: 326-00525', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-14T08:00:00.000Z', '2026-04-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРИМА ПЛАСТ КОМЕРС'
  RETURNING id)
INSERT INTO _order_map SELECT 290, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 172.72, 'Оригинален №: 326-00529', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-14T08:00:00.000Z', '2026-04-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 291, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 56.07, 'Оригинален №: 326-00526', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-14T08:00:00.000Z', '2026-04-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='димитър спешното'
  RETURNING id)
INSERT INTO _order_map SELECT 292, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 292.96, 'Оригинален №: 326-00497', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-14T08:00:00.000Z', '2026-04-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='МП 2632000766'
  RETURNING id)
INSERT INTO _order_map SELECT 293, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 58.42, 'Оригинален №: 326-00497', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-14T08:00:00.000Z', '2026-04-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='МП 26-1807-1155'
  RETURNING id)
INSERT INTO _order_map SELECT 294, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 89.90, 'Оригинален №: 326-00533', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-14T08:00:00.000Z', '2026-04-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ники локорско'
  RETURNING id)
INSERT INTO _order_map SELECT 295, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 2491.00, 'Оригинален №: 626-00098-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-15T08:00:00.000Z', '2026-04-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Сарина'
  RETURNING id)
INSERT INTO _order_map SELECT 296, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 31.52, 'Оригинален №: 326-00537', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-15T08:00:00.000Z', '2026-04-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 297, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 96.52, 'Оригинален №: 626-00582', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-15T08:00:00.000Z', '2026-04-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='си дизайн'
  RETURNING id)
INSERT INTO _order_map SELECT 298, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 36.52, 'Оригинален №: 326-00541', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-15T08:00:00.000Z', '2026-04-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='нбр'
  RETURNING id)
INSERT INTO _order_map SELECT 299, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 2253.60, 'Оригинален №: 326-00544', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-16T08:00:00.000Z', '2026-04-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алумина глас'
  RETURNING id)
INSERT INTO _order_map SELECT 300, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1155.21, 'Оригинален №: 626-00580', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-16T08:00:00.000Z', '2026-04-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='боярт-ай ем ес'
  RETURNING id)
INSERT INTO _order_map SELECT 301, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 72.39, 'Оригинален №: 626-00584', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-16T08:00:00.000Z', '2026-04-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 302, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 261.70, 'Оригинален №: 626-00589', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-16T08:00:00.000Z', '2026-04-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='младост'
  RETURNING id)
INSERT INTO _order_map SELECT 303, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 149.22, 'Оригинален №: 326-00542', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-16T08:00:00.000Z', '2026-04-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='гласмен'
  RETURNING id)
INSERT INTO _order_map SELECT 304, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 29.37, 'Оригинален №: 626-00596', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-17T08:00:00.000Z', '2026-04-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 305, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 85.54, 'Оригинален №: 326-00551', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-17T08:00:00.000Z', '2026-04-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='метал 22'
  RETURNING id)
INSERT INTO _order_map SELECT 306, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 36.70, 'Оригинален №: 626-00598', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-17T08:00:00.000Z', '2026-04-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОЯРТ'
  RETURNING id)
INSERT INTO _order_map SELECT 307, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1431.28, 'Оригинален №: 5-02659', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-17T08:00:00.000Z', '2026-04-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='м-ж банско'
  RETURNING id)
INSERT INTO _order_map SELECT 308, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 169.92, 'Оригинален №: 326-00549', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-17T08:00:00.000Z', '2026-04-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='булвас'
  RETURNING id)
INSERT INTO _order_map SELECT 309, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 558.21, 'Оригинален №: 5-02658', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-17T08:00:00.000Z', '2026-04-17T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='м-ж папата'
  RETURNING id)
INSERT INTO _order_map SELECT 310, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 5059.98, 'Оригинален №: 326-00561', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-20T08:00:00.000Z', '2026-04-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='гласмен'
  RETURNING id)
INSERT INTO _order_map SELECT 311, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 30.36, 'Оригинален №: 326-00561', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-20T08:00:00.000Z', '2026-04-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='жоро'
  RETURNING id)
INSERT INTO _order_map SELECT 312, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 39.80, 'Оригинален №: 626-00609', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-20T08:00:00.000Z', '2026-04-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кюпи-карлово'
  RETURNING id)
INSERT INTO _order_map SELECT 313, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 15.70, 'Оригинален №: 626-00602', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-20T08:00:00.000Z', '2026-04-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 314, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 12.65, 'Оригинален №: 626-00608', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-20T08:00:00.000Z', '2026-04-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ди ем кей'
  RETURNING id)
INSERT INTO _order_map SELECT 315, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 168.69, 'Оригинален №: 326-00563', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-20T08:00:00.000Z', '2026-04-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дидо астера'
  RETURNING id)
INSERT INTO _order_map SELECT 316, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 346.02, 'Оригинален №: 5-02495', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-20T08:00:00.000Z', '2026-04-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 317, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 5079.00, 'Оригинален №: 626-00030-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-20T08:00:00.000Z', '2026-04-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 318, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 4.00, 'Оригинален №: 700155', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-20T08:00:00.000Z', '2026-04-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 319, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 17.10, 'Оригинален №: 626-00615', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-21T08:00:00.000Z', '2026-04-21T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 320, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 146.84, 'Оригинален №: 326-00567', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-21T08:00:00.000Z', '2026-04-21T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='а.петров'
  RETURNING id)
INSERT INTO _order_map SELECT 321, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 119.92, 'Оригинален №: 5-02662', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-22T08:00:00.000Z', '2026-04-22T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 322, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 14.76, 'Оригинален №: 326-00571', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-22T08:00:00.000Z', '2026-04-22T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='а.петров'
  RETURNING id)
INSERT INTO _order_map SELECT 323, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 479.67, 'Оригинален №: 326-00575', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-22T08:00:00.000Z', '2026-04-22T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРИМА ПЛАСТ КОМЕРС'
  RETURNING id)
INSERT INTO _order_map SELECT 324, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 15.61, 'Оригинален №: 626-00628', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-22T08:00:00.000Z', '2026-04-22T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 325, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 78.30, 'Оригинален №: 626-00612', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-22T08:00:00.000Z', '2026-04-22T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='лукс дизайн'
  RETURNING id)
INSERT INTO _order_map SELECT 326, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 34.43, 'Оригинален №: 326-00582', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-23T08:00:00.000Z', '2026-04-23T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ДН СТИЛ 2294'
  RETURNING id)
INSERT INTO _order_map SELECT 327, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 73.10, 'Оригинален №: 626-00638', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-24T08:00:00.000Z', '2026-04-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='коко'
  RETURNING id)
INSERT INTO _order_map SELECT 328, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 15.70, 'Оригинален №: 326-00584', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-24T08:00:00.000Z', '2026-04-24T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОРИСЛАВ ГЕОРГИЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 329, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 23.20, 'Оригинален №: 326-00592', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-27T08:00:00.000Z', '2026-04-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Стани'
  RETURNING id)
INSERT INTO _order_map SELECT 330, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 280.30, 'Оригинален №: 326-00597', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-27T08:00:00.000Z', '2026-04-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='поли глас'
  RETURNING id)
INSERT INTO _order_map SELECT 331, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 43.88, 'Оригинален №: 326-00594', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-27T08:00:00.000Z', '2026-04-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='влади'
  RETURNING id)
INSERT INTO _order_map SELECT 332, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 28.70, 'Оригинален №: 626-00643', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-27T08:00:00.000Z', '2026-04-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 333, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 32.20, 'Оригинален №: 326-00593', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-27T08:00:00.000Z', '2026-04-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 334, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 145.90, 'Оригинален №: 326-00607', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-28T08:00:00.000Z', '2026-04-28T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дизайнмебел'
  RETURNING id)
INSERT INTO _order_map SELECT 335, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 93.02, 'Оригинален №: 326-00600', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-28T08:00:00.000Z', '2026-04-28T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='попа'
  RETURNING id)
INSERT INTO _order_map SELECT 336, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 108.80, 'Оригинален №: 626-00655', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-28T08:00:00.000Z', '2026-04-28T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 337, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 276.70, 'Оригинален №: 326-00613', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-28T08:00:00.000Z', '2026-04-28T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 338, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 6710.00, 'Оригинален №: 626-00054-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-28T08:00:00.000Z', '2026-04-28T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='м-ж Бистрица'
  RETURNING id)
INSERT INTO _order_map SELECT 339, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 115.38, 'Оригинален №: 326-00617', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-29T08:00:00.000Z', '2026-04-29T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кюпи'
  RETURNING id)
INSERT INTO _order_map SELECT 340, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 9.65, 'Оригинален №: 626-00661', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-29T08:00:00.000Z', '2026-04-29T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 341, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 360.43, 'Оригинален №: 626-00660', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-29T08:00:00.000Z', '2026-04-29T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='младост'
  RETURNING id)
INSERT INTO _order_map SELECT 342, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 171.11, 'Оригинален №: 5-02667', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-29T08:00:00.000Z', '2026-04-29T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 343, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 182.74, 'Оригинален №: 326-00622', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-30T08:00:00.000Z', '2026-04-30T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='РАЙЧО'
  RETURNING id)
INSERT INTO _order_map SELECT 344, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 34.60, 'Оригинален №: 626-00666', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-30T08:00:00.000Z', '2026-04-30T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='младост'
  RETURNING id)
INSERT INTO _order_map SELECT 345, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 197.30, 'Оригинален №: 626-00065', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-30T08:00:00.000Z', '2026-04-30T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 346, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 191.30, 'Оригинален №: 626-006650', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-30T08:00:00.000Z', '2026-04-30T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 347, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 103.16, 'Оригинален №: 326-00621', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-30T08:00:00.000Z', '2026-04-30T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ет логи'
  RETURNING id)
INSERT INTO _order_map SELECT 348, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 36.47, 'Оригинален №: 326-00626', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-04-30T08:00:00.000Z', '2026-04-30T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='федерико зуза'
  RETURNING id)
INSERT INTO _order_map SELECT 349, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 7.68, 'Оригинален №: 700164', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-04T08:00:00.000Z', '2026-05-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 350, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 97.50, 'Оригинален №: 326-00637', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-05T08:00:00.000Z', '2026-05-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дидо астера'
  RETURNING id)
INSERT INTO _order_map SELECT 351, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 46.48, 'Оригинален №: 326-00635', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-05T08:00:00.000Z', '2026-05-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Стани'
  RETURNING id)
INSERT INTO _order_map SELECT 352, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 131.35, 'Оригинален №: 326-00636', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-05T08:00:00.000Z', '2026-05-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кюпи'
  RETURNING id)
INSERT INTO _order_map SELECT 353, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 16692.92, 'Оригинален №: 400960', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-05T08:00:00.000Z', '2026-05-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж ПЛОВДИВ'
  RETURNING id)
INSERT INTO _order_map SELECT 354, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 5.20, 'Оригинален №: 626-00673', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-05T08:00:00.000Z', '2026-05-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Миро'
  RETURNING id)
INSERT INTO _order_map SELECT 355, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 159.58, 'Оригинален №: 5-02671', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-05T08:00:00.000Z', '2026-05-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 356, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 242.00, 'Оригинален №: 626-00109-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-05T08:00:00.000Z', '2026-05-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='КРАСИМИР КАНЧЕЛОВА'
  RETURNING id)
INSERT INTO _order_map SELECT 357, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 690.72, 'Оригинален №: 626-00684', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-07T08:00:00.000Z', '2026-05-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 358, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 44.30, 'Оригинален №: 326-00648', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-07T08:00:00.000Z', '2026-05-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='влади'
  RETURNING id)
INSERT INTO _order_map SELECT 359, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 1974.50, 'Оригинален №: 626-00683', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-07T08:00:00.000Z', '2026-05-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН-73 ОУ'
  RETURNING id)
INSERT INTO _order_map SELECT 360, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 192.92, 'Оригинален №: 626-00681', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-07T08:00:00.000Z', '2026-05-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алдис-9270'
  RETURNING id)
INSERT INTO _order_map SELECT 361, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 159.63, 'Оригинален №: 626-00679', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-07T08:00:00.000Z', '2026-05-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 362, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 98.48, 'Оригинален №: 326-00645', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-07T08:00:00.000Z', '2026-05-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='НИКОЛАЙ ИЛИЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 363, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 14.26, 'Оригинален №: 5-02674', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-07T08:00:00.000Z', '2026-05-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 364, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 15.12, 'Оригинален №: 326-00645', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-07T08:00:00.000Z', '2026-05-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='НИКОЛАЙ ИЛИЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 365, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 699.00, 'Оригинален №: 5-02673', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-07T08:00:00.000Z', '2026-05-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 366, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 284.41, 'Оригинален №: 326-00649', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-07T08:00:00.000Z', '2026-05-07T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='поли глас'
  RETURNING id)
INSERT INTO _order_map SELECT 367, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 167.60, 'Оригинален №: 626-00688', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-08T08:00:00.000Z', '2026-05-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='трипласт-65'
  RETURNING id)
INSERT INTO _order_map SELECT 368, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 39.00, 'Оригинален №: 626-00692', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-08T08:00:00.000Z', '2026-05-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='кристиян аврамов'
  RETURNING id)
INSERT INTO _order_map SELECT 369, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 111.24, 'Оригинален №: 326-00659', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-08T08:00:00.000Z', '2026-05-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='гласмен'
  RETURNING id)
INSERT INTO _order_map SELECT 370, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 72.60, 'Оригинален №: 626-00686', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-08T08:00:00.000Z', '2026-05-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='вигомебел'
  RETURNING id)
INSERT INTO _order_map SELECT 371, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 131.42, 'Оригинален №: 326-00654', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-08T08:00:00.000Z', '2026-05-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ТРИПЛАСТ 67'
  RETURNING id)
INSERT INTO _order_map SELECT 372, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 8466.00, 'Оригинален №: 626-00111-1,112,113', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-11T08:00:00.000Z', '2026-05-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='м-ж Бъкстон'
  RETURNING id)
INSERT INTO _order_map SELECT 373, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 22.81, 'Оригинален №: 326-00664', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-11T08:00:00.000Z', '2026-05-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ваня'
  RETURNING id)
INSERT INTO _order_map SELECT 374, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 281.06, 'Оригинален №: 326-00663', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-11T08:00:00.000Z', '2026-05-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дн стил'
  RETURNING id)
INSERT INTO _order_map SELECT 375, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 3594.80, 'Оригинален №: 626-00117-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-11T08:00:00.000Z', '2026-05-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж САРИНА'
  RETURNING id)
INSERT INTO _order_map SELECT 376, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 66.06, 'Оригинален №: 326-00661', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-11T08:00:00.000Z', '2026-05-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='данаил'
  RETURNING id)
INSERT INTO _order_map SELECT 377, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 63.90, 'Оригинален №: 5-02677', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-11T08:00:00.000Z', '2026-05-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 378, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 75.00, 'Оригинален №: 626-00697', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-11T08:00:00.000Z', '2026-05-11T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='перси'
  RETURNING id)
INSERT INTO _order_map SELECT 379, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 10.31, 'Оригинален №: 326-00672', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-12T08:00:00.000Z', '2026-05-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='богдан'
  RETURNING id)
INSERT INTO _order_map SELECT 380, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 83.80, 'Оригинален №: 626-00707', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-12T08:00:00.000Z', '2026-05-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Алдин'
  RETURNING id)
INSERT INTO _order_map SELECT 381, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 347.00, 'Оригинален №: 626-00704', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-12T08:00:00.000Z', '2026-05-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='разград'
  RETURNING id)
INSERT INTO _order_map SELECT 382, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 611.09, 'Оригинален №: 326-00670', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-12T08:00:00.000Z', '2026-05-12T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='поли глас'
  RETURNING id)
INSERT INTO _order_map SELECT 383, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 139.35, 'Оригинален №: 5-02680', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-13T08:00:00.000Z', '2026-05-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 384, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 139.54, 'Оригинален №: 626-00718', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-13T08:00:00.000Z', '2026-05-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ди ем кей'
  RETURNING id)
INSERT INTO _order_map SELECT 385, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 340.65, 'Оригинален №: 5-02679', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-13T08:00:00.000Z', '2026-05-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 386, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 24.10, 'Оригинален №: 626-00710', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-13T08:00:00.000Z', '2026-05-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='лукс дизайн'
  RETURNING id)
INSERT INTO _order_map SELECT 387, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 39.40, 'Оригинален №: 626-00716', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-13T08:00:00.000Z', '2026-05-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дивийа-24'
  RETURNING id)
INSERT INTO _order_map SELECT 388, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 21.34, 'Оригинален №: 5-02681', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-13T08:00:00.000Z', '2026-05-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='от цех'
  RETURNING id)
INSERT INTO _order_map SELECT 389, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 74.90, 'Оригинален №: 626-00710', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-13T08:00:00.000Z', '2026-05-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='лукс дизайн'
  RETURNING id)
INSERT INTO _order_map SELECT 390, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 23.70, 'Оригинален №: 626-00715', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-13T08:00:00.000Z', '2026-05-13T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='разград'
  RETURNING id)
INSERT INTO _order_map SELECT 391, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 193.75, 'Оригинален №: 5-02686', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-14T08:00:00.000Z', '2026-05-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 392, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 50.41, 'Оригинален №: 5-02690', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-14T08:00:00.000Z', '2026-05-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 393, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 150.52, 'Оригинален №: 5-02653', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-14T08:00:00.000Z', '2026-05-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 394, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 193.75, 'Оригинален №: 5-02686', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-14T08:00:00.000Z', '2026-05-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 395, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 215.56, 'Оригинален №: 5-02688', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-14T08:00:00.000Z', '2026-05-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 396, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 238.00, 'Оригинален №: 626-00030-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-14T08:00:00.000Z', '2026-05-14T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='монтаж'
  RETURNING id)
INSERT INTO _order_map SELECT 397, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 97.61, 'Оригинален №: 326-00682', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-15T08:00:00.000Z', '2026-05-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ДН СТИЛ 2282'
  RETURNING id)
INSERT INTO _order_map SELECT 398, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1189.38, 'Оригинален №: 626-00734', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-15T08:00:00.000Z', '2026-05-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ес солюшън'
  RETURNING id)
INSERT INTO _order_map SELECT 399, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 20.70, 'Оригинален №: 626-00737', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-15T08:00:00.000Z', '2026-05-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='младост 2002'
  RETURNING id)
INSERT INTO _order_map SELECT 400, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 17.00, 'Оригинален №: 626-00726', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-15T08:00:00.000Z', '2026-05-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алдис-9352'
  RETURNING id)
INSERT INTO _order_map SELECT 401, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 11.50, 'Оригинален №: 626-00738', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-15T08:00:00.000Z', '2026-05-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алемар'
  RETURNING id)
INSERT INTO _order_map SELECT 402, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 1733.10, 'Оригинален №: 626-00724', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-15T08:00:00.000Z', '2026-05-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН-73 ОУ'
  RETURNING id)
INSERT INTO _order_map SELECT 403, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 196.86, 'Оригинален №: 326-00682', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-15T08:00:00.000Z', '2026-05-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ДН СТИЛ 2296'
  RETURNING id)
INSERT INTO _order_map SELECT 404, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 45.21, 'Оригинален №: 326-00690', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-15T08:00:00.000Z', '2026-05-15T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 405, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 7.12, 'Оригинален №: 400966', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 406, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 144.53, 'Оригинален №: 326-00696', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='нпн'
  RETURNING id)
INSERT INTO _order_map SELECT 407, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 47.24, 'Оригинален №: 326-00700', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алумина глас'
  RETURNING id)
INSERT INTO _order_map SELECT 408, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 74.30, 'Оригинален №: 626-00744', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='вигомебел'
  RETURNING id)
INSERT INTO _order_map SELECT 409, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 50.30, 'Оригинален №: 626-00739', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 410, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 548.76, 'Оригинален №: 326-00689', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 411, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1077.30, 'Оригинален №: 326-00683', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 412, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 47.00, 'Оригинален №: 326-00695', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 413, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 35.42, 'Оригинален №: 326-00695', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 414, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 2037.64, 'Оригинален №: 400816_8', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='интербилд'
  RETURNING id)
INSERT INTO _order_map SELECT 415, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 27.05, 'Оригинален №: 107131', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-18T08:00:00.000Z', '2026-05-18T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 416, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 22.86, 'Оригинален №: 326-00697', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-19T08:00:00.000Z', '2026-05-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 417, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 141.00, 'Оригинален №: 626-00122-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-19T08:00:00.000Z', '2026-05-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='богдан'
  RETURNING id)
INSERT INTO _order_map SELECT 418, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 192.10, 'Оригинален №: 626-00752', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-19T08:00:00.000Z', '2026-05-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='трипласт-69'
  RETURNING id)
INSERT INTO _order_map SELECT 419, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 51.35, 'Оригинален №: 326-00704', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-19T08:00:00.000Z', '2026-05-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='евгени янев'
  RETURNING id)
INSERT INTO _order_map SELECT 420, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 8.00, 'Оригинален №: 626-00747', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-19T08:00:00.000Z', '2026-05-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Скабрин'
  RETURNING id)
INSERT INTO _order_map SELECT 421, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 26.86, 'Оригинален №: 326-00719', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-19T08:00:00.000Z', '2026-05-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='МП 26-1907-0163'
  RETURNING id)
INSERT INTO _order_map SELECT 422, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 14.00, 'Оригинален №: 400967', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-19T08:00:00.000Z', '2026-05-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 423, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 20.28, 'Оригинален №: 326-00673', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-19T08:00:00.000Z', '2026-05-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='рацата'
  RETURNING id)
INSERT INTO _order_map SELECT 424, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 37.64, 'Оригинален №: 326-00673', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-19T08:00:00.000Z', '2026-05-19T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='рацата'
  RETURNING id)
INSERT INTO _order_map SELECT 425, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 26.22, 'Оригинален №: 326-00710', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-20T08:00:00.000Z', '2026-05-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ники локорско'
  RETURNING id)
INSERT INTO _order_map SELECT 426, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 140.30, 'Оригинален №: 5-02696', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-20T08:00:00.000Z', '2026-05-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 427, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 143.87, 'Оригинален №: 5-02695', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-20T08:00:00.000Z', '2026-05-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 428, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 780.57, 'Оригинален №: 326-00713', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-20T08:00:00.000Z', '2026-05-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 429, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 131.51, 'Оригинален №: 5-02699', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-20T08:00:00.000Z', '2026-05-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 430, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 1441.88, 'Оригинален №: 326-00712', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-20T08:00:00.000Z', '2026-05-20T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРИМА етап 3'
  RETURNING id)
INSERT INTO _order_map SELECT 431, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 20.40, 'Оригинален №: 626-00763', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-21T08:00:00.000Z', '2026-05-21T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БРАТЯ ЧИЧЕКЛИЕВИ'
  RETURNING id)
INSERT INTO _order_map SELECT 432, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 80.73, 'Оригинален №: 326-00718', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-21T08:00:00.000Z', '2026-05-21T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРОЕКТ 75'
  RETURNING id)
INSERT INTO _order_map SELECT 433, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 59.25, 'Оригинален №: 626-00764', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-21T08:00:00.000Z', '2026-05-21T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 434, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 35.70, 'Оригинален №: 626-00767', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-22T08:00:00.000Z', '2026-05-22T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='виенви'
  RETURNING id)
INSERT INTO _order_map SELECT 435, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 81.50, 'Оригинален №: 626-00767', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-22T08:00:00.000Z', '2026-05-22T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='виенви'
  RETURNING id)
INSERT INTO _order_map SELECT 436, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 71.18, 'Оригинален №: 326-00729', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-22T08:00:00.000Z', '2026-05-22T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='РАЙЧО'
  RETURNING id)
INSERT INTO _order_map SELECT 437, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 99.60, 'Оригинален №: 626-00766', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-22T08:00:00.000Z', '2026-05-22T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='трипласт-74'
  RETURNING id)
INSERT INTO _order_map SELECT 438, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 22.08, 'Оригинален №: 326-00728', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-22T08:00:00.000Z', '2026-05-22T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='любо'
  RETURNING id)
INSERT INTO _order_map SELECT 439, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 25.80, 'Оригинален №: 626-00778', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='младост'
  RETURNING id)
INSERT INTO _order_map SELECT 440, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 40.10, 'Оригинален №: 626-00781', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='диемкей'
  RETURNING id)
INSERT INTO _order_map SELECT 441, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 24.92, 'Оригинален №: 326-00748', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='НИКОЛАЙ ИЛИЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 442, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 84.40, 'Оригинален №: 326-00726', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='МП 26-1199-0242'
  RETURNING id)
INSERT INTO _order_map SELECT 443, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 17.69, 'Оригинален №: 326-00740', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алуминтрейд'
  RETURNING id)
INSERT INTO _order_map SELECT 444, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 126.36, 'Оригинален №: 326-00733', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПЕПО'
  RETURNING id)
INSERT INTO _order_map SELECT 445, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 65.10, 'Оригинален №: 326-00732', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ДН СТИЛ 2279'
  RETURNING id)
INSERT INTO _order_map SELECT 446, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 546.77, 'Оригинален №: 326-00742', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='дн стил 2287'
  RETURNING id)
INSERT INTO _order_map SELECT 447, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 128.70, 'Оригинален №: 326-00745', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='рацата'
  RETURNING id)
INSERT INTO _order_map SELECT 448, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 106.80, 'Оригинален №: 626-00780', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='к.волев'
  RETURNING id)
INSERT INTO _order_map SELECT 449, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 9.36, 'Оригинален №: 326-00736', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='влади'
  RETURNING id)
INSERT INTO _order_map SELECT 450, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 315.90, 'Оригинален №: 626-00777', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-26T08:00:00.000Z', '2026-05-26T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 451, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 17.80, 'Оригинален №: 326-00747', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-27T08:00:00.000Z', '2026-05-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='митко дърво'
  RETURNING id)
INSERT INTO _order_map SELECT 452, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 458.66, 'Оригинален №: 5-02704', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-27T08:00:00.000Z', '2026-05-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 453, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 586.70, 'Оригинален №: 626-00125-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-27T08:00:00.000Z', '2026-05-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='РАЗВИТИЕ'
  RETURNING id)
INSERT INTO _order_map SELECT 454, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 61.44, 'Оригинален №: 700187', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-27T08:00:00.000Z', '2026-05-27T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 455, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 18.10, 'Оригинален №: 626-00975', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-28T08:00:00.000Z', '2026-05-28T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='КЕСТОН'
  RETURNING id)
INSERT INTO _order_map SELECT 456, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 27.70, 'Оригинален №: 626-00793', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-28T08:00:00.000Z', '2026-05-28T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='Скабрин'
  RETURNING id)
INSERT INTO _order_map SELECT 457, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 17.18, 'Оригинален №: 326-00755', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-28T08:00:00.000Z', '2026-05-28T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='федерико зуза'
  RETURNING id)
INSERT INTO _order_map SELECT 458, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 131.87, 'Оригинален №: 5-02687', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-29T08:00:00.000Z', '2026-05-29T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 459, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 114.10, 'Оригинален №: 626-00798', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-29T08:00:00.000Z', '2026-05-29T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН-73 ОУ'
  RETURNING id)
INSERT INTO _order_map SELECT 460, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 41.53, 'Оригинален №: 5-02709', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-29T08:00:00.000Z', '2026-05-29T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 461, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 181.08, 'Оригинален №: 326-00762', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-29T08:00:00.000Z', '2026-05-29T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='гласмен'
  RETURNING id)
INSERT INTO _order_map SELECT 462, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 23.01, 'Оригинален №: 326-00761', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-05-29T08:00:00.000Z', '2026-05-29T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='мебелина'
  RETURNING id)
INSERT INTO _order_map SELECT 463, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 30.64, 'Оригинален №: 326-00769', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-01T08:00:00.000Z', '2026-06-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='нпн'
  RETURNING id)
INSERT INTO _order_map SELECT 464, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 82.90, 'Оригинален №: 626-00799', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-01T08:00:00.000Z', '2026-06-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 465, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 61.60, 'Оригинален №: 626-00802', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-01T08:00:00.000Z', '2026-06-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='БОЯРТ'
  RETURNING id)
INSERT INTO _order_map SELECT 466, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 19.00, 'Оригинален №: 326-00768', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-01T08:00:00.000Z', '2026-06-01T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='тони своге'
  RETURNING id)
INSERT INTO _order_map SELECT 467, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 140.99, 'Оригинален №: 326-00779', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-02T08:00:00.000Z', '2026-06-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='НИКОЛАЙ ИЛИЕВ'
  RETURNING id)
INSERT INTO _order_map SELECT 468, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 141.48, 'Оригинален №: 326-00782', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-02T08:00:00.000Z', '2026-06-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='миро и синове'
  RETURNING id)
INSERT INTO _order_map SELECT 469, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 163.83, 'Оригинален №: 326-00786', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-02T08:00:00.000Z', '2026-06-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВАЛМАН'
  RETURNING id)
INSERT INTO _order_map SELECT 470, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 6.84, 'Оригинален №: 700190', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-02T08:00:00.000Z', '2026-06-02T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 471, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 87.78, 'Оригинален №: 5-02713', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-03T08:00:00.000Z', '2026-06-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 472, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 116.20, 'Оригинален №: 626-00810', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-03T08:00:00.000Z', '2026-06-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='боярт-84475'
  RETURNING id)
INSERT INTO _order_map SELECT 473, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 1994.97, 'Оригинален №: 626-00814', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-03T08:00:00.000Z', '2026-06-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='АЛДИС-9353'
  RETURNING id)
INSERT INTO _order_map SELECT 474, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 55.40, 'Оригинален №: 626-00813', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-03T08:00:00.000Z', '2026-06-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВЕНКО'
  RETURNING id)
INSERT INTO _order_map SELECT 475, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 700.01, 'Оригинален №: 626-00807', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-03T08:00:00.000Z', '2026-06-03T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 476, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 30.30, 'Оригинален №: 626-00815', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-04T08:00:00.000Z', '2026-06-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='младост'
  RETURNING id)
INSERT INTO _order_map SELECT 477, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 20.50, 'Оригинален №: 626-00824', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-04T08:00:00.000Z', '2026-06-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ВЕНКО'
  RETURNING id)
INSERT INTO _order_map SELECT 478, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', NULL, 'Оригинален №: 326-00763', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-04T08:00:00.000Z', '2026-06-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ЦИТАДЕЛ'
  RETURNING id)
INSERT INTO _order_map SELECT 479, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 2179.79, 'Оригинален №: 326-00763', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-04T08:00:00.000Z', '2026-06-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ЦИТАДЕЛ'
  RETURNING id)
INSERT INTO _order_map SELECT 480, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 38.40, 'Оригинален №: 626-00819', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-04T08:00:00.000Z', '2026-06-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='илиян'
  RETURNING id)
INSERT INTO _order_map SELECT 481, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 36.90, 'Оригинален №: 626-00821', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-04T08:00:00.000Z', '2026-06-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='алвега дизайн'
  RETURNING id)
INSERT INTO _order_map SELECT 482, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 12.30, 'Оригинален №: 626-00816', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-04T08:00:00.000Z', '2026-06-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='майкъл'
  RETURNING id)
INSERT INTO _order_map SELECT 483, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 6.84, 'Оригинален №: 400973', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-04T08:00:00.000Z', '2026-06-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ОФИС'
  RETURNING id)
INSERT INTO _order_map SELECT 484, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 212.33, 'Оригинален №: 326-00763', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-04T08:00:00.000Z', '2026-06-04T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ЦИТАДЕЛ'
  RETURNING id)
INSERT INTO _order_map SELECT 485, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 15.90, 'Оригинален №: 326-00799-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-05T08:00:00.000Z', '2026-06-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='николай димитров'
  RETURNING id)
INSERT INTO _order_map SELECT 486, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 57.80, 'Оригинален №: 326-00798', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-05T08:00:00.000Z', '2026-06-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ПРОЕКТ 75'
  RETURNING id)
INSERT INTO _order_map SELECT 487, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 46.20, 'Оригинален №: 326-00794', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-05T08:00:00.000Z', '2026-06-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='драгън флай'
  RETURNING id)
INSERT INTO _order_map SELECT 488, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 50.70, 'Оригинален №: 626-00829', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-05T08:00:00.000Z', '2026-06-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='АЛДИС-9520'
  RETURNING id)
INSERT INTO _order_map SELECT 489, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 193.73, 'Оригинален №: 626-00826', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-05T08:00:00.000Z', '2026-06-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='бк'
  RETURNING id)
INSERT INTO _order_map SELECT 490, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 2100.90, 'Оригинален №: 626-00830', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-05T08:00:00.000Z', '2026-06-05T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ТРИПЛАСТ-77'
  RETURNING id)
INSERT INTO _order_map SELECT 491, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 36.82, 'Оригинален №: 326-00806', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-08T08:00:00.000Z', '2026-06-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='нбр'
  RETURNING id)
INSERT INTO _order_map SELECT 492, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 12.96, 'Оригинален №: 326-00806-2', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-08T08:00:00.000Z', '2026-06-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='евгени янев'
  RETURNING id)
INSERT INTO _order_map SELECT 493, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 577.94, 'Оригинален №: 400962', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-08T08:00:00.000Z', '2026-06-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='М-Ж'
  RETURNING id)
INSERT INTO _order_map SELECT 494, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'единично_стъкло', 'нормална', 'ДОСТАВЕНА', 416.30, 'Оригинален №: 326-00805', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-06-08T08:00:00.000Z', '2026-06-08T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='ТОНИ НИ'
  RETURNING id)
INSERT INTO _order_map SELECT 495, id FROM ins;
WITH ins AS (
  INSERT INTO orders (client_id, order_type, order_category, status, sale_price, notes, source, created_by, created_at, updated_at)
  SELECT cm.new_id, 'стъклопакет', 'нормална', 'ДОСТАВЕНА', 226.22, 'Оригинален №: 625-00330-1', 'office',
         (SELECT id FROM users WHERE role='admin' LIMIT 1), '2026-12-16T08:00:00.000Z', '2026-12-16T08:00:00.000Z'
  FROM _client_map cm WHERE cm.orig_name='тихомир-ишлеме'
  RETURNING id)
INSERT INTO _order_map SELECT 496, id FROM ins;

-- Insert order items
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 2094.00, 740.00, 1, 0 FROM _order_map om WHERE om.orig_idx=0;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1835.00, 715.00, 1, 0 FROM _order_map om WHERE om.orig_idx=1;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1638.00, 1198.00, 1, 1 FROM _order_map om WHERE om.orig_idx=1;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1559.00, 599.00, 1, 2 FROM _order_map om WHERE om.orig_idx=1;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 2130.00, 630.00, 1, 0 FROM _order_map om WHERE om.orig_idx=3;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1160.00, 518.00, 1, 0 FROM _order_map om WHERE om.orig_idx=2;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН ФАСЕТ', 2400.00, 537.00, 1, 1 FROM _order_map om WHERE om.orig_idx=3;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1057.00, 597.00, 1, 0 FROM _order_map om WHERE om.orig_idx=4;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ', 1901.00, 763.00, 1, 0 FROM _order_map om WHERE om.orig_idx=5;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ', 857.00, 911.00, 1, 0 FROM _order_map om WHERE om.orig_idx=6;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 657.00, 906.00, 1, 1 FROM _order_map om WHERE om.orig_idx=6;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 381.00, 351.00, 1, 2 FROM _order_map om WHERE om.orig_idx=6;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ', 2390.00, 1010.00, 1, 3 FROM _order_map om WHERE om.orig_idx=6;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 448.00, 898.00, 1, 4 FROM _order_map om WHERE om.orig_idx=6;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ', 1770.00, 758.00, 1, 5 FROM _order_map om WHERE om.orig_idx=6;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ', 305.00, 1085.00, 1, 6 FROM _order_map om WHERE om.orig_idx=6;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 331.00, 211.00, 2, 7 FROM _order_map om WHERE om.orig_idx=6;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ', 2097.00, 813.00, 1, 8 FROM _order_map om WHERE om.orig_idx=6;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1993.00, 413.00, 1, 0 FROM _order_map om WHERE om.orig_idx=7;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 930.00, 2100.00, 1, 0 FROM _order_map om WHERE om.orig_idx=8;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ 8ММ ЦВЕТНО', 1350.00, 2100.00, 1, 1 FROM _order_map om WHERE om.orig_idx=8;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ФОЛИРАНЕ С ДВЕ ФОЛИА', 1352.00, 2100.00, 1, 2 FROM _order_map om WHERE om.orig_idx=8;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 865.00, 1263.00, 1, 3 FROM _order_map om WHERE om.orig_idx=8;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф36', 1000.00, 1270.00, 1, 4 FROM _order_map om WHERE om.orig_idx=8;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 834.00, 741.00, 1, 5 FROM _order_map om WHERE om.orig_idx=8;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1500.00, 2700.00, 3, 0 FROM _order_map om WHERE om.orig_idx=11;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 698.00, 521.00, 1, 0 FROM _order_map om WHERE om.orig_idx=9;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1730.00, 605.00, 1, 0 FROM _order_map om WHERE om.orig_idx=12;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 630.00, 920.00, 1, 0 FROM _order_map om WHERE om.orig_idx=10;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО/БЯЛО 4,1,4', 815.00, 680.00, 1, 1 FROM _order_map om WHERE om.orig_idx=9;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЛЕПЕНЕ СЪС СИЛИКОН', 1600.00, 2700.00, 3, 1 FROM _order_map om WHERE om.orig_idx=11;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1200.00, 900.00, 2, 2 FROM _order_map om WHERE om.orig_idx=11;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 900.00, 1400.00, 2, 3 FROM _order_map om WHERE om.orig_idx=11;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/ДЕЛТА ГРИС 4ММ', 918.00, 673.00, 1, 0 FROM _order_map om WHERE om.orig_idx=13;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 2-ЕН', 800.00, 645.00, 1, 0 FROM _order_map om WHERE om.orig_idx=16;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 605.00, 699.00, 1, 0 FROM _order_map om WHERE om.orig_idx=15;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 2404.00, 453.00, 2, 0 FROM _order_map om WHERE om.orig_idx=17;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 483.00, 1892.00, 1, 0 FROM _order_map om WHERE om.orig_idx=14;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф6', 580.00, 1520.00, 1, 1 FROM _order_map om WHERE om.orig_idx=17;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1324.00, 560.00, 1, 0 FROM _order_map om WHERE om.orig_idx=22;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 2283.00, 1271.00, 1, 0 FROM _order_map om WHERE om.orig_idx=20;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 200.00, 965.00, 2, 0 FROM _order_map om WHERE om.orig_idx=21;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1950.00, 675.00, 1, 0 FROM _order_map om WHERE om.orig_idx=19;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 3220.00, 430.00, 1, 0 FROM _order_map om WHERE om.orig_idx=18;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 320.00, 798.00, 2, 0 FROM _order_map om WHERE om.orig_idx=25;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 650.00, 1936.00, 1, 0 FROM _order_map om WHERE om.orig_idx=23;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 720.00, 890.00, 1, 0 FROM _order_map om WHERE om.orig_idx=24;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 580.00, 2190.00, 1, 0 FROM _order_map om WHERE om.orig_idx=26;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 600.00, 2260.00, 1, 0 FROM _order_map om WHERE om.orig_idx=27;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 372.00, 1965.00, 1, 1 FROM _order_map om WHERE om.orig_idx=23;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ 8ММ ЦВЕТНО', 492.00, 2185.00, 1, 1 FROM _order_map om WHERE om.orig_idx=26;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 1882.00, 375.00, 2, 2 FROM _order_map om WHERE om.orig_idx=26;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БРОНЗЕ/СИВО/ЗЕЛЕНО 8ММ', 1898.00, 740.00, 1, 3 FROM _order_map om WHERE om.orig_idx=26;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 400.00, 400.00, 1, 0 FROM _order_map om WHERE om.orig_idx=28;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 377.00, 497.00, 1, 0 FROM _order_map om WHERE om.orig_idx=30;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 800.00, 1700.00, 1, 0 FROM _order_map om WHERE om.orig_idx=34;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 428.00, 703.00, 1, 0 FROM _order_map om WHERE om.orig_idx=31;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1526.00, 721.00, 1, 0 FROM _order_map om WHERE om.orig_idx=32;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 420.00, 972.00, 1, 0 FROM _order_map om WHERE om.orig_idx=33;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 420.00, 945.00, 1, 0 FROM _order_map om WHERE om.orig_idx=29;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 728.00, 783.00, 1, 0 FROM _order_map om WHERE om.orig_idx=37;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 991.00, 540.00, 1, 0 FROM _order_map om WHERE om.orig_idx=35;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1200.00, 500.00, 1, 0 FROM _order_map om WHERE om.orig_idx=39;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 765.00, 345.00, 1, 0 FROM _order_map om WHERE om.orig_idx=38;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1125.00, 1030.00, 1, 0 FROM _order_map om WHERE om.orig_idx=36;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 6ММ', 770.00, 397.00, 2, 0 FROM _order_map om WHERE om.orig_idx=40;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1260.00, 510.00, 1, 1 FROM _order_map om WHERE om.orig_idx=38;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1375.00, 775.00, 4, 1 FROM _order_map om WHERE om.orig_idx=36;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 349.00, 999.00, 2, 1 FROM _order_map om WHERE om.orig_idx=37;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 382.00, 2609.00, 1, 2 FROM _order_map om WHERE om.orig_idx=36;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 369.00, 149.00, 1, 2 FROM _order_map om WHERE om.orig_idx=37;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 290.00, 470.00, 1, 0 FROM _order_map om WHERE om.orig_idx=43;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 931.00, 801.00, 1, 0 FROM _order_map om WHERE om.orig_idx=47;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 347.00, 247.00, 1, 0 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 453.00, 1935.00, 1, 0 FROM _order_map om WHERE om.orig_idx=42;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 2057.00, 807.00, 1, 0 FROM _order_map om WHERE om.orig_idx=44;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 416.00, 1578.00, 1, 0 FROM _order_map om WHERE om.orig_idx=46;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1378.00, 521.00, 1, 0 FROM _order_map om WHERE om.orig_idx=45;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 416.00, 998.00, 1, 1 FROM _order_map om WHERE om.orig_idx=46;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1586.00, 430.00, 2, 1 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 850.00, 370.00, 1, 1 FROM _order_map om WHERE om.orig_idx=45;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1315.00, 789.00, 1, 1 FROM _order_map om WHERE om.orig_idx=44;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1586.00, 247.00, 2, 2 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1374.00, 1214.00, 1, 2 FROM _order_map om WHERE om.orig_idx=44;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 3125.00, 1265.00, 1, 2 FROM _order_map om WHERE om.orig_idx=46;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 690.00, 790.00, 1, 3 FROM _order_map om WHERE om.orig_idx=44;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 1017.00, 914.00, 1, 3 FROM _order_map om WHERE om.orig_idx=46;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1800.00, 783.00, 1, 3 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 6ММ/БЯЛО 5ММ', 2950.00, 1423.00, 2, 4 FROM _order_map om WHERE om.orig_idx=44;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МАТ 4ММ/МАТ 4ММ', 1820.00, 443.00, 1, 4 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 6ММ/БЯЛО 5ММ', 848.00, 968.00, 1, 5 FROM _order_map om WHERE om.orig_idx=44;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 588.00, 673.00, 1, 5 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1100.00, 580.00, 1, 6 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1825.00, 654.00, 1, 7 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 657.00, 906.00, 1, 8 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 500.00, 1100.00, 1, 9 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МАТ 4ММ/МАТ 4ММ', 1025.00, 1245.00, 1, 10 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1670.00, 750.00, 1, 11 FROM _order_map om WHERE om.orig_idx=41;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1050.00, 380.00, 1, 0 FROM _order_map om WHERE om.orig_idx=52;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 2825.00, 610.00, 1, 0 FROM _order_map om WHERE om.orig_idx=51;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1207.00, 395.00, 1, 0 FROM _order_map om WHERE om.orig_idx=50;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 440.00, 740.00, 1, 0 FROM _order_map om WHERE om.orig_idx=48;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 5ММ', 1115.00, 580.00, 2, 0 FROM _order_map om WHERE om.orig_idx=49;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 1730.00, 160.00, 2, 1 FROM _order_map om WHERE om.orig_idx=48;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1643.00, 624.00, 3, 1 FROM _order_map om WHERE om.orig_idx=50;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '4,1,4,/БЯЛО 5ММ', 2599.00, 946.00, 1, 1 FROM _order_map om WHERE om.orig_idx=49;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 564.00, 830.00, 1, 2 FROM _order_map om WHERE om.orig_idx=50;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 516.00, 786.00, 1, 2 FROM _order_map om WHERE om.orig_idx=49;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 5ММ', 1904.00, 654.00, 1, 3 FROM _order_map om WHERE om.orig_idx=49;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 198.00, 498.00, 1, 0 FROM _order_map om WHERE om.orig_idx=55;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 669.00, 474.00, 1, 0 FROM _order_map om WHERE om.orig_idx=53;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/МАТ 4ММ', 1284.00, 785.00, 1, 0 FROM _order_map om WHERE om.orig_idx=56;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1950.00, 800.00, 1, 0 FROM _order_map om WHERE om.orig_idx=57;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1684.00, 437.00, 1, 0 FROM _order_map om WHERE om.orig_idx=54;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 2370.00, 840.00, 1, 1 FROM _order_map om WHERE om.orig_idx=54;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРКА / КРЪГ', 1185.00, 98.00, 1, 1 FROM _order_map om WHERE om.orig_idx=55;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1284.00, 785.00, 2, 1 FROM _order_map om WHERE om.orig_idx=56;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 1219.00, 374.00, 1, 1 FROM _order_map om WHERE om.orig_idx=53;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ОГЛ 4ММ/ДЕЛТА ГРИС 4ММ', 1710.00, 515.00, 1, 1 FROM _order_map om WHERE om.orig_idx=57;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО/БЯЛО 3,1,3', 265.00, 1399.00, 1, 2 FROM _order_map om WHERE om.orig_idx=56;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1685.00, 555.00, 1, 2 FROM _order_map om WHERE om.orig_idx=54;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 6 ММ/МАТ 4 ММ/МФ 6', 1064.00, 374.00, 1, 2 FROM _order_map om WHERE om.orig_idx=53;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1792.00, 475.00, 1, 2 FROM _order_map om WHERE om.orig_idx=55;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1800.00, 600.00, 1, 3 FROM _order_map om WHERE om.orig_idx=54;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 2627.00, 710.00, 1, 0 FROM _order_map om WHERE om.orig_idx=61;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 900.00, 760.00, 1, 0 FROM _order_map om WHERE om.orig_idx=60;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1310.00, 510.00, 1, 0 FROM _order_map om WHERE om.orig_idx=59;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1775.00, 675.00, 1, 0 FROM _order_map om WHERE om.orig_idx=58;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 10ММ', 2100.00, 800.00, 1, 1 FROM _order_map om WHERE om.orig_idx=61;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1068.00, 683.00, 1, 1 FROM _order_map om WHERE om.orig_idx=59;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 870.00, 405.00, 1, 1 FROM _order_map om WHERE om.orig_idx=60;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КОПЧЕ', 517.00, 806.00, 1, 2 FROM _order_map om WHERE om.orig_idx=61;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1190.00, 405.00, 1, 2 FROM _order_map om WHERE om.orig_idx=60;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ГАМА/ПАНТА', 2627.00, 716.00, 1, 3 FROM _order_map om WHERE om.orig_idx=61;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 197.00, 914.00, 1, 0 FROM _order_map om WHERE om.orig_idx=64;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 330.00, 915.00, 1, 0 FROM _order_map om WHERE om.orig_idx=70;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЛАКОБЕЛ 4ММ 9010', 1956.00, 865.00, 1, 0 FROM _order_map om WHERE om.orig_idx=68;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ХИМИЧЕСКИ МАТ 8ММ', 1910.00, 620.00, 1, 0 FROM _order_map om WHERE om.orig_idx=71;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ/МАТ 4ММ', 400.00, 250.00, 1, 0 FROM _order_map om WHERE om.orig_idx=63;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1230.00, 700.00, 2, 0 FROM _order_map om WHERE om.orig_idx=65;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА БРОНЗЕ 4ММ', 1835.00, 160.00, 1, 0 FROM _order_map om WHERE om.orig_idx=66;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 600.00, 685.00, 1, 0 FROM _order_map om WHERE om.orig_idx=67;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КРИЗЕТ 4ММ', 1790.00, 685.00, 1, 0 FROM _order_map om WHERE om.orig_idx=69;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 245.00, 1900.00, 1, 0 FROM _order_map om WHERE om.orig_idx=62;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 1883.00, 1575.00, 1, 0 FROM _order_map om WHERE om.orig_idx=72;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1790.00, 685.00, 1, 1 FROM _order_map om WHERE om.orig_idx=69;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'МАСЛИНОВА КЛОНКА БРОНЗЕ 4ММ', 1956.00, 865.00, 1, 1 FROM _order_map om WHERE om.orig_idx=68;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПЕСЪКОСТРУЕН МАТ', 285.00, 2005.00, 1, 1 FROM _order_map om WHERE om.orig_idx=62;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БРОНЗЕ/СИВО/ЗЕЛЕНО 4ММ', 1130.00, 715.00, 3, 1 FROM _order_map om WHERE om.orig_idx=65;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1400.00, 545.00, 2, 1 FROM _order_map om WHERE om.orig_idx=63;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ФОЛИРАНЕ С ЕДНО ФОЛИО', 1785.00, 690.00, 1, 2 FROM _order_map om WHERE om.orig_idx=69;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАСЛИНА 4ММ', 1128.00, 151.00, 2, 0 FROM _order_map om WHERE om.orig_idx=78;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 1928.00, 1512.00, 1, 0 FROM _order_map om WHERE om.orig_idx=79;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ДЕЛТА ГРИС 4ММ/ДЕЛТА ГРИС 4ММ', 1725.00, 180.00, 1, 0 FROM _order_map om WHERE om.orig_idx=76;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 6ММ/БЯЛО 4ММ/МФ 6ММ', 1468.00, 916.00, 1, 0 FROM _order_map om WHERE om.orig_idx=80;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 448.00, 808.00, 1, 0 FROM _order_map om WHERE om.orig_idx=73;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 280.00, 2380.00, 1, 0 FROM _order_map om WHERE om.orig_idx=74;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 255.00, 265.00, 1, 0 FROM _order_map om WHERE om.orig_idx=77;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1898.00, 470.00, 1, 0 FROM _order_map om WHERE om.orig_idx=75;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО/БЯЛО 3,1,3', 1870.00, 745.00, 1, 1 FROM _order_map om WHERE om.orig_idx=77;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ДЕЛТА ГРИС 4ММ', 1980.00, 450.00, 2, 1 FROM _order_map om WHERE om.orig_idx=76;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 559.00, 509.00, 1, 1 FROM _order_map om WHERE om.orig_idx=78;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1299.00, 519.00, 1, 2 FROM _order_map om WHERE om.orig_idx=78;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 620.00, 1345.00, 1, 0 FROM _order_map om WHERE om.orig_idx=85;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 395.00, 959.00, 3, 0 FROM _order_map om WHERE om.orig_idx=84;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 300.00, 300.00, 20, 0 FROM _order_map om WHERE om.orig_idx=81;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1133.00, 618.00, 1, 0 FROM _order_map om WHERE om.orig_idx=83;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 1017.00, 914.00, 1, 0 FROM _order_map om WHERE om.orig_idx=82;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 600.00, 1415.00, 1, 1 FROM _order_map om WHERE om.orig_idx=84;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 250.00, 400.00, 1, 1 FROM _order_map om WHERE om.orig_idx=83;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 936.00, 1519.00, 1, 2 FROM _order_map om WHERE om.orig_idx=83;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗЛАТНИ ГОДИНИ 4ММ', 245.00, 850.00, 2, 0 FROM _order_map om WHERE om.orig_idx=89;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 2185.00, 740.00, 3, 0 FROM _order_map om WHERE om.orig_idx=88;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 2063.00, 693.00, 1, 0 FROM _order_map om WHERE om.orig_idx=90;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 698.00, 722.00, 1, 0 FROM _order_map om WHERE om.orig_idx=87;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 250.00, 1600.00, 1, 0 FROM _order_map om WHERE om.orig_idx=86;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 695.00, 387.00, 1, 0 FROM _order_map om WHERE om.orig_idx=96;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 430.00, 760.00, 1, 0 FROM _order_map om WHERE om.orig_idx=94;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1300.00, 585.00, 2, 0 FROM _order_map om WHERE om.orig_idx=95;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/КРИЗЕТ 4ММ', 1007.00, 837.00, 1, 0 FROM _order_map om WHERE om.orig_idx=93;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРКА 2-ЕН', 450.00, 1900.00, 1, 0 FROM _order_map om WHERE om.orig_idx=91;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 460.00, 150.00, 1, 0 FROM _order_map om WHERE om.orig_idx=92;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1115.00, 885.00, 1, 1 FROM _order_map om WHERE om.orig_idx=95;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 4ММ', 288.00, 593.00, 1, 1 FROM _order_map om WHERE om.orig_idx=96;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БРОНЗЕ, СИВО 4ММ', 298.00, 2500.00, 1, 1 FROM _order_map om WHERE om.orig_idx=94;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/ДЕЛТА ГРИС 4ММ', 1436.00, 470.00, 1, 1 FROM _order_map om WHERE om.orig_idx=93;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1432.00, 170.00, 1, 2 FROM _order_map om WHERE om.orig_idx=93;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 498.00, 2500.00, 1, 2 FROM _order_map om WHERE om.orig_idx=94;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1190.00, 773.00, 1, 2 FROM _order_map om WHERE om.orig_idx=95;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 6ММ', 2472.00, 974.00, 1, 3 FROM _order_map om WHERE om.orig_idx=93;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '3,1,3 МФ/БЯЛО 6ММ', 1500.00, 1600.00, 3, 4 FROM _order_map om WHERE om.orig_idx=93;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ХИМИЧЕСКИ МАТ 8ММ', 1930.00, 740.00, 1, 0 FROM _order_map om WHERE om.orig_idx=97;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1501.00, 476.00, 1, 0 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 680.00, 1450.00, 1, 0 FROM _order_map om WHERE om.orig_idx=101;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 690.00, 2440.00, 1, 0 FROM _order_map om WHERE om.orig_idx=100;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 5ММ', 2490.00, 300.00, 1, 0 FROM _order_map om WHERE om.orig_idx=99;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 380.00, 965.00, 1, 0 FROM _order_map om WHERE om.orig_idx=103;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 1710.00, 650.00, 1, 0 FROM _order_map om WHERE om.orig_idx=98;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 800.00, 832.00, 1, 0 FROM _order_map om WHERE om.orig_idx=102;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 710.00, 1165.00, 1, 1 FROM _order_map om WHERE om.orig_idx=103;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 614.00, 550.00, 1, 1 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1200.00, 760.00, 1, 1 FROM _order_map om WHERE om.orig_idx=102;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/ДЕЛТА ГРИС 4ММ', 614.00, 635.00, 1, 2 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 495.00, 543.00, 1, 3 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1853.00, 543.00, 1, 4 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 2270.00, 945.00, 2, 5 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1290.00, 620.00, 2, 6 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 765.00, 730.00, 1, 7 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 514.00, 715.00, 1, 8 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1101.00, 500.00, 1, 9 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1875.00, 730.00, 4, 10 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1010.00, 430.00, 1, 11 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1010.00, 430.00, 1, 12 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1496.00, 533.00, 4, 13 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 734.00, 834.00, 1, 14 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1751.00, 168.00, 1, 15 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/ДЕЛТА БРОНЗЕ 4ММ', 1805.00, 490.00, 1, 16 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1765.00, 948.00, 3, 17 FROM _order_map om WHERE om.orig_idx=104;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЦВЕТНО/ЦВЕТНО 4,1,4', 418.00, 1270.00, 2, 0 FROM _order_map om WHERE om.orig_idx=112;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 594.00, 1100.00, 1, 0 FROM _order_map om WHERE om.orig_idx=106;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 900.00, 1500.00, 10, 0 FROM _order_map om WHERE om.orig_idx=109;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1568.00, 533.00, 2, 0 FROM _order_map om WHERE om.orig_idx=110;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 826.00, 647.00, 2, 0 FROM _order_map om WHERE om.orig_idx=111;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1189.00, 679.00, 1, 0 FROM _order_map om WHERE om.orig_idx=108;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 1305.00, 1122.00, 1, 0 FROM _order_map om WHERE om.orig_idx=113;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА БРОНЗЕ 4ММ', 1215.00, 650.00, 1, 0 FROM _order_map om WHERE om.orig_idx=114;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 2100.00, 900.00, 1, 0 FROM _order_map om WHERE om.orig_idx=116;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 440.00, 1050.00, 1, 0 FROM _order_map om WHERE om.orig_idx=115;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 780.00, 2430.00, 1, 0 FROM _order_map om WHERE om.orig_idx=107;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 780.00, 2060.00, 1, 0 FROM _order_map om WHERE om.orig_idx=117;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 258.00, 2110.00, 1, 0 FROM _order_map om WHERE om.orig_idx=105;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 1045.00, 906.00, 1, 1 FROM _order_map om WHERE om.orig_idx=116;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1830.00, 825.00, 1, 1 FROM _order_map om WHERE om.orig_idx=113;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 431.00, 998.00, 1, 1 FROM _order_map om WHERE om.orig_idx=108;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЛАКОБЕЛ 4ММ 9005', 149.00, 595.00, 3, 1 FROM _order_map om WHERE om.orig_idx=117;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 418.00, 1745.00, 2, 1 FROM _order_map om WHERE om.orig_idx=112;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1115.00, 485.00, 2, 1 FROM _order_map om WHERE om.orig_idx=110;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ 8ММ ЦВЕТНО', 2050.00, 740.00, 1, 1 FROM _order_map om WHERE om.orig_idx=115;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 2036.00, 748.00, 2, 2 FROM _order_map om WHERE om.orig_idx=108;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 10ММ', 3147.00, 1254.00, 1, 2 FROM _order_map om WHERE om.orig_idx=116;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 2304.00, 471.00, 1, 2 FROM _order_map om WHERE om.orig_idx=110;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 750.00, 600.00, 1, 2 FROM _order_map om WHERE om.orig_idx=112;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 500.00, 1050.00, 1, 2 FROM _order_map om WHERE om.orig_idx=113;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 2304.00, 253.00, 1, 3 FROM _order_map om WHERE om.orig_idx=110;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1600.00, 800.00, 1, 3 FROM _order_map om WHERE om.orig_idx=112;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 590.00, 590.00, 1, 4 FROM _order_map om WHERE om.orig_idx=112;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 3165.00, 877.00, 1, 5 FROM _order_map om WHERE om.orig_idx=112;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 1055.00, 918.00, 1, 6 FROM _order_map om WHERE om.orig_idx=112;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КОПЧЕ', 3165.00, 342.00, 1, 7 FROM _order_map om WHERE om.orig_idx=112;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 290.00, 916.00, 1, 8 FROM _order_map om WHERE om.orig_idx=112;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1260.00, 1030.00, 1, 0 FROM _order_map om WHERE om.orig_idx=120;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1585.00, 1070.00, 1, 0 FROM _order_map om WHERE om.orig_idx=118;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 690.00, 318.00, 1, 0 FROM _order_map om WHERE om.orig_idx=121;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 857.00, 457.00, 2, 0 FROM _order_map om WHERE om.orig_idx=122;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 5ММ', 900.00, 440.00, 1, 0 FROM _order_map om WHERE om.orig_idx=119;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1130.00, 680.00, 4, 1 FROM _order_map om WHERE om.orig_idx=120;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 246.00, 310.00, 2, 1 FROM _order_map om WHERE om.orig_idx=121;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 4ММ', 500.00, 798.00, 2, 2 FROM _order_map om WHERE om.orig_idx=121;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 690.00, 256.00, 1, 3 FROM _order_map om WHERE om.orig_idx=121;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 900.00, 380.00, 1, 0 FROM _order_map om WHERE om.orig_idx=128;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 610.00, 1030.00, 1, 0 FROM _order_map om WHERE om.orig_idx=123;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1745.00, 495.00, 2, 0 FROM _order_map om WHERE om.orig_idx=125;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/КОНФЕТА 4ММ', 485.00, 405.00, 1, 0 FROM _order_map om WHERE om.orig_idx=127;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 800.00, 300.00, 2, 0 FROM _order_map om WHERE om.orig_idx=124;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1120.00, 515.00, 1, 0 FROM _order_map om WHERE om.orig_idx=126;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 493.00, 2000.00, 1, 0 FROM _order_map om WHERE om.orig_idx=129;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1130.00, 766.00, 1, 0 FROM _order_map om WHERE om.orig_idx=130;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 900.00, 783.00, 1, 0 FROM _order_map om WHERE om.orig_idx=131;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 945.00, 20.00, 1, 0 FROM _order_map om WHERE om.orig_idx=132;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 859.00, 859.00, 1, 1 FROM _order_map om WHERE om.orig_idx=130;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1248.00, 412.00, 1, 0 FROM _order_map om WHERE om.orig_idx=141;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1245.00, 1915.00, 1, 0 FROM _order_map om WHERE om.orig_idx=134;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 967.00, 677.00, 1, 0 FROM _order_map om WHERE om.orig_idx=136;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 3,1,3', 880.00, 1715.00, 1, 0 FROM _order_map om WHERE om.orig_idx=139;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 800.00, 700.00, 1, 0 FROM _order_map om WHERE om.orig_idx=133;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 967.00, 677.00, 1, 0 FROM _order_map om WHERE om.orig_idx=135;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/ЗЕЛЕНО 4ММ', 1218.00, 678.00, 1, 0 FROM _order_map om WHERE om.orig_idx=137;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 309.00, 317.00, 1, 0 FROM _order_map om WHERE om.orig_idx=138;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 780.00, 230.00, 1, 0 FROM _order_map om WHERE om.orig_idx=140;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/МАТ 4ММ/МФ 4ММ', 1789.00, 469.00, 1, 1 FROM _order_map om WHERE om.orig_idx=138;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР ЗА ВЕНТИЛАТОР', 1218.00, 678.00, 1, 1 FROM _order_map om WHERE om.orig_idx=137;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1650.00, 1070.00, 1, 1 FROM _order_map om WHERE om.orig_idx=133;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 6ММ', 330.00, 395.00, 6, 1 FROM _order_map om WHERE om.orig_idx=141;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 730.00, 600.00, 1, 2 FROM _order_map om WHERE om.orig_idx=133;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЛАКОБЕЛ 4ММ 9005', 100.00, 366.00, 2, 2 FROM _order_map om WHERE om.orig_idx=141;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1310.00, 1310.00, 1, 0 FROM _order_map om WHERE om.orig_idx=148;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 800.00, 1050.00, 1, 0 FROM _order_map om WHERE om.orig_idx=146;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 1877.00, 450.00, 1, 0 FROM _order_map om WHERE om.orig_idx=145;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 1992.00, 355.00, 2, 0 FROM _order_map om WHERE om.orig_idx=147;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БРОНЗЕ/СИВО/ЗЕЛЕНО 5ММ', 220.00, 163.00, 5, 0 FROM _order_map om WHERE om.orig_idx=143;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 300.00, 735.00, 1, 0 FROM _order_map om WHERE om.orig_idx=142;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'СТОПСОЛ 6ММ/БЯЛО 4ММ', 360.00, 1005.00, 1, 0 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1192.00, 703.00, 1, 1 FROM _order_map om WHERE om.orig_idx=148;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 364.00, 705.00, 1, 1 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 5ММ', 264.00, 200.00, 5, 1 FROM _order_map om WHERE om.orig_idx=143;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 6ММ', 200.00, 450.00, 1, 1 FROM _order_map om WHERE om.orig_idx=145;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МАТ 4ММ/МАТ 4ММ', 279.00, 585.00, 1, 2 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 2215.00, 350.00, 1, 2 FROM _order_map om WHERE om.orig_idx=145;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 304.00, 605.00, 1, 3 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 2105.00, 350.00, 1, 3 FROM _order_map om WHERE om.orig_idx=145;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МАТ 4ММ/МАТ 4ММ', 354.00, 605.00, 1, 4 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 775.00, 470.00, 3, 5 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 2134.00, 944.00, 1, 6 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1272.00, 886.00, 1, 7 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1655.00, 1195.00, 1, 8 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1332.00, 536.00, 1, 9 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ДЕЛТА ГРИС 4ММ/ДЕЛТА ГРИС 4ММ', 508.00, 653.00, 1, 10 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1276.00, 924.00, 2, 11 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 924.00, 1276.00, 2, 12 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1880.00, 700.00, 2, 13 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1775.00, 115.00, 1, 14 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1810.00, 533.00, 1, 15 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 1650.00, 300.00, 4, 16 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 6ММ', 2034.00, 1440.00, 1, 17 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 2205.00, 286.00, 1, 18 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 500.00, 1100.00, 1, 19 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 727.00, 567.00, 1, 20 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1890.00, 1480.00, 1, 21 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 928.00, 838.00, 1, 22 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1885.00, 786.00, 1, 23 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/БЯЛО 6ММ', 2105.00, 2065.00, 1, 24 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 2105.00, 2075.00, 1, 25 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1838.00, 784.00, 1, 26 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 998.00, 633.00, 1, 27 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО/БЯЛО 3,1,3', 703.00, 952.00, 2, 28 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1074.00, 1005.00, 1, 29 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1205.00, 777.00, 4, 30 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 500.00, 1030.00, 1, 31 FROM _order_map om WHERE om.orig_idx=144;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1956.00, 748.00, 1, 0 FROM _order_map om WHERE om.orig_idx=152;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 378.00, 358.00, 1, 0 FROM _order_map om WHERE om.orig_idx=149;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1920.00, 524.00, 1, 0 FROM _order_map om WHERE om.orig_idx=153;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 2196.00, 822.00, 2, 0 FROM _order_map om WHERE om.orig_idx=151;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 915.00, 2270.00, 1, 0 FROM _order_map om WHERE om.orig_idx=154;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 5ММ', 930.00, 2055.00, 4, 0 FROM _order_map om WHERE om.orig_idx=155;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 2196.00, 822.00, 2, 0 FROM _order_map om WHERE om.orig_idx=150;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 240.00, 1905.00, 4, 1 FROM _order_map om WHERE om.orig_idx=155;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1059.00, 589.00, 1, 0 FROM _order_map om WHERE om.orig_idx=160;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 520.00, 270.00, 1, 0 FROM _order_map om WHERE om.orig_idx=159;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 640.00, 1220.00, 1, 0 FROM _order_map om WHERE om.orig_idx=158;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1296.00, 595.00, 1, 0 FROM _order_map om WHERE om.orig_idx=157;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1368.00, 622.00, 1, 0 FROM _order_map om WHERE om.orig_idx=156;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 275.00, 261.00, 4, 1 FROM _order_map om WHERE om.orig_idx=157;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1528.00, 1298.00, 1, 1 FROM _order_map om WHERE om.orig_idx=156;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1340.00, 698.00, 1, 1 FROM _order_map om WHERE om.orig_idx=160;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 6 ЗАК/БЯЛО 4ММ/3,1,3', 1590.00, 775.00, 2, 2 FROM _order_map om WHERE om.orig_idx=160;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 275.00, 551.00, 4, 2 FROM _order_map om WHERE om.orig_idx=157;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 1785.00, 670.00, 1, 3 FROM _order_map om WHERE om.orig_idx=160;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 2356.00, 2116.00, 1, 0 FROM _order_map om WHERE om.orig_idx=161;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/СИВО/БРОНЗЕ 4ММ', 950.00, 550.00, 1, 0 FROM _order_map om WHERE om.orig_idx=162;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1510.00, 568.00, 3, 0 FROM _order_map om WHERE om.orig_idx=168;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 598.00, 1098.00, 1, 0 FROM _order_map om WHERE om.orig_idx=166;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 275.00, 2490.00, 1, 0 FROM _order_map om WHERE om.orig_idx=167;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 1920.00, 750.00, 2, 0 FROM _order_map om WHERE om.orig_idx=165;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1440.00, 575.00, 1, 0 FROM _order_map om WHERE om.orig_idx=164;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 2356.00, 2116.00, 1, 0 FROM _order_map om WHERE om.orig_idx=163;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ОГЛ 4ММ/ОГЛ 4ММ', 1725.00, 505.00, 1, 1 FROM _order_map om WHERE om.orig_idx=165;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 1510.00, 575.00, 1, 1 FROM _order_map om WHERE om.orig_idx=168;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1380.00, 1300.00, 2, 2 FROM _order_map om WHERE om.orig_idx=165;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ДЕЛТА ГРИС 4ММ/ДЕЛТА ГРИС 4ММ', 1860.00, 230.00, 1, 3 FROM _order_map om WHERE om.orig_idx=165;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 1705.00, 725.00, 1, 0 FROM _order_map om WHERE om.orig_idx=171;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1320.00, 625.00, 1, 0 FROM _order_map om WHERE om.orig_idx=169;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 1640.00, 780.00, 1, 0 FROM _order_map om WHERE om.orig_idx=170;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 341.00, 433.00, 1, 0 FROM _order_map om WHERE om.orig_idx=173;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 2510.00, 275.00, 1, 0 FROM _order_map om WHERE om.orig_idx=172;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 1401.00, 772.00, 1, 0 FROM _order_map om WHERE om.orig_idx=174;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ 10ММ ЦВЕТНО', 2510.00, 958.00, 3, 1 FROM _order_map om WHERE om.orig_idx=172;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1297.00, 668.00, 1, 1 FROM _order_map om WHERE om.orig_idx=174;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ГАМА/ПАНТА', 2510.00, 245.00, 1, 2 FROM _order_map om WHERE om.orig_idx=172;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 2510.00, 1390.00, 1, 3 FROM _order_map om WHERE om.orig_idx=172;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф45', 2500.00, 1040.00, 1, 4 FROM _order_map om WHERE om.orig_idx=172;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 232.00, 597.00, 2, 0 FROM _order_map om WHERE om.orig_idx=176;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 630.00, 575.00, 1, 0 FROM _order_map om WHERE om.orig_idx=178;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/ДЕЛТА ГРИС 4ММ/МФ 4ММ', 560.00, 280.00, 1, 0 FROM _order_map om WHERE om.orig_idx=177;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 248.00, 966.00, 1, 0 FROM _order_map om WHERE om.orig_idx=175;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КОПЧЕ', 730.00, 575.00, 1, 1 FROM _order_map om WHERE om.orig_idx=178;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1595.00, 570.00, 1, 0 FROM _order_map om WHERE om.orig_idx=179;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БРОНЗЕ, СИВО 4ММ', 540.00, 2340.00, 1, 0 FROM _order_map om WHERE om.orig_idx=182;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 6ММ/БЯЛО 4ММ', 1415.00, 829.00, 1, 0 FROM _order_map om WHERE om.orig_idx=181;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1088.00, 1033.00, 1, 0 FROM _order_map om WHERE om.orig_idx=183;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1310.00, 473.00, 1, 0 FROM _order_map om WHERE om.orig_idx=184;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 2445.00, 1285.00, 2, 0 FROM _order_map om WHERE om.orig_idx=185;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 1900.00, 530.00, 16, 0 FROM _order_map om WHERE om.orig_idx=180;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1336.00, 509.00, 1, 1 FROM _order_map om WHERE om.orig_idx=183;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1000.00, 920.00, 3, 1 FROM _order_map om WHERE om.orig_idx=185;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 228.00, 966.00, 1, 1 FROM _order_map om WHERE om.orig_idx=184;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '3,1,3/БЯЛО 4ММ', 1680.00, 275.00, 1, 1 FROM _order_map om WHERE om.orig_idx=180;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1289.00, 569.00, 1, 2 FROM _order_map om WHERE om.orig_idx=183;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 922.00, 322.00, 2, 2 FROM _order_map om WHERE om.orig_idx=184;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 935.00, 2195.00, 1, 2 FROM _order_map om WHERE om.orig_idx=180;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 725.00, 505.00, 1, 3 FROM _order_map om WHERE om.orig_idx=180;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1276.00, 1459.00, 3, 3 FROM _order_map om WHERE om.orig_idx=184;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 1268.00, 686.00, 1, 4 FROM _order_map om WHERE om.orig_idx=184;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА БРОНЗЕ 4ММ', 1500.00, 535.00, 1, 4 FROM _order_map om WHERE om.orig_idx=180;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1769.00, 578.00, 1, 5 FROM _order_map om WHERE om.orig_idx=184;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1418.00, 1441.00, 1, 0 FROM _order_map om WHERE om.orig_idx=191;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1655.00, 770.00, 1, 0 FROM _order_map om WHERE om.orig_idx=189;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 2325.00, 1650.00, 1, 0 FROM _order_map om WHERE om.orig_idx=192;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 700.00, 1150.00, 1, 0 FROM _order_map om WHERE om.orig_idx=186;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 369.00, 1671.00, 1, 0 FROM _order_map om WHERE om.orig_idx=187;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ДЕЛТА ГРИС 4ММ', 710.00, 520.00, 1, 0 FROM _order_map om WHERE om.orig_idx=188;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 282.00, 592.00, 2, 0 FROM _order_map om WHERE om.orig_idx=190;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 1190.00, 1150.00, 1, 1 FROM _order_map om WHERE om.orig_idx=189;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1659.00, 809.00, 1, 1 FROM _order_map om WHERE om.orig_idx=187;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1330.00, 1060.00, 1, 0 FROM _order_map om WHERE om.orig_idx=194;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1378.00, 745.00, 1, 0 FROM _order_map om WHERE om.orig_idx=193;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1270.00, 800.00, 1, 0 FROM _order_map om WHERE om.orig_idx=195;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 6ММ', 125.00, 2250.00, 1, 1 FROM _order_map om WHERE om.orig_idx=195;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1398.00, 549.00, 1, 1 FROM _order_map om WHERE om.orig_idx=194;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1465.00, 2015.00, 1, 2 FROM _order_map om WHERE om.orig_idx=194;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 355.00, 355.00, 2, 0 FROM _order_map om WHERE om.orig_idx=197;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 5ММ', 480.00, 348.00, 1, 0 FROM _order_map om WHERE om.orig_idx=204;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 5ММ', 2679.00, 480.00, 1, 0 FROM _order_map om WHERE om.orig_idx=203;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 500.00, 1600.00, 1, 0 FROM _order_map om WHERE om.orig_idx=201;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 705.00, 580.00, 1, 0 FROM _order_map om WHERE om.orig_idx=202;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 437.00, 525.00, 10, 0 FROM _order_map om WHERE om.orig_idx=198;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1993.00, 793.00, 1, 0 FROM _order_map om WHERE om.orig_idx=196;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 900.00, 1020.00, 2, 0 FROM _order_map om WHERE om.orig_idx=200;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 2007.00, 500.00, 1, 0 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 5ММ', 348.00, 480.00, 1, 1 FROM _order_map om WHERE om.orig_idx=203;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 2007.00, 410.00, 1, 1 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1320.00, 590.00, 1, 1 FROM _order_map om WHERE om.orig_idx=202;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 2007.00, 133.00, 1, 2 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 1963.00, 593.00, 1, 3 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1963.00, 638.00, 1, 4 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 1963.00, 93.00, 1, 5 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 1993.00, 150.00, 1, 6 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1993.00, 343.00, 1, 7 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 1997.00, 502.00, 1, 8 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1993.00, 512.00, 1, 9 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 1993.00, 467.00, 1, 10 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 1993.00, 453.00, 1, 11 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БРОНИРАНО СТЪКЛО  МАКАРОВ', 782.00, 1293.00, 1, 12 FROM _order_map om WHERE om.orig_idx=199;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 497.00, 297.00, 1, 0 FROM _order_map om WHERE om.orig_idx=209;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 580.00, 450.00, 1, 0 FROM _order_map om WHERE om.orig_idx=210;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 555.00, 527.00, 2, 0 FROM _order_map om WHERE om.orig_idx=208;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ/МАТ 4ММ', 736.00, 436.00, 1, 0 FROM _order_map om WHERE om.orig_idx=207;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 400.00, 2007.00, 1, 0 FROM _order_map om WHERE om.orig_idx=206;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1820.00, 825.00, 1, 0 FROM _order_map om WHERE om.orig_idx=205;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1600.00, 450.00, 1, 0 FROM _order_map om WHERE om.orig_idx=211;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1741.00, 561.00, 1, 1 FROM _order_map om WHERE om.orig_idx=209;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 560.00, 886.00, 1, 1 FROM _order_map om WHERE om.orig_idx=205;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1000.00, 2400.00, 1, 2 FROM _order_map om WHERE om.orig_idx=209;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1750.00, 565.00, 1, 2 FROM _order_map om WHERE om.orig_idx=205;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 388.00, 683.00, 1, 3 FROM _order_map om WHERE om.orig_idx=205;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 940.00, 940.00, 1, 3 FROM _order_map om WHERE om.orig_idx=209;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1770.00, 168.00, 1, 4 FROM _order_map om WHERE om.orig_idx=205;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1715.00, 653.00, 1, 5 FROM _order_map om WHERE om.orig_idx=205;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ХИМИЧЕСКИ МАТ 4ММ', 300.00, 1500.00, 1, 0 FROM _order_map om WHERE om.orig_idx=216;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1125.00, 650.00, 4, 0 FROM _order_map om WHERE om.orig_idx=213;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 830.00, 640.00, 1, 0 FROM _order_map om WHERE om.orig_idx=212;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1810.00, 2455.00, 1, 0 FROM _order_map om WHERE om.orig_idx=217;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 3147.00, 1280.00, 1, 0 FROM _order_map om WHERE om.orig_idx=219;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/4 СЕЗ 4ММ', 1208.00, 900.00, 1, 0 FROM _order_map om WHERE om.orig_idx=218;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 915.00, 635.00, 1, 0 FROM _order_map om WHERE om.orig_idx=221;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 320.00, 952.00, 2, 0 FROM _order_map om WHERE om.orig_idx=222;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 355.00, 355.00, 3, 0 FROM _order_map om WHERE om.orig_idx=220;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 307.00, 298.00, 1, 0 FROM _order_map om WHERE om.orig_idx=214;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 500.00, 800.00, 1, 0 FROM _order_map om WHERE om.orig_idx=215;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 6ММ', 1725.00, 945.00, 1, 1 FROM _order_map om WHERE om.orig_idx=220;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 300.00, 490.00, 1, 1 FROM _order_map om WHERE om.orig_idx=216;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 825.00, 870.00, 1, 1 FROM _order_map om WHERE om.orig_idx=217;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 915.00, 635.00, 1, 1 FROM _order_map om WHERE om.orig_idx=221;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1160.00, 522.00, 2, 1 FROM _order_map om WHERE om.orig_idx=213;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 2160.00, 1011.00, 1, 1 FROM _order_map om WHERE om.orig_idx=219;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КОПЧЕ', 2730.00, 140.00, 1, 1 FROM _order_map om WHERE om.orig_idx=212;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ДЕЛТА МАТ 4ММ', 1095.00, 575.00, 1, 2 FROM _order_map om WHERE om.orig_idx=217;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1200.00, 720.00, 1, 2 FROM _order_map om WHERE om.orig_idx=221;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'СТОПСОЛ 4ММ/БЯЛО 4ММ', 1590.00, 805.00, 1, 2 FROM _order_map om WHERE om.orig_idx=220;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 2160.00, 1004.00, 3, 2 FROM _order_map om WHERE om.orig_idx=219;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 10ММ', 2160.00, 1011.00, 1, 3 FROM _order_map om WHERE om.orig_idx=219;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 415.00, 2415.00, 1, 3 FROM _order_map om WHERE om.orig_idx=217;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 380.00, 320.00, 1, 3 FROM _order_map om WHERE om.orig_idx=221;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф50', 2143.00, 1042.00, 2, 4 FROM _order_map om WHERE om.orig_idx=219;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 3-ЕН', 290.00, 2455.00, 1, 4 FROM _order_map om WHERE om.orig_idx=217;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1575.00, 850.00, 1, 5 FROM _order_map om WHERE om.orig_idx=217;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1455.00, 840.00, 1, 6 FROM _order_map om WHERE om.orig_idx=217;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 2014.00, 875.00, 1, 0 FROM _order_map om WHERE om.orig_idx=225;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 980.00, 780.00, 1, 0 FROM _order_map om WHERE om.orig_idx=227;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1993.00, 450.00, 2, 0 FROM _order_map om WHERE om.orig_idx=226;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВОЛИНЕЕН КАНТ 4ММ', 1700.00, 300.00, 3, 0 FROM _order_map om WHERE om.orig_idx=224;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 2110.00, 980.00, 1, 0 FROM _order_map om WHERE om.orig_idx=223;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ 10ММ ЦВЕТНО', 2020.00, 955.00, 1, 1 FROM _order_map om WHERE om.orig_idx=223;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРКА / КРЪГ', 1200.00, 1200.00, 1, 1 FROM _order_map om WHERE om.orig_idx=224;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1800.00, 1023.00, 2, 1 FROM _order_map om WHERE om.orig_idx=225;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 936.00, 936.00, 1, 2 FROM _order_map om WHERE om.orig_idx=224;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 2037.00, 912.00, 5, 2 FROM _order_map om WHERE om.orig_idx=225;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 563.00, 963.00, 1, 0 FROM _order_map om WHERE om.orig_idx=228;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 985.00, 415.00, 1, 0 FROM _order_map om WHERE om.orig_idx=232;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 1235.00, 700.00, 1, 0 FROM _order_map om WHERE om.orig_idx=229;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1904.00, 874.00, 1, 0 FROM _order_map om WHERE om.orig_idx=230;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1724.00, 1328.00, 1, 0 FROM _order_map om WHERE om.orig_idx=231;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 808.00, 868.00, 1, 1 FROM _order_map om WHERE om.orig_idx=231;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА БРОНЗЕ 4ММ', 1000.00, 270.00, 1, 1 FROM _order_map om WHERE om.orig_idx=232;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 3-ЕН', 1168.00, 868.00, 1, 2 FROM _order_map om WHERE om.orig_idx=231;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 364.00, 890.00, 1, 3 FROM _order_map om WHERE om.orig_idx=231;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 750.00, 665.00, 1, 0 FROM _order_map om WHERE om.orig_idx=236;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '3,1,3 не/СТОПСОЛ 6 ММ', 1990.00, 1698.00, 2, 0 FROM _order_map om WHERE om.orig_idx=238;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1910.00, 645.00, 1, 0 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1315.00, 855.00, 1, 0 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 214.00, 1273.00, 1, 0 FROM _order_map om WHERE om.orig_idx=235;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/4 СЕЗ 4ММ', 2085.00, 1525.00, 1, 0 FROM _order_map om WHERE om.orig_idx=233;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 1812.00, 1609.00, 2, 1 FROM _order_map om WHERE om.orig_idx=238;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 2044.00, 876.00, 1, 1 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1330.00, 2130.00, 2, 1 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 931.00, 801.00, 1, 2 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1880.00, 580.00, 1, 2 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 1990.00, 923.00, 1, 2 FROM _order_map om WHERE om.orig_idx=238;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 398.00, 398.00, 1, 3 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1275.00, 490.00, 1, 3 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 399.00, 199.00, 1, 4 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1790.00, 220.00, 1, 4 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ОГЛ 4ММ/МАТ 4ММ', 1810.00, 585.00, 1, 5 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 794.00, 1181.00, 1, 5 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО/БЯЛО 5,1,5', 2145.00, 977.00, 3, 6 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1779.00, 221.00, 1, 6 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 2031.00, 428.00, 2, 7 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 3165.00, 258.00, 1, 7 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 3165.00, 438.00, 1, 8 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1820.00, 480.00, 1, 8 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КОПЧЕ', 1095.00, 905.00, 1, 9 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1155.00, 402.00, 1, 9 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1258.00, 1336.00, 2, 10 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРКА / КРЪГ', 1155.00, 402.00, 1, 10 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/4 СЕЗ 4ММ', 1238.00, 1128.00, 1, 11 FROM _order_map om WHERE om.orig_idx=237;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1156.00, 502.00, 1, 11 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1852.00, 415.00, 1, 12 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БРОНЗЕ 4 ММ/ДЕЛТА БРОНЗЕ 4ММ', 1803.00, 135.00, 1, 13 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 470.00, 1895.00, 1, 14 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 650.00, 1800.00, 1, 15 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 5ММ', 240.00, 563.00, 1, 16 FROM _order_map om WHERE om.orig_idx=234;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 2324.00, 569.00, 2, 0 FROM _order_map om WHERE om.orig_idx=240;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 2093.00, 467.00, 2, 0 FROM _order_map om WHERE om.orig_idx=242;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1690.00, 1188.00, 1, 0 FROM _order_map om WHERE om.orig_idx=239;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1300.00, 1200.00, 2, 0 FROM _order_map om WHERE om.orig_idx=241;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 1930.00, 900.00, 1, 1 FROM _order_map om WHERE om.orig_idx=242;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БРОНЗЕ/СИВО/ЗЕЛЕНО 8ММ', 2324.00, 920.00, 2, 2 FROM _order_map om WHERE om.orig_idx=242;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 990.00, 1200.00, 1, 0 FROM _order_map om WHERE om.orig_idx=243;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1558.00, 718.00, 1, 0 FROM _order_map om WHERE om.orig_idx=245;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЛАКОБЕЛ 4ММ 9005', 567.00, 727.00, 1, 0 FROM _order_map om WHERE om.orig_idx=244;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 990.00, 480.00, 1, 1 FROM _order_map om WHERE om.orig_idx=243;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 440.00, 292.00, 4, 0 FROM _order_map om WHERE om.orig_idx=249;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1091.00, 768.00, 2, 0 FROM _order_map om WHERE om.orig_idx=251;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1288.00, 629.00, 2, 0 FROM _order_map om WHERE om.orig_idx=246;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 1030.00, 1080.00, 1, 0 FROM _order_map om WHERE om.orig_idx=248;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 5ММ', 550.00, 110.00, 1, 0 FROM _order_map om WHERE om.orig_idx=252;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1218.00, 609.00, 1, 0 FROM _order_map om WHERE om.orig_idx=247;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 2010.00, 1410.00, 1, 0 FROM _order_map om WHERE om.orig_idx=250;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БРОНЗЕ/СИВО/ЗЕЛЕНО 4ММ', 296.00, 2292.00, 1, 1 FROM _order_map om WHERE om.orig_idx=249;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 492.00, 486.00, 1, 1 FROM _order_map om WHERE om.orig_idx=250;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1410.00, 780.00, 2, 1 FROM _order_map om WHERE om.orig_idx=246;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1318.00, 871.00, 1, 1 FROM _order_map om WHERE om.orig_idx=247;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1715.00, 458.00, 1, 2 FROM _order_map om WHERE om.orig_idx=246;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 390.00, 1630.00, 2, 2 FROM _order_map om WHERE om.orig_idx=249;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1260.00, 1078.00, 1, 2 FROM _order_map om WHERE om.orig_idx=250;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 305.00, 400.00, 1, 0 FROM _order_map om WHERE om.orig_idx=256;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 2073.00, 652.00, 1, 0 FROM _order_map om WHERE om.orig_idx=254;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 525.00, 1765.00, 1, 0 FROM _order_map om WHERE om.orig_idx=259;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 380.00, 810.00, 1, 0 FROM _order_map om WHERE om.orig_idx=258;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1874.00, 600.00, 1, 0 FROM _order_map om WHERE om.orig_idx=255;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 910.00, 790.00, 2, 0 FROM _order_map om WHERE om.orig_idx=260;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1900.00, 1000.00, 1, 0 FROM _order_map om WHERE om.orig_idx=257;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1874.00, 600.00, 1, 0 FROM _order_map om WHERE om.orig_idx=253;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 1893.00, 793.00, 1, 1 FROM _order_map om WHERE om.orig_idx=255;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 700.00, 580.00, 1, 1 FROM _order_map om WHERE om.orig_idx=256;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 2093.00, 192.00, 1, 1 FROM _order_map om WHERE om.orig_idx=254;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 1893.00, 793.00, 1, 1 FROM _order_map om WHERE om.orig_idx=253;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА БРОНЗЕ 4ММ', 645.00, 635.00, 1, 0 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 6ММ', 338.00, 786.00, 1, 0 FROM _order_map om WHERE om.orig_idx=261;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1895.00, 805.00, 1, 0 FROM _order_map om WHERE om.orig_idx=262;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1710.00, 730.00, 1, 1 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА БРОНЗЕ 4ММ', 370.00, 635.00, 1, 2 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1750.00, 180.00, 1, 3 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 337.00, 137.00, 4, 4 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 670.00, 815.00, 1, 5 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1840.00, 777.00, 2, 6 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 187.00, 367.00, 1, 7 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1861.00, 652.00, 2, 8 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1225.00, 695.00, 1, 9 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1950.00, 575.00, 1, 10 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 418.00, 878.00, 1, 11 FROM _order_map om WHERE om.orig_idx=263;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 2018.00, 857.00, 1, 0 FROM _order_map om WHERE om.orig_idx=266;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 3-ЕН', 2249.00, 591.00, 1, 0 FROM _order_map om WHERE om.orig_idx=264;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1341.00, 510.00, 1, 0 FROM _order_map om WHERE om.orig_idx=265;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1715.00, 1865.00, 1, 1 FROM _order_map om WHERE om.orig_idx=265;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 1045.00, 205.00, 1, 0 FROM _order_map om WHERE om.orig_idx=269;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1558.00, 424.00, 1, 0 FROM _order_map om WHERE om.orig_idx=267;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 930.00, 1030.00, 1, 0 FROM _order_map om WHERE om.orig_idx=271;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1700.00, 600.00, 1, 0 FROM _order_map om WHERE om.orig_idx=268;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 2550.00, 890.00, 1, 0 FROM _order_map om WHERE om.orig_idx=270;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 350.00, 761.00, 3, 0 FROM _order_map om WHERE om.orig_idx=272;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1060.00, 670.00, 1, 1 FROM _order_map om WHERE om.orig_idx=269;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф12', 350.00, 907.00, 1, 1 FROM _order_map om WHERE om.orig_idx=270;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1398.00, 468.00, 1, 1 FROM _order_map om WHERE om.orig_idx=272;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 755.00, 400.00, 4, 2 FROM _order_map om WHERE om.orig_idx=269;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КОПЧЕ', 2200.00, 900.00, 1, 2 FROM _order_map om WHERE om.orig_idx=270;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1298.00, 653.00, 1, 0 FROM _order_map om WHERE om.orig_idx=275;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1481.00, 531.00, 1, 0 FROM _order_map om WHERE om.orig_idx=276;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 550.00, 573.00, 8, 0 FROM _order_map om WHERE om.orig_idx=273;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КЛИЪР ВИЖЪН 4ММ', 474.00, 2342.00, 1, 0 FROM _order_map om WHERE om.orig_idx=274;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ФЛЕЙТА МАТ 4ММ', 900.00, 240.00, 6, 0 FROM _order_map om WHERE om.orig_idx=277;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 6ММ', 256.00, 556.00, 6, 1 FROM _order_map om WHERE om.orig_idx=274;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1140.00, 380.00, 1, 0 FROM _order_map om WHERE om.orig_idx=284;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1320.00, 700.00, 1, 0 FROM _order_map om WHERE om.orig_idx=278;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 600.00, 2722.00, 2, 0 FROM _order_map om WHERE om.orig_idx=285;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 1490.00, 557.00, 1, 0 FROM _order_map om WHERE om.orig_idx=279;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1248.00, 612.00, 2, 0 FROM _order_map om WHERE om.orig_idx=280;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1800.00, 800.00, 1, 0 FROM _order_map om WHERE om.orig_idx=281;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 940.00, 430.00, 1, 0 FROM _order_map om WHERE om.orig_idx=283;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 2154.00, 1444.00, 1, 0 FROM _order_map om WHERE om.orig_idx=282;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'МАТ ПО СХЕМА/МАТ КАНТ', 400.00, 700.00, 1, 1 FROM _order_map om WHERE om.orig_idx=278;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН ФАСЕТ', 1800.00, 730.00, 1, 1 FROM _order_map om WHERE om.orig_idx=281;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА БРОНЗЕ 4ММ', 1500.00, 535.00, 2, 1 FROM _order_map om WHERE om.orig_idx=284;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1307.00, 482.00, 1, 1 FROM _order_map om WHERE om.orig_idx=280;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 1970.00, 650.00, 1, 2 FROM _order_map om WHERE om.orig_idx=284;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 389.00, 1019.00, 4, 3 FROM _order_map om WHERE om.orig_idx=284;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 558.00, 500.00, 2, 0 FROM _order_map om WHERE om.orig_idx=286;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 2667.00, 695.00, 1, 0 FROM _order_map om WHERE om.orig_idx=287;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 427.00, 167.00, 1, 0 FROM _order_map om WHERE om.orig_idx=289;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1770.00, 680.00, 2, 0 FROM _order_map om WHERE om.orig_idx=292;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1348.00, 898.00, 1, 0 FROM _order_map om WHERE om.orig_idx=293;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 494.00, 2454.00, 2, 0 FROM _order_map om WHERE om.orig_idx=295;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО/БЯЛО 3,1,3', 1333.00, 981.00, 1, 0 FROM _order_map om WHERE om.orig_idx=294;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1416.00, 625.00, 1, 0 FROM _order_map om WHERE om.orig_idx=290;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 1270.00, 680.00, 1, 0 FROM _order_map om WHERE om.orig_idx=291;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 660.00, 320.00, 2, 0 FROM _order_map om WHERE om.orig_idx=288;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1925.00, 705.00, 2, 1 FROM _order_map om WHERE om.orig_idx=289;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1462.00, 1443.00, 1, 1 FROM _order_map om WHERE om.orig_idx=290;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 942.00, 576.00, 1, 2 FROM _order_map om WHERE om.orig_idx=289;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1680.00, 1192.00, 1, 2 FROM _order_map om WHERE om.orig_idx=290;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1428.00, 578.00, 1, 3 FROM _order_map om WHERE om.orig_idx=290;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1246.00, 1691.00, 1, 4 FROM _order_map om WHERE om.orig_idx=290;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '3,1,3/3,1,3', 2871.00, 611.00, 2, 5 FROM _order_map om WHERE om.orig_idx=290;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 3,1,3', 2867.00, 611.00, 2, 6 FROM _order_map om WHERE om.orig_idx=290;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1289.00, 488.00, 2, 7 FROM _order_map om WHERE om.orig_idx=290;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 941.00, 376.00, 1, 8 FROM _order_map om WHERE om.orig_idx=290;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 180.00, 375.00, 2, 0 FROM _order_map om WHERE om.orig_idx=299;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1930.00, 1470.00, 1, 0 FROM _order_map om WHERE om.orig_idx=297;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1138.00, 1482.00, 1, 0 FROM _order_map om WHERE om.orig_idx=296;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 975.00, 2190.00, 1, 0 FROM _order_map om WHERE om.orig_idx=298;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1905.00, 350.00, 1, 1 FROM _order_map om WHERE om.orig_idx=297;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 1118.00, 539.00, 2, 0 FROM _order_map om WHERE om.orig_idx=301;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 2005.00, 1750.00, 1, 0 FROM _order_map om WHERE om.orig_idx=304;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1870.00, 785.00, 3, 0 FROM _order_map om WHERE om.orig_idx=303;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 300.00, 300.00, 20, 0 FROM _order_map om WHERE om.orig_idx=302;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРГОН 3-ЕН', 2055.00, 730.00, 2, 0 FROM _order_map om WHERE om.orig_idx=300;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 2-ЕН', 1118.00, 299.00, 1, 1 FROM _order_map om WHERE om.orig_idx=301;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КРИЗЕТ 4ММ', 1835.00, 810.00, 1, 1 FROM _order_map om WHERE om.orig_idx=303;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '4,1,4 НЕ/4,1,4', 2054.00, 1252.00, 2, 2 FROM _order_map om WHERE om.orig_idx=301;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 2054.00, 1252.00, 1, 3 FROM _order_map om WHERE om.orig_idx=301;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 2-ЕН', 2514.00, 614.00, 3, 4 FROM _order_map om WHERE om.orig_idx=301;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '4,1,4 НЕ/4,1,4', 2364.00, 2234.00, 2, 5 FROM _order_map om WHERE om.orig_idx=301;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 652.00, 1993.00, 8, 0 FROM _order_map om WHERE om.orig_idx=310;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1170.00, 520.00, 2, 0 FROM _order_map om WHERE om.orig_idx=307;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 255.00, 768.00, 1, 0 FROM _order_map om WHERE om.orig_idx=309;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 674.00, 2043.00, 3, 0 FROM _order_map om WHERE om.orig_idx=308;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1325.00, 225.00, 1, 0 FROM _order_map om WHERE om.orig_idx=306;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1792.00, 805.00, 1, 0 FROM _order_map om WHERE om.orig_idx=305;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 362.00, 242.00, 2, 1 FROM _order_map om WHERE om.orig_idx=309;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 300.00, 2043.00, 2, 1 FROM _order_map om WHERE om.orig_idx=308;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ 8ММ ЦВЕТНО', 368.00, 1993.00, 4, 1 FROM _order_map om WHERE om.orig_idx=310;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ГАМА/ПАНТА', 183.00, 1993.00, 4, 2 FROM _order_map om WHERE om.orig_idx=310;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ГАМА/ПАНТА', 877.00, 2043.00, 2, 2 FROM _order_map om WHERE om.orig_idx=308;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 1993.00, 857.00, 2, 3 FROM _order_map om WHERE om.orig_idx=310;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 134.00, 2043.00, 2, 3 FROM _order_map om WHERE om.orig_idx=308;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КОПЧЕ', 674.00, 2043.00, 3, 4 FROM _order_map om WHERE om.orig_idx=308;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1993.00, 883.00, 1, 4 FROM _order_map om WHERE om.orig_idx=310;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 6ММ', 1993.00, 877.00, 1, 5 FROM _order_map om WHERE om.orig_idx=310;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1072.00, 622.00, 1, 0 FROM _order_map om WHERE om.orig_idx=318;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1120.00, 515.00, 2, 0 FROM _order_map om WHERE om.orig_idx=315;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 775.00, 2010.00, 1, 0 FROM _order_map om WHERE om.orig_idx=314;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 730.00, 645.00, 1, 0 FROM _order_map om WHERE om.orig_idx=313;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 700.00, 510.00, 1, 0 FROM _order_map om WHERE om.orig_idx=312;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 2050.00, 1390.00, 4, 0 FROM _order_map om WHERE om.orig_idx=311;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 488.00, 2167.00, 2, 0 FROM _order_map om WHERE om.orig_idx=316;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/МАТ 4ММ/МФ 4ММ', 1898.00, 680.00, 1, 0 FROM _order_map om WHERE om.orig_idx=319;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 2070.00, 323.00, 1, 0 FROM _order_map om WHERE om.orig_idx=317;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 840.00, 738.00, 1, 1 FROM _order_map om WHERE om.orig_idx=319;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 2060.00, 680.00, 1, 1 FROM _order_map om WHERE om.orig_idx=317;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЛЕПЕНЕ СЪС СИЛИКОН', 2050.00, 1300.00, 8, 1 FROM _order_map om WHERE om.orig_idx=311;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф12', 2088.00, 678.00, 1, 2 FROM _order_map om WHERE om.orig_idx=317;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ГАМА/ПАНТА', 2098.00, 426.00, 1, 3 FROM _order_map om WHERE om.orig_idx=317;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 600.00, 800.00, 1, 0 FROM _order_map om WHERE om.orig_idx=321;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ОГЛ 4ММ/ОГЛ 4ММ', 1820.00, 460.00, 1, 0 FROM _order_map om WHERE om.orig_idx=320;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО/БЯЛО 4,1,4', 1525.00, 2425.00, 3, 1 FROM _order_map om WHERE om.orig_idx=320;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'СТОПСОЛ 4ММ/БЯЛО 4ММ', 1208.00, 1458.00, 1, 0 FROM _order_map om WHERE om.orig_idx=326;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 540.00, 340.00, 1, 0 FROM _order_map om WHERE om.orig_idx=324;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БРОНЗЕ/СИВО/ЗЕЛЕНО 4ММ', 351.00, 1226.00, 2, 0 FROM _order_map om WHERE om.orig_idx=323;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1974.00, 702.00, 1, 0 FROM _order_map om WHERE om.orig_idx=322;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/МАТ 4ММ/МФ 4ММ', 1771.00, 266.00, 1, 0 FROM _order_map om WHERE om.orig_idx=325;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1000.00, 500.00, 2, 1 FROM _order_map om WHERE om.orig_idx=322;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 890.00, 435.00, 1, 0 FROM _order_map om WHERE om.orig_idx=327;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 984.00, 1660.00, 1, 0 FROM _order_map om WHERE om.orig_idx=328;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 835.00, 530.00, 1, 0 FROM _order_map om WHERE om.orig_idx=329;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф20', 299.00, 750.00, 1, 1 FROM _order_map om WHERE om.orig_idx=328;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 880.00, 690.00, 1, 2 FROM _order_map om WHERE om.orig_idx=328;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1459.00, 427.00, 2, 0 FROM _order_map om WHERE om.orig_idx=334;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 2845.00, 1260.00, 1, 0 FROM _order_map om WHERE om.orig_idx=331;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 780.00, 1200.00, 1, 0 FROM _order_map om WHERE om.orig_idx=332;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 900.00, 610.00, 1, 0 FROM _order_map om WHERE om.orig_idx=333;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 620.00, 1010.00, 1, 0 FROM _order_map om WHERE om.orig_idx=330;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1328.00, 688.00, 2, 1 FROM _order_map om WHERE om.orig_idx=334;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 898.00, 372.00, 1, 1 FROM _order_map om WHERE om.orig_idx=331;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1100.00, 325.00, 1, 1 FROM _order_map om WHERE om.orig_idx=330;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '3,1,3 НЕ/БЯЛО 4ММ', 1369.00, 1156.00, 1, 2 FROM _order_map om WHERE om.orig_idx=331;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1130.00, 2220.00, 1, 2 FROM _order_map om WHERE om.orig_idx=334;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1738.00, 1156.00, 1, 3 FROM _order_map om WHERE om.orig_idx=331;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ЗЕЛЕНО 4ММ', 1062.00, 587.00, 1, 3 FROM _order_map om WHERE om.orig_idx=334;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1090.00, 650.00, 1, 0 FROM _order_map om WHERE om.orig_idx=339;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 590.00, 390.00, 1, 0 FROM _order_map om WHERE om.orig_idx=337;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 900.00, 1990.00, 1, 0 FROM _order_map om WHERE om.orig_idx=335;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 2030.00, 1165.00, 1, 0 FROM _order_map om WHERE om.orig_idx=338;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 762.00, 1970.00, 1, 0 FROM _order_map om WHERE om.orig_idx=336;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРГОН 3-ЕН', 1300.00, 650.00, 1, 1 FROM _order_map om WHERE om.orig_idx=339;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 690.00, 570.00, 1, 0 FROM _order_map om WHERE om.orig_idx=342;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1205.00, 645.00, 1, 0 FROM _order_map om WHERE om.orig_idx=341;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 2082.00, 430.00, 2, 0 FROM _order_map om WHERE om.orig_idx=343;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 680.00, 640.00, 1, 0 FROM _order_map om WHERE om.orig_idx=340;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КОПЧЕ', 710.00, 640.00, 1, 1 FROM _order_map om WHERE om.orig_idx=340;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1980.00, 1930.00, 1, 0 FROM _order_map om WHERE om.orig_idx=346;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1547.00, 1090.00, 1, 0 FROM _order_map om WHERE om.orig_idx=348;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 600.00, 1183.00, 1, 0 FROM _order_map om WHERE om.orig_idx=344;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 100.00, 1202.00, 2, 0 FROM _order_map om WHERE om.orig_idx=349;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 1255.00, 835.00, 1, 0 FROM _order_map om WHERE om.orig_idx=345;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1980.00, 1930.00, 1, 0 FROM _order_map om WHERE om.orig_idx=347;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1478.00, 592.00, 4, 0 FROM _order_map om WHERE om.orig_idx=350;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1172.00, 289.00, 1, 1 FROM _order_map om WHERE om.orig_idx=350;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1970.00, 1160.00, 1, 2 FROM _order_map om WHERE om.orig_idx=350;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 1470.00, 630.00, 1, 0 FROM _order_map om WHERE om.orig_idx=353;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 885.00, 2140.00, 1, 0 FROM _order_map om WHERE om.orig_idx=351;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРГОН 2-ЕН', 2020.00, 955.00, 1, 0 FROM _order_map om WHERE om.orig_idx=354;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 1290.00, 650.00, 4, 0 FROM _order_map om WHERE om.orig_idx=352;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1645.00, 1495.00, 1, 0 FROM _order_map om WHERE om.orig_idx=356;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 765.00, 1010.00, 8, 0 FROM _order_map om WHERE om.orig_idx=355;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1368.00, 662.00, 1, 0 FROM _order_map om WHERE om.orig_idx=357;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1685.00, 955.00, 1, 1 FROM _order_map om WHERE om.orig_idx=354;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КОПЧЕ', 820.00, 630.00, 1, 1 FROM _order_map om WHERE om.orig_idx=353;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 176.00, 933.00, 3, 1 FROM _order_map om WHERE om.orig_idx=356;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 562.00, 2465.00, 1, 1 FROM _order_map om WHERE om.orig_idx=351;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 1364.00, 955.00, 1, 2 FROM _order_map om WHERE om.orig_idx=354;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 468.00, 2477.00, 2, 2 FROM _order_map om WHERE om.orig_idx=351;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1736.00, 915.00, 3, 2 FROM _order_map om WHERE om.orig_idx=356;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 2380.00, 955.00, 1, 3 FROM _order_map om WHERE om.orig_idx=354;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВОЛИНЕЕН КАНТ 4ММ', 460.00, 2497.00, 1, 3 FROM _order_map om WHERE om.orig_idx=351;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРКА / КРЪГ', 582.00, 2502.00, 1, 4 FROM _order_map om WHERE om.orig_idx=351;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 6ММ', 2052.00, 955.00, 1, 4 FROM _order_map om WHERE om.orig_idx=354;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1812.00, 485.00, 1, 5 FROM _order_map om WHERE om.orig_idx=351;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 538.00, 578.00, 1, 0 FROM _order_map om WHERE om.orig_idx=365;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 900.00, 2000.00, 1, 0 FROM _order_map om WHERE om.orig_idx=363;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 300.00, 300.00, 20, 0 FROM _order_map om WHERE om.orig_idx=362;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 434.00, 951.00, 5, 0 FROM _order_map om WHERE om.orig_idx=359;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1305.00, 678.00, 6, 0 FROM _order_map om WHERE om.orig_idx=358;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1220.00, 1120.00, 1, 0 FROM _order_map om WHERE om.orig_idx=367;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ОГЛ 4ММ/БЯЛО 4ММ', 2405.00, 650.00, 1, 0 FROM _order_map om WHERE om.orig_idx=360;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 799.00, 478.00, 1, 0 FROM _order_map om WHERE om.orig_idx=361;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 2200.00, 800.00, 2, 0 FROM _order_map om WHERE om.orig_idx=366;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КРИЗЕТ 4ММ', 1047.00, 344.00, 6, 0 FROM _order_map om WHERE om.orig_idx=364;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 10ММ', 2200.00, 800.00, 1, 1 FROM _order_map om WHERE om.orig_idx=366;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1028.00, 330.00, 6, 1 FROM _order_map om WHERE om.orig_idx=364;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ/МАТ 4ММ', 500.00, 400.00, 1, 1 FROM _order_map om WHERE om.orig_idx=358;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 600.00, 400.00, 10, 1 FROM _order_map om WHERE om.orig_idx=362;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ГАМА/ПАНТА', 2100.00, 800.00, 4, 2 FROM _order_map om WHERE om.orig_idx=366;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 2002.00, 872.00, 1, 3 FROM _order_map om WHERE om.orig_idx=366;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КОПЧЕ', 1400.00, 806.00, 2, 4 FROM _order_map om WHERE om.orig_idx=366;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'СТОПСОЛ 4ММ/БЯЛО 4ММ', 1782.00, 795.00, 4, 0 FROM _order_map om WHERE om.orig_idx=369;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 2700.00, 1300.00, 1, 0 FROM _order_map om WHERE om.orig_idx=370;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 657.00, 2310.00, 1, 0 FROM _order_map om WHERE om.orig_idx=371;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1146.00, 454.00, 1, 0 FROM _order_map om WHERE om.orig_idx=368;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МАТ 4ММ/МАТ 4ММ', 505.00, 665.00, 1, 0 FROM _order_map om WHERE om.orig_idx=372;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1782.00, 705.00, 1, 1 FROM _order_map om WHERE om.orig_idx=369;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 990.00, 805.00, 2, 0 FROM _order_map om WHERE om.orig_idx=377;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 2-ЕН', 1255.00, 620.00, 1, 0 FROM _order_map om WHERE om.orig_idx=375;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО/БЯЛО 4,1,4', 2365.00, 1085.00, 3, 0 FROM _order_map om WHERE om.orig_idx=374;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1275.00, 625.00, 1, 0 FROM _order_map om WHERE om.orig_idx=379;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 5ММ', 1043.00, 404.00, 1, 0 FROM _order_map om WHERE om.orig_idx=373;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 170.00, 170.00, 3, 0 FROM _order_map om WHERE om.orig_idx=378;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1068.00, 1192.00, 1, 0 FROM _order_map om WHERE om.orig_idx=376;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1138.00, 308.00, 1, 1 FROM _order_map om WHERE om.orig_idx=373;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 2365.00, 980.00, 2, 1 FROM _order_map om WHERE om.orig_idx=374;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 1065.00, 465.00, 1, 0 FROM _order_map om WHERE om.orig_idx=381;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 740.00, 685.00, 2, 0 FROM _order_map om WHERE om.orig_idx=382;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 6ММ', 395.00, 762.00, 4, 0 FROM _order_map om WHERE om.orig_idx=380;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1028.00, 730.00, 1, 0 FROM _order_map om WHERE om.orig_idx=383;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 525.00, 700.00, 1, 0 FROM _order_map om WHERE om.orig_idx=391;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 1705.00, 623.00, 1, 0 FROM _order_map om WHERE om.orig_idx=390;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 390.00, 770.00, 8, 0 FROM _order_map om WHERE om.orig_idx=387;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 3-ЕН', 1115.00, 500.00, 1, 0 FROM _order_map om WHERE om.orig_idx=385;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 2243.00, 793.00, 2, 0 FROM _order_map om WHERE om.orig_idx=386;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 2-ЕН', 1200.00, 574.00, 1, 0 FROM _order_map om WHERE om.orig_idx=388;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 200.00, 1244.00, 1, 0 FROM _order_map om WHERE om.orig_idx=389;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 6ММ', 3032.00, 1972.00, 1, 0 FROM _order_map om WHERE om.orig_idx=384;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 10ММ', 2343.00, 743.00, 1, 1 FROM _order_map om WHERE om.orig_idx=386;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 743.00, 2366.00, 1, 2 FROM _order_map om WHERE om.orig_idx=386;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 196.00, 905.00, 1, 0 FROM _order_map om WHERE om.orig_idx=396;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 3130.00, 700.00, 1, 0 FROM _order_map om WHERE om.orig_idx=392;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 3130.00, 700.00, 1, 0 FROM _order_map om WHERE om.orig_idx=395;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 559.00, 329.00, 1, 0 FROM _order_map om WHERE om.orig_idx=397;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 2476.00, 475.00, 1, 0 FROM _order_map om WHERE om.orig_idx=393;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 2545.00, 887.00, 1, 0 FROM _order_map om WHERE om.orig_idx=394;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '3,1,3/НЕ 6ММ', 1792.00, 698.00, 1, 1 FROM _order_map om WHERE om.orig_idx=397;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 1818.00, 203.00, 1, 2 FROM _order_map om WHERE om.orig_idx=397;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 5,1,5', 920.00, 100.00, 2, 0 FROM _order_map om WHERE om.orig_idx=399;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'СТОПСОЛ 4ММ/БЯЛО 4ММ', 2556.00, 806.00, 1, 0 FROM _order_map om WHERE om.orig_idx=403;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 620.00, 170.00, 1, 0 FROM _order_map om WHERE om.orig_idx=405;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 597.00, 420.00, 1, 0 FROM _order_map om WHERE om.orig_idx=400;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 530.00, 1790.00, 1, 0 FROM _order_map om WHERE om.orig_idx=402;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 1180.00, 628.00, 1, 0 FROM _order_map om WHERE om.orig_idx=404;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 1750.00, 375.00, 1, 0 FROM _order_map om WHERE om.orig_idx=401;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРГОН 2-ЕН', 1150.00, 568.00, 1, 0 FROM _order_map om WHERE om.orig_idx=398;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1730.00, 198.00, 1, 1 FROM _order_map om WHERE om.orig_idx=401;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1955.00, 433.00, 2, 2 FROM _order_map om WHERE om.orig_idx=401;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1298.00, 528.00, 1, 3 FROM _order_map om WHERE om.orig_idx=401;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1720.00, 665.00, 1, 4 FROM _order_map om WHERE om.orig_idx=401;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 2060.00, 1090.00, 1, 5 FROM _order_map om WHERE om.orig_idx=401;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 6ММ', 555.00, 647.00, 2, 6 FROM _order_map om WHERE om.orig_idx=401;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1210.00, 425.00, 1, 0 FROM _order_map om WHERE om.orig_idx=411;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1830.00, 490.00, 2, 0 FROM _order_map om WHERE om.orig_idx=407;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР 2-ЕН ВЕНТИЛАТОР', 450.00, 1350.00, 1, 0 FROM _order_map om WHERE om.orig_idx=408;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 850.00, 2340.00, 1, 0 FROM _order_map om WHERE om.orig_idx=409;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ/БЯЛО 4 ММ', 1360.00, 530.00, 2, 0 FROM _order_map om WHERE om.orig_idx=410;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 578.00, 697.00, 1, 0 FROM _order_map om WHERE om.orig_idx=416;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 3,1,3', 1840.00, 413.00, 2, 0 FROM _order_map om WHERE om.orig_idx=412;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВОЛИНЕЕН КАНТ 4ММ', 800.00, 1600.00, 1, 0 FROM _order_map om WHERE om.orig_idx=413;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1860.00, 620.00, 1, 0 FROM _order_map om WHERE om.orig_idx=414;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4,1,4', 372.00, 723.00, 1, 0 FROM _order_map om WHERE om.orig_idx=415;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 5ММ', 430.00, 290.00, 1, 0 FROM _order_map om WHERE om.orig_idx=406;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 372.00, 826.00, 1, 1 FROM _order_map om WHERE om.orig_idx=415;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 500.00, 535.00, 2, 1 FROM _order_map om WHERE om.orig_idx=410;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ/МАТ 4ММ', 840.00, 330.00, 1, 1 FROM _order_map om WHERE om.orig_idx=411;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 381.00, 261.00, 1, 1 FROM _order_map om WHERE om.orig_idx=406;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 700.00, 300.00, 1, 2 FROM _order_map om WHERE om.orig_idx=410;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 900.00, 560.00, 1, 3 FROM _order_map om WHERE om.orig_idx=410;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 990.00, 535.00, 1, 4 FROM _order_map om WHERE om.orig_idx=410;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА БРОНЗЕ 4ММ', 1340.00, 340.00, 1, 5 FROM _order_map om WHERE om.orig_idx=410;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 700.00, 540.00, 1, 6 FROM _order_map om WHERE om.orig_idx=410;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1588.00, 598.00, 2, 0 FROM _order_map om WHERE om.orig_idx=419;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 315.00, 330.00, 2, 0 FROM _order_map om WHERE om.orig_idx=423;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 1044.00, 656.00, 1, 0 FROM _order_map om WHERE om.orig_idx=417;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1665.00, 1710.00, 1, 0 FROM _order_map om WHERE om.orig_idx=421;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1098.00, 522.00, 1, 0 FROM _order_map om WHERE om.orig_idx=418;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/МАТ 4ММ', 377.00, 697.00, 1, 0 FROM _order_map om WHERE om.orig_idx=420;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 5ММ', 597.00, 1018.00, 1, 0 FROM _order_map om WHERE om.orig_idx=422;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 766.00, 2000.00, 1, 0 FROM _order_map om WHERE om.orig_idx=425;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 62.00, 1735.00, 1, 0 FROM _order_map om WHERE om.orig_idx=424;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БРОНЗЕ, СИВО 4ММ', 395.00, 2629.00, 1, 1 FROM _order_map om WHERE om.orig_idx=424;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 408.00, 448.00, 1, 1 FROM _order_map om WHERE om.orig_idx=417;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1278.00, 944.00, 1, 1 FROM _order_map om WHERE om.orig_idx=418;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1218.00, 768.00, 2, 0 FROM _order_map om WHERE om.orig_idx=431;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 2130.00, 660.00, 2, 0 FROM _order_map om WHERE om.orig_idx=429;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 1993.00, 630.00, 1, 0 FROM _order_map om WHERE om.orig_idx=427;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 143.00, 810.00, 2, 0 FROM _order_map om WHERE om.orig_idx=430;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 2043.00, 485.00, 3, 0 FROM _order_map om WHERE om.orig_idx=428;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1064.00, 317.00, 2, 0 FROM _order_map om WHERE om.orig_idx=426;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 1993.00, 93.00, 1, 1 FROM _order_map om WHERE om.orig_idx=427;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВОЛИНЕЕН КАНТ 4ММ', 785.00, 785.00, 2, 0 FROM _order_map om WHERE om.orig_idx=433;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ДЕЛТА ГРИС 4ММ/ДЕЛТА ГРИС 4ММ', 930.00, 675.00, 1, 0 FROM _order_map om WHERE om.orig_idx=434;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4ММ/БЯЛО 4 ММ', 438.00, 638.00, 1, 0 FROM _order_map om WHERE om.orig_idx=432;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ДЕЛТА ГРИС 4ММ/ДЕЛТА ГРИС 4ММ', 1765.00, 635.00, 1, 1 FROM _order_map om WHERE om.orig_idx=434;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРКА / КРЪГ', 585.00, 585.00, 3, 1 FROM _order_map om WHERE om.orig_idx=433;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/СИВО/БРОНЗЕ 4ММ', 1895.00, 1598.00, 1, 1 FROM _order_map om WHERE om.orig_idx=432;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МАТ 4ММ/МАТ 4ММ', 1731.00, 543.00, 1, 2 FROM _order_map om WHERE om.orig_idx=434;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 670.00, 365.00, 1, 0 FROM _order_map om WHERE om.orig_idx=439;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 985.00, 2000.00, 1, 0 FROM _order_map om WHERE om.orig_idx=437;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1857.00, 545.00, 1, 0 FROM _order_map om WHERE om.orig_idx=436;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1450.00, 1445.00, 1, 0 FROM _order_map om WHERE om.orig_idx=435;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1299.00, 598.00, 1, 0 FROM _order_map om WHERE om.orig_idx=438;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1869.00, 352.00, 2, 0 FROM _order_map om WHERE om.orig_idx=443;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 1740.00, 950.00, 1, 0 FROM _order_map om WHERE om.orig_idx=450;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 855.00, 925.00, 1, 0 FROM _order_map om WHERE om.orig_idx=446;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 598.00, 2695.00, 1, 0 FROM _order_map om WHERE om.orig_idx=445;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'СТОПСОЛ 4 ММ/СТОПСОЛ 4 ММ', 1775.00, 740.00, 1, 0 FROM _order_map om WHERE om.orig_idx=444;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 498.00, 943.00, 1, 0 FROM _order_map om WHERE om.orig_idx=451;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 975.00, 2190.00, 1, 0 FROM _order_map om WHERE om.orig_idx=440;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 702.00, 1268.00, 1, 0 FROM _order_map om WHERE om.orig_idx=441;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1692.00, 900.00, 3, 0 FROM _order_map om WHERE om.orig_idx=447;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 510.00, 2383.00, 2, 0 FROM _order_map om WHERE om.orig_idx=448;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 5ММ', 230.00, 222.00, 2, 0 FROM _order_map om WHERE om.orig_idx=442;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 1139.00, 882.00, 1, 0 FROM _order_map om WHERE om.orig_idx=449;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 1715.00, 495.00, 1, 1 FROM _order_map om WHERE om.orig_idx=444;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1298.00, 973.00, 1, 1 FROM _order_map om WHERE om.orig_idx=443;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1033.00, 460.00, 2, 1 FROM _order_map om WHERE om.orig_idx=440;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРКА 2-ЕН', 1018.00, 372.00, 2, 2 FROM _order_map om WHERE om.orig_idx=440;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 520.00, 255.00, 2, 2 FROM _order_map om WHERE om.orig_idx=444;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 329.00, 898.00, 1, 3 FROM _order_map om WHERE om.orig_idx=440;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 216.00, 698.00, 1, 4 FROM _order_map om WHERE om.orig_idx=440;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'АРГОН 3-ЕН', 650.00, 1100.00, 1, 0 FROM _order_map om WHERE om.orig_idx=455;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БРОНЗЕ/СИВО/ЗЕЛЕНО 6ММ', 1725.00, 335.00, 1, 0 FROM _order_map om WHERE om.orig_idx=452;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 2700.00, 2450.00, 1, 0 FROM _order_map om WHERE om.orig_idx=453;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1468.00, 1111.00, 2, 0 FROM _order_map om WHERE om.orig_idx=454;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БРОНЗЕ/СИВО/ЗЕЛЕНО 4ММ', 467.00, 1597.00, 1, 0 FROM _order_map om WHERE om.orig_idx=456;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1055.00, 2185.00, 1, 0 FROM _order_map om WHERE om.orig_idx=457;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БРОНЗЕ/СИВО/ЗЕЛЕНО 5ММ', 1381.00, 646.00, 1, 0 FROM _order_map om WHERE om.orig_idx=458;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ХИМИЧЕСКИ МАТ БРОНЗЕ 4ММ', 1606.00, 496.00, 2, 1 FROM _order_map om WHERE om.orig_idx=458;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1253.00, 609.00, 2, 1 FROM _order_map om WHERE om.orig_idx=457;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 2700.00, 1400.00, 2, 0 FROM _order_map om WHERE om.orig_idx=462;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'СТОПСОЛ 6ММ/БЯЛО 6ММ', 780.00, 1679.00, 1, 0 FROM _order_map om WHERE om.orig_idx=461;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 390.00, 770.00, 2, 0 FROM _order_map om WHERE om.orig_idx=460;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 437.00, 177.00, 1, 0 FROM _order_map om WHERE om.orig_idx=459;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ/БЯЛО 4ММ', 1180.00, 525.00, 2, 0 FROM _order_map om WHERE om.orig_idx=463;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 980.00, 1679.00, 1, 1 FROM _order_map om WHERE om.orig_idx=461;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1248.00, 597.00, 2, 2 FROM _order_map om WHERE om.orig_idx=461;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МФ 4ММ', 1185.00, 500.00, 2, 0 FROM _order_map om WHERE om.orig_idx=465;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4 ММ/БЯЛО 4ММ/3.3.1 КА', 2160.00, 650.00, 1, 0 FROM _order_map om WHERE om.orig_idx=464;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 420.00, 2133.00, 1, 0 FROM _order_map om WHERE om.orig_idx=467;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 3-ЕН', 1188.00, 551.00, 1, 0 FROM _order_map om WHERE om.orig_idx=466;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1385.00, 540.00, 1, 0 FROM _order_map om WHERE om.orig_idx=470;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 498.00, 798.00, 1, 0 FROM _order_map om WHERE om.orig_idx=471;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 343.00, 648.00, 1, 0 FROM _order_map om WHERE om.orig_idx=469;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 445.00, 434.00, 4, 0 FROM _order_map om WHERE om.orig_idx=468;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1310.00, 330.00, 1, 1 FROM _order_map om WHERE om.orig_idx=471;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 2093.00, 405.00, 1, 0 FROM _order_map om WHERE om.orig_idx=472;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 355.00, 355.00, 2, 0 FROM _order_map om WHERE om.orig_idx=476;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 2-ЕН', 2300.00, 847.00, 1, 0 FROM _order_map om WHERE om.orig_idx=474;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 370.00, 505.00, 1, 0 FROM _order_map om WHERE om.orig_idx=475;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '4,1,4,/4,1,4', 2114.00, 2684.00, 1, 0 FROM _order_map om WHERE om.orig_idx=473;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '3,3,1 ка/БЯЛО 4 ММ/МФ 6', 1244.00, 588.00, 1, 1 FROM _order_map om WHERE om.orig_idx=473;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 457.00, 465.00, 1, 1 FROM _order_map om WHERE om.orig_idx=472;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 1550.00, 1280.00, 1, 1 FROM _order_map om WHERE om.orig_idx=476;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/СИВО/БРОНЗЕ 4ММ', 1895.00, 1598.00, 1, 1 FROM _order_map om WHERE om.orig_idx=475;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ШЛАЙФ', 1244.00, 588.00, 1, 2 FROM _order_map om WHERE om.orig_idx=473;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 2093.00, 457.00, 1, 2 FROM _order_map om WHERE om.orig_idx=472;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 1860.00, 850.00, 1, 2 FROM _order_map om WHERE om.orig_idx=476;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 2143.00, 694.00, 1, 3 FROM _order_map om WHERE om.orig_idx=472;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', '4 сезона', 1272.00, 1267.00, 1, 3 FROM _order_map om WHERE om.orig_idx=473;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1760.00, 570.00, 1, 3 FROM _order_map om WHERE om.orig_idx=476;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1255.00, 462.00, 2, 4 FROM _order_map om WHERE om.orig_idx=473;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 2143.00, 705.00, 1, 4 FROM _order_map om WHERE om.orig_idx=472;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1255.00, 345.00, 1, 5 FROM _order_map om WHERE om.orig_idx=473;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 900.00, 465.00, 2, 6 FROM _order_map om WHERE om.orig_idx=473;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 1096.00, 535.00, 1, 0 FROM _order_map om WHERE om.orig_idx=477;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1245.00, 632.00, 1, 0 FROM _order_map om WHERE om.orig_idx=481;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 240.00, 2124.00, 1, 0 FROM _order_map om WHERE om.orig_idx=482;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КЛИЪР ВИЖЪН 4ММ', 1330.00, 575.00, 1, 0 FROM _order_map om WHERE om.orig_idx=483;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 8ММ', 1220.00, 1800.00, 4, 0 FROM _order_map om WHERE om.orig_idx=484;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'НЕ 4ММ/БЯЛО 4ММ', 720.00, 810.00, 1, 0 FROM _order_map om WHERE om.orig_idx=478;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 4ММ', 1000.00, 850.00, 1, 0 FROM _order_map om WHERE om.orig_idx=479;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 795.00, 2490.00, 5, 0 FROM _order_map om WHERE om.orig_idx=480;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 700.00, 830.00, 1, 0 FROM _order_map om WHERE om.orig_idx=485;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1580.00, 810.00, 1, 1 FROM _order_map om WHERE om.orig_idx=478;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 10ММ', 783.00, 2490.00, 5, 1 FROM _order_map om WHERE om.orig_idx=480;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 10ММ', 700.00, 860.00, 1, 1 FROM _order_map om WHERE om.orig_idx=485;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛЕН 2-ЕН', 1245.00, 632.00, 1, 1 FROM _order_map om WHERE om.orig_idx=481;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 1330.00, 145.00, 1, 1 FROM _order_map om WHERE om.orig_idx=483;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 8ММ', 965.00, 950.00, 4, 1 FROM _order_map om WHERE om.orig_idx=484;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1055.00, 775.00, 1, 2 FROM _order_map om WHERE om.orig_idx=481;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'КЛИЪР ВИЖЪН 6ММ', 235.00, 602.00, 3, 2 FROM _order_map om WHERE om.orig_idx=483;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф45', 602.00, 2490.00, 5, 2 FROM _order_map om WHERE om.orig_idx=480;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 8ММ', 1520.00, 810.00, 4, 2 FROM _order_map om WHERE om.orig_idx=484;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 184.00, 158.00, 3, 3 FROM _order_map om WHERE om.orig_idx=483;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 1600.00, 700.00, 4, 3 FROM _order_map om WHERE om.orig_idx=484;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'R ДО 50 ММ', 1900.00, 950.00, 4, 4 FROM _order_map om WHERE om.orig_idx=484;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ФОЛИРАНЕ С ДВЕ ФОЛИА', 1535.00, 766.00, 4, 5 FROM _order_map om WHERE om.orig_idx=484;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 1900.00, 543.00, 4, 6 FROM _order_map om WHERE om.orig_idx=484;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'БЯЛО 10ММ', 2614.00, 960.00, 1, 7 FROM _order_map om WHERE om.orig_idx=484;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 234.00, 435.00, 1, 0 FROM _order_map om WHERE om.orig_idx=489;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'КА 4ММ/БЯЛО 4ММ/МАТ 4ММ', 1409.00, 379.00, 2, 0 FROM _order_map om WHERE om.orig_idx=491;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', '3,1,3КА/БЯЛО 4ММ/МФ 4ММ', 2295.00, 756.00, 1, 0 FROM _order_map om WHERE om.orig_idx=490;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 700.00, 1000.00, 1, 0 FROM _order_map om WHERE om.orig_idx=487;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 6ММ', 90.00, 283.00, 5, 0 FROM _order_map om WHERE om.orig_idx=488;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОГЛЕДАЛО БЯЛО 4ММ', 1000.00, 2427.00, 1, 0 FROM _order_map om WHERE om.orig_idx=486;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'R ДО 50 ММ', 1600.00, 300.00, 2, 1 FROM _order_map om WHERE om.orig_idx=487;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/МАТ 4ММ', 1725.00, 1002.00, 2, 1 FROM _order_map om WHERE om.orig_idx=490;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'НЕПРАВИЛНА ФОРМА / СКОСЯВАНИЯ', 1974.00, 435.00, 1, 1 FROM _order_map om WHERE om.orig_idx=489;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 4ММ', 542.00, 1630.00, 1, 1 FROM _order_map om WHERE om.orig_idx=486;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/ДЕЛТА ГРИС 4ММ', 727.00, 617.00, 1, 0 FROM _order_map om WHERE om.orig_idx=493;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ПРАВОЛИНЕЕН КАНТ 10ММ', 2196.00, 270.00, 1, 0 FROM _order_map om WHERE om.orig_idx=494;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'МФ 4ММ/БЯЛО 4ММ', 1115.00, 720.00, 2, 0 FROM _order_map om WHERE om.orig_idx=492;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ТОПЪЛ ДИСТАНЦИОНЕР 2-ЕН', 515.00, 1820.00, 2, 0 FROM _order_map om WHERE om.orig_idx=495;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ЗАКАЛЯВАНЕ ФЛОАТ 10ММ', 2557.00, 883.00, 1, 1 FROM _order_map om WHERE om.orig_idx=494;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ГАМА/ПАНТА', 2100.00, 900.00, 1, 2 FROM _order_map om WHERE om.orig_idx=494;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'единично_стъкло', 'ОТВОР Ф16', 453.00, 906.00, 1, 3 FROM _order_map om WHERE om.orig_idx=494;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'БЯЛО 4ММ/БЯЛО 4 ММ', 197.00, 797.00, 1, 0 FROM _order_map om WHERE om.orig_idx=496;
INSERT INTO order_items (order_id, product_type, product_desc, width, height, qty, sort_order) SELECT om.new_id, 'стъклопакет', 'ОГЛ 4ММ/ОГЛ 4ММ', 1792.00, 665.00, 1, 1 FROM _order_map om WHERE om.orig_idx=496;

-- Insert cost records
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 67.00 FROM _order_map om WHERE om.orig_idx=0 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 434.20 FROM _order_map om WHERE om.orig_idx=1 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 633.30 FROM _order_map om WHERE om.orig_idx=2 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 179.20 FROM _order_map om WHERE om.orig_idx=3 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 80.00 FROM _order_map om WHERE om.orig_idx=4 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 133.30 FROM _order_map om WHERE om.orig_idx=5 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 8.80 FROM _order_map om WHERE om.orig_idx=6 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 50.30 FROM _order_map om WHERE om.orig_idx=7 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 599.90 FROM _order_map om WHERE om.orig_idx=8 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 72.50 FROM _order_map om WHERE om.orig_idx=9 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 32.80 FROM _order_map om WHERE om.orig_idx=10 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 486.30 FROM _order_map om WHERE om.orig_idx=11 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 0.00 FROM _order_map om WHERE om.orig_idx=12 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.90 FROM _order_map om WHERE om.orig_idx=13 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 28.50 FROM _order_map om WHERE om.orig_idx=14 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 13.50 FROM _order_map om WHERE om.orig_idx=15 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 35.90 FROM _order_map om WHERE om.orig_idx=16 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 62.40 FROM _order_map om WHERE om.orig_idx=17 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 0.00 FROM _order_map om WHERE om.orig_idx=18 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 50.70 FROM _order_map om WHERE om.orig_idx=19 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 184.50 FROM _order_map om WHERE om.orig_idx=20 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 11.50 FROM _order_map om WHERE om.orig_idx=21 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 72.50 FROM _order_map om WHERE om.orig_idx=22 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 54.30 FROM _order_map om WHERE om.orig_idx=23 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 180.40 FROM _order_map om WHERE om.orig_idx=24 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 8.80 FROM _order_map om WHERE om.orig_idx=25 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 78.40 FROM _order_map om WHERE om.orig_idx=26 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 16.90 FROM _order_map om WHERE om.orig_idx=27 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 26.80 FROM _order_map om WHERE om.orig_idx=28 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 686.50 FROM _order_map om WHERE om.orig_idx=29 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 60.30 FROM _order_map om WHERE om.orig_idx=30 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 19.70 FROM _order_map om WHERE om.orig_idx=31 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 37.70 FROM _order_map om WHERE om.orig_idx=32 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 828.30 FROM _order_map om WHERE om.orig_idx=33 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 47.50 FROM _order_map om WHERE om.orig_idx=34 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 20.70 FROM _order_map om WHERE om.orig_idx=35 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 3.80 FROM _order_map om WHERE om.orig_idx=36 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 287.00 FROM _order_map om WHERE om.orig_idx=37 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.70 FROM _order_map om WHERE om.orig_idx=38 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 10.50 FROM _order_map om WHERE om.orig_idx=39 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.10 FROM _order_map om WHERE om.orig_idx=40 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1606.50 FROM _order_map om WHERE om.orig_idx=41 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 25.80 FROM _order_map om WHERE om.orig_idx=42 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 15.40 FROM _order_map om WHERE om.orig_idx=43 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 31.00 FROM _order_map om WHERE om.orig_idx=44 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.80 FROM _order_map om WHERE om.orig_idx=45 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 31.30 FROM _order_map om WHERE om.orig_idx=46 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 8.50 FROM _order_map om WHERE om.orig_idx=47 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 4.70 FROM _order_map om WHERE om.orig_idx=48 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 3.40 FROM _order_map om WHERE om.orig_idx=49 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 98.90 FROM _order_map om WHERE om.orig_idx=50 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 80.30 FROM _order_map om WHERE om.orig_idx=51 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 57.90 FROM _order_map om WHERE om.orig_idx=52 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 2369.60 FROM _order_map om WHERE om.orig_idx=53 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 13.90 FROM _order_map om WHERE om.orig_idx=54 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 24.70 FROM _order_map om WHERE om.orig_idx=55 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 62.10 FROM _order_map om WHERE om.orig_idx=56 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 54.60 FROM _order_map om WHERE om.orig_idx=57 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 26.10 FROM _order_map om WHERE om.orig_idx=58 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 204.10 FROM _order_map om WHERE om.orig_idx=59 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 30.10 FROM _order_map om WHERE om.orig_idx=60 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 238.80 FROM _order_map om WHERE om.orig_idx=61 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 32.00 FROM _order_map om WHERE om.orig_idx=62 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 460.20 FROM _order_map om WHERE om.orig_idx=63 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 126.50 FROM _order_map om WHERE om.orig_idx=64 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 207.60 FROM _order_map om WHERE om.orig_idx=65 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 50.80 FROM _order_map om WHERE om.orig_idx=66 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 59.00 FROM _order_map om WHERE om.orig_idx=67 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 161.10 FROM _order_map om WHERE om.orig_idx=68 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 4.00 FROM _order_map om WHERE om.orig_idx=69 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 167.00 FROM _order_map om WHERE om.orig_idx=70 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 39.00 FROM _order_map om WHERE om.orig_idx=71 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 500.60 FROM _order_map om WHERE om.orig_idx=72 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 14.50 FROM _order_map om WHERE om.orig_idx=73 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 19.10 FROM _order_map om WHERE om.orig_idx=74 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 29.30 FROM _order_map om WHERE om.orig_idx=75 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 39.20 FROM _order_map om WHERE om.orig_idx=76 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 17.80 FROM _order_map om WHERE om.orig_idx=77 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 2301.50 FROM _order_map om WHERE om.orig_idx=78 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 45.90 FROM _order_map om WHERE om.orig_idx=79 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 893.20 FROM _order_map om WHERE om.orig_idx=80 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 501.40 FROM _order_map om WHERE om.orig_idx=81 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 111.00 FROM _order_map om WHERE om.orig_idx=82 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 93.20 FROM _order_map om WHERE om.orig_idx=83 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 26.30 FROM _order_map om WHERE om.orig_idx=84 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 39.30 FROM _order_map om WHERE om.orig_idx=85 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 11.60 FROM _order_map om WHERE om.orig_idx=86 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 3595.60 FROM _order_map om WHERE om.orig_idx=87 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 9.10 FROM _order_map om WHERE om.orig_idx=88 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 8.10 FROM _order_map om WHERE om.orig_idx=89 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 62.10 FROM _order_map om WHERE om.orig_idx=90 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 66.40 FROM _order_map om WHERE om.orig_idx=91 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.40 FROM _order_map om WHERE om.orig_idx=92 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 103.70 FROM _order_map om WHERE om.orig_idx=93 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 13.30 FROM _order_map om WHERE om.orig_idx=94 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 78.00 FROM _order_map om WHERE om.orig_idx=95 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 5.00 FROM _order_map om WHERE om.orig_idx=96 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 34.30 FROM _order_map om WHERE om.orig_idx=97 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 19.40 FROM _order_map om WHERE om.orig_idx=98 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 46.10 FROM _order_map om WHERE om.orig_idx=99 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 20.60 FROM _order_map om WHERE om.orig_idx=100 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 21.50 FROM _order_map om WHERE om.orig_idx=101 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 197.00 FROM _order_map om WHERE om.orig_idx=102 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 45.00 FROM _order_map om WHERE om.orig_idx=103 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1.80 FROM _order_map om WHERE om.orig_idx=104 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 9.30 FROM _order_map om WHERE om.orig_idx=105 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 16.90 FROM _order_map om WHERE om.orig_idx=106 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 50.50 FROM _order_map om WHERE om.orig_idx=107 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 929.00 FROM _order_map om WHERE om.orig_idx=108 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1118.40 FROM _order_map om WHERE om.orig_idx=109 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 101.50 FROM _order_map om WHERE om.orig_idx=110 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 239.90 FROM _order_map om WHERE om.orig_idx=111 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 19.20 FROM _order_map om WHERE om.orig_idx=112 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 19.40 FROM _order_map om WHERE om.orig_idx=113 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 83.60 FROM _order_map om WHERE om.orig_idx=114 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 72.80 FROM _order_map om WHERE om.orig_idx=115 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 298.10 FROM _order_map om WHERE om.orig_idx=116 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 28.80 FROM _order_map om WHERE om.orig_idx=117 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 88.80 FROM _order_map om WHERE om.orig_idx=118 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 6.30 FROM _order_map om WHERE om.orig_idx=119 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 11.60 FROM _order_map om WHERE om.orig_idx=120 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 11.90 FROM _order_map om WHERE om.orig_idx=121 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 27.10 FROM _order_map om WHERE om.orig_idx=122 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 11.50 FROM _order_map om WHERE om.orig_idx=123 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 110.20 FROM _order_map om WHERE om.orig_idx=124 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 14.90 FROM _order_map om WHERE om.orig_idx=125 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 155.30 FROM _order_map om WHERE om.orig_idx=126 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 209.00 FROM _order_map om WHERE om.orig_idx=127 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 30.70 FROM _order_map om WHERE om.orig_idx=128 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 20.10 FROM _order_map om WHERE om.orig_idx=129 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 417.50 FROM _order_map om WHERE om.orig_idx=130 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 29.50 FROM _order_map om WHERE om.orig_idx=131 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 38.00 FROM _order_map om WHERE om.orig_idx=132 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 116.20 FROM _order_map om WHERE om.orig_idx=133 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 391.20 FROM _order_map om WHERE om.orig_idx=134 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 149.60 FROM _order_map om WHERE om.orig_idx=135 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 149.60 FROM _order_map om WHERE om.orig_idx=136 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 490.40 FROM _order_map om WHERE om.orig_idx=137 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 692.00 FROM _order_map om WHERE om.orig_idx=138 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 163.80 FROM _order_map om WHERE om.orig_idx=139 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 15.10 FROM _order_map om WHERE om.orig_idx=140 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.90 FROM _order_map om WHERE om.orig_idx=141 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.30 FROM _order_map om WHERE om.orig_idx=142 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.40 FROM _order_map om WHERE om.orig_idx=143 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 42.40 FROM _order_map om WHERE om.orig_idx=144 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 44.50 FROM _order_map om WHERE om.orig_idx=145 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 28.60 FROM _order_map om WHERE om.orig_idx=146 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 82.80 FROM _order_map om WHERE om.orig_idx=147 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 23.00 FROM _order_map om WHERE om.orig_idx=148 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 211.10 FROM _order_map om WHERE om.orig_idx=149 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1307.60 FROM _order_map om WHERE om.orig_idx=150 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1286.20 FROM _order_map om WHERE om.orig_idx=151 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 898.00 FROM _order_map om WHERE om.orig_idx=152 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 55.60 FROM _order_map om WHERE om.orig_idx=153 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 22.40 FROM _order_map om WHERE om.orig_idx=154 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 11.20 FROM _order_map om WHERE om.orig_idx=155 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 276.70 FROM _order_map om WHERE om.orig_idx=156 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 21.30 FROM _order_map om WHERE om.orig_idx=157 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 13.10 FROM _order_map om WHERE om.orig_idx=158 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 6.90 FROM _order_map om WHERE om.orig_idx=159 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1.00 FROM _order_map om WHERE om.orig_idx=160 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 271.90 FROM _order_map om WHERE om.orig_idx=161 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 11.20 FROM _order_map om WHERE om.orig_idx=162 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 283.80 FROM _order_map om WHERE om.orig_idx=163 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 511.80 FROM _order_map om WHERE om.orig_idx=164 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 56.00 FROM _order_map om WHERE om.orig_idx=165 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 18.10 FROM _order_map om WHERE om.orig_idx=166 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 86.40 FROM _order_map om WHERE om.orig_idx=167 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 114.00 FROM _order_map om WHERE om.orig_idx=168 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 8.50 FROM _order_map om WHERE om.orig_idx=169 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.70 FROM _order_map om WHERE om.orig_idx=170 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 19.40 FROM _order_map om WHERE om.orig_idx=171 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1018.00 FROM _order_map om WHERE om.orig_idx=172 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 3.00 FROM _order_map om WHERE om.orig_idx=173 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1398.00 FROM _order_map om WHERE om.orig_idx=174 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 2258.00 FROM _order_map om WHERE om.orig_idx=175 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 6.50 FROM _order_map om WHERE om.orig_idx=176 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 467.10 FROM _order_map om WHERE om.orig_idx=177 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 78.30 FROM _order_map om WHERE om.orig_idx=178 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 33.80 FROM _order_map om WHERE om.orig_idx=179 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 2160.60 FROM _order_map om WHERE om.orig_idx=180 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 10.70 FROM _order_map om WHERE om.orig_idx=181 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 17.10 FROM _order_map om WHERE om.orig_idx=182 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 6.40 FROM _order_map om WHERE om.orig_idx=183 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 26.00 FROM _order_map om WHERE om.orig_idx=184 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 28.70 FROM _order_map om WHERE om.orig_idx=185 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 16.70 FROM _order_map om WHERE om.orig_idx=186 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 571.90 FROM _order_map om WHERE om.orig_idx=187 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.60 FROM _order_map om WHERE om.orig_idx=188 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 158.80 FROM _order_map om WHERE om.orig_idx=189 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 15.40 FROM _order_map om WHERE om.orig_idx=190 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 3.00 FROM _order_map om WHERE om.orig_idx=191 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 100.40 FROM _order_map om WHERE om.orig_idx=192 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1379.20 FROM _order_map om WHERE om.orig_idx=193 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 234.90 FROM _order_map om WHERE om.orig_idx=194 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 22.70 FROM _order_map om WHERE om.orig_idx=195 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 43.80 FROM _order_map om WHERE om.orig_idx=196 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 168.70 FROM _order_map om WHERE om.orig_idx=197 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 52.00 FROM _order_map om WHERE om.orig_idx=198 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 47.10 FROM _order_map om WHERE om.orig_idx=199 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 25.40 FROM _order_map om WHERE om.orig_idx=200 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 20.80 FROM _order_map om WHERE om.orig_idx=201 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 29.60 FROM _order_map om WHERE om.orig_idx=202 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 39.50 FROM _order_map om WHERE om.orig_idx=203 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 11.10 FROM _order_map om WHERE om.orig_idx=204 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 17.90 FROM _order_map om WHERE om.orig_idx=205 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 39.60 FROM _order_map om WHERE om.orig_idx=206 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 664.20 FROM _order_map om WHERE om.orig_idx=207 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 271.30 FROM _order_map om WHERE om.orig_idx=208 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 47.50 FROM _order_map om WHERE om.orig_idx=209 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 186.20 FROM _order_map om WHERE om.orig_idx=210 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 10.60 FROM _order_map om WHERE om.orig_idx=211 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 38.10 FROM _order_map om WHERE om.orig_idx=212 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 60.90 FROM _order_map om WHERE om.orig_idx=213 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.00 FROM _order_map om WHERE om.orig_idx=214 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 5.90 FROM _order_map om WHERE om.orig_idx=215 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 6.70 FROM _order_map om WHERE om.orig_idx=216 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 696.40 FROM _order_map om WHERE om.orig_idx=217 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 50.50 FROM _order_map om WHERE om.orig_idx=218 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 11.30 FROM _order_map om WHERE om.orig_idx=219 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 64.10 FROM _order_map om WHERE om.orig_idx=220 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 132.20 FROM _order_map om WHERE om.orig_idx=221 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 20.20 FROM _order_map om WHERE om.orig_idx=222 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 119.90 FROM _order_map om WHERE om.orig_idx=223 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 64.80 FROM _order_map om WHERE om.orig_idx=224 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 786.20 FROM _order_map om WHERE om.orig_idx=225 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 52.40 FROM _order_map om WHERE om.orig_idx=226 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 74.40 FROM _order_map om WHERE om.orig_idx=227 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 33.20 FROM _order_map om WHERE om.orig_idx=228 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 172.00 FROM _order_map om WHERE om.orig_idx=229 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 20.40 FROM _order_map om WHERE om.orig_idx=230 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 163.70 FROM _order_map om WHERE om.orig_idx=231 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 120.80 FROM _order_map om WHERE om.orig_idx=232 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 10.90 FROM _order_map om WHERE om.orig_idx=233 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 8.70 FROM _order_map om WHERE om.orig_idx=234 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.10 FROM _order_map om WHERE om.orig_idx=235 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 34.00 FROM _order_map om WHERE om.orig_idx=236 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 64.90 FROM _order_map om WHERE om.orig_idx=237 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 133.00 FROM _order_map om WHERE om.orig_idx=238 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 5.90 FROM _order_map om WHERE om.orig_idx=239 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 395.20 FROM _order_map om WHERE om.orig_idx=240 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 162.70 FROM _order_map om WHERE om.orig_idx=241 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 50.50 FROM _order_map om WHERE om.orig_idx=242 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 16.00 FROM _order_map om WHERE om.orig_idx=243 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 5.40 FROM _order_map om WHERE om.orig_idx=244 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 173.80 FROM _order_map om WHERE om.orig_idx=245 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 20.70 FROM _order_map om WHERE om.orig_idx=246 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1693.00 FROM _order_map om WHERE om.orig_idx=247 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 37.50 FROM _order_map om WHERE om.orig_idx=248 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 88.40 FROM _order_map om WHERE om.orig_idx=249 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 367.90 FROM _order_map om WHERE om.orig_idx=250 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 86.70 FROM _order_map om WHERE om.orig_idx=251 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 4.70 FROM _order_map om WHERE om.orig_idx=252 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 79.80 FROM _order_map om WHERE om.orig_idx=253 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 90.30 FROM _order_map om WHERE om.orig_idx=254 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 91.10 FROM _order_map om WHERE om.orig_idx=255 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 242.10 FROM _order_map om WHERE om.orig_idx=256 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 28.90 FROM _order_map om WHERE om.orig_idx=257 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 283.80 FROM _order_map om WHERE om.orig_idx=258 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 166.10 FROM _order_map om WHERE om.orig_idx=259 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 45.50 FROM _order_map om WHERE om.orig_idx=260 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 408.60 FROM _order_map om WHERE om.orig_idx=261 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 29.00 FROM _order_map om WHERE om.orig_idx=262 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 486.50 FROM _order_map om WHERE om.orig_idx=263 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 544.00 FROM _order_map om WHERE om.orig_idx=264 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 195.00 FROM _order_map om WHERE om.orig_idx=265 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 55.60 FROM _order_map om WHERE om.orig_idx=266 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 9.90 FROM _order_map om WHERE om.orig_idx=267 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 29.00 FROM _order_map om WHERE om.orig_idx=268 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 68.20 FROM _order_map om WHERE om.orig_idx=269 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 252.00 FROM _order_map om WHERE om.orig_idx=270 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 85.20 FROM _order_map om WHERE om.orig_idx=271 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 6.80 FROM _order_map om WHERE om.orig_idx=272 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 17.20 FROM _order_map om WHERE om.orig_idx=273 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 10.70 FROM _order_map om WHERE om.orig_idx=274 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 142.50 FROM _order_map om WHERE om.orig_idx=275 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 103.80 FROM _order_map om WHERE om.orig_idx=276 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 2.00 FROM _order_map om WHERE om.orig_idx=277 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 38.10 FROM _order_map om WHERE om.orig_idx=278 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 94.10 FROM _order_map om WHERE om.orig_idx=279 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 324.80 FROM _order_map om WHERE om.orig_idx=280 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 208.00 FROM _order_map om WHERE om.orig_idx=281 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 18.50 FROM _order_map om WHERE om.orig_idx=282 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 14.00 FROM _order_map om WHERE om.orig_idx=283 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 42.10 FROM _order_map om WHERE om.orig_idx=284 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 122.90 FROM _order_map om WHERE om.orig_idx=285 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 4.70 FROM _order_map om WHERE om.orig_idx=286 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 89.40 FROM _order_map om WHERE om.orig_idx=287 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 4.00 FROM _order_map om WHERE om.orig_idx=288 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 16.60 FROM _order_map om WHERE om.orig_idx=289 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1107.10 FROM _order_map om WHERE om.orig_idx=290 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 107.70 FROM _order_map om WHERE om.orig_idx=291 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 29.90 FROM _order_map om WHERE om.orig_idx=292 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 194.00 FROM _order_map om WHERE om.orig_idx=293 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 25.90 FROM _order_map om WHERE om.orig_idx=294 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 45.80 FROM _order_map om WHERE om.orig_idx=295 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1775.30 FROM _order_map om WHERE om.orig_idx=296 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 24.20 FROM _order_map om WHERE om.orig_idx=297 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 59.90 FROM _order_map om WHERE om.orig_idx=298 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 25.20 FROM _order_map om WHERE om.orig_idx=299 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1490.50 FROM _order_map om WHERE om.orig_idx=300 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 674.90 FROM _order_map om WHERE om.orig_idx=301 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 47.30 FROM _order_map om WHERE om.orig_idx=302 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 162.40 FROM _order_map om WHERE om.orig_idx=303 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 79.70 FROM _order_map om WHERE om.orig_idx=304 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 15.80 FROM _order_map om WHERE om.orig_idx=305 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 52.70 FROM _order_map om WHERE om.orig_idx=306 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 23.10 FROM _order_map om WHERE om.orig_idx=307 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 644.30 FROM _order_map om WHERE om.orig_idx=308 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 102.30 FROM _order_map om WHERE om.orig_idx=309 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 318.40 FROM _order_map om WHERE om.orig_idx=310 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 3037.30 FROM _order_map om WHERE om.orig_idx=311 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 14.80 FROM _order_map om WHERE om.orig_idx=312 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 25.50 FROM _order_map om WHERE om.orig_idx=313 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 9.90 FROM _order_map om WHERE om.orig_idx=314 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 8.60 FROM _order_map om WHERE om.orig_idx=315 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 94.80 FROM _order_map om WHERE om.orig_idx=316 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 183.90 FROM _order_map om WHERE om.orig_idx=317 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 3333.60 FROM _order_map om WHERE om.orig_idx=318 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1.80 FROM _order_map om WHERE om.orig_idx=319 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 8.90 FROM _order_map om WHERE om.orig_idx=320 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 81.40 FROM _order_map om WHERE om.orig_idx=321 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 63.70 FROM _order_map om WHERE om.orig_idx=322 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 3.60 FROM _order_map om WHERE om.orig_idx=323 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 312.90 FROM _order_map om WHERE om.orig_idx=324 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.50 FROM _order_map om WHERE om.orig_idx=325 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 39.90 FROM _order_map om WHERE om.orig_idx=326 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 19.80 FROM _order_map om WHERE om.orig_idx=327 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 35.80 FROM _order_map om WHERE om.orig_idx=328 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 9.20 FROM _order_map om WHERE om.orig_idx=329 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 13.70 FROM _order_map om WHERE om.orig_idx=330 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 147.50 FROM _order_map om WHERE om.orig_idx=331 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 23.00 FROM _order_map om WHERE om.orig_idx=332 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 14.70 FROM _order_map om WHERE om.orig_idx=333 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 23.10 FROM _order_map om WHERE om.orig_idx=334 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 76.30 FROM _order_map om WHERE om.orig_idx=335 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 45.70 FROM _order_map om WHERE om.orig_idx=336 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 79.30 FROM _order_map om WHERE om.orig_idx=337 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 168.90 FROM _order_map om WHERE om.orig_idx=338 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 4400.10 FROM _order_map om WHERE om.orig_idx=339 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 74.10 FROM _order_map om WHERE om.orig_idx=340 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 6.40 FROM _order_map om WHERE om.orig_idx=341 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 226.90 FROM _order_map om WHERE om.orig_idx=342 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 91.00 FROM _order_map om WHERE om.orig_idx=343 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 113.90 FROM _order_map om WHERE om.orig_idx=344 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 23.30 FROM _order_map om WHERE om.orig_idx=345 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 129.60 FROM _order_map om WHERE om.orig_idx=346 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 138.00 FROM _order_map om WHERE om.orig_idx=347 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 52.90 FROM _order_map om WHERE om.orig_idx=348 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 18.80 FROM _order_map om WHERE om.orig_idx=349 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 3.80 FROM _order_map om WHERE om.orig_idx=350 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 50.00 FROM _order_map om WHERE om.orig_idx=351 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 29.00 FROM _order_map om WHERE om.orig_idx=352 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 85.40 FROM _order_map om WHERE om.orig_idx=353 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 10172.70 FROM _order_map om WHERE om.orig_idx=354 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 2.90 FROM _order_map om WHERE om.orig_idx=355 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 108.90 FROM _order_map om WHERE om.orig_idx=356 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 118.50 FROM _order_map om WHERE om.orig_idx=357 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 455.10 FROM _order_map om WHERE om.orig_idx=358 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 22.00 FROM _order_map om WHERE om.orig_idx=359 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1262.00 FROM _order_map om WHERE om.orig_idx=360 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 136.90 FROM _order_map om WHERE om.orig_idx=361 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 106.70 FROM _order_map om WHERE om.orig_idx=362 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 52.40 FROM _order_map om WHERE om.orig_idx=363 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.60 FROM _order_map om WHERE om.orig_idx=364 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 6.40 FROM _order_map om WHERE om.orig_idx=365 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 454.30 FROM _order_map om WHERE om.orig_idx=366 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 176.40 FROM _order_map om WHERE om.orig_idx=367 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 122.20 FROM _order_map om WHERE om.orig_idx=368 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 28.40 FROM _order_map om WHERE om.orig_idx=369 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 60.60 FROM _order_map om WHERE om.orig_idx=370 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 36.50 FROM _order_map om WHERE om.orig_idx=371 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 74.20 FROM _order_map om WHERE om.orig_idx=372 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 5697.80 FROM _order_map om WHERE om.orig_idx=373 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 13.60 FROM _order_map om WHERE om.orig_idx=374 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 197.90 FROM _order_map om WHERE om.orig_idx=375 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 2356.70 FROM _order_map om WHERE om.orig_idx=376 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 35.30 FROM _order_map om WHERE om.orig_idx=377 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 41.50 FROM _order_map om WHERE om.orig_idx=378 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 45.20 FROM _order_map om WHERE om.orig_idx=379 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 5.00 FROM _order_map om WHERE om.orig_idx=380 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 43.10 FROM _order_map om WHERE om.orig_idx=381 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 226.60 FROM _order_map om WHERE om.orig_idx=382 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 370.20 FROM _order_map om WHERE om.orig_idx=383 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 97.50 FROM _order_map om WHERE om.orig_idx=384 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 98.20 FROM _order_map om WHERE om.orig_idx=385 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 168.00 FROM _order_map om WHERE om.orig_idx=386 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 15.70 FROM _order_map om WHERE om.orig_idx=387 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 28.40 FROM _order_map om WHERE om.orig_idx=388 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 11.40 FROM _order_map om WHERE om.orig_idx=389 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 46.00 FROM _order_map om WHERE om.orig_idx=390 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 15.90 FROM _order_map om WHERE om.orig_idx=391 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 94.30 FROM _order_map om WHERE om.orig_idx=392 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 33.90 FROM _order_map om WHERE om.orig_idx=393 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 101.10 FROM _order_map om WHERE om.orig_idx=394 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 103.30 FROM _order_map om WHERE om.orig_idx=395 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 144.80 FROM _order_map om WHERE om.orig_idx=396 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 148.10 FROM _order_map om WHERE om.orig_idx=397 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 70.50 FROM _order_map om WHERE om.orig_idx=398 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 605.00 FROM _order_map om WHERE om.orig_idx=399 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 9.50 FROM _order_map om WHERE om.orig_idx=400 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 9.90 FROM _order_map om WHERE om.orig_idx=401 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 8.00 FROM _order_map om WHERE om.orig_idx=402 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1100.90 FROM _order_map om WHERE om.orig_idx=403 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 89.00 FROM _order_map om WHERE om.orig_idx=404 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 28.20 FROM _order_map om WHERE om.orig_idx=405 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1.60 FROM _order_map om WHERE om.orig_idx=406 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 90.10 FROM _order_map om WHERE om.orig_idx=407 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 29.40 FROM _order_map om WHERE om.orig_idx=408 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 38.30 FROM _order_map om WHERE om.orig_idx=409 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 31.70 FROM _order_map om WHERE om.orig_idx=410 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 339.60 FROM _order_map om WHERE om.orig_idx=411 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 478.20 FROM _order_map om WHERE om.orig_idx=412 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 24.30 FROM _order_map om WHERE om.orig_idx=413 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 17.50 FROM _order_map om WHERE om.orig_idx=414 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1104.50 FROM _order_map om WHERE om.orig_idx=415 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 14.80 FROM _order_map om WHERE om.orig_idx=416 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 14.60 FROM _order_map om WHERE om.orig_idx=417 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 91.70 FROM _order_map om WHERE om.orig_idx=418 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 120.60 FROM _order_map om WHERE om.orig_idx=419 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 37.40 FROM _order_map om WHERE om.orig_idx=420 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 3.90 FROM _order_map om WHERE om.orig_idx=421 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 14.90 FROM _order_map om WHERE om.orig_idx=422 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.10 FROM _order_map om WHERE om.orig_idx=423 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.30 FROM _order_map om WHERE om.orig_idx=424 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 19.40 FROM _order_map om WHERE om.orig_idx=425 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 14.40 FROM _order_map om WHERE om.orig_idx=426 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 81.40 FROM _order_map om WHERE om.orig_idx=427 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 82.10 FROM _order_map om WHERE om.orig_idx=428 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 564.00 FROM _order_map om WHERE om.orig_idx=429 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 66.90 FROM _order_map om WHERE om.orig_idx=430 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1125.60 FROM _order_map om WHERE om.orig_idx=431 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.80 FROM _order_map om WHERE om.orig_idx=432 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 40.00 FROM _order_map om WHERE om.orig_idx=433 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 43.10 FROM _order_map om WHERE om.orig_idx=434 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 22.70 FROM _order_map om WHERE om.orig_idx=435 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 58.00 FROM _order_map om WHERE om.orig_idx=436 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 36.30 FROM _order_map om WHERE om.orig_idx=437 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 67.30 FROM _order_map om WHERE om.orig_idx=438 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 16.20 FROM _order_map om WHERE om.orig_idx=439 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 17.40 FROM _order_map om WHERE om.orig_idx=440 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 27.50 FROM _order_map om WHERE om.orig_idx=441 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 10.40 FROM _order_map om WHERE om.orig_idx=442 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 6.90 FROM _order_map om WHERE om.orig_idx=443 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.00 FROM _order_map om WHERE om.orig_idx=444 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 64.50 FROM _order_map om WHERE om.orig_idx=445 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 34.10 FROM _order_map om WHERE om.orig_idx=446 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 325.90 FROM _order_map om WHERE om.orig_idx=447 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 63.80 FROM _order_map om WHERE om.orig_idx=448 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 73.00 FROM _order_map om WHERE om.orig_idx=449 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 4.80 FROM _order_map om WHERE om.orig_idx=450 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 216.30 FROM _order_map om WHERE om.orig_idx=451 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.40 FROM _order_map om WHERE om.orig_idx=452 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 285.10 FROM _order_map om WHERE om.orig_idx=453 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 463.10 FROM _order_map om WHERE om.orig_idx=454 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 41.90 FROM _order_map om WHERE om.orig_idx=455 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 9.90 FROM _order_map om WHERE om.orig_idx=456 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 13.70 FROM _order_map om WHERE om.orig_idx=457 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 9.30 FROM _order_map om WHERE om.orig_idx=458 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 79.90 FROM _order_map om WHERE om.orig_idx=459 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 71.20 FROM _order_map om WHERE om.orig_idx=460 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 19.80 FROM _order_map om WHERE om.orig_idx=461 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 90.10 FROM _order_map om WHERE om.orig_idx=462 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.50 FROM _order_map om WHERE om.orig_idx=463 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 21.90 FROM _order_map om WHERE om.orig_idx=464 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 51.70 FROM _order_map om WHERE om.orig_idx=465 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 32.50 FROM _order_map om WHERE om.orig_idx=466 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 9.60 FROM _order_map om WHERE om.orig_idx=467 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 64.80 FROM _order_map om WHERE om.orig_idx=468 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 87.90 FROM _order_map om WHERE om.orig_idx=469 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 101.70 FROM _order_map om WHERE om.orig_idx=470 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1.80 FROM _order_map om WHERE om.orig_idx=471 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 42.50 FROM _order_map om WHERE om.orig_idx=472 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 62.40 FROM _order_map om WHERE om.orig_idx=473 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1271.40 FROM _order_map om WHERE om.orig_idx=474 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 34.40 FROM _order_map om WHERE om.orig_idx=475 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 465.30 FROM _order_map om WHERE om.orig_idx=476 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 21.70 FROM _order_map om WHERE om.orig_idx=477 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 12.80 FROM _order_map om WHERE om.orig_idx=478 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 0.00 FROM _order_map om WHERE om.orig_idx=479 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1270.70 FROM _order_map om WHERE om.orig_idx=480 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 24.10 FROM _order_map om WHERE om.orig_idx=481 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 13.20 FROM _order_map om WHERE om.orig_idx=482 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.70 FROM _order_map om WHERE om.orig_idx=483 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 2.90 FROM _order_map om WHERE om.orig_idx=484 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 100.30 FROM _order_map om WHERE om.orig_idx=485 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 10.10 FROM _order_map om WHERE om.orig_idx=486 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 30.20 FROM _order_map om WHERE om.orig_idx=487 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 19.50 FROM _order_map om WHERE om.orig_idx=488 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 23.30 FROM _order_map om WHERE om.orig_idx=489 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 111.90 FROM _order_map om WHERE om.orig_idx=490 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 1200.90 FROM _order_map om WHERE om.orig_idx=491 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 22.40 FROM _order_map om WHERE om.orig_idx=492 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 7.90 FROM _order_map om WHERE om.orig_idx=493 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 359.30 FROM _order_map om WHERE om.orig_idx=494 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 285.20 FROM _order_map om WHERE om.orig_idx=495 ON CONFLICT DO NOTHING;
INSERT INTO order_costs (order_id, material_cost) SELECT om.new_id, 149.20 FROM _order_map om WHERE om.orig_idx=496 ON CONFLICT DO NOTHING;

DROP TABLE _client_map, _order_map;
