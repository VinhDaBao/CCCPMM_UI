import React, { useContext, useState } from 'react';
import {
  useDispatch,
  useSelector
} from "react-redux";

import { logout }
  from "../../redux/authSlice";
import {
  UsergroupAddOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';

import { Menu } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/auth.context';

const Header = () => {
  const navigate = useNavigate();

  // const { auth, setAuth } = useContext(AuthContext);

  // console.log('>>> check auth: ', auth);
  const auth = useSelector(
    state => state.auth
  );
  const dispatch = useDispatch();
  const [current, setCurrent] = useState('home');

  const onClick = (e) => {
    console.log('click ', e);
    setCurrent(e.key);
  };

  const items = [
    {
      label: <Link to="/">Home Page</Link>,
      key: 'home',
      icon: <HomeOutlined />,
    },

    ...(auth.isAuthenticated
      ? [
        {
          label: <Link to="/user">Users</Link>,
          key: 'user',
          icon: <UsergroupAddOutlined />,
        },
      ]
      : []),

    {
      label: `Welcome ${auth?.user?.email ?? ''}`,
      key: 'submenu',
      icon: <SettingOutlined />,

      children: auth.isAuthenticated
        ? [
          {
            label: (
              <span
                onClick={() => {
                  localStorage.removeItem('access_token');
                  dispatch(logout());
                  navigate('/login');
                }}
              >
                Logout
              </span>
            ),

            key: 'logout',
          },
        ]
        : [
          {
            label: <Link to="/login">Đăng nhập</Link>,
            key: 'login',
          },
        ],
    },
  ];

  return (
    <Menu
      onClick={onClick}
      selectedKeys={[current]}
      mode="horizontal"
      items={items}
    />
  );
};

export default Header;