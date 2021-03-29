import React, {useEffect, useState, useContext} from "react";
import {BrowserRouter as Router, useHistory, useParams} from "react-router-dom";

import {addPost} from "../helpers/post.js";

const AddPost = () => {

	const history = useHistory();
	const [title, setTitle] = useState();
	const [message, setMessage] = useState();
	const [inputPlantID, setInputPlantID] = useState();
	let { plantID } = useParams("/plant/:plantID");

	useEffect(() => {
		if(plantID) {
				setInputPlantID(plantID);
		}
	}, [plantID])

	const submit = async () => {
		await addPost({
			title: title,
			message: message,
			plantID: inputPlantID
		});
		history.push(`/plant/${plantID}`)
	}

	return(
		<div className="w-100 mt-5 d-flex flex-column align-items-center justify-content-center">
      <div className="w-50 p-3">
        <div class="form-group row">
          <label for="title" class="col-sm-2 col-form-label">Title</label>
          <div class="col-sm-10">
            <input type="text" class="form-control" id="title" placeholder="Title" onChange={(text) => setTitle(text.target.value)}/>
          </div>
        </div>
        <div class="form-group row">
          <label for="message" class="col-sm-2 col-form-label">Message</label>
          <div class="col-sm-10">
            <input type="text" class="form-control" id="message" placeholder="Message" onChange={(text) => setMessage(text.target.value)}/>
          </div>
        </div>
        <div class="form-group row">
          <label for="plantID" class="col-sm-2 col-form-label">Plant ID</label>
          <div class="col-sm-10">
            <input type="text" class="form-control" id="plantID" placeholder={plantID ? plantID : "Plant ID"} onChange={(text) => setInputPlantID(text.target.value)}/>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-sm-10 offset-sm-2">
            <button type="" class="btn btn-primary" onClick={() => submit()}>Add Post</button>
          </div>
        </div>
      </div>
    </div>
	)

}

export default AddPost
