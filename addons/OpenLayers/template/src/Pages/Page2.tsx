import React, {useEffect, useRef, useState} from 'react';
import styled from 'styled-components';
import Map from 'ol/Map';
import View from 'ol/View';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import 'ol/ol.css';

const MapElement = styled.div`
  width: 500px;
  height: 500px;
`;

export const Page2 = () => {
  const mapElement = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<Map | undefined>();

  useEffect(() => {
    if (mapElement.current) {
      const m = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: [0, 0],
          zoom: 2
        })
      });
      setMap(m);
      return () => {
        m.dispose();
        setMap(undefined);
      }
    }
  }, [mapElement])

  return (
    <>
      <p>Page 2</p>
      <MapElement ref={mapElement}/>
    </>
  )
};
