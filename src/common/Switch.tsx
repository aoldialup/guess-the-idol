export default function Switch({ label, name, onChange, checked }:
  { label: string, name: string, onChange: any, checked: boolean }) {
  return <>
    <label className="switch" style={{ marginBottom: "10%" }}>
      <input type="checkbox" name={name} checked={checked} onChange={onChange} />
      <span className="slider round" ></span>
      <span className="group-label" style={{ marginLeft: "100%" }}>{label}</span>
    </label>
  </>
}