require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const userRoute = require("./routes/user");
const blogRoute = require("./routes/blog");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const { checkForAuthenticationCookie } = require("./services/authentication");

const Blog = require("./models/Blog");

const Port = process.env.PORT || 8005;

mongoose
  .connect(process.env.MONGO_URL, {})
  .then(() => {
    console.log(" Connected to MongoDB successfully");
  })
  .catch((err) => {
    console.error(" Error connecting to MongoDB:", err.message);
  });

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.json());
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({})
    .sort({ createdAt: -1 })
    .populate("createdBy");
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(Port, () => {
  console.log(`Server is running on port ${Port}`);
});
