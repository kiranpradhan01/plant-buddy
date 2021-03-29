const fetch = require('node-fetch');

// GET request to /posts returns all posts to the user
// GET request to /posts/plant/:plantID will return all posts about plant with plantID
const getPostsHandler = async (req, res, { Post }) => {
    const user = JSON.parse(req.get('X-User'));
    var { plantID } = req.params
    try {
        res.setHeader("Content-Type", "application/json");
        const posts = await Post.find();
        var postResults = [];
        if (plantID != "") {
            // if request body specific plantID
            for (var post of posts) {
                if (post.plantID == plantID) {
                    postResults.push(post);
                }
            }
        } else {
            // get all posts
            for (var post of posts) {
                postResults.push(post);
            }
        }
        res.json(postResults); // sets headers for you
    } catch (err) {
        res.status(500).send(`Error getting posts: ${err}`);
    }
}

// POST request to /posts creates a new post from the request body, adds it to mongoose, and responds with a JSON obj of the new post
const postPostsHandler = async (req, res, { Post }) => {
    const user = JSON.parse(req.get('X-User'));
    var { title, message, plantID } = req.body;
    // if plantID does not exist in the request body
    if (!plantID) {
        res.status(400).send("Plant ID not found");
        return;
    }
    // check if the requested plantID exists in posts
    await Post.findOne({"plantID": plantID}, function (err, result) {
        if (err) {
            res.status(500).send(`Error finding posts: ${err}`);
            return;
        }
    });

    // create new post object
    const newPost = {
        title: title,
        message: message,
        plantID: plantID
    };

    // respond with a query to mongoose
    const query = new Post(newPost);
    query.save((err, newPost) => {
        if (err) {
            res.status(500).send(`Error creating new post: ${err}`);
            return;
        }
        // set headers
        res.setHeader("Content-Type", "application/json");
        res.status(201).json(newPost);
    });
}

// DELETE request to /posts/:postID deletes a post with postID and responds with a success message
const deleteSpecificPostsHandler = async (req, res, { Post }) => {
  const postID = req.params.postID;

  try {
    await Post.findByIdAndDelete(postID, (err) => {
      if(err) throw(err);
    })

    res.setHeader("Content-Type", "application/json");
		return res.status(200).json({message: "success"})
  } catch (err) {
    return res.status(500).json({message: "error deleting post"})
  }
}

// GET request to /posts/:postID finds and returns the post with postID to the user
const getSpecificPostsHandler = async (req, res, { Post }) => {
  const postID = req.params.postID;

  try {
    const post = await Post.findOne({"_id": postID}).populate('comments');

    if(!post._id) {
      return res.status(400).json({message: "There is no post with that id"})
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(post);
  } catch (err) {
    return res.status(500).json({message: "error getting post"})
  }
}

// PATCH request to /post/:postID updates a post in mongoose with the given content in the request body and returns the updated post in JSON back to the user
const patchSpecificPostsHandler = async (req, res, { Post }) => {
  const postID = req.params.postID;

  try {
    const new_post = await Post.findByIdAndUpdate(postID, {...req.body}, {new: true});

    if(!new_post._id) {
      return res.status(400).json({message: "There is no post with that id"})
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(new_post);
  } catch (err) {
    return res.status(500).json({error: err})
  }
}

// POST request to /posts/:postID/comment creates a new comment from the request body, saves it to a post with postID in mongoose, and responds with a JSON obj of the comment to the user
const postSpecificCommentHandler = async (req, res, { Post, Comment}) => {
  const postID = req.params.postID;

  try {
    const comment = new Comment({...req.body});

    res.setHeader("Content-Type", "application/json");

    await Post.findById(postID, async (err, post) => {
      if(err) throw(err);
      if(!post) return res.status(400).json({message: "There is no post with that id"});

      await comment.save(async (err, newComment) => {
        if(err) throw(err);

        post.comments = [...post.comments, newComment._id];
        await post.save((err, newPost) => {
          if(err) throw(err);

          return res.status(200).json(newPost);
        });
      });
    })
  } catch (err)  {
    return res.status(500).json({error: err})
  }
}

// DELETE request to /posts/comment/:commentID deletes a comment with commentID and responds with a success message
const deleteSpecificCommentHandler = async (req, res, {Comment}) => {
  const commentID = req.params.commentID;

  try {
    await Comment.findByIdAndDelete(commentID, (err) => {
      if(err) throw(err);
    })

    res.setHeader("Content-Type", "application/json");
		return res.status(200).json({message: "success"})
  } catch (err) {
    return res.status(500).json({message: "error deleting comment"})
  }
}

// PATCH request to /posts/comment/:commentID updates a comment in mongoose with the given content in the request body and returns the updated comment in JSON back to the user
const patchSpecificCommentHandler = async (req, res, {Comment}) => {
  const commentID = req.params.commentID;

  try {
    const new_comment = await Comment.findByIdAndUpdate(commentID, {...req.body}, {new: true});

    if(!new_comment._id) {
      return res.status(400).json({message: "There is no comment with that id"})
    }

    res.setHeader("Content-Type", "application/json");
    return res.status(200).json(new_comment);
  } catch (err) {
    return res.status(500).json({error: err})
  }
}

const getPlantToken = async (req, res, {}) => {
  console.log("Creating params");
  console.log(process.env.PLANT_TOKEN);
  const params = {
    origin: 'https://www.erikth.me',
    token: process.env.PLANT_TOKEN
  }

  console.log("fetching...");
  const response = await fetch(
      'https://trefle.io/api/auth/claim', {
        method: 'post',
        body: JSON.stringify(params),
        headers: { 'Content-Type': 'application/json' }
      });
  console.log(response);
  const json = await response.json();
  return res.status(200).json(json);
}

module.exports = {getPostsHandler, postPostsHandler, deleteSpecificPostsHandler, getSpecificPostsHandler, patchSpecificPostsHandler, postSpecificCommentHandler, patchSpecificCommentHandler, deleteSpecificCommentHandler, getPlantToken}
