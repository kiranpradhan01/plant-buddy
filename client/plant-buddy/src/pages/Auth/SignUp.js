import React, {useEffect, useContext, useState} from 'react';
import {BrowserRouter as Router, useHistory, Link} from "react-router-dom";

import {signUp} from "../../helpers/auth";

const SignUp = () => {

  const history = useHistory();
  const [fName, setFName] = useState();
  const [lName, setLName] = useState();
  const [uName, setUName] = useState();
  const [email, setEmail] = useState();
  const [pass, setPass] = useState();
  const [conf, setConf] = useState();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))

  useEffect(() => {
    if(user) {
      history.push("/plants");
    }
  }, [user, history])

  const submit = async () => {
    const cred = {
      firstName: fName,
      lastName: lName,
      email: email,
      password: pass,
      passwordConf: conf,
      userName: uName
    }
    console.log(cred);
    await signUp(cred, setUser);
  }

  return(
    <div className="w-100 mt-5 d-flex flex-column align-items-center justify-content-center">
      <div className="w-50 p-3">
        <div class="form-group row">
          <label for="firstName" class="col-sm-2 col-form-label">First Name</label>
          <div class="col-sm-10">
            <input type="text" class="form-control" id="firstName" placeholder="First Name" onChange={(text) => setFName(text.target.value)}/>
          </div>
        </div>
        <div class="form-group row">
          <label for="lastName" class="col-sm-2 col-form-label">Last Name</label>
          <div class="col-sm-10">
            <input type="text" class="form-control" id="lastName" placeholder="Last Name" onChange={(text) => setLName(text.target.value)}/>
          </div>
        </div>
        <div class="form-group row">
          <label for="userName" class="col-sm-2 col-form-label">User Name</label>
          <div class="col-sm-10">
            <input type="text" class="form-control" id="userName" placeholder="User Name" onChange={(text) => setUName(text.target.value)}/>
          </div>
        </div>
        <div class="form-group row">
          <label for="email" class="col-sm-2 col-form-label">Email</label>
          <div class="col-sm-10">
            <input type="email" class="form-control" id="email" placeholder="Email" onChange={(text) => setEmail(text.target.value)}/>
          </div>
        </div>
        <div class="form-group row">
          <label for="password" class="col-sm-2 col-form-label">Password</label>
          <div class="col-sm-10">
            <input type="password" class="form-control" id="password" placeholder="Password" onChange={(text) => setPass(text.target.value)}/>
          </div>
        </div>
        <div class="form-group row">
          <label for="confirmPassword" class="col-sm-2 col-form-label">Password</label>
          <div class="col-sm-10">
            <input type="password" class="form-control" id="confirmPassword" placeholder="Confirm Password" onChange={(text) => setConf(text.target.value)}/>
          </div>
        </div>
        <div class="form-group row">
          <div class="col-sm-10 offset-sm-2">
            <button type="" class="btn btn-primary" onClick={() => submit()}>Sign in</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignUp
