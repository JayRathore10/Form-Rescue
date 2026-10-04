import { useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import MainPage from "./components/MainPage/MainPage";
import Login from "./components/authentication/Login";

const handleSignin = async (data) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/auth/login`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || result.error || "Login failed"
    );
  }

  if (!result.token) {
    throw new Error("Login successful but no token was returned.");
  }

  localStorage.setItem("token", result.token);

  return result;
};

const handleSignup = async (data) => {
  const response = await fetch(
    `${import.meta.env.VITE_API_URL}/api/v1/auth/register`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    }
  );

  const result = await response.json();

  if (!response.ok) {
    throw new Error(
      result.message || result.error || "Signup failed"
    );
  }

  return result;
};

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(
    Boolean(localStorage.getItem("token"))
  );

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
  };

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={
            <Login
              onLogin={handleLogin}
              onSignin={handleSignin}
              onSignup={handleSignup}
            />
          }
        />

        <Route
          path="/"
          element={
            isLoggedIn ? (
              <MainPage onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        <Route
          path="*"
          element={
            <Navigate
              to={isLoggedIn ? "/" : "/login"}
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
