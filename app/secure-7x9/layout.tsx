import "./admin.css";
import AdminSidebar from "./_components/AdminSidebar";
import AdminTopbar from "./_components/AdminTopbar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-layout">
      <AdminSidebar />
      <div className="adm-main">
        <AdminTopbar />
        {children}
      </div>
    </div>
  );
}
