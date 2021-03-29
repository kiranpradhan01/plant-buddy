import React, {useEffect, useState} from 'react';
import { NavLink } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import plant from '../resources/plant.svg';
import {signOut} from '../helpers/auth';

const Navigation = () => {

    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))

    return (
        // bg="dark"
            <Navbar id="nav" expand="lg">
                <Navbar.Toggle aria-controls="basic-navbar-nav"></Navbar.Toggle>
                <Navbar.Collapse id="basic-navbar-nav">
                    <NavLink className="navbar-brand" to="/">
                        <div class="header">
                            <h3 id="brand-title">PlantBuddy<img src={plant} alt="Logo" id="brand-logo"/></h3>
                        </div>
                    </NavLink>
                    <Nav className="justify-content-end" style={{ width: "100%" }}>
                        <NavLink className="d-inline p-2  link-path" to="/">HOME</NavLink>
                        <NavLink className="d-inline p-2 link-path" to="/plants">PLANTS</NavLink>
                        {
                          user ? <><NavLink className="d-inline p-2  link-path" to="/profile">PROFILE</NavLink>
                        <NavLink className="d-inline p-2  link-path" to="/login" onClick={() => signOut(setUser)}>SIGN OUT</NavLink></>
                      : <NavLink className="d-inline p-2  link-path" to="/login">LOG IN</NavLink>
                        }
                    </Nav>
                </Navbar.Collapse>
            </Navbar>
    )
}

export default Navigation;
