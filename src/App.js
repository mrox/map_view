import './App.css';
import styled from 'styled-components';
import MapLL from './Map';
import _ from 'lodash'
import React, { useContext, useEffect, useState } from 'react';
import Button from '@mui/material/Button';
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco, googlecode } from 'react-syntax-highlighter/dist/esm/styles/hljs';
import SQLResult from './SqlResult';
import { Drawer, Card, CardContent, TextField, Tabs, List, Tab, Box, ListItem, ListItemText, ListItemIcon, IconButton, ListItemButton, Input } from '@mui/material';
import { v4 as uuidv4, validate as isValidUUID } from 'uuid';
import API from './Api';
import InsightsIcon from '@mui/icons-material/Insights';
import BluetoothIcon from '@mui/icons-material/Bluetooth';
import ModeEditOutlineIcon from '@mui/icons-material/ModeEditOutline';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LogoutIcon from '@mui/icons-material/Logout';
function App() {
  const [center, setCenter] = useState([21.0294498, 105.8544441])
  const [polygons, setPolygons] = useState(new Map())
  const [showResult, setShowResult] = useState(false)
  const [locations, setLocations] = useState(new Map())
  const [tab, setTab] = useState(0)
  const [showPolygon, setShowPolygon] = useState();
  const [isLogin, setIslogin] = useState(false);
  const [username, setUsername] = useState();
  const [password, setPassword] = useState();

  const changePolygons = (type, v) => {
    switch (type) {
      case 'edit':
        let c = polygons.get(v.id)
        if (c) {
          v.data.name = c.name;
        }
        setPolygons(new Map(polygons.set(v.id, v.data)))
        break;
      case 'delete':
        polygons.delete(v.id)
        setPolygons(new Map(polygons))
        break;
      default:
        setPolygons(new Map(polygons.set(v.id, v.data)))
        break;
    }
  }

  const getData = async () => {
    try {

      let ls = await API.getLocations()

      let m = new Map()
      ls.forEach(v => {
        // if (!v.beaconId) {
        m.set(v.id, v)
        // }
      })
      setLocations(m)
      // console.log(locations);
    } catch (error) {
      alert(error)
    }
  }
  useEffect(() => {
    if (tab == 0)
      getData()
  }, [tab])


  useEffect(async () => {
    console.log("effect");
    if (localStorage.getItem('username')) {

      await onLogin(localStorage.getItem('username'), localStorage.getItem('password'))
      await getData()
    }

  }, [])


  const changeName = (id, v) => {
    let newNData = polygons.get(id);
    newNData.name = v.target.value;
    setPolygons(new Map(polygons.set(id, newNData)))
  }
  const viewPolygon = (v) => {
    let polygonData = locations.get(v).polygon
    setShowPolygon(
      {
        id: v,
        name: locations.get(v).name,
        p: JSON.parse(polygonData).map(d => [d.lat, d.lng]),
      }
    );

    console.log(`showPolygon:${v}`);
    // console.log(v);
  }
  const onSavePolygon = () => {
    polygons.forEach(async (v, i) => {
      try {
        let rs;
        if (isValidUUID(i)) {
          rs = await API.updateLocation(i, v)
        }
        else {
          rs = await API.createLocation(v)
        }
        setPolygons(new Map())
        alert("updated")
      } catch (error) {
        alert(error.message)
      }
      finally {
        console.log(`update done`);
      }

    })
  }
  const onClearPolygon = () => {
    setPolygons(new Map())
  }
  const onLogin = async (u, p) => {
    try {
      await API.login(u, p)
      localStorage.setItem('username', u)
      localStorage.setItem('password', p)
      setIslogin(true)
      await getData()
    } catch (error) {
      alert(error.message)
    }
  }
  const onLogout = () => {
    setIslogin(false);
    API.logOut()
  }
  return (
    <>
      <Container>
        <LeftStyled>
          {!isLogin ?
            <LoginForm>
              <h3>Login</h3>
              <TextField id="outlined-basic" label="username" variant="outlined" type='text' onChange={(e) => setUsername(e.target.value)} value={username} />
              <TextField id="outlined-basic" label="password" variant="outlined" type='password' onChange={(e) => setPassword(e.target.value)} value={password} />
              <Button variant='contained' onClick={() => onLogin(username, password)}>Login</Button>
            </LoginForm>
            :
            <>
              <SearchContainer>
                <IconButton onClick={onLogout} aria-label="logout">
                  <LogoutIcon />
                </IconButton>
                <Tabs variant="fullWidth" value={tab} onChange={(e, n) => { setTab(n) }} centered>
                  <Tab label="Locations" />
                  <Tab label="Polygons" />
                </Tabs>
              </SearchContainer>

              <SearchResults>
                <TabPanel value={tab} index={0}>
                  <List dense>
                    {[...locations.keys()].map(k => (
                      <ListItem key={k}>
                        <ListItemButton onClick={() => viewPolygon(k)} >
                          <ListItemIcon>
                            {!locations.get(k).beaconId ?
                              <InsightsIcon size='small' /> : <BluetoothIcon size='small' color="primary" />
                            }
                          </ListItemIcon>


                          <ListItemText
                            primary={locations.get(k).name}
                          />
                        </ListItemButton>
                      </ListItem>
                    ))}
                  </List>
                </TabPanel>
                <TabPanel value={tab} index={1}>
                  {[...polygons.keys()].map(k => (
                    <Card key={k} variant="outlined">
                      <CardContent>
                        <TextField label="Name" fullWidth size="small" onChange={(v) => changeName(k, v)} id="outlined-basic" variant="outlined" value={polygons.get(k).name} />
                        <SyntaxHighlighter language="json" style={googlecode}>
                          {JSON.stringify(polygons.get(k).points)}
                        </SyntaxHighlighter>
                      </CardContent>
                    </Card>
                  ))}
                  {
                    polygons.size > 0 && <div>
                      <Button ariant='outlined' onClick={onClearPolygon}>clear</Button>
                      <Button variant="contained" onClick={onSavePolygon}>Save</Button>
                    </div>
                  }
                </TabPanel>

              </SearchResults>
            </>
          }
        </LeftStyled>
        <RightStyled>
          <MapLL center={center} changePolygons={changePolygons} viewPolygon={showPolygon} />
        </RightStyled>

      </Container>


    </>
  );
}

const LoginForm = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`
const Result = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 200px;
  z-index: 1000;
`

const LeftStyled = styled.div`
  padding: 8px;
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 100vh;
  overflow-y: auto;
`
const RightStyled = styled.div`
  width: calc(100vw - 400px);
  height: 100vh;
`

const SearchContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 4px;
`
const SearchResults = styled.div`
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0;
  margin: 0;
`

const Container = styled.div`
  display: flex;
  flex-direction: row;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`


function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      hidden={value !== index}
      {...other}
    >
      {value === index && (
        <>
          {children}
        </>
      )}
    </div>
  );
}
export default App;
