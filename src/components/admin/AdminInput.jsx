export default function AdminInput({
  label,
  value,
  onChange,
  name,
  placeholder = "",
  type = "text",
  className = "",
}) {
  return (
    <div className="form-section">
      <label className="field-label">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={"input-box " + className}
      />
    </div>
  );
}
