function Header() {
  return (
    <header style={styles.header}>
      <h1>Admin Dashboard</h1>

      <div style={styles.profile} onClick={() => alert("Profile clicked")}>
        👤
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#0B3D2E", // pine green
    color: "white",
    padding: "15px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center"
  },
  profile: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    backgroundColor: "white",
    color: "#0B3D2E",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    cursor: "pointer"
  }
};

export default Header;