const { Router } = require("express");
const multer = require("multer");
const router = Router();
const path = require("path");
const Comment = require("../models/comment");

const Blog = require("../models/Blog");
// const { blob } = require("stream/consumers");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(`./public/upload`));
  },
  filename: (req, file, cb) => {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage: storage });

router.get("/add-new", (req, res) => {
  return res.render("addblog", {
    user: req.user,
  });
});

router.get("/:id", async (req, res) => {
  const blog = await Blog.findById(req.params.id).populate("createdBy");
  if (!blog) {
    return res.redirect("/"); // Redirect to home if blog not found
  }
  const comments = await Comment.find({ blodId: req.params.id }).populate(
    "createdBy"
  );
  return res.render("blog", {
    user: req.user,
    blog,
    comments,
  });
});

router.post("/comment/:blodId", async (req, res) => {
  if (!req.body.content || req.body.content.trim() === "") {
    // Fetch blog and comments to re-render the page with error
    const blog = await Blog.findById(req.params.blodId).populate("createdBy");
    const comments = await Comment.find({ blodId: req.params.blodId }).populate(
      "createdBy"
    );
    return res.render("blog", {
      user: req.user,
      blog,
      comments,
      error: "Please add a comment.",
    });
  }
  await Comment.create({
    content: req.body.content,
    blodId: req.params.blodId,
    createdBy: req.user.id,
  });
  return res.redirect(`/blog/${req.params.blodId}`);
});

router.post("/", upload.single("coverImage"), async (req, res) => {
  const { title, body } = req.body;
  if (!title || title.trim() === "" || !body || body.trim() === "") {
    return res.render("addBlog", {
      user: req.user,
      error: "Please enter both a title and body for your blog.",
    });
  }
  const blog = await Blog.create({
    title: title,
    body: body,
    createdBy: req.user.id,
    coverImageURL: req.file ? `/upload/${req.file.filename}` : null,
  });

  // Populate the createdBy field before redirecting to ensure author details are available
  const populatedBlog = await Blog.findById(blog._id).populate("createdBy");
  return res.redirect(`/blog/${populatedBlog._id}`);
});

module.exports = router;
