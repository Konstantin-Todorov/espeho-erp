import { useState } from 'react'
import { Banknote, BarChart3, BookOpen, ChevronDown, ClipboardList, Cog, Factory, HardHat, Lightbulb, Maximize2, Monitor, Package, Plus, Ruler, Search, ShieldCheck, Wrench } from 'lucide-react'

// ─── Data ─────────────────────────────────────────────────────────────────────

const STATUSES = [
  {
    key: 'НОВА',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    dot: 'bg-blue-400',
    label: 'Нова',
    who: 'Офис',
    description: 'Поръчката е въведена, но още не е пусната.',
    next: 'Офисът я изпраща за материали или направо в производство („Създай и пусни в цеха“).',
  },
  {
    key: 'МАТЕРИАЛИ',
    color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    dot: 'bg-yellow-400',
    label: 'Чака материали',
    who: 'Склад / Офис',
    description: 'Подготвят се стъкло, рамки, уплътнител. Цехът я вижда като „чака материали“ и още не работи по нея.',
    next: 'Когато материалите са налице, офисът я пуска в производство.',
  },
  {
    key: 'ПРОИЗВОДСТВО',
    color: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    dot: 'bg-orange-400',
    label: 'В производство',
    who: 'Цех',
    description: 'Работниците изпълняват етапите един след друг (рязане, миене, сглобяване…). Етапите се работят само в този статус.',
    next: 'Когато последният етап е „Готово“, поръчката сама става ГОТОВА и офисът получава известие.',
  },
  {
    key: 'ГОТОВА',
    color: 'bg-green-500/20 text-green-400 border-green-500/30',
    dot: 'bg-green-400',
    label: 'Готова',
    who: 'Офис / Склад',
    description: 'Чака клиента да я вземе, доставка или монтаж.',
    next: 'При предаване — ДОСТАВЕНА. Ако доставката се отбележи „Доставена“, поръчката се приключва автоматично.',
  },
  {
    key: 'ДОСТАВЕНА',
    color: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
    dot: 'bg-gray-400',
    label: 'Предадена',
    who: 'Офис',
    description: 'Предадена на клиента. Плащането и монтажът се следят отделно в страницата на поръчката.',
    next: '—',
  },
  {
    key: 'ОТКАЗАНА',
    color: 'bg-red-500/20 text-red-400 border-red-500/30',
    dot: 'bg-red-400',
    label: 'Отказана',
    who: 'Офис / Администратор',
    description: 'Анулирана поръчка (системата иска потвърждение). Не влиза в приходите.',
    next: '—',
  },
]

const ROLES = [
  {
    name: 'Администратор',
    key: 'admin',
    icon: ShieldCheck,
    color: 'text-accent border-accent/30 bg-accent/5',
    dotColor: 'bg-accent',
    tagColor: 'bg-accent/10 text-accent border-accent/20',
    summary: 'Всичко, което прави офисът, плюс потребители, машини и настройки.',
    workflow: [
      'Управлява потребителите — роли, пароли, почасови ставки',
      'В „Настройки“ задава ДДС, надценка и минималната площ за таксуване',
      'Следи отчетите — приходи, себестойност, марж, брак',
      'Поддържа списъка с машини и техните разходи',
    ],
  },
  {
    name: 'Офис',
    key: 'office',
    icon: Monitor,
    color: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
    dotColor: 'bg-blue-400',
    tagColor: 'bg-blue-400/10 text-blue-400 border-blue-400/20',
    summary: 'Клиенти, оферти, поръчки, плащания, доставки. Единствените (с админа), които виждат цени.',
    workflow: [
      'Въвежда поръчки и оферти с бутона „+ Нов“ (горе, от всяка страница)',
      'Придвижва поръчките по статуси и следи просрочените и спешните',
      'Записва плащания и монтаж в страницата на поръчката',
      'Планира доставки и поръчва материали от доставчици',
      'Може да изписва материали от склада към поръчка',
    ],
  },
  {
    name: 'Цех (производство)',
    key: 'production',
    icon: HardHat,
    color: 'text-orange-400 border-orange-400/30 bg-orange-400/5',
    dotColor: 'bg-orange-400',
    tagColor: 'bg-orange-400/10 text-orange-400 border-orange-400/20',
    summary: 'Изпълнява етапите от телефон или таблет. Не вижда цени.',
    workflow: [
      'Отваря Производство → „Моите задачи“: първо тези „В процес“, после „Мои“, после „Свободни“',
      'Натиска „Започни“ — ако е сиво, предишният етап още не е готов',
      'Натиска „Готово“, когато приключи. Последният етап прави поръчката ГОТОВА',
      'Регистрира брак — с отговорния работник и причина',
      'Записва поддръжка на машините',
    ],
  },
  {
    name: 'Склад',
    key: 'warehouse',
    icon: Package,
    color: 'text-green-400 border-green-400/30 bg-green-400/5',
    dotColor: 'bg-green-400',
    tagColor: 'bg-green-400/10 text-green-400 border-green-400/20',
    summary: 'Наличности, приемане на стока, доставки до клиенти.',
    workflow: [
      'Следи таб „Под минимум“ в Склад',
      'Приема стока по поръчка към доставчик — наличността се увеличава автоматично',
      'Записва приход и изписва материали към поръчки',
      'Задава минималната наличност на всеки материал',
      'Отбелязва доставките: Изчаква → В движение → Доставена',
    ],
  },
]

