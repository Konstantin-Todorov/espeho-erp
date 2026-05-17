const ROLES = [
  {
    name: 'Администратор',
    key: 'admin',
    color: 'text-accent border-accent/30 bg-accent/10',
    dot: 'bg-accent',
    description: 'Пълен достъп до всички модули. Вижда всички финансови данни.',
    can: [
      'Вижда и управлява всички поръчки',
      'Достъп до всички финансови данни и репорти',
      'Управлява потребители (добавя, редактира, деактивира)',
      'Вижда и управлява клиенти',
      'Достъп до машини и поддръжка',
      'Достъп до производство и брак',
      'Достъп до склад и материали',
      'Пълни репорти: финанси, производство, брак',
    ],
    cannot: [
      '—',
    ],
  },
  {
    name: 'Офис',
    key: 'office',
    color: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    dot: 'bg-blue-400',
    description: 'Управлява поръчките и клиентите. Вижда финанси без детайли за труд.',
    can: [
      'Създава и редактира поръчки',
      'Управлява клиенти',
      'Достъп до производство и брак',
      'Достъп до склад',
      'Репорти: поръчки, материали, брак',
      'Финансови репорти (без разбивка по работник)',
    ],
    cannot: [
      'Управление на потребители',
      'Настройки на машини',
      'Почасови ставки на работниците',
    ],
  },
  {
    name: 'Производство',
    key: 'production',
    color: 'text-orange-400 border-orange-400/30 bg-orange-400/10',
    dot: 'bg-orange-400',
    description: 'Работи с производствените етапи. Вижда само своите задачи и поръчките.',
    can: [
      'Вижда всички поръчки (без цени)',
      'Управлява производствени етапи (drag & drop)',
      'Отбелязва свършена работа и часове',
      'Регистрира брак',
      'Достъп до машини',
    ],
    cannot: [
      'Цени на поръчки и финансови данни',
      'Управление на клиенти',
      'Потребители и настройки',
      'Репорти',
    ],
  },
  {
    name: 'Склад',
    key: 'warehouse',
    color: 'text-green-400 border-green-400/30 bg-green-400/10',
    dot: 'bg-green-400',
    description: 'Управлява складовите наличности и движенията на материали.',
    can: [
      'Вижда всички поръчки (без цени)',
      'Управлява складови наличности',
      'Добавя и изписва материали',
      'Преглежда движения на материали',
    ],
    cannot: [
      'Цени и финансови данни',
      'Управление на клиенти',
      'Производствени етапи',
      'Потребители и настройки',
      'Репорти',
    ],
  },
]

const PERMISSIONS = [
  { module: 'Начало (Дашборд)',  admin: true,  office: true,  production: 'само своите задачи', warehouse: 'бърз достъп до склад' },
  { module: 'Поръчки',           admin: true,  office: true,  production: 'без цени',  warehouse: 'без цени' },
  { module: 'Производство',      admin: true,  office: true,  production: true,        warehouse: false },
  { module: 'Брак',              admin: true,  office: true,  production: true,        warehouse: false },
  { module: 'Склад',             admin: true,  office: true,  production: false,       warehouse: true },
  { module: 'Клиенти',           admin: true,  office: true,  production: false,       warehouse: false },
  { module: 'Машини',            admin: true,  office: false, production: true,        warehouse: false },
  { module: 'Репорти',           admin: true,  office: true,  production: false,       warehouse: false },
  { module: 'Потребители',       admin: true,  office: false, production: false,       warehouse: false },
  { module: 'Профил',            admin: true,  office: true,  production: true,        warehouse: true },
]

function PermCell({ val }) {
  if (val === true) return <span className="text-green-400 font-medium">✓ Пълен</span>
  if (val === false) return <span className="text-muted">—</span>
  return <span className="text-yellow-400 text-xs">{val}</span>
}

export default function Guide() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold text-white mb-2">Ръководство и роли</h1>
      <p className="text-muted mb-8">Системата има 4 роли с различни нива на достъп и отговорности.</p>

      {/* Role cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
        {ROLES.map(role => (
          <div key={role.key} className={`card border ${role.color.split(' ').find(c => c.startsWith('border'))} `}>
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-3 h-3 rounded-full ${role.dot}`} />
              <h2 className={`font-bold text-lg ${role.color.split(' ')[0]}`}>{role.name}</h2>
            </div>
            <p className="text-sm text-muted mb-4">{role.description}</p>

            <div className="mb-3">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Може да:</p>
              <ul className="space-y-1">
                {role.can.map((item, i) => (
                  <li key={i} className="text-sm text-gray-300 flex items-start gap-2">
                    <span className="text-green-400 mt-0.5 flex-shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {role.cannot[0] !== '—' && (
              <div>
                <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-2">Няма достъп до:</p>
                <ul className="space-y-1">
                  {role.cannot.map((item, i) => (
                    <li key={i} className="text-sm text-gray-500 flex items-start gap-2">
                      <span className="text-danger mt-0.5 flex-shrink-0">✗</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Permissions matrix */}
      <div className="card mb-10">
        <h2 className="text-sm font-semibold text-muted uppercase tracking-wide mb-4">Матрица на достъпа</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-2 pr-4 text-muted font-medium">Модул</th>
                <th className="text-center py-2 px-4 text-accent font-medium">Администратор</th>
                <th className="text-center py-2 px-4 text-blue-400 font-medium">Офис</th>
                <th className="text-center py-2 px-4 text-orange-400 font-medium">Производство</th>
                <th className="text-center py-2 px-4 text-green-400 font-medium">Склад</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSIONS.map((row, i) => (
                <tr key={i} className="border-b border-border/40 hover:bg-surface/50">
                  <td className="py-2.5 pr-4 text-gray-300 font-medium">{row.module}</td>
                  <td className="text-center py-2.5 px-4"><PermCell val={row.admin} /></td>
                  <td className="text-center py-2.5 px-4"><PermCell val={row.office} /></td>
                  <td className="text-center py-2.5 px-4"><PermCell val={row.production} /></td>
                  <td className="text-center py-2.5 px-4"><PermCell val={row.warehouse} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drag & drop note */}
      <div className="card border border-orange-400/20 bg-orange-400/5">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
          <div>
            <p className="font-semibold text-orange-400 mb-1">Производство — Drag & Drop</p>
            <p className="text-sm text-gray-400">
              В модул <strong className="text-white">Производство</strong> поръчките са наредени в Kanban дъска с колони по статус.
              Производствените работници и офисът могат да преместват поръчки между колоните с влачене —
              от <em>Чакащи</em> → <em>В процес</em> → <em>Готово</em>.
              Всяко преместване се записва автоматично.
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Планирано подобрение: визуален drag & drop с анимации (в следваща версия).
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
