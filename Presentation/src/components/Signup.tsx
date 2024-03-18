import { ApiPostRequest, ApiResponse } from "../scripts/api";
import { format } from 'date-fns';
import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContext, toastProps } from "../App";
import { Button, Checkbox, DatePicker, Form, Input } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, FormOutlined } from '@ant-design/icons';
import { Avatar, Container, Typography } from "@mui/material";

interface SignupData {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate: string;
}


const Signup = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const setToastComponent = useContext(ToastContext);
  const [formData, setFormData] = useState<SignupData>({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    password: "",
    birthDate: ""
  });
  const [response, setResponse] = useState<ApiResponse>({ status: 0, body: "" });

  const handleSignup = async () => {
    try {
      const formattedBirthDate = format(new Date(formData.birthDate), "yyyy-MM-dd");
      const result = await ApiPostRequest("signup", undefined, { ...formData, birthDate: formattedBirthDate });

      if (result.status === 200) {
        setToastComponent({ type: "success", message: "Signup Successful" });
        navigate("/login");
      } else {
        result.body = JSON.parse(result.body);
        setResponse(result as ApiResponse);
        setToastComponent({ type: "error", message: "Signup Failed" });
      }
    } catch (error) {
      console.log("Error:", error);
    }
  };

  const handleChange = (key: keyof SignupData, value: string) => {
    setFormData({ ...formData, [key]: value });
  };

  return (
    <>
      <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', flexDirection: 'column' }}>
        <div style={{ background: 'rgba(255,255,255)', padding: '20px', borderRadius: '10px', maxWidth: '600px', width: '100%', boxShadow: '0 0 10px rgba(0, 0, 0, 0.1)', display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column' }}>
          <Avatar sx={{ m: 1, bgcolor: "primary.light" }}>
            <FormOutlined />
          </Avatar>
          <Typography variant="h5" sx={{ mb: 3 }}>Singup</Typography>
          <Form
            form={form}
            name="register"
            onFinish={handleSignup}
            style={{ maxWidth: 600, minWidth: '70%' }}
            scrollToFirstError
          >
            <Form.Item
              hasFeedback
              name="firstname"
              rules={[
                { required: true, message: 'Please input your firstname!' },
                { pattern: /^[A-Z]/, message: 'First letter should be capital!' },
                { pattern: /^[a-zA-Z]+$/, message: 'Only letters are allowed!' }
              ]}
            >
              <Input
                style={{ height: '50px', fontSize: '16px' }}
                allowClear
                placeholder="First Name"
                onChange={(e) => handleChange('firstName', e.target.value)}
              />
            </Form.Item>
            <Form.Item
              hasFeedback
              name="lastname"
              rules={[
                { required: true, message: 'Please input your lastname!' },
                { pattern: /^[A-Z]/, message: 'First letter should be capital!' },
                { pattern: /^[a-zA-Z]+$/, message: 'Only letters are allowed!' }
              ]}
            >
              <Input
                style={{ height: '50px', fontSize: '16px' }}
                allowClear
                placeholder="Last Name"
                onChange={(e) => handleChange('lastName', e.target.value)}
              />
            </Form.Item>

            <Form.Item
              hasFeedback
              name="birthdate"
              rules={[
                { required: true, message: 'Please input your birthdate!' }
              ]}
            >
              <DatePicker
                allowClear
                placeholder="Birthdate"
                size="large"
                style={{ width: '100%', height: '50px' }}
                onChange={(_, dateString) => handleChange('birthDate', String(dateString))}
              />
            </Form.Item>

            <Form.Item
              hasFeedback
              name="username"
              validateStatus={response.status !== 200 && response.body.username !== undefined ? "error" : undefined}
              help={response.status !== 200 && response.body.username !== undefined ? response.body.username : undefined}
              rules={[
                { required: true, message: 'Please input your username!' }
              ]}
            >
              <Input
                style={{ height: '50px', fontSize: '16px' }}
                allowClear
                placeholder="Username"
                prefix={<UserOutlined />}
                onChange={(e) => handleChange('username', e.target.value)}
              />
            </Form.Item>

            <Form.Item
              hasFeedback
              name="email"
              validateStatus={response.status !== 200 && response.body.email !== undefined ? "error" : undefined}
              help={response.status !== 200 && response.body.email !== undefined ? response.body.email : undefined}
              rules={[
                { type: 'email', message: 'The input is not valid E-mail!' },
                { required: true, message: 'Please input your E-mail!' }
              ]}
            >
              <Input
                style={{ height: '50px', fontSize: '16px' }}
                allowClear
                placeholder="E-mail"
                prefix={<MailOutlined />}
                onChange={(e) => handleChange('email', e.target.value)}
              />
            </Form.Item>

            <Form.Item
              hasFeedback
              name="password"
              validateStatus={response.status !== 200 && response.body.field === "password" ? "error" : undefined}
              help={response.status !== 200 && response.body.field === "password" ? response.body.message : undefined}
              rules={[
                { required: true, message: 'Please input your password!' },
                { min: 6, message: 'Password must be at least 6 characters!' },
                { pattern: /^(?=.*[0-9])\S+$/, message: 'Password must have at least one digit!' },
                { pattern: /^(?=.*[a-z])\S+$/, message: 'Password must have at least one lowercase letter!' },
                { pattern: /^(?=.*[A-Z])\S+$/, message: 'Password must have at least one uppercase letter!' },
                { pattern: /^(?=.*[^A-Za-z0-9])\S+$/, message: 'Password must have at least one non-alphanumeric character!' },

              ]}
            >
              <Input.Password
                style={{ height: '50px', fontSize: '16px' }}
                allowClear
                prefix={<LockOutlined />}
                placeholder="Password"
                onChange={(e) => handleChange('password', e.target.value)}
              />
            </Form.Item>

            <Form.Item
              name="confirm"
              dependencies={['password']}
              hasFeedback
              rules={[
                {
                  required: true,
                  message: 'Please confirm your password!',
                },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue('password') === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(new Error('The new password that you entered do not match!'));
                  },
                }),
              ]}
            >
              <Input.Password
                style={{ height: '50px', fontSize: '16px' }}
                allowClear
                prefix={<LockOutlined />}
                placeholder="Confirm Password"
              />
            </Form.Item>

            <Form.Item
              name="agreement"
              valuePropName="checked"
              style={{ textAlign: 'center' }}
              rules={[
                {
                  validator: (_, value) =>
                    value ? Promise.resolve() : Promise.reject(new Error('Should accept agreement')),
                },
              ]}
            >
              <Checkbox style={{ fontSize: '16px' }}>
                I have read the <Link to="/terms">agreement</Link>
              </Checkbox>
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%', fontSize: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>Signup</Button>
            </Form.Item>

            <Form.Item>
              <div style={{ textAlign: 'center' }}>
                <Link to="/login">Already have an account? Login</Link>
              </div>
            </Form.Item>
          </Form>
        </div>
      </Container>
    </>
  );
};

export default Signup;
