import React, { useState } from 'react';
import axios from 'axios';
import './Comments.scss'; 
import Swal from 'sweetalert2';
import date_time from '../configs/date_time'; // Assuming similar utility function exists
import Toast from '../swal_fire/swal_fire';
import config from "../configs/config";
const Comments = ({
    comment_id,
    authorName,
    authorImage,
    content,
    date,
    popularity: initialPopularity,
    commentLikeCount,
    commentDislikeCount,
    isLiked: initialIsLiked,
    isDisliked: initialIsDisliked,
}) => {
    const [likeCount, setLikeCount] = useState(commentLikeCount);
    const [dislikeCount, setDislikeCount] = useState(commentDislikeCount);
    const [liked, setLiked] = useState(initialIsLiked);
    const [disliked, setDisliked] = useState(initialIsDisliked);
    const [popularity, setPopularity] = useState(initialPopularity);
    const currentUser = localStorage.getItem('name');
    const UPVOTE_WEIGHT = 2;
    const DOWNVOTE_WEIGHT = -1;
    const COMMENT_WEIGHT = 1;
    const handleEdit = () => {
        Swal.fire({
            title: 'Edit Comment',
            input: 'textarea',
            inputValue: content,
            inputPlaceholder: 'Type your comment here...',
            showCancelButton: true,
            confirmButtonText: 'Update',
            showLoaderOnConfirm: true,
            preConfirm: (newContent) => {
                if (!newContent.trim()) {
                    Swal.showValidationMessage('The comment cannot be empty!');
                    return false;
                }
                return newContent;
            }
        }).then((result) => {
            if (result.isConfirmed && result.value && result.value !== content) {
                updateComment(result.value);
            }
        });
    };
    
    const updateComment = async (newContent) => {
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'You must be logged in to edit comments.'
            });
            return;
        }
    
        try {
            const response = await axios.put(`${config.API_BASE_URL}/api/Comment/update/${comment_id}`, {
                content: newContent
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });
    
            if (response.status === 200) {
                Swal.fire({
                    icon: 'success',
                    title: 'Comment updated successfully!',
                    timer: 1500
                });
                window.location.reload();
            } else {
                throw new Error('Failed to update comment');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to update comment',
                text: error.response?.data?.message || 'An error occurred while updating your comment.'
            });
        }
    };

  
    const handleLike  = async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'You must be logged in to dislike comments.'
            });
            return;
        }
        const newLikeCount = liked ? likeCount - 1 : likeCount + 1;
        const newDislikeCount = disliked ? dislikeCount - 1 : dislikeCount;
        setLiked(!liked);
        if (disliked) {
            setDisliked(false);
            setDislikeCount(newDislikeCount);
        }
        await sendReactionToServer('UpVote');
        setLikeCount(newLikeCount);
        updatePopularity(newLikeCount, newDislikeCount);
    };
    const sendReactionToServer = async (reactionType) => {
        const token = localStorage.getItem('token');
        const url = `https://localhost:7261/api/BlogReaction/addcommentreaction/${comment_id}`;
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `bearer ${token}`
                },
                body: JSON.stringify({ userReaction: reactionType })
            });
    
            if (!response.ok) {
                throw new Error('Failed to post reaction');
            }
            const data = await response.text();
            Toast.fire({
                icon: 'success',
                title: data
            });
            return data;
        } catch (error) {
            Toast.fire({
                icon: 'error',
                title: 'Failed to update reaction'
            });
            console.error('Error posting reaction:', error);
        }
    };
    const handleDislike =  async () => {
        const token = localStorage.getItem('token');
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'You must be logged in to dislike comments.'
            });
            return;
        }
        const newDislikeCount = disliked ? dislikeCount - 1 : dislikeCount + 1;
        const newLikeCount = liked ? likeCount - 1 : likeCount;
        setDisliked(!disliked);
        if (liked) {
            setLiked(false);
            setLikeCount(newLikeCount);
        }
        await sendReactionToServer('DownVote');
        setDislikeCount(newDislikeCount);
        updatePopularity(newLikeCount, newDislikeCount);
    };
    const handleDelete = () => {
        var token = localStorage.getItem('token')
        Swal.fire({
            title: 'Are you sure?',
            text: "You won't be able to revert this!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, delete it!'
        }).then((result) => {
            if (result.isConfirmed) {
                if (!token) {
                    Swal.fire({
                        icon: 'error',
                        title: 'Unauthorized',
                        text: 'You must be logged in to perform this action.'
                    });
                    return;
                }
    
                // Assuming `comment_id` is accessible here, if not pass it to `handleDelete` when you call it
                deleteComment(comment_id);
            }
        });
    };
    
    const deleteComment = async (commentId) => {
        var token = localStorage.getItem('token')
        try {
            const response = await axios.delete(`${config.API_BASE_URL}/api/Comment/delete/${commentId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.status === 200 || response.status === 204) { // Check if the deletion was successful
                Swal.fire(
                    'Deleted!',
                    'Your comment has been deleted.',
                    'success'
                );
                window.location.reload();
             
            } else {
                throw new Error('Failed to delete the comment');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to delete comment',
                text: error.response?.data?.message || 'There was an error attempting to delete the comment.'
            });
        }
    };

    const updatePopularity = (newLikeCount, newDislikeCount) => {
        var newPops = (newLikeCount * UPVOTE_WEIGHT) + 
               (newDislikeCount * DOWNVOTE_WEIGHT)
        setPopularity(newPops);
        return newPops
    };

    return (
        <div className="comment">
            <div className="comment-header">
                <img src={authorImage} alt={authorName} className="comment-author-image" />
                <div className='comment_names_div'>
                    <strong>{authorName}</strong>
                    <span>{date_time(date)}</span>
                </div>
                
                {currentUser == authorName && (
                    <div className="comment-actions">
                        <box-icon type='solid' name='edit' onClick={handleEdit} color="blue"> </box-icon>
                        <box-icon name='trash' type='solid' onClick={handleDelete} color="red"></box-icon>
                    </div>
                )}
            </div>
            <p className="comment-content">{content}</p>
            <div className="comment-footer">
                <button className="like-button" onClick={handleLike}>
                    <box-icon name='like' type={liked ? 'solid' : 'regular'} color='blue'></box-icon>
                    <span>{likeCount}</span>
                </button>
                <button className="dislike-button" onClick={handleDislike}>
                    <box-icon name='dislike' type={disliked ? 'solid' : 'regular'} color='red'></box-icon>
                    <span>{dislikeCount}</span>
                </button>
                <button className="popularity-button">
                    <box-icon name='star' type='solid' color="orange"></box-icon>
                    {popularity}
                </button>
            </div>
        </div>
    );
};

export default Comments;
