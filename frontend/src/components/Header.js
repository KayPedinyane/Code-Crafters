function Header() {
  const adminName = "Zandile Mkontwana"; // Admin name

  return (
    <header style={styles.header}>
      <div style={styles.nameContainer}>
        <h1 style={styles.name}>{adminName}</h1>
        <p style={styles.role}>Admin</p>
      </div>

      <div
        style={styles.profile}
        onClick={() => alert("Profile clicked")}
      >
        👤
      </div>
    </header>
  );
}

const styles = {
  header: {
    backgroundColor: "#014421", // pine green
    color: "white",
    padding: "20px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  nameContainer: {
    textAlign: "center",
    flex: 1, // centers name
  },
  name: {
    fontSize: "28px",
    margin: 0,
  },
  role: {
    fontSize: "14px",
    margin: 0,
    fontWeight: "normal",
  },
  profile: {
    width: "50px",
    height: "50px",
    borderRadius: "50%",      // makes it circular
    backgroundColor: "white", // circle background
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    fontSize: "24px",
    cursor: "pointer",
  },
};

export default Header;