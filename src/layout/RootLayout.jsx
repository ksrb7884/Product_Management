import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import styles from "./RootLayout.module.css";
import { AuthContext, useAuth } from "../context/AuthProvider";

function RootLayout() {
  const { isAuthenticated, logout } = useAuth(AuthContext);
  const navigate = useNavigate();
  const navigation = useNavigation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  return (
    <div>
      <header className={styles.header}>
        <nav className={styles.nav}>
          <ul>
            <li>
              <Link to="/products">Products</Link>
            </li>
            {!isAuthenticated && (
              <>
                <li>
                  <Link to="/login">Login</Link>
                </li>
                <li>
                  <Link to="/">Signup</Link>
                </li>
              </>
            )}
            {isAuthenticated && (
              <li>
                <button onClick={handleLogout} className={styles.logoutBtn}>
                  Logout
                </button>
              </li>
            )}
          </ul>
        </nav>
      </header>
      <section>
        {navigation.state === "loading" ? <h1>Loading...</h1> : <Outlet />}
      </section>
    </div>
  );
}

export default RootLayout;
