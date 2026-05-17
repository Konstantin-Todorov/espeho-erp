import { useState } from 'react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATUSES = [
  {
    key: 'НОВА',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
    label: 'Нова',
    who: 'Офис',
    description: 'Поръчката е въведена в системата. Все още не е изпратена за подготовка.',
    next: 'Офисът преглежда детайлите и пуска поръчката към следващ статус.',
  },
  {
    key: 'МАТЕРИАЛИ',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-400',
    label: 'Подготовка на материали',
    who: 'Склад / Офис',
    description: 'Складът подготвя необходимите материали — стъкло, профили, химикали и др.',
    next: 'Когато материалите са готови, офисът пуска поръчката в производство.',
  },
  {
    key: 'ПРОИЗВОДСТВО',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    dot: 'bg-orange-400',
    label: 'В производство',
    who: 'Производство',
    description: 'Поръчката е в цеха. Производствените работници изпълняват етапите последователно.',
    next: 'Когато всички производствени етапи са завършени, офисът маркира поръчката като готова.',
  },
  {
    key: 'ГОТОВА',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    dot: 'bg-green-400',
    label: 'Готова за доставка',
    who: 'Офис',
    description: 'Производството е приключено. Поръчката чака да бъде взета или доставена на клиента.',
    next: 'След доставката офисът потвърждава и поръчката преминава в ДОСТАВЕНА.',
  },
  {
    key: 'ДОСТАВЕНА',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    dot: 'bg-gray-400',
    label: 'Доставена',
    who: 'Офис',
    description: 'Поръчката е предадена на клиента. Приходът се отчита в репортите.',
    next: '—',
  },
  {
    key: 'ОТКАЗАНА',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
    label: 'Отказана',
    who: 'Офис / Администратор',
    description: 'Поръчката е отказана — от клиента или поради друга причина. Не влиза в приходите.',
    next: '—',
  },
]

const ROLES = [
  {
    name: 'Администратор',
    key: 'admin',
    emoji: '👑',
    color: 'text-accent border-accent/30 bg-accent/5',
    dotColor: 'bg-accent',
    tagColor: 'bg-accent/10 text-accent border-accent/20',
    summary: 'Пълен достъп до всичко. Вижда всички финансови данни, управлява потребителите.',
    workflow: [
      'Следи дашборда — активни поръчки, приход, марж, брак',
      'Управлява потребителите — добавя, редактира, задава роли и почасови ставки',
      'Вижда себестойността на всяка поръчка и маржа на печалба',
      'Одобрява решения за бракувани продукти (преработка или скрап)',
      'Следи репортите — финансови, производствени, материали',
      'Управлява машинния парк и задава почасовите им разходи',
    ],
  },
  {
    name: 'Офис',
    key: 'office',
    emoji: '🖥️',
    color: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
    dotColor: 'bg-blue-400',
    tagColor: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    summary: 'Управлява поръчките и клиентите. Движи поръчките между статуси. Комуникира с клиенти.',
    workflow: [
      'Добавя нови клиенти и поръчки',
      'Придвижва поръчките: НОВА → МАТЕРИАЛИ → ПРОИЗВОДСТВО → ГОТОВА → ДОСТАВЕНА',
      'Назначава производствени работници по етапи',
      'Изпраща линк за проследяване на поръчката на клиента',
      'Следи просрочените и спешните поръчки',
      'Генерира репорти за поръчки и клиенти',
      'Може да записва работа на производствените работници',
    ],
  },
  {
    name: 'Производство',
    key: 'production',
    emoji: '⚙️',
    color: 'text-orange-400 border-orange-400/30 bg-orange-400/5',
    dotColor: 'bg-orange-400',
    tagColor: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    summary: 'Изпълнява производствените етапи. Записва отработено време. Регистрира брак.',
    workflow: [
      'На дашборда вижда своите задачи за деня — назначени производствени етапи',
      'Отваря поръчката и натиска "Започни" на текущия етап',
      'Изпълнява работата, след което натиска "Завърши ✓"',
      'Записва отработеното време с бутон "+ Запиши работа"',
      'При открит брак регистрира записа с причина и количество',
      'Може да добавя нови производствени етапи ако е необходимо',
    ],
  },
  {
    name: 'Склад',
    key: 'warehouse',
    emoji: '📦',
    color: 'text-green-400 border-green-400/30 bg-green-400/5',
    dotColor: 'bg-green-400',
    tagColor: 'bg-green-400/10 text-green-400 border-green-400/20',
    summary: 'Управлява складовите наличности. Следи кога материалите свършват.',
    workflow: [
      'Следи наличностите — вижда кои материали са под минималното ниво',
      'Добавя нови постъпления на материали (приход)',
      'Изписва материали, използвани в производството',
      'Регистрира доставки от доставчици',
      'Актуализира минималните прагове на материалите',
    ],
  },
]

const STEPS = [
  { n: '1', title: 'Клиентът се обажда или пише', who: 'Офис', color: 'bg-blue-500', text: 'Офис служителят добавя клиента в системата (ако е нов) и въвежда новата поръчка — тип, размери, краен срок, цена.' },
  { n: '2', title: 'Подготовка на материали', who: 'Склад', color: 'bg-yellow-500', text: 'Поръчката получава статус МАТЕРИАЛИ. Складът проверява наличностите и подготвя необходимото. При нужда се поръчва от доставчик.' },
  { n: '3', title: 'Влиза в производство', who: 'Производство', color: 'bg-orange-500', text: 'Офисът пуска поръчката в ПРОИЗВОДСТВО. Работниците виждат своите задачи на дашборда. Всеки етап се маркира — "Започни" и "Завърши".' },
  { n: '4', title: 'Записване на работа', who: 'Производство', color: 'bg-purple-500', text: 'Работниците записват колко минути са работили и по кой етап. Системата изчислява себестойността на труда автоматично.' },
  { n: '5', title: 'Готова за доставка', who: 'Офис', color: 'bg-green-500', text: 'Когато производството приключи, офисът маркира поръчката ГОТОВА. Може да се изпрати линк на клиента да провери статуса.' },
  { n: '6', title: 'Доставка и приключване', who: 'Офис', color: 'bg-gray-400', text: 'След предаване на поръчката — ДОСТАВЕНА. Приходът вече се отчита в репортите и дашборда.' },
]

const NEW_MODULES = [
  { icon: '📄', title: 'Оферти', desc: 'Създавайте оферти за клиенти с позиции и цени. Изпращайте, приемайте или отказвайте. С един клик конвертирайте офертата в поръчка.' },
  { icon: '🖨️', title: 'PDF документи', desc: 'От детайла на всяка поръчка: "🖨️ Лист" генерира Производствен лист, "📄 Бележка" генерира Доставателна бележка. Отваря се в нов таб с бутон за принтиране.' },
  { icon: '🔔', title: 'Известия', desc: 'Камбанката в горния ляв ъгъл показва известия в реално време. Получавате известие при: готова поръчка, просрочена поръчка, ниска наличност.' },
  { icon: '✅', title: 'Контрол на качеството', desc: 'В таб "Контрол" на всяка поръчка — стандартен чеклист (размери, повърхност, запечатване...). Кликнете за проверка. Показва прогрес и кой е проверил.' },
  { icon: '🚚', title: 'Доставки', desc: 'Управлявайте доставките: планирайте дата, шофьор, адрес. Следете статус: Изчаква → В движение → Доставена. Достъпно от страница Доставки или от детайла на поръчката.' },
  { icon: '🏭', title: 'Доставчици и PO', desc: 'Добавяйте доставчици с контактни данни. Създавайте Purchase Orders (PO) с артикули свързани към материали. При получаване автоматично обновява склада.' },
  { icon: '📋', title: 'Клониране', desc: 'Бутон "📋 Клонирай" копира поръчка — запазва всички позиции и производствени етапи. Удобно за повтарящи се поръчки.' },
  { icon: '📊', title: 'Разширени репорти', desc: 'Нови табове в Репорти: "По клиенти" — приход и брой поръчки по клиент с графика. "По тип" — разбивка по тип поръчка с процент успеваемост.' },
]

const FAQ = [
  {
    q: 'Как да добавя нов тип поръчка?',
    a: 'При създаване на поръчка в полето "Тип" може да напишете всичко — полето е свободен текст. Написаното се запомня и предлага при следваща поръчка.',
  },
  {
    q: 'Какво се случва когато маркирам поръчка като ДОСТАВЕНА?',
    a: 'Продажната цена влиза в приходите за месеца (вижда се на дашборда). Поръчката не изчезва — остава в архива и може да бъде намерена при търсене.',
  },
  {
    q: 'Как работи линкът за проследяване?',
    a: 'Всяка поръчка има уникален линк (в дясната колона на детайла). Изпратете го на клиента — той вижда статуса и производствените етапи без да влиза в системата.',
  },
  {
    q: 'Откъде виждам дали работник е на зададен етап?',
    a: 'В таб "Производство" на поръчката, до всеки етап има падащо меню за избор на работник (вижда се само за администратор и офис).',
  },
  {
    q: 'Как да регистрирам брак?',
    a: 'В поръчката → таб "Брак" → "Регистрирай брак". Изберете причина, количество, етап и опишете проблема. Системата изчислява загубата автоматично.',
  },
  {
    q: 'Мога ли да добавя производствен етап след като поръчката е вече в производство?',
    a: 'Да — в таб "Производство" на поръчката има бутон "+ Добави производствен етап" (вижда се за администратор и офис, и когато поръчката е активна).',
  },
  {
    q: 'Какво е "Pipeline" на дашборда?',
    a: 'Очакваният приход от всички активни поръчки (не доставени, не отказани). Показва колко пари се очакват при завършване на текущите задачи.',
  },
  {
    q: 'Как работи модулът Оферти?',
    a: 'Страница Оферти (офис/администратор): създайте оферта с позиции и цени → изпратете на клиента → при приемане натиснете "→ Поръчка" за конвертиране. Всяка оферта може да бъде принтирана като PDF.',
  },
  {
    q: 'Как да получа известие по имейл?',
    a: 'Системата изпраща имейл автоматично при: ГОТОВА поръчка (на клиента, ако има имейл), просрочена поръчка (на офиса/администратора), ниска наличност (на склада). Необходимо е SMTP сървър да е конфигуриран от администратора.',
  },
  {
    q: 'Как работи контролният лист за качество?',
    a: 'В таб "Контрол" на поръчката — при първо отваряне натиснете "Инициализирай" за стандартния чеклист. Кликнете върху всеки елемент за отметка. Системата записва кой и кога е проверил.',
  },
  {
    q: 'Как да клонирам поръчка за повтарящ се клиент?',
    a: 'В детайла на поръчката, натиснете бутон "📋 Клонирай". Системата създава нова поръчка със същите позиции и производствени етапи, но нов номер и статус НОВА.',
  },
  {
    q: 'Как да добавя доставчик и да поръчам материали?',
    a: 'Страница Доставчици: добавете доставчик → таб "Поръчки (PO)" → "Нова PO" → изберете доставчик и добавете артикули (свързани с материали от склада). При получаване натиснете "Получи" — складът се обновява автоматично.',
  },
]

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionTitle({ children }) {
  return <h2 className="text-xl font-bold text-white mb-1">{children}</h2>
}

function SectionSub({ children }) {
  return <p className="text-sm text-muted mb-6">{children}</p>
}

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false)
  return (
    <div className={`border border-border rounded-xl overflow-hidden transition-colors ${open ? 'bg-surface/60' : 'bg-surface/20'}`}>
      <button className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left" onClick={() => setOpen(o => !o)}>
        <span className="font-medium text-white text-sm">{q}</span>
        <svg className={`w-4 h-4 text-muted flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-4">
          <p className="text-sm text-gray-300 leading-relaxed">{a}</p>
        </div>
      )}
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const NAV = [
  { id: 'intro',    label: 'Въведение' },
  { id: 'workflow', label: 'Процес' },
  { id: 'statuses', label: 'Статуси' },
  { id: 'roles',    label: 'Роли' },
  { id: 'faq',      label: 'Въпроси' },
]

export default function Guide() {
  const [active, setActive] = useState('intro')

  const scrollTo = id => {
    setActive(id)
    document.getElementById(`section-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">📘 Ръководство за потребителя</h1>
        <p className="text-muted">Пълно описание на системата — как работи, кой какво прави и как минава всяка поръчка от началото до края.</p>
      </div>

      {/* Sticky nav */}
      <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur-sm border-b border-border mb-8 -mx-4 px-4 py-2 flex gap-1 overflow-x-auto">
        {NAV.map(n => (
          <button key={n.id} onClick={() => scrollTo(n.id)}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
              ${active === n.id ? 'bg-accent text-white' : 'text-muted hover:text-white hover:bg-border'}`}>
            {n.label}
          </button>
        ))}
      </div>

      {/* ── SECTION 1: Въведение ─────────────────────────────────────────────── */}
      <section id="section-intro" className="mb-14">
        <SectionTitle>Какво е тази система?</SectionTitle>
        <SectionSub>Еспехо ERP — управление на производство и поръчки за стъклена дограма</SectionSub>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { icon: '📋', title: 'Поръчки', text: 'Всяка клиентска поръчка се проследява от създаването до доставката. Виждате статуса, крайния срок и производствения напредък в реално време.' },
            { icon: '⚙️', title: 'Производство', text: 'Производствените работници виждат своите задачи и отбелязват кога започват и завършват всеки етап. Записва се отработено време.' },
            { icon: '📊', title: 'Финанси', text: 'Системата изчислява себестойността на всяка поръчка (материали + труд + машини + режийни) и сравнява с продажната цена.' },
          ].map(c => (
            <div key={c.title} className="card">
              <div className="text-3xl mb-3">{c.icon}</div>
              <h3 className="font-semibold text-white mb-2">{c.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="card border-accent/20 bg-accent/5">
          <div className="flex gap-3 items-start">
            <span className="text-2xl">💡</span>
            <div>
              <p className="font-semibold text-white mb-1">Основна идея</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Всяка поръчка минава през <strong className="text-white">6 статуса</strong> — от НОВА до ДОСТАВЕНА.
                Офисът я придвижва между статусите. Производствените работници виждат само своята работа.
                Складът следи материалите. Администраторът вижда всичко — включително финансовите резултати.
              </p>
            </div>
          </div>
        </div>

        {/* New modules */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Нови функции</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NEW_MODULES.map(m => (
              <div key={m.title} className="card hover:border-border/80 transition-colors">
                <div className="flex gap-3 items-start">
                  <span className="text-xl flex-shrink-0">{m.icon}</span>
                  <div>
                    <p className="font-medium text-white text-sm">{m.title}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{m.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SECTION 2: Процес ────────────────────────────────────────────────── */}
      <section id="section-workflow" className="mb-14">
        <SectionTitle>Как минава една поръчка?</SectionTitle>
        <SectionSub>Стъпка по стъпка от телефонния разговор до доставката</SectionSub>

        <div className="space-y-0">
          {STEPS.map((step, i) => (
            <div key={i} className="flex gap-4">
              <div className="flex flex-col items-center flex-shrink-0">
                <div className={`w-10 h-10 rounded-full ${step.color} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
                  {step.n}
                </div>
                {i < STEPS.length - 1 && <div className="w-px flex-1 bg-border my-1 min-h-[2rem]" />}
              </div>
              <div className="pb-6 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-white">{step.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-border text-muted">{step.who}</span>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SECTION 3: Статуси ───────────────────────────────────────────────── */}
      <section id="section-statuses" className="mb-14">
        <SectionTitle>Статуси на поръчките</SectionTitle>
        <SectionSub>Всяка поръчка е точно в един от тези статуси</SectionSub>

        <div className="space-y-3">
          {STATUSES.map(s => (
            <div key={s.key} className={`card border ${s.color.split(' ').find(c => c.startsWith('border-'))}`}>
              <div className="flex items-start gap-4">
                <span className={`w-3 h-3 rounded-full flex-shrink-0 mt-1.5 ${s.dot}`} />
                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap mb-1">
                    <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded-md border ${s.color}`}>{s.key}</span>
                    <span className="text-white font-semibold">{s.label}</span>
                    <span className="text-xs text-muted">Отговорник: {s.who}</span>
                  </div>
                  <p className="text-sm text-gray-300 mb-1">{s.description}</p>
                  {s.next !== '—' && (
                    <p className="text-xs text-muted italic">→ {s.next}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Status flow diagram */}
        <div className="card mt-6 border-border/50">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">Нормален поток</p>
          <div className="flex flex-wrap items-center gap-2">
            {['НОВА','МАТЕРИАЛИ','ПРОИЗВОДСТВО','ГОТОВА','ДОСТАВЕНА'].map((s, i) => {
              const status = STATUSES.find(x => x.key === s)
              return (
                <div key={s} className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${status?.color}`}>{s}</span>
                  {i < 4 && <span className="text-muted text-sm">→</span>}
                </div>
              )
            })}
            <span className="text-muted text-sm ml-2">/ ОТКАЗАНА (от всеки статус)</span>
          </div>
        </div>
      </section>

      {/* ── SECTION 4: Роли ──────────────────────────────────────────────────── */}
      <section id="section-roles" className="mb-14">
        <SectionTitle>Роли и отговорности</SectionTitle>
        <SectionSub>Всеки потребител има точно определена роля с различен достъп</SectionSub>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          {ROLES.map(role => (
            <div key={role.key} className={`card border ${role.color.split(' ').find(c => c.startsWith('border-'))}`}>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl">{role.emoji}</span>
                <div>
                  <h3 className={`font-bold text-lg ${role.color.split(' ')[0]}`}>{role.name}</h3>
                  <p className="text-xs text-muted">{role.summary}</p>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Типичен работен ден:</p>
                <ol className="space-y-1.5">
                  {role.workflow.map((step, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-gray-300">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 border ${role.tagColor}`}>
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ))}
        </div>

        {/* Permissions table */}
        <div className="card">
          <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-4">Матрица на достъпа</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 pr-6 text-muted font-medium">Модул</th>
                  {ROLES.map(r => (
                    <th key={r.key} className={`text-center py-2 px-3 font-medium ${r.color.split(' ')[0]}`}>
                      {r.emoji} {r.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { m: 'Дашборд',      admin: '★ Пълен', office: '★ Пълен', production: 'Мои задачи', warehouse: 'Склад' },
                  { m: 'Поръчки',      admin: '★ Пълен', office: '★ Пълен', production: 'Без цени',   warehouse: 'Без цени' },
                  { m: 'Производство', admin: '★ Пълен', office: '★ Пълен', production: '★ Пълен',    warehouse: '—' },
                  { m: 'Брак',         admin: '★ Пълен', office: '★ Пълен', production: '★ Пълен',    warehouse: '—' },
                  { m: 'Склад',        admin: '★ Пълен', office: '★ Пълен', production: '—',           warehouse: '★ Пълен' },
                  { m: 'Клиенти',      admin: '★ Пълен', office: '★ Пълен', production: '—',           warehouse: '—' },
                  { m: 'Машини',       admin: '★ Пълен', office: '—',        production: '★ Пълен',    warehouse: '—' },
                  { m: 'Репорти',      admin: '★ Пълен', office: 'Без труд', production: '—',           warehouse: '—' },
                  { m: 'Потребители',  admin: '★ Пълен', office: '—',        production: '—',           warehouse: '—' },
                  { m: 'Финанси',      admin: '★ Пълен', office: 'Частично', production: '—',           warehouse: '—' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-surface/40">
                    <td className="py-2.5 pr-6 text-gray-300 font-medium">{row.m}</td>
                    {(['admin','office','production','warehouse']).map(role => (
                      <td key={role} className="text-center py-2.5 px-3">
                        {row[role] === '—'
                          ? <span className="text-muted">—</span>
                          : row[role].startsWith('★')
                            ? <span className="text-green-400 text-xs font-medium">{row[role].replace('★ ','')}</span>
                            : <span className="text-yellow-400 text-xs">{row[role]}</span>
                        }
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── SECTION 5: FAQ ───────────────────────────────────────────────────── */}
      <section id="section-faq" className="mb-14">
        <SectionTitle>Често задавани въпроси</SectionTitle>
        <SectionSub>Отговори на най-честите въпроси при работа със системата</SectionSub>

        <div className="space-y-2">
          {FAQ.map((item, i) => <FAQItem key={i} q={item.q} a={item.a} />)}
        </div>

        <div className="card mt-8 border-border/50 bg-surface/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🛠️</span>
            <div>
              <p className="font-semibold text-white">Имате проблем или въпрос?</p>
              <p className="text-sm text-muted mt-0.5">Свържете се с администратора на системата или пишете в коментарите на съответната поръчка.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
