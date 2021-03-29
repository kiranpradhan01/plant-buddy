//import axios from 'axios'
import React, {useEffect, useState} from 'react';
import {BrowserRouter as Router, useParams, useHistory} from "react-router-dom";

//import {usePost} from "../helpers/hooks";

const Post = () => {

  const history = useHistory();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  let { postID } = useParams();

  useEffect(() => {
    if(!user) {
      history.push("/login")
    }
  },[user, history])

  //const {post, isError, isLoading} = usePost(postID);

  return (
    <div>
      {postID}
    </div>
  )
}

export default Post
