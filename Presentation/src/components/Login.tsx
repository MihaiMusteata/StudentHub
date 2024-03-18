import { useContext, useState } from "react";
import { Link } from "react-router-dom";
import { ApiPostRequest, ApiResponse } from "../scripts/api";
import { ToastContext, toastProps } from "../App";
import { Input, Button, Form } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import { Avatar, Container, Typography } from "@mui/material";

interface LoginData {
  credential: string;
  password: string;
}

interface LoginProps {
  updateUser: boolean;
  setUpdateUser: (updateUser: boolean) => void;
}

const Login = ({ updateUser, setUpdateUser }: LoginProps) => {
  const [loginData, setLoginData] = useState<LoginData>({
    credential: "",
    password: "",
  });
  const [response, setResponse] = useState<ApiResponse>({ status: 0, body: "" });
  const setToastComponent = useContext(ToastContext);

  const handleLogin = async () => {
    try {
      const result = await ApiPostRequest("login", undefined, loginData);

      if (result.status === 200) {
        setToastComponent({ type: "success", message: "Login Successful" });
        setUpdateUser(!updateUser);
      } else {
        result.body = JSON.parse(result.body);
        setResponse(result as ApiResponse);
        setToastComponent({ type: "error", message: "Login Failed" });
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  return (
    <>
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div style={{ background: 'rgba(255,255,255)', padding: '20px', borderRadius: '10px', maxWidth: '500px', width: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Avatar sx={{ m: 1, bgcolor: "primary.light" }}>
            <LoginOutlined />
          </Avatar>
          <Typography variant="h5" sx={{ mb: 3 }}>Login</Typography>
          <Form
            name="login"
            initialValues={{ remember: true }}
            onFinish={handleLogin}
            style={{ maxWidth: 500 }}
            scrollToFirstError
          >

            <Form.Item
              name="credential"
              hasFeedback
              validateStatus={response.status !== 200 && response.body.credentials ? "error" : undefined}
              help={response.status !== 200 && response.body.credentials ? response.body.credentials : undefined}
              rules={[
                { required: true, message: 'Please input your email or username!' }
              ]}
            >
              <Input
                style={{ height: '50px', fontSize: '16px' }}
                allowClear
                prefix={<UserOutlined />}
                placeholder="Email or Username"
                value={loginData.credential}
                onChange={(e) => setLoginData({ ...loginData, credential: e.target.value })} />
            </Form.Item>

            <Form.Item
              name="password"
              hasFeedback
              validateStatus={response.status !== 200 && response.body.password ? "error" : undefined}
              help={response.status !== 200 && response.body.password ? response.body.password : undefined}
              rules={[{ required: true, message: 'Please input your password!' }]}
            >
              <Input.Password
                allowClear
                style={{ height: '50px', fontSize: '16px' }}
                prefix={<LockOutlined />}
                placeholder="Password"
                value={loginData.password}
                onChange={(e) => setLoginData({ ...loginData, password: e.target.value })} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Login</Button>
            </Form.Item>

            <Form.Item>
              <div style={{ textAlign: 'center' }}>
                <Link to="/signup">Don't have an account? Signup</Link>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Container>
    </>
  );
};

export default Login;
