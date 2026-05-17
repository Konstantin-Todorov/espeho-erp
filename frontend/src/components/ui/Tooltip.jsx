export default function Tooltip({ text, children, position = 'top' }) {
  const posClass = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left:   'right-full top-1/2 -translate-y-1/2 mr-2',
    right:  'left-full top-1/2 -translate-y-1/2 ml-2',
  }[position] || 'bottom-full left-1/2 -translate-x-1/2 mb-2'

  return (
    <span className="relative inline-flex group">
      {children}
      <span className={`pointer-events-none absolute z-50 ${posClass} whitespace-nowrap
        rounded-lg bg-gray-900 border border-border px-2.5 py-1.5 text-xs text-gray-200 shadow-xl
        opacity-0 group-hover:opacity-100 transition-opacity duration-150`}>
        {text}
      </span>
    </span>
  )
}
