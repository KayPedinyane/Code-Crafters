import Header from "../components/Header";
import { Outlet } from "react-router-dom";

function AdminLayout() {
  return (
    <section style={styles.layout}>
      <Header />
      <Outlet />
    </section>
  );
}

const styles = {
  layout: {
    minHeight: "100vh",
    backgroundImage: "url('/Admin_images/admin_pic3.jpeg')",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
  },
};

export default AdminLayout;