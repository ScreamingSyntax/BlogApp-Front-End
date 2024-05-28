import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Post from '../../components/Post';
import './styles/Profile.scss';
import config from '../../configs/config';
import Swal from 'sweetalert2';
import { Drawer, Button, List, ListItem, ListItemText } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const Profile = () => {
    const [userName, setUserName] = useState(localStorage.getItem('name'));
    const userEmail = localStorage.getItem('email');
    const [userImage, setUserImage] = useState(localStorage.getItem('image'));
    const [userPosts, setUserPosts] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [sidebarContent, setSidebarContent] = useState([]);
    const [sidebarTitle, setSidebarTitle] = useState('');
    const navigate = useNavigate();
    useEffect(() => {
        fetchUserPosts();
    }, []);
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


    const handleDeleteProfile = async () => {
        const result = await Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        });
        
        if (result.isConfirmed) {
            try {
                await axios.delete(`${config.API_BASE_URL}/api/Account/delete-user`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                localStorage.clear();
                navigate('/');
                window.location.reload();
                Swal.fire(
                    'Deleted!',
                    'Your profile has been deleted.',
                    'success'
                );
            } catch (error) {
                console.log(error)
                Swal.fire('Error', error.response?.data?.message || 'Failed to delete profile', 'error');
            }
        }
    };

    
    const resolveImageUrl = (url) => {
        if (!url) return null;
        return url.startsWith('http') ? url : `${config.API_BASE_URL}${url}`;
    };
    const updateLocalStorageFromResponse = (data) => {
        localStorage.setItem('name', data.username);
        localStorage.setItem('role', data.role);
        localStorage.setItem('email', data.email);
        localStorage.setItem('id', data.id);
        localStorage.setItem('image', resolveImageUrl(data.imageUrl));
        setUserImage(resolveImageUrl(data.imageUrl));
        // Trigger a re-render or navigate to refresh
        window.location.reload();
    };
    
    const fetchUserPosts = async () => {
        try {
            const { data } = await axios.get(`${config.API_BASE_URL}/api/BlogPost/my-blogs/`, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            const fetchedPosts = data.map(bp => ({
                id: bp.blog.id,
                title: bp.blog.title,
                authorName: bp.blog.author.userName,
                authorImage: bp.blog.author.image,
                postImage: bp.blog.imageUrl,
                description: bp.blog.body,
                popularity: bp.popularity,
                postLikeCount: bp.reactions.filter(r => r.type === 0).length,
                postDislikeCount: bp.reactions.filter(r => r.type === 1).length,
                commentCount: bp.comments.length,
                date: bp.blog.postDate,
                isLiked: bp.reactions.some(r => r.userId === localStorage.getItem('id') && r.type === 0),
                isDisliked: bp.reactions.some(r => r.userId === localStorage.getItem('id') && r.type === 1)
            }));
            setUserPosts(fetchedPosts);
        } catch (error) {
            console.error("Error fetching user posts:", error);
            Swal.fire('Error', 'Failed to fetch user posts.', 'error');
        }
    };

    const handleImageChange = async (event) => {
        const file = event.target.files[0];
        if (file) {
            const formData = new FormData();
            formData.append('ImageFile', file);

            try {
                const { data } = await axios.put(`${config.API_BASE_URL}/api/Account/update-image/`, formData, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                });
                updateLocalStorageFromResponse(data);
                Swal.fire('Success', 'Image updated successfully', 'success');
                setUserImage(resolveImageUrl(data.imageUrl));
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to update image', 'error');
            }
        }
    };

    const handleUpdateUserName = async () => {
        const { value: newUsername } = await Swal.fire({
            title: 'Enter new username',
            input: 'text',
            inputLabel: 'New Username',
            showCancelButton: true,
            inputValidator: (value) => {
                if (!value) return 'You need to write something!';
            }
        });

        if (newUsername) {
            try {
                const { data } = await axios.put(`${config.API_BASE_URL}/api/Account/update-username/`, {
                    NewUsername: newUsername
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });
                updateLocalStorageFromResponse(data);
                setUserName(data.username);
                Swal.fire('Success', 'Username updated successfully', 'success');
            } catch (error) {
                Swal.fire('Error', error.response?.data?.message || 'Failed to update username', 'error');
            }
        }
    };

    const toggleSidebar = (open, title) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }
        setSidebarTitle(title);
        setIsSidebarOpen(open);
        if (open) {
            fetchHistoryData(title);
        }
    };

    const fetchHistoryData = async (title) => {
        let url = `${config.API_BASE_URL}/api/BlogPost/my-blog-history/`;
        if (title === 'Comment History') {
            url = `${config.API_BASE_URL}/api/Comment/history/`;
        }

        try {
            const { data } = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
            });
            setSidebarContent(data);
        } catch (error) {
            Swal.fire('Error', `Failed to fetch ${title.toLowerCase()}.`, 'error');
            console.error(`Error fetching ${title.toLowerCase()}:`, error);
        }
    };

    const renderSidebar = () => (
        <Drawer anchor='right' open={isSidebarOpen} onClose={toggleSidebar(false, '')}>
            <div className="sidebar" style={{width: '300px', padding: '20px'}} role="presentation">
                <h2>{sidebarTitle}</h2>
                <List>
                    {sidebarContent.map((item, index) => (
                        <ListItem key={index}>
                            <ListItemText
                                primary={item.title || item.content}
                                secondary={`Updated: ${new Date(item.updateDate || item.commentUpdateDate).toLocaleString()}`}
                            />
                        </ListItem>
                    ))}
                </List>
            </div>
        </Drawer>
    );

    return (
        <div className="profile">
            <div className="profile-card">
                <div className="user_image_profile_card">
                    <img src={resolveImageUrl(userImage)} alt={userName} className="profile-image" />
                    <input type="file" accept="image/*" onChange={handleImageChange} hidden id="profile-image-upload"/>
                    <label htmlFor="profile-image-upload" className="profile-image-upload-label">
                        <box-icon name='upload' color="white"></box-icon> Update Image
                    </label>
                </div>
                <div className="user_description">
                    <p className="user_name_profile">{userName}</p>
                    <p className="user_email_description">{userEmail}</p>
                    <div className='user_options_btn'>                  
                    <box-icon name='edit'  onClick={handleUpdateUserName} color="blue" ></box-icon>
                    <box-icon name='trash-alt' onClick = {handleDeleteProfile}  type='solid' color="red" ></box-icon>
                    <box-icon name='lock' onClick={handleLockClick} color="orange" ></box-icon>
                    </div>
                </div>
            </div>
            <div className="history-buttons">
                <Button variant="contained" color="primary" onClick={toggleSidebar(true, 'Blog History')}>
                    View Blog History
                </Button>
                <Button variant="contained" color="secondary" onClick={toggleSidebar(true, 'Comment History')}>
                    View Comment History
                </Button>
            </div>
            {renderSidebar()}
            {userPosts.map(post => (
                <Post
                    key={post.id}
                    blogId={post.id}
                    postTitle={post.title}
                    authorName={post.authorName}
                    authorImage={post.authorImage}
                    postImage={post.postImage}
                    description={post.description}
                    popularity={post.popularity}
                    postLikeCount={post.postLikeCount}
                    postDislikeCount={post.postDislikeCount}
                    commentCount={post.commentCount}
                    isLiked={post.isLiked}
                    isDisliked={post.isDisliked}
                    date={post.date}
                    redirectPath="/profile"
                />
            ))}
        </div>
    );
};

export default Profile;
