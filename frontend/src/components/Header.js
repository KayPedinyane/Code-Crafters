function Header() {
  const adminName = "Zandile Mkontwana";

  return (
    <header style={styles.header}>
      <section style={styles.nameContainer}>
        <h1 style={styles.name}>{adminName}</h1>
        <p style={styles.role}>Admin</p>
      </section>

      <button
        style={styles.profile}
        onClick={() => alert("Profile clicked")}
        aria-label="Open profile"
      >
        👤
      </button>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#0a1628",
    color: "white",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameContainer: {
    textAlign: "center",
    flex: 1,
  },
  name: {
    fontSize: "28px",
    margin: 0,
  },
  role: {
    fontSize: "14px",
    margin: 0,
    fontWeight: "normal",
    color: "#00c853",
  },
  profile: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",
    backgroundColor: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    cursor: "pointer",
    border: "none",
  },
};

export default Header;