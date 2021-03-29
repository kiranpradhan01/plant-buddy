import axios from 'axios';
import React, {useEffect} from "react";

import plantImg from '../resources/plant-gather.jpg';
import 'bootstrap/dist/css/bootstrap.css';
import {Link} from "react-router-dom";
import Copyright from "../components/Copyright";
import {Button} from 'react-bootstrap';

const APIKEY = "wVz82cdV76B30gEglNaLc2ygsvGh6FG8zJ_khAmM1kw"
const URL = `https://trefle.io/api/v1/plants?token=${APIKEY}`;

const Home = () => {

	useEffect(() => {
		axios.get(URL).then(res => {
			return res;
		}).then(data => {
			console.log(data)
		})
	})

	return (<main>
		<div id="landing-page">
			<div id="home">
				<div id="home-caption">
					<h1>PlantBuddy</h1>
					<p>Plant Buddy supports finding best plant that can be your long lasting meaningful relationship</p>
					<Link to="/plants">
						<Button variant="info">Explore Your Plant</Button>
					</Link>
				</div>
				<div id="home-img">
					<img src={plantImg} alt="A person planting a seed on earth, a person watering the earth, and a person throwing away trash."/>
				</div>
			</div>
		</div>
		<Copyright/>
	</main>);
};

export default Home;
