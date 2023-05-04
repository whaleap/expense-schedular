import React, { Suspense } from "react";
import { Route, Routes } from "react-router-dom";

import Navbar from "../components/Navbar";
// pages for this product
import LandingPage from "./LandingPage/Index.js";
import DBPage from "./DBPage/Index.js";
// import UserList from "./UserPage/List.js";
// import UserPage from "./UserPage/Index.js";
// import BudgetList from "./BudgetPage/List.js";
// import BudgetPage from "./BudgetPage/Index.js";
// import TransactionList from "./TransactionPage/List.js";
// import TransactionPage from "./TransactionPage/Index.js";

import useAPI from "../hooks/useAPI";
import useStore from "../hooks/useStore";

function App() {
  const API = useAPI();
  const { logIn, logOut } = useStore((state) => state);

  API.GET({ location: "users/current" }, (user, error) => {
    if (error) {
      alert("ERROR!");
      logOut();
      return;
    }

    if (user) logIn(user);
    else logOut();
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div style={{ paddingTop: "20px", minHeight: "100px", padding: "50px" }}>
        <Navbar />
        <Routes>
          <Route exact path="/" element={<LandingPage />} />
          <Route exact path="/DB" element={<DBPage />} />
          {/* <Route exact path="/users" element={<UserList />} />
          <Route exact path="/users/:_id" element={<UserPage />} />
          <Route exact path="/budgets" element={<BudgetList />} />
          <Route exact path="/budgets/:_id" element={<BudgetPage />} />
          <Route exact path="/transactions" element={<TransactionList />} />
          <Route
            exact
            path="/transactions/:_id"
            element={<TransactionPage />}
          /> */}
        </Routes>
      </div>
    </Suspense>
  );
}

export default App;