const STEPS = [
  { n: '1', title: 'Запитване и оферта', who: 'Офис', color: 'bg-blue-500', text: '„+ Нов“ → Оферта. Изберете клиента (търсене по име/телефон или „+ Нов клиент“), добавете редове с размери и цена. „→ Поръчка“ превръща офертата в поръчка.' },
  { n: '2', title: 'Поръчка', who: 'Офис', color: 'bg-indigo-500', text: '„+ Нов“ → Поръчка. Всеки ред има мерна единица (€/м², €/л.м., €/бр., сума) — сумата се смята сама. Видът поръчка (стъклопакет / единично / смесена) определя етапите в цеха.' },
  { n: '3', title: 'Материали', who: 'Склад', color: 'bg-yellow-500', text: 'Ако нещо липсва — поръчка към доставчик. При пристигане: „Приеми стоката“ и стоката влиза в склада (може и частично).' },
  { n: '4', title: 'Производство', who: 'Цех', color: 'bg-orange-500', text: 'Офисът пуска поръчката в ПРОИЗВОДСТВО. Работниците виждат етапите в „Моите задачи“ и ги отбелязват „Започни“ / „Готово“.' },
  { n: '5', title: 'Готова', who: 'автоматично', color: 'bg-green-500', text: 'Последният етап прави поръчката ГОТОВА и офисът получава известие. Може да изпратите на клиента линка за проследяване.' },
  { n: '6', title: 'Предаване, плащане, монтаж', who: 'Офис / Склад', color: 'bg-gray-400', text: 'Клиентът взема, доставяме или монтираме. Плащанията (цяло или на части) и монтажът се отбелязват в страницата на поръчката.' },
]

const TIPS = [
  { icon: Plus, title: 'Бутон „+ Нов“', desc: 'Бързо създаване от всяка страница: поръчка, оферта, клиент, доставка, брак, поръчка към доставчик, приемане на стока.' },
  { icon: Banknote, title: 'Цените са с ДДС', desc: 'Всички цени в поръчки и оферти са крайни, с ДДС — както в таблицата. Себестойността е без ДДС.' },
  { icon: Ruler, title: 'Мерни единици', desc: '€/м² — по размерите (Ш × В в мм); €/л.м. — по периметъра (кант, фасет); €/бр. — отвори, панти, артикули; „Сума“ — фиксирана сума (транспорт, монтаж).' },
  { icon: Maximize2, title: 'Минимална площ', desc: 'Малките стъкла се таксуват минимум 0,4 м² за стъклопакет и 0,2 м² за единично стъкло (на брой). Стойностите се сменят от „Настройки“. Ред под минимума показва „мин.“.' },
  { icon: Search, title: 'Търсене по стар номер', desc: 'Оригиналният номер от таблицата (напр. 326-00160) се показва вместо вътрешния и се търси навсякъде — в горното търсене и в списъка с поръчки.' },
  { icon: Factory, title: 'Приемане на стока', desc: 'Доставчици → Поръчки към доставчици → „Приеми стоката“: изберете склад и количества. Наличността се обновява сама; непълна доставка остава „Частично приета“.' },
]

