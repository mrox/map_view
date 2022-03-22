import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap, FeatureGroup } from 'react-leaflet'
import styled from 'styled-components';
import 'leaflet/dist/leaflet.css';
// import './leaflet-draw.css'
import { OpenStreetMapProvider } from "react-leaflet-geosearch";
import { EditControl } from "react-leaflet-draw"
import SearchControl from "./SearchControl";
import React, { useContext, useEffect, useState } from 'react';

import L from 'leaflet';
import { max, min } from 'lodash';

delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
    iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
    iconUrl: require('leaflet/dist/images/marker-icon.png'),
    shadowUrl: require('leaflet/dist/images/marker-shadow.png')
});

const py = [[20.993947, 105.937076], [20.994478, 105.937914], [20.993857, 105.938482], [20.993156, 105.937763], [20.993947, 105.937076]]
const point = [20.994051200000000000000000000000, 105.937956100000000000000000000000]
const limeOptions = { color: 'lime' }

//https://nominatim.openstreetmap.org/search?q=h%C3%A0%20n%E1%BB%99i&format=json
function ChangeView({ position, zoom }) {
    const map = useMap();
      
    let latMin = min(position.map(v => v[0]))
    let lngMin = min(position.map(v => v[1]))
    let latMax = max(position.map(v => v[0]))
    let lngMax = max(position.map(v => v[1]))

    map.fitBounds([[latMin, lngMin], [latMax, lngMax]], { maxZoom: 16 });
    return null;
}

function MapLL({ center, changePolygons, viewPolygon }) {
    const prov = OpenStreetMapProvider();
    const [map, setMap] = useState(null);
    useEffect(() => {
        console.log(viewPolygon);
        viewPolygon && console.log(`plg: ${viewPolygon[0]}`);
        // viewPolygon && mapRef.setView(viewPolygon[0])
        map && map.eachLayer(l => {
            console.log(l);
            // if (Object.keys(l._layers).length > 0) {
            //     map.removeLayer(l);
            //   }
        })
    }, [viewPolygon])

    const onDrawFinish = (e) => {
        console.log('onDrawFinish');
        let type = e.layerType;
        let layer = e.layer;
        if (type === 'marker') {
            // Do marker specific actions
            console.log('_onCreated: marker created', e);
        } else {
            if (layer?.editing?.latlngs) {
                changePolygons('add', {
                    id: layer._leaflet_id.toString(), 
                        data: {
                        name: `${layer._leaflet_id}`,
                        points: layer?.editing?.latlngs[0][0].map(v => ({ lat: v.lat, lng: v.lng }))
                    }
                })
            }
        }

    };
    const onEdited = (e) => {
        console.log(e.layers);
        console.log('onEdited',e.layers._layers);
        for (const key in e.layers._layers) {
            if (Object.hasOwnProperty.call(e.layers._layers, key)) {
                const element = e.layers._layers[key];
                console.log(key, element.options.attribution, element);
                let name = key;
                let id = key.toString();
                if(element.options.attribution) {
                    let data = JSON.parse(element.options.attribution)
                    name = data.name;
                    id = data.id;
                }
                changePolygons('edit', {
                    id,
                    // p: element?.editing?.latlngs[0][0].map(v => ({lat: v.lat, lng:v.lng}))
                    data: {
                        name: name,
                        points: element?.editing?.latlngs[0][0].map(v => ({ lat: v.lat, lng: v.lng }))
                    }
                })
            }
        }

    }

    const onDeleted = (e) => {
        for (const key in e.layers._layers) {
            if (Object.hasOwnProperty.call(e.layers._layers, key)) {
                const element = e.layers._layers[key];
                let id = key.toString()
                if(element.options.attribution) {
                    let data = JSON.parse(element.options.attribution)
                    id = data.id;
                }
                changePolygons('delete', {
                    id,
                    p: element?.editing?.latlngs[0][0].map(v => ({ lat: v.lat, lng: v.lng }))
                })
            }
        }
    }
    const onCreatePoly = (e) => {
        console.log(`onCreatePoly: ${e}`);
    }
    return (

        <SMapContainer
        
            // ref={mapRef}
            // whenCreated={ mapInstance => { mapRef.current = mapInstance } }
            whenCreated={setMap}
            center={center}
            zoom={6}
            maxZoom={18}
            key={viewPolygon? viewPolygon.id:1}
            >
            {viewPolygon && <ChangeView position={viewPolygon.p} />}


            <TileLayer
                // url="https://api.mapbox.com/styles/v1/tuyentran/cl0hkluab000g14o320uvadhj/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidHV5ZW50cmFuIiwiYSI6ImNsMGhrZHpzMjA2ZTQzY3VlMWg4NnptN2sifQ.k0yWz_HAfNvCl0kLembacQ"
                url="https://api.mapbox.com/styles/v1/tuyentran/cl0hkluab000g14o320uvadhj/tiles/256/{z}/{x}/{y}@2x?access_token=pk.eyJ1IjoidHV5ZW50cmFuIiwiYSI6ImNsMGhrZHpzMjA2ZTQzY3VlMWg4NnptN2sifQ.k0yWz_HAfNvCl0kLembacQ"
                attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
            />

            <FeatureGroup>
                {viewPolygon && <Polygon attribution={
                        JSON.stringify({
                            id: viewPolygon.id,
                            name: viewPolygon.name
                        })
                    } 
                    pathOptions={limeOptions} positions={viewPolygon.p} onMounted={(e) => onCreatePoly(e)} onCreated={(e) => onCreatePoly(e)} 
                 />}
                <EditControl
                    position='topright'
                    // onEdited={this._onEditPath}
                    onCreated={onDrawFinish}
                    onEdited={onEdited}
                    onDeleted={onDeleted}
                    draw={{
                        rectangle: false,
                        circle: false,
                        marker: false,
                        circlemarker: false,
                        polyline: false
                    }}
                />
            </FeatureGroup>
            <SearchControl
                provider={prov}
                showMarker={true}
                showPopup={true}
                popupFormat={({ query, result }) => result.label}
                maxMarkers={3}
                retainZoomLevel={false}
                animateZoom={true}
                autoClose={true}
                searchLabel={"Enter address"}
                keepResult={false}
            />
        </SMapContainer>
    );
}

const SMapContainer = styled(MapContainer)`
    width: 100%;
    height: 100%;
`

const CContainer = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
`

export default MapLL;
