import React from 'react';
import Helmet from 'react-helmet';
import L from 'leaflet';
import axios from 'axios'

import Layout from 'components/Layout';
import Container from 'components/Container';
import Map from 'components/Map'; 


const LOCATION = {
  lat: 38.9072,
  lng: -77.0369
};
const CENTER = [LOCATION.lat, LOCATION.lng];
const DEFAULT_ZOOM = 2;


const IndexPage = () => { 

  /**
   * mapEffect
   * @description Fires a callback once the page renders
   * @example Here this is and example of being used to zoom in and set a popup on load
   */

  async function mapEffect({ leafletElement: map } = {}) {

    let response;

    try {
      response = await axios.get('https://corona.lmao.ninja/v2/countries');
    } catch(e) {
      console.log(`Failed to fetch countries: ${e.message}`, e);
      return;
    }

    

 const { data = [] } = response;

 //check if valid
const hasData = Array.isArray(data) && data.length > 0;
//if not? 
if ( !hasData ) return;


//define feature and map through of the data and grab each country

const geoJson = {
  type: 'FeatureCollection',
  features: data.map((country = {}) => {
    const { countryInfo = {} } = country;//grab the country info and create a geometry type based on lag and lat.
    const { lat, long: lng } = countryInfo;
    return {
      type: 'Feature',
      properties: {
        ...country,// add country detailes to  properties 
      },
      geometry: {
        type: 'Point',
        coordinates: [ lng, lat ]
      }
    }
  })
}




// this section is to show custom markers.
  function countryPointToLayer (feature = {}, latlng){
    const { properties = {} } = feature;
    let updatedFormatted;
    let casesString;

    const {
      country,
      updated,
      cases,
      deaths,
      recovered
    } = properties

    casesString = `${cases}`;

    if ( cases > 10000 ) {// show more than 10k cases on map
      casesString = `${casesString.slice(0, -3)}k+` 
    }

    if ( updated ) {
      updatedFormatted = new Date(updated).toLocaleString();
    }
//
    const html = `
      <span class="icon-marker">
        <span class="icon-marker-tooltip">
          <h2>${country}</h2>
          <ul>
            <li><strong>Confirmed:</strong> ${cases}</li>
            <li><strong>Deaths:</strong> ${deaths}</li>
            <li><strong>Recovered:</strong> ${recovered}</li>
            <li><strong>Last Update:</strong> ${updatedFormatted}</li>
          </ul>
        </span>
        ${ casesString }
      </span>
    `;

    return L.marker( latlng, {
      icon: L.divIcon({
        className: 'icon',
        html
      }),
      riseOnHover: true// when you hover, it raises info about selected country
    });
  }
;


    const geoJsonLayers = new L.geoJSON(geoJson,  {  //add it to leaflet.
      pointToLayer: countryPointToLayer

    });
    geoJsonLayers.addTo(map); 

  }



  const mapSettings = {
    center: CENTER,
    defaultBaseMap: 'OpenStreetMap',
    zoom: DEFAULT_ZOOM,
    mapEffect
  };

  return (
    <Layout pageName="home">
      <Helmet>
        <title>Home Page</title>
      </Helmet>

      <Map {...mapSettings}>
        
      </Map>

      <Container type="content" className="text-center home-start">
        <h2>Still Getting Started?</h2>
        <p>Run the following in your terminal!</p>
        <pre>
          <code>gatsby new [directory] https://github.com/colbyfayock/gatsby-starter-leaflet</code>
        </pre>
        <p className="note">Note: Gatsby CLI required globally for the above command</p>
      </Container>
    </Layout>
  );
};

export default IndexPage;
