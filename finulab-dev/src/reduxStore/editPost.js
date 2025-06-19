import {createSlice} from '@reduxjs/toolkit';

export const editPostSlice = createSlice(
    {
        name: "editPost",
        initialState: {
            editPost: {
                "postId": "",
                "post": "",
                "postMedia": [],
                "groupDesc": {
                    "name": "",
                    "image": ""
                },
                "repostDesc": []
            }
        },
        reducers: {
            setEditPost: (state, action) => {
                const {postId, post, postMedia, groupDesc, repostDesc} = action.payload
                state.editPost = {
                    ...state.editPost,
                    "postId": postId,
                    "post": post,
                    "postMedia": postMedia,
                    "groupDesc": groupDesc,
                    "repostDesc": repostDesc
                }
            },
            clearEditPost: (state, action) => {
                state.editPost = {
                    ...state.editPost,
                    "postId": "",
                    "post": "",
                    "postMedia": [],
                    "groupDesc": {
                        "name": "",
                        "image": ""
                    },
                    "repostDesc": []
                }
            }
        }
    }
);

export const {setEditPost, clearEditPost} = editPostSlice.actions;
export const selectEditPost = (state) => state.editPost.editPost;
export default editPostSlice.reducer;