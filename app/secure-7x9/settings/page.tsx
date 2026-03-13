export default function AdminSettings() {
  return (
    <div className="adm-content">
      <h1 className="adm-topbar-title" style={{ marginBottom: "1.5rem" }}>Settings</h1>

      <div className="adm-settings-wrap">

        {/* General */}
        <div className="adm-card" style={{ padding: "2rem", marginBottom: "1.5rem" }}>
          <h3 className="adm-settings-title">General App Settings</h3>
          <div className="adm-form-group">
            <label className="adm-form-label">Site Name</label>
            <input className="adm-form-input" type="text" defaultValue="Floo3D" />
          </div>
          <div className="adm-form-group">
            <label className="adm-form-label">Support Email</label>
            <input className="adm-form-input" type="email" defaultValue="support@floo3d.io" />
          </div>
          <div className="adm-checkbox-row">
            <input className="adm-checkbox" id="maintenance" type="checkbox" />
            <label className="adm-checkbox-label" htmlFor="maintenance">Maintenance Mode</label>
          </div>
        </div>

        {/* Credit Pricing */}
        <div className="adm-card" style={{ padding: "2rem" }}>
          <h3 className="adm-settings-title">Credit Pricing</h3>
          <div className="adm-form-grid" style={{ marginBottom: "1.5rem" }}>
            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">Standard Render (Credits)</label>
              <input className="adm-form-input" type="number" defaultValue={5} />
            </div>
            <div className="adm-form-group" style={{ margin: 0 }}>
              <label className="adm-form-label">High Quality (Credits)</label>
              <input className="adm-form-input" type="number" defaultValue={15} />
            </div>
          </div>
          <button className="adm-btn-primary">Save Changes</button>
        </div>

      </div>
    </div>
  );
}
