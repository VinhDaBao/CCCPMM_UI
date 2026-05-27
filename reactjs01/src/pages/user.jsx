import { notification, Table } from "antd";

import { useEffect } from "react";

import {
  useDispatch,
  useSelector
} from "react-redux";

import { getAllUsersApi } from "../util/api";

import {

  getProfileStart,
  getProfileSuccess,
  getProfileFail,

} from "../redux/profileSlice";

const UserPage = () => {

  const dispatch = useDispatch();
  const auth = useSelector(state => state.auth);


  const {

    profileLoading,

    profileData,

    profileError,

  } = useSelector(
    state => state.profile
  );


  useEffect(() => {

    if (!auth?.user?.role) return;

    const fetchUser = async () => {

      try {

        dispatch(getProfileStart());

        const res = await getAllUsersApi();

        if (res && res.users) {
          dispatch(
            getProfileSuccess(
              res.users
            )
          );

        } else {

          dispatch(
            getProfileFail(
              res?.message ??
              "Failed to fetch profile"
            )
          );

          notification.error({

            message: "Unauthorized",

            description:
              res?.message ??
              "Cannot fetch profile",
          });
        }

      } catch (error) {

        dispatch(
          getProfileFail(
            error.message
          )
        );

        notification.error({

          message: "Error",

          description:
            error.message,
        });
      }
    };

    fetchUser();

  }, [dispatch]);


  const columns = [

    {
      title: "Id",
      dataIndex: "_id",
    },

    {
      title: "Email",
      dataIndex: "email",
    },

    {
      title: "Full Name",
      dataIndex: "fullName",
    },

    {
      title: "Role",
      dataIndex: "role",
    },
  ];

  return (

    <div style={{ padding: 30 }}>

      {
        profileError && (

          <p
            style={{
              color: "red",
              marginBottom: 20
            }}
          >
            {profileError}
          </p>
        )
      }

      <Table

        bordered

        loading={profileLoading}

        dataSource={profileData || []}

        columns={columns}

        rowKey={"_id"}
      />

    </div>
  );
};

export default UserPage; 