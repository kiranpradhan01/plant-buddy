import "./App.css";
import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import AddPost from "./pages/AddPost";
import Home from "./pages/Home";
import Login from "./pages/Auth/Login";
import Plants from "./pages/Plants";
import Plant from "./pages/Plant";
import Post from "./pages/Post";
import Profile from "./pages/Profile";
import SignUp from "./pages/Auth/SignUp";

import Navigation from "./components/Navigation";

function App() {
    return (
      <div className="App">
          <Router>
            <Navigation/>
            <Switch>
              <Route path="/login" component={Login}/>
              <Route path="/signup" component={SignUp}/>
              <Route path="/plants" component={Plants}/>
              <Route path="/profile" component={Profile}/>
              <Route path="/plant/:plantID" component={Plant}/>
              <Route path="/post/add/:plantID" component={AddPost}/>
              <Route path="/post/:postID" component={Post}/>
              <Route exact path="/" component={Home}/>
            </Switch>
          </Router>
      </div>
    );
};

export default App;
