// app.js
const express = require('express');
const app = express();
const cors = require('cors');
const jwt = require("jsonwebtoken");
const authLogic = require('./authLogic');
const postLogic = require('./postLogic');
const likeLogic = require('./likeLogic');
const SECRET_KEY = "MY_TOKEN";

app.use(cors());
app.use(express.json());

app.listen(3000, () => {
    console.log("Server running on port 3000");
});


// Middleware to verify JWT
function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) return res.status(401).json({ message: "Access denied" });

    jwt.verify(token.split(" ")[1], SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}

// Đăng ký
app.post('/register', (req, res) => {
    const { username, password, dob, image } = req.body;
    const result = authLogic.register(username, password, dob, image);
    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});

// Đăng nhập
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const result = await authLogic.login(username, password);
    if (result.success) {
        res.json(result);
    } else {
        res.status(401).json(result);
    }
});
app.post('/forgot-password', (req, res) => {
    const { username } = req.body;
    const result = authLogic.resetPassword(username);
    if (result.success) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});


app.use(authenticateToken);
// Quản lý bài viết

app.get('/posts', (req, res) => {
    res.json(postLogic.getPosts());
});

app.post('/posts', (req, res) => {
    const username = req.user.username;
    const { title, content, status, type } = req.body;
    const newPost = postLogic.createPost(title, content, username, status, type);
    res.json(newPost);
});


app.get('/likes', (req, res) => {
    res.json(likeLogic.getLikes());
});

app.get('/posts/:id', (req, res) => {
    const post = postLogic.getPostById(+req.params.id);
    if (post) {
        res.json(post);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

app.put('/posts/:id', (req, res) => {
    const updatedPost = postLogic.updatePost(+req.params.id, req.body);
    if (updatedPost) {
        res.json(updatedPost);
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

app.delete('/posts/:id', (req, res) => {
    const deletedPost = postLogic.deletePost(+req.params.id);
    if (deletedPost) {
        res.json({ message: 'Post deleted' });
    } else {
        res.status(404).json({ message: 'Post not found' });
    }
});

// Like bài viết
app.post('/posts/:id/like', (req, res) => {
    const username = req.user.username;
    const result = likeLogic.likePost(+req.params.id, username);
    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});

// Unlike bài viết
app.post('/posts/:id/unlike', (req, res) => {
    const username = req.user.username;
    const result = likeLogic.unlikePost(+req.params.id, username);
    if (result.success) {
        res.json(result);
    } else {
        res.status(400).json(result);
    }
});

app.get('/posts/:id/likes', (req, res) => {
    const likes = likeLogic.getLikesByPost(+req.params.id);
    res.json(likes);
});


app.put('/users/update-profile', (req, res) => {
    const username = req.user.username;
    const updatedData = req.body;
    const result = authLogic.updateUser(username, updatedData);
    if (result.success) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});

app.get('/users/get-profile', (req, res) => {
    const username = req.user.username;
    const result = authLogic.getInfo(username);
    if (result.success) {
        res.json(result);
    } else {
        res.status(404).json(result);
    }
});
