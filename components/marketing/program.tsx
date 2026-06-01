'use client'

import * as React from 'react'
import { ChevronDown } from 'lucide-react'

// TODO(client): эти модули — маркетинговое описание программы. Можно вынести
// в site_settings/CMS. Фактические разделы курса живут в course_sections.
const MODULES = [
  { tag: 'Старт', title: 'Подготовка финансов и credit score', desc: 'Как привести деньги в порядок и понять, на какой дом вы реально можете рассчитывать.', points: ['Что такое credit score и как его поднять', 'Down payment: сколько копить', 'Debt-to-income ratio простыми словами', 'Подготовка документов заранее'] },
  { tag: 'Финансы', title: 'Mortgage — программы и pre-approval', desc: 'Разбираемся в типах кредитов и получаем pre-approval, чтобы продавцы воспринимали вас всерьёз.', points: ['Conventional, FHA, VA — что выбрать', 'Fixed vs adjustable rate', 'Как получить pre-approval letter', 'Сравнение предложений кредиторов'] },
  { tag: 'Поиск', title: 'Выбор района и поиск дома', desc: 'Как оценивать районы, школы и перспективы, не полагаясь только на красивые фото.', points: ['Анализ района и школьных рейтингов', 'Работа с MLS и Realtor.com', 'Красные флаги при просмотре', 'Чек-лист идеального дома'] },
  { tag: 'Сделка', title: 'Offer, переговоры и контракт', desc: 'Как составить сильное предложение и вести переговоры, не переплачивая.', points: ['Структура грамотного offer', 'Contingencies, которые вас защищают', 'Тактики переговоров о цене', 'Earnest money deposit'] },
  { tag: 'Проверка', title: 'Inspection, appraisal и Due Diligence', desc: 'Самый важный этап защиты: что проверять и как использовать результаты в свою пользу.', points: ['Что входит в home inspection', 'Как читать отчёт инспектора', 'Appraisal и что если оценка ниже', 'Период Due Diligence'] },
  { tag: 'Владение', title: 'HOA, страховка и налоги', desc: 'Скрытые расходы, о которых забывают новички — и как их заранее посчитать.', points: ['Что такое HOA и его правила', 'Homeowners insurance', 'Property taxes по штатам', 'Расчёт реальной ежемесячной стоимости'] },
  { tag: 'Финал', title: 'Closing — получение ключей', desc: 'Последний рывок: документы, итоговые расчёты и долгожданный момент с ключами.', points: ['Closing disclosure построчно', 'Closing costs: кто за что платит', 'Final walkthrough', 'Что взять с собой на closing'] },
  { tag: 'Бонус', title: 'Стратегия создания капитала через недвижимость', desc: 'Как первый дом становится фундаментом долгосрочного благосостояния семьи.', points: ['Equity и как он растёт', 'Refinance в нужный момент', 'От первого дома к инвестициям', 'Налоговые преимущества владельца'] },
]

export function Program() {
  const [open, setOpen] = React.useState(0)

  return (
    <section className="section program" id="program">
      <div className="wrap">
        <div className="section-head reveal">
          <span className="eyebrow center">Программа</span>
          <h2>Что внутри курса</h2>
          <p>
            Все темы, которые проведут вас от мысли «хочу свой дом» до момента
            получения ключей.
          </p>
        </div>
        <div className="modules">
          {MODULES.map((m, i) => {
            const isOpen = open === i
            return (
              <div key={m.title} className={`module reveal${i % 2 ? ' d1' : ''}${isOpen ? ' open' : ''}`}>
                <div className="module-head" onClick={() => setOpen(isOpen ? -1 : i)}>
                  <span className="module-num">{i === MODULES.length - 1 ? '★' : i + 1}</span>
                  <span className="module-title">{m.title}</span>
                  <span className="module-tag">{m.tag}</span>
                  <span className="module-arrow">
                    <ChevronDown size={20} />
                  </span>
                </div>
                <div className="module-body" style={{ maxHeight: isOpen ? 800 : 0 }}>
                  <div className="module-body-inner">
                    <p>{m.desc}</p>
                    <ul className="module-points">
                      {m.points.map((p) => (
                        <li key={p}>
                          <span className="dot" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
