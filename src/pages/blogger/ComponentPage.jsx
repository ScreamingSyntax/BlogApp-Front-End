import { useParams } from "react-router-dom";
import Comments from "../../components/Comments";
import './styles/CommentsPage.scss'
import   { useState, useEffect } from "react";
import config from '../../configs/config';
import axios from "axios";
import Swal from "sweetalert2";
const ComponentPage = () => {
    const { blogId } = useParams();
    const [comments, setComments] = useState([]);
    
    const token = localStorage.getItem('token');
    const userId = localStorage.getItem('id'); // User ID from local storage for reaction checks
    const UPVOTE_WEIGHT = 2;
    const DOWNVOTE_WEIGHT = -1;
    useEffect(() => {
        if (blogId) {
            fetchComments();
        }
    }, [blogId]);
    const handleAddComment = () => {
        if (!token) {
            Swal.fire({
                icon: 'error',
                title: 'Unauthorized',
                text: 'You must be logged in to add comments.'
            });
            return;
        }
    
        Swal.fire({
            title: 'Add a new comment',
            input: 'textarea',
            inputPlaceholder: 'Type your comment here...',
            inputAttributes: {
                'aria-label': 'Type your comment here'
            },
            showCancelButton: true,
            confirmButtonText: 'Submit',
            showLoaderOnConfirm: true,
            preConfirm: (comment) => {
                if (!comment) {
                    Swal.showValidationMessage('Please enter a comment before submitting.');
                    return false;
                }
                return submitComment(comment);
            },
            allowOutsideClick: () => !Swal.isLoading()
        });
    };
    
    const submitComment = async (comment) => {
        try {
            const response = await axios.post(`${config.API_BASE_URL}/api/Comment/add/`, {
                blogPostId: blogId,
                content: comment
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
    
            if (response.status === 200 || response.status === 201) {
                Swal.fire({
                    icon: 'success',
                    title: 'Comment added successfully!',
                    showConfirmButton: false,
                    timer: 1500
                });
                fetchComments(); // Refresh comments after adding
            } else {
                throw new Error('Failed to add comment');
            }
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Failed to add comment',
                text: error.response?.data?.message || 'There was an error while posting your comment.'
            });
        }
    };
    const fetchComments = async () => {
        try {
            const response = await axios.get(`${config.API_BASE_URL}/api/Comment/${blogId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(response.data)
            console.log(blogId)
            console.log("This is user ID")
            console.log(userId)
            console.log("This is reaction_id")
            response.data.forEach(a=>{
                console.log(a)
            })
            const fetchedComments = response.data.map(comment => ({
                ...comment,
                authorImage: config.API_BASE_URL + comment.author.image,
                isLiked: comment.reactions.some(r => r.userId === userId && r.type === 0),
                isDisliked: comment.reactions.some(r => r.userId === userId && r.type === 1),
                commentLikeCount: comment.reactions.filter(r => r.type === 0).length,
                commentDislikeCount: comment.reactions.filter(r => r.type === 1).length,
            }));
            
            setComments(fetchedComments);
        } catch (error) {
            console.error("Error fetching comments:", error);
        }
    };

    return (
        <div>
            {token && (
                <section className="comment_btn_section" onClick={handleAddComment}>
                    <div className="add_comment_btn"> 
                        <box-icon name='plus-circle' color="white"></box-icon>
                        <p>Add Comment</p>
                    </div>
                </section>
            )}
            {comments.map(comment => (
                <Comments
                    key={comment.id}
                    comment_id={comment.id}
                    authorName={comment.author.userName}
                    authorImage={comment.authorImage}
                    content={comment.content}
                    date={comment.commentDate}
                    popularity= {UPVOTE_WEIGHT * comment.commentLikeCount + DOWNVOTE_WEIGHT * comment.commentDislikeCount }  
                    commentLikeCount={comment.commentLikeCount}
                    commentDislikeCount={comment.commentDislikeCount}
                    isLiked={comment.isLiked}
                    isDisliked={comment.isDisliked}
                />
            ))}
        </div>
    );
};

export default ComponentPage;