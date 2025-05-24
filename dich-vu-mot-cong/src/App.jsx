import React from "react";
import { AuthProvider } from "./contexts/AuthContext";
import AppRoutes from "./routes/AppRoutes";
import "./App.css";
import "antd/dist/reset.css"; // hoặc import 'antd/dist/antd.css' tùy phiên bản antd
function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
