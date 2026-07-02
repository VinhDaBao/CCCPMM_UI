<<<<<<< HEAD
import Header from "./components/layout/header";

import axios from "./util/axios.customize";

import { useEffect } from "react";

import { Spin } from "antd";

import { Outlet } from "react-router-dom";
=======
import axios from "./util/axios.customize";
import { useEffect, useState } from "react";
import { Spin } from "antd";
import { Outlet } from "react-router-dom"; 
import { useDispatch } from "react-redux";
import { loginSuccess } from "./redux/authSlice";
>>>>>>> 46e75d21f45e5f272338458849bcf7e1b5f87b74

import {
  useDispatch,
  useSelector
} from "react-redux";

import {
  loginSuccess
} from "./redux/authSlice";

function App() {
  const dispatch = useDispatch();
  const [isLoading, setIsLoading] = useState(true);

<<<<<<< HEAD
  const dispatch = useDispatch();

  const auth = useSelector(
    state => state.auth
  );

  useEffect(() => {

    const fetchAccount = async () => {

      try {

        const res = await axios.get(
          "/api/auth/user/profile"
        );

        console.log(
          "FETCH ACCOUNT RESPONSE:",
          res
        );

        if (
          res &&
          res.user &&
          res.user.user
        ) {

          dispatch(
            loginSuccess(
              res.user.user
            )
          );
        }

      } catch (error) {

        console.log(error);
=======
  useEffect(() => {
    const fetchAccount = async () => {
      const token = localStorage.getItem("access_token");
      
      if (!token) {
        setIsLoading(false);
        return;
      }

      try {
        const base64Url = token.split('.')[1];
        const payload = JSON.parse(window.atob(base64Url));
        const role = payload.role; 

        console.log(">>> Role extracted from token:", role);

        const apiEndpoint = role === 'admin' ? '/api/auth/admin/profile' : '/api/auth/user/profile';
        const res = await axios.get(apiEndpoint);
        
        console.log("FETCH ACCOUNT RESPONSE:", res);

        if (res && res.user) {
          dispatch(loginSuccess(res.user));
        }
      } catch (error) {
        console.log("Account fetch error:", error);
        localStorage.removeItem("access_token");
      } finally {
        setIsLoading(false);
>>>>>>> 46e75d21f45e5f272338458849bcf7e1b5f87b74
      }
    };

    fetchAccount();
<<<<<<< HEAD

  }, [dispatch]);

  return (<div> { auth.loading ? <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}> <Spin /> </div> : <> <Header /> <Outlet /> </> } </div>)
=======
  }, [dispatch]);

  return (
    <div>
      {isLoading ? (
        <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}>
          <Spin size="large" />
        </div>
      ) : (
      
        <Outlet />
      )}
    </div>
  );
>>>>>>> 46e75d21f45e5f272338458849bcf7e1b5f87b74
}

export default App;