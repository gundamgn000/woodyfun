export default function AdminTextarea({
  label,
  value,
  onChange,
  name,
  rows = 4,
  placeholder = "",
}) {
  return (
    <div className="form-section">
      <label className="field-label">{label}</label>
      <textarea
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="input-box resize-none"
      />
    </div>
  );
}
