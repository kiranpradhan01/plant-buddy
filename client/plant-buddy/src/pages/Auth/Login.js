import React, {useEffect, useContext, useState} from 'react';
import {BrowserRouter as Router, useHistory, Link} from "react-router-dom";

import {signIn} from "../../helpers/auth";

const Login = () => {

  const [email, setEmail] = useState();
  const [pass, setPass] = useState();
  const history = useHistory();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))

  useEffect(() => {
    if(user) {
      history.push("/plants");
    }
  }, [user, history])

  const submit = async (values) => {
    await signIn({
      email: email,
      password: pass,
    }, setUser);
  }

  return(
    <div className="w-100 mt-5 d-flex flex-column align-items-center justify-content-center">
      <div className="w-50 p-3">
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
          <div class="col-sm-10 offset-sm-2">
            <button type="" onClick={()=> submit()} class="btn btn-primary">Sign in</button>
          </div>
        </div>
      </div>
      <Link to="/signup">New User? Sign Up Now!</Link>
    </div>
  )
}

export default Login
