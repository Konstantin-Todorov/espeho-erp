// Input with autocomplete suggestions but allows any free-text value
export default function CreatableInput({ value, onChange, suggestions = [], placeholder, className = '', required }) {
  const id = `dl-${Math.random().toString(36).slice(2)}`
  return (
    <>
      <input
        list={id}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={`input ${className}`}
        required={required}
        autoComplete="off"
      />
      <datalist id={id}>
        {suggestions.map(s => (
          <option key={s.value ?? s} value={s.value ?? s}>{s.label ?? s}</option>
        ))}
      </datalist>
    </>
  )
}
