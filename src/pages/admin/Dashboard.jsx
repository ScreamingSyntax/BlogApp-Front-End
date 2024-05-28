import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { FaRegThumbsUp, FaRegThumbsDown, FaUser, FaCalendarAlt, FaBlog } from 'react-icons/fa';
import config from '../../configs/config'; // Ensure this exists and is correctly set up
import './Dashboard.scss'; // Ensure this SCSS file is configured correctly

const AdminDashboard = () => {
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    password: '',
    confirmPassword: '',
    imageFile: null,
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchData(selectedMonth);
  }, [selectedMonth]);

  const fetchData = async (month) => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Authentication token is not available.');
      return;
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };

    try {
      setLoading(true);
      const response = await axios.get(`https://localhost:7261/api/Admin/FilterByMonth?month=${month}`, config);
      setData(response.data);
    } catch (err) {
      setError('Failed to fetch data. Please check if you are authorized.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resolveImageUrl = (url) => {
    if (!url) return '/default-image.png'; // Default image if none is provided
    return url.startsWith('http') ? url : `${config.API_BASE_URL}${url}`;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    setFormData({
      ...formData,
      imageFile: file,
    });
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      Swal.fire({
        icon: 'error',
        title: 'Validation Error',
        text: 'Passwords do not match!',
      });
      return;
    }

    const formDataToSend = new FormData();
    formDataToSend.append('UserName', formData.userName);
    formDataToSend.append('Email', formData.email);
    formDataToSend.append('Password', formData.password);
    formDataToSend.append('ConfirmPassword', formData.confirmPassword);
    formDataToSend.append('Role', 'Admin');
    formDataToSend.append('ImageFile', formData.imageFile);

    try {
      const response = await axios.post('https://localhost:7261/api/Account/register/', formDataToSend);
      console.log('Admin registered successfully:', response.data);
      setShowModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Admin registered successfully!',
      });
      resetForm();
    } catch (err) {
      console.error('Failed to register admin:', err);
      if (err.response && err.response.data) {
        const errorMessages = err.response.data.map(error => error.description).join(', ');
        Swal.fire({
          icon: 'error',
          title: 'Registration Error',
          text: errorMessages,
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Registration Error',
          text: 'Failed to register admin. Please try again later.',
        });
      }
    }
  };

  const resetForm = () => {
    setFormData({
      userName: '',
      email: '',
      password: '',
      confirmPassword: '',
      imageFile: null,
    });
    setImagePreview(null);
  };

  const openModal = () => {
    resetForm();
    setShowModal(true);
  };

  return (
    <div className="dashboard-container">
      <h1>Admin Dashboard</h1>
      <div className="add_admin_btn" onClick={openModal}>
        <FaUser />
        <p>Add Admin</p>
      </div>
      <div className="controls">
        <label htmlFor="month-select"><FaCalendarAlt /> Select Month:</label>
        <select
          id="month-select"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
        >
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={i + 1}>
              {i + 1}
            </option>
          ))}
        </select>
      </div>
      {loading && <p>Loading...</p>}
      {error && <p className="error">{error}</p>}
      {data && (
        <div className="data-summary">
          <div className='admin-detail-card'>
            <div className="card">
              <FaBlog className="icon"/>
              <h2>Total Blogs</h2>
              <p>{data.getTotalCount.blogCount}</p>
            </div>
            <div className="card">
              <FaRegThumbsUp className="icon"/>
              <h2>Total Upvotes</h2>
              <p>{data.getTotalCount.upvoteCount}</p>
            </div>
            <div className="card">
              <FaRegThumbsDown className="icon"/>
              <h2>Total Downvotes</h2>
              <p>{data.getTotalCount.downvoteCount}</p>
            </div>
          </div>
          <div className="user-section">
            <h3>Top Ten Users</h3>
            <div className="grid">
              {data.getTotalCount.topTenUser.map(user => (
                <div key={user.id} className="grid-item">
                  <img src={resolveImageUrl(user.image)} alt={user.userName} />
                  <div>
                    <strong>{user.userName}</strong>
                    <p>{user.email}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="blog-section">
            <h3>Top Ten Blogs</h3>
            <div className="grid">
              {data.getTotalCount.topTenBlog.map(blog => (
                <div key={blog.id} className="grid-item">
                  <img src={resolveImageUrl(blog.imageUrl)} alt={blog.title} />
                  <div>
                    <strong>{blog.title}</strong>
                    <p>{blog.body.substring(0, 100)}...</p>
                    <small>{new Date(blog.postDate).toLocaleDateString()}</small>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>Add Admin</h2>
            <form onSubmit={handleSubmit}>
              <label>
                UserName:
                <input type="text" name="userName" value={formData.userName} onChange={handleInputChange} required />
              </label>
              <label>
                Email:
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required />
              </label>
              <label>
                Password:
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required />
              </label>
              <label>
                Confirm Password:
                <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required />
              </label>
              <label>
                Image:
                <input type="file" onChange={handleImageChange} required />
              </label>
              {imagePreview && <img src={imagePreview} alt="Preview" className="image-preview" />}
              <button type="submit">Add Admin</button>
              <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
