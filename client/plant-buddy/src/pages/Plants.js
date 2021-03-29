import axios from 'axios';
import React, {useState, useEffect, useContext} from 'react';
import {BrowserRouter as Router, useHistory} from "react-router-dom";
import {BsFillCaretRightFill, BsFillCaretLeftFill} from "react-icons/bs";

import {authHeader} from '../helpers/auth';

const LAST_PAGE = 18000

const Plants = () => {
	const history = useHistory();
	const [plants, setPlants] = useState([]);
	const [page, setPage] = useState(1);
	const [plantToken, setPlantToken] = useState(localStorage.getItem('plantToken'));
	const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))

	useEffect(() => {
		const getPlantToken = async () => {
			await axios.get(`${process.env.REACT_APP_API_URL}/posts/plant/token`, {headers: authHeader()})
			.then(res => {
				const token = res.data.token;
        if(token) {
          localStorage.setItem('plantToken', token);
          setPlantToken(token)
        } else {
					console.log(res);
				}
			}).catch(err => console.error(err))
		}

		const getPlants = async () => {
			if(!plantToken) {
					await getPlantToken();
			}

			setPlants([]);
			await axios.get(`${process.env.REACT_APP_PLANT_URL}?token=${plantToken}&page=${page}`)
			.then(res => {
				setPlants(res.data.data)
			}).catch(err => console.error(err))
		}

		getPlants();
	}, [page, plantToken])

	useEffect(() => {
		if(!user) {
			history.push("/login")
		}
	},[user, history])


  return(
    <React.Fragment>
			<div className="d-flex flex-column align-items-center">
				<div className="card-columns">
					{
						plants.map(plant => <Plant plant={plant}/>)
					}
				</div>
				<div className="mt-3 d-flex flex-row justify-content-center ">
					{
						page > 1 && <BsFillCaretLeftFill onClick={() => setPage(page-1)}/>
					}
					<p className="ml-1 mr-1">{page}</p>
					{
						page < LAST_PAGE && <BsFillCaretRightFill onClick={() => setPage(page+1)}/>
					}
				</div>
			</div>
		</React.Fragment>
  )
}

const Plant = ({plant}) => {

	return(
		<a href={`/plant/${plant.id}`}>
			<div className="card m-1 p-0">
				<img className="card-image-top" width="250" src={plant.image_url} alt={plant.common_name}/>
				<div className="card-body">
					<h1 className="card-title text-black">{plant.common_name}</h1>
					<h2 className="card-subtitle text-black-50">{plant.scientific_name}</h2>
				</div>
			</div>
		</a>

	)
}

export default Plants;
