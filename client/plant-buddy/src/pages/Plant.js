import axios from 'axios'
import React, {useState, useEffect, useContext} from 'react';
import {BrowserRouter as Router, useParams, useHistory} from "react-router-dom";
import {Col, Row} from 'reactstrap'
import {BsFillXCircleFill} from "react-icons/bs";

import {usePostsPlant} from "../helpers/hooks";
import {deletePost} from "../helpers/post.js";
import {authHeader} from '../helpers/auth';

const Plant = () => {

  const [plant, setPlant] = useState({});
  const [loading, setLoading] = useState(true);
  const [plantToken, setPlantToken] = useState(localStorage.getItem('plantToken'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')))
  const history = useHistory();
  let { plantID } = useParams("/plant/:plantID");


  const {posts, isError, isLoading} = usePostsPlant(plantID)

  useEffect(() => {
    if(!user) {
      history.push("/login")
    }
  },[user, history])

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

    const getPlant = async () => {
      await axios.get(`${process.env.REACT_APP_PLANT_URL}/${plantID}?token=${plantToken}`)
      .then(res => {
        setLoading(false)
        setPlant(res.data.data)
      }).catch(err => {
        console.error(err);
        if(plantID) {
          alert("Failed to load resources for this plant");
          history.push("/plants")
        }
      });
    }

    setLoading(true)
    getPlant();
  }, [plantID, history])

  if(loading) {
    return (
      <div>
        Loading Data...
      </div>
    )
  } else {
    return (
      <div className="m-3">
        <Row>
          <Col>
            <img width="400" src={plant.image_url} alt={plant.common_name}/>
          </Col>
          <Col>
            <div>
              <h1 className="text-left text-capitalize">{plant.common_name}</h1>
              <h2 className="text-left">Scientific Name: {plant.scientific_name}</h2>
            </div>
            <div className="mt-4">
              {plant.genus && <p className="m-0 text-left">Genus: {plant.genus.name}</p>}
              {plant.family && <p className="m-0 text-left">Family: {plant.family_common_name}({plant.family.name})</p>}
              <p className="m-0 text-left">Observations:</p>
              <p className="text-left">{plant.observations}</p>
            </div>
          </Col>
        </Row>
        <div className="card-columns">
          {
            posts && posts.map(post => {
              console.log(post);
              return(<div className="card m-1 p-0">
              <div className="card-header">
                <BsFillXCircleFill onClick={() => deletePost(post._id)}/>
              </div>
                <div className="card-body">
                  <div className="card-title">{post.title}</div>
                  <div className="card-text">{post.message}</div>
                </div>
              </div>)
            })
          }
          <div className="card m-1 p-0">
            <div className="card-body">
              <button className="btn btn-primary"
                      onClick={() => history.push(`/post/add/${plantID}`)}>
                Add Post
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default Plant
