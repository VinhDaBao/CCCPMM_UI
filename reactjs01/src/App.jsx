import Header from "./components/layout/header";

import axios from "./util/axios.customize";

import { useEffect } from "react";

import { Spin } from "antd";

import { Outlet } from "react-router-dom";

import {
  useDispatch,
  useSelector
} from "react-redux";

import {
  loginSuccess
} from "./redux/authSlice";

function App() {

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
      }
    };

    fetchAccount();

  }, [dispatch]);

  return (<div> { auth.loading ? <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}> <Spin /> </div> : <> <Header /> <Outlet /> </> } </div>)
}

export default App;