import React, {useState, useEffect, useContext} from 'react';
import {BroswerRouter as Router, useHistory} from "react-router-dom";

import {editUser} from "../helpers/auth";

const Profile = () => {

  const [edit, setEdit] = useState(false);
  const history = useHistory()
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  useEffect(() => {
      if(!user){
        history.push("/login")
      }
      console.log(user);
  }, [user])

  const submit = async (values) => {
    if(edit) {
      await editUser({
        firstName,
        lastName
      });
      setEdit(false);
    } else {
      setEdit(true)
    }
  }

  if(!user) {
    return(
      <div>
        Loading...
      </div>
    )
  } else {
    return(
      <div className="w-100 mt-5 d-flex flex-column align-items-center justify-content-center">
        <div className="w-50 p-3" onSubmit={submit}>
          <div class="form-group row">
            <label for="firstName" class="col-sm-2 col-form-label">First Name</label>
            <div class="col-sm-10">
              {
                edit ?
                <input type="text" class="form-control" id="firstName" placeholder="First Name" onChange={(text) => setFirstName(text.target.value)}/>
                : <div>{user.firstName}</div>
              }
            </div>
          </div>
          <div class="form-group row">
            <label for="lastName" class="col-sm-2 col-form-label">Last Name</label>
            <div class="col-sm-10">
              {
                edit ?
                <input type="text" class="form-control" id="lastName" placeholder="Last Name" onChange={(text) => setLastName(text.target.value)}/>
                : <div>{user.lastName}</div>
              }
            </div>
          </div>
          <div class="form-group row">
            <div class="col-sm-10 offset-sm-2">
              <button type="" onClick={() => submit()} class="btn btn-primary">{edit ? 'Save' : 'Edit'}</button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Profile;
