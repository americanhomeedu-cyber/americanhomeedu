-- Seed FAQ + testimonials for the featured course.
-- NOTE: testimonials are PLACEHOLDER copy for design — replace with real ones
-- before launch (per the design brief).

insert into public.faq_items (course_id, question, answer, position)
select c.id, q.question, q.answer, q.position
from public.courses c
cross join (values
  ('Как долго у меня будет доступ к курсу?',
   'Доступ навсегда. Покупаете один раз и возвращаетесь к материалам в любой момент — без подписок и ограничений по времени.', 1),
  ('Подходит ли курс, если я только планирую переезд?',
   'Да. Большой блок посвящён подготовке финансов и credit score заранее — это лучше всего начинать ещё до переезда.', 2),
  ('Нужна ли грин-карта или гражданство, чтобы купить дом?',
   'Нет. Купить недвижимость в США можно с разными статусами. В курсе разбираем доступные варианты и нюансы mortgage для каждого случая.', 3),
  ('На каком языке материалы?',
   'Полностью на русском — видеоуроки, тексты, чек-листы и PDF. Сложные термины объясняются простым языком.', 4),
  ('Что входит в курс?',
   'Видеоуроки, текстовые материалы, чек-листы и PDF по всем этапам: финансы, mortgage и pre-approval, выбор района, offers, inspection, closing и инвестиционная стратегия.', 5),
  ('Можно ли вернуть деньги?',
   'Да, действует гарантия возврата в течение 30 дней. Если курс вам не подошёл — напишите в поддержку.', 6)
) as q(question, answer, position)
where c.slug = 'american-home-blueprint';

insert into public.testimonials (course_id, name, city, rating, text, tag, position)
select c.id, t.name, t.city, t.rating, t.text, t.tag, t.position
from public.courses c
cross join (values
  ('Марина К.', 'Charlotte, NC', 5,
   'Переехали год назад и думали, что покупка дома — это нереально. После курса прошли pre-approval и купили дом в пригороде Шарлотты. Каждый шаг был понятен.', 'Купили дом', 1),
  ('Дмитрий и Оля', 'Raleigh, NC', 5,
   'Самое ценное — блок про credit score. Подтянули кредит за несколько месяцев и получили ставку лучше, чем ожидали. Спасибо, Алла!', 'Релокация', 2),
  ('Елена С.', 'Atlanta, GA', 5,
   'Боялась переговоров и инспекции. Курс разложил всё по полочкам — чувствовала себя уверенно даже в multiple offers ситуации.', 'First-time buyer', 3),
  ('Сергей Н.', 'Charlotte, NC', 5,
   'Брал курс с прицелом на инвестиции. Раздел про Airbnb и расчёт доходности окупил стоимость курса с первой же сделки.', 'Инвестиции', 4)
) as t(name, city, rating, text, tag, position)
where c.slug = 'american-home-blueprint';
