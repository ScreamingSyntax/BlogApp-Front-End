import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import './styles/Login.scss';
import Toast from '../../swal_fire/swal_fire';
import axios from 'axios';
import config from '../../configs/config';
import Swal from 'sweetalert2';
import { generateToken, messaging } from '../../notification/firebase';
const Login = () => {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errors, setErrors] = useState({});

    const handleLockClick = async () => {
      try {
          // Prompt user to enter their email
          const { value: email } = await Swal.fire({
              title: 'Enter your email',
              input: 'email',
              inputLabel: 'Your email address',
              inputPlaceholder: 'Enter your email address',
              inputValidator: (value) => {
                  if (!value) return 'You need to enter your email!';
              }
          });
  
          if (email) {
              // Request backend to send OTP to the given email
              await axios.post(`${config.API_BASE_URL}/api/Account/forgot-password/`, { email }, {
                  headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
              });
  
              // Ask user to enter the OTP they received
              const { value: otp } = await Swal.fire({
                  title: 'Enter OTP',
                  input: 'text',
                  inputLabel: 'OTP',
                  inputPlaceholder: 'Enter the OTP sent to your email',
                  inputValidator: (value) => {
                      if (!value) return 'You need to enter the OTP!';
                  }
              });
  
              if (otp) {
                  // Prompt user to enter and confirm their new password
                  const { value: passwords } = await Swal.fire({
                      title: 'Set New Password',
                      html:
                          '<input id="swal-input1" class="swal2-input" type="password" placeholder="New Password">' +
                          '<input id="swal-input2" class="swal2-input" type="password" placeholder="Confirm New Password">',
                      focusConfirm: false,
                      preConfirm: () => {
                          const password1 = document.getElementById('swal-input1').value;
                          const password2 = document.getElementById('swal-input2').value;
                          if (!password1 || !password2) {
                              Swal.showValidationMessage('Please enter both passwords');
                          } else if (password1 !== password2) {
                              Swal.showValidationMessage('Passwords do not match');
                          } else {
                              return { password: password1, confirmPassword: password2 };
                          }
                      }
                  });
  
                  if (passwords) {
                      // Make API call to reset the password with the new password and OTP
                      await axios.post(`${config.API_BASE_URL}/api/Account/reset-password/`, {
                          email,
                          otp,
                          newPassword: passwords.password
                      }, {
                          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                      });
                      Swal.fire('Success', 'Password updated successfully', 'success');
                  }
              }
          }
      } catch (error) {
          Swal.fire('Error', error.response?.data?.message || 'Failed to process request', 'error');
          console.error('Error during password reset:', error);
      }
  };
    const validate = () => {
        let isValid = true;
        const errors = {};

        if (!email) {
            isValid = false;
            errors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(email)) {
            isValid = false;
            errors.email = "Email is invalid";
        }

        if (!password) {
            isValid = false;
            errors.password = "Password is required";
        } else if (password.length < 6) {
            isValid = false;
            errors.password = "Password must be at least 6 characters long";
        }

        setErrors(errors);
        return isValid;
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
          const token = await generateToken();
          const response = await fetch('https://localhost:7261/api/Authentication/login/', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email: email, password: password, DeviceToken:token  })
          });
          if (response.ok) {
            const data = await response.json();
            if (data.flag) {
              console.log(data)
              console.log("Login Successful:", data.message);
              localStorage.setItem('token', data.token);
              localStorage.setItem('role', data.role);
              localStorage.setItem('name', data.name);
              localStorage.setItem('image', data.image);
              localStorage.setItem('id', data.userID);
              localStorage.setItem('email', data.email);
              Toast.fire({
                icon: 'success',
                title: "User Logged in successfully."
            });
            if(data.role == "Admin"){
              navigate('/dashboard')
              window.location.reload()
              return;
            }
            navigate('/')
            window.location.reload()
            } else {
            Toast.fire({
                    icon: 'error',
                    title: "User login Failed"
                });
              console.error("Login Failed:", data.message);
            }
          } else {
            const errorData = await response.json(); 
            console.error("Error logging in:", errorData.message || "An unknown error occurred");
          }
        } catch (error) {
          console.error("Network error:", error.message);
        }
      };
      

    return (
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}  >
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    {errors.email && <div style={{ color: "red" }}>{errors.email}</div>}
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password:</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    {errors.password && <div style={{ color: "red" }}>{errors.password}</div>}
                </div>
                
                <button type="submit">Login</button>
                <button type="button" onClick={handleLockClick}>Forgot Password</button>
                <p className="linked_paragraph">New to this? <span onClick={() => navigate('/register')}> Register </span></p>
            </form>
        </div>
    );
};

export default Login;