const FAQ = [
  {
    q: 'Къде избирам вида на поръчката?',
    a: 'При нова поръчка → „Още настройки“ → „Вид поръчка“ (падащ списък: стъклопакет, единично стъкло, смесена). Видът определя етапите в цеха. При поръчка от оферта видът се избира автоматично според редовете.',
  },
  {
    q: 'Как се смята цената на ред?',
    a: 'Цена × количество, според мерната единица: за €/м² — площта по размерите, но не по-малко от минималната площ; за €/л.м. — периметърът 2 × (Ш + В); за €/бр. — броят; „Сума“ — точно въведената сума. Сумата на поръчката е сборът на редовете, освен ако не въведете ръчна крайна цена.',
  },
  {
    q: 'Защо работникът не може да натисне „Започни“?',
    a: 'Етапите вървят по ред — следващият може да започне, когато предишният е „Готово“ или пропуснат. Освен това поръчката трябва да е в статус ПРОИЗВОДСТВО (докато е „Материали“, цехът само я вижда).',
  },
  {
    q: 'Работник не вижда задачите си.',
    a: 'В „Моите задачи“ се виждат етапите, разпределени на него, и свободните (неразпределени) етапи на поръчки в ПРОИЗВОДСТВО. Проверете дали поръчката е пусната в производство.',
  },
  {
    q: 'Как отбелязвам плащане или монтаж?',
    a: 'В страницата на поръчката: секция „Плащане“ — добавете сума (брой, банка, карта); статусът става „Частично“ или „Платена“ автоматично. Монтажът се отбелязва там също, ако поръчката е „за монтаж“.',
  },
  {
    q: 'Как работи линкът за проследяване?',
    a: 'Всяка поръчка има линк в страницата си. Клиентът вижда номера, статуса и етапите — без цени и без вътрешни бележки.',
  },
  {
    q: 'Как регистрирам брак?',
    a: 'Брак → „Регистрирай брак“ (или „+ Нов“ → Брак). Потърсете поръчката по номер или клиент, изберете отговорния работник и причината. Етап и машина не са задължителни. После „Реши“: преработка или отписване.',
  },
  {
    q: 'Как поръчвам материали от доставчик?',
    a: 'Доставчици → „Поръчки към доставчици“ → „+ Нова поръчка към доставчик“: изберете доставчик и добавете материали. Когато стоката пристигне — „Приеми стоката“.',
  },
  {
    q: 'Кой вижда цените?',
    a: 'Само администратор и офис. Цехът и складът не виждат продажни цени, себестойност и надници — нито в екраните, нито в данните от сървъра.',
  },
  {
    q: 'Как сменям името или паролата си?',
    a: 'Кликнете името си → „Моят профил“. Паролата трябва да е поне 6 символа.',
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
        <ChevronDown className={`w-4 h-4 text-muted flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
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
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3"><BookOpen className="w-8 h-8 text-accent flex-shrink-0" strokeWidth={1.75} />Ръководство за потребителя</h1>
        <p className="text-muted">Кратко и практично: как минава една поръчка, кой какво прави и как се смятат цените.</p>
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
        <SectionSub>Еспехо ERP — поръчки, производство, склад и доставки на едно място</SectionSub>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { icon: ClipboardList, title: 'Поръчки', text: 'Всяка поръчка — от офертата до предаването, плащането и монтажа. Номерът от таблицата (326-…) се пази и търси.' },
            { icon: Cog, title: 'Производство', text: 'Работниците виждат задачите си на телефона в „Моите задачи“ и отбелязват „Започни“ / „Готово“ за всеки етап.' },
            { icon: BarChart3, title: 'Финанси', text: 'Цени с ДДС, плащания, себестойност (материали + труд + машини) и марж. Виждат се само от офиса и администратора.' },
          ].map(c => (
            <div key={c.title} className="card">
              <c.icon className="w-8 h-8 mb-3 text-accent" strokeWidth={1.75} />
              <h3 className="font-semibold text-white mb-2">{c.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{c.text}</p>
            </div>
          ))}
        </div>

        <div className="card border-accent/20 bg-accent/5">
          <div className="flex gap-3 items-start">
            <Lightbulb className="w-6 h-6 text-accent flex-shrink-0" strokeWidth={1.75} />
            <div>
              <p className="font-semibold text-white mb-1">Основна идея</p>
              <p className="text-sm text-gray-300 leading-relaxed">
                Поръчката минава НОВА → МАТЕРИАЛИ → ПРОИЗВОДСТВО → ГОТОВА → ДОСТАВЕНА.
                Офисът я пуска, цехът отбелязва етапите (последният я прави ГОТОВА сам), складът следи материалите.
                Цени виждат само офисът и администраторът.
              </p>
            </div>
          </div>
        </div>

        {/* New modules */}
        <div className="mt-6">
          <h3 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Важно за всеки ден</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TIPS.map(m => (
              <div key={m.title} className="card hover:border-border/80 transition-colors">
                <div className="flex gap-3 items-start">
                  <m.icon className="w-5 h-5 flex-shrink-0 mt-0.5 text-accent" strokeWidth={2} />
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
        <SectionSub>Стъпка по стъпка от запитването до предаването</SectionSub>

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
            <span className="text-muted text-sm ml-2">/ ОТКАЗАНА (с потвърждение)</span>
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
                <role.icon className={`w-6 h-6 flex-shrink-0 ${role.color.split(' ')[0]}`} strokeWidth={1.75} />
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
                      <r.icon className="w-4 h-4 inline-block align-[-3px] mr-1" strokeWidth={2} />{r.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { m: 'Поръчки',      admin: 'Пълен', office: 'Пълен', production: 'Без цени',      warehouse: 'Без цени' },
                  { m: 'Оферти',       admin: 'Пълен', office: 'Пълен', production: '—',             warehouse: '—' },
                  { m: 'Клиенти',      admin: 'Пълен', office: 'Пълен', production: '—',             warehouse: '—' },
                  { m: 'Производство', admin: 'Пълен', office: 'Пълен', production: 'Пълен',      warehouse: '—' },
                  { m: 'Брак',         admin: 'Пълен', office: 'Пълен', production: 'Без суми',      warehouse: '—' },
                  { m: 'Склад',        admin: 'Пълен', office: 'Изписване',  production: '—',          warehouse: 'Пълен' },
                  { m: 'Доставчици',   admin: 'Пълен', office: 'Пълен', production: '—',             warehouse: 'Поръчки и приемане' },
                  { m: 'Доставки',     admin: 'Пълен', office: 'Пълен', production: '—',             warehouse: 'Пълен' },
                  { m: 'Машини',       admin: 'Пълен', office: '—',        production: 'Без разходи',  warehouse: '—' },
                  { m: 'Отчети и цени',admin: 'Пълен', office: 'Пълен', production: '—',             warehouse: '—' },
                  { m: 'Потребители, Настройки', admin: 'Пълен', office: '—', production: '—',         warehouse: '—' },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-border/30 hover:bg-surface/40">
                    <td className="py-2.5 pr-6 text-gray-300 font-medium">{row.m}</td>
                    {(['admin','office','production','warehouse']).map(role => (
                      <td key={role} className="text-center py-2.5 px-3">
                        {row[role] === '—'
                          ? <span className="text-muted">—</span>
                          : row[role] === 'Пълен'
                            ? <span className="text-green-400 text-xs font-medium">{row[role]}</span>
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
            <Wrench className="w-6 h-6 text-muted flex-shrink-0" strokeWidth={1.75} />
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
