import React, { Component, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

class MyMap extends Component {
    render() {
        const { position } = this.props;
        const [destinationLocations, setDestinationLocations] = useState([]);

        useEffect(() => {
            setDestinationLocations([
                [49.194911, 16.573983],
                [49.189749, 16.601020],
            ]);
        }, []);


        return (
            <MapContainer center={position} zoom={13} style={{ height: '400px', width: '100%' }}>
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={position}>
                    <Popup>Your Location</Popup>
                </Marker>
                {destinationLocations.map((destination, index) => (
                    <Marker key={index} position={destination}>
                        <Popup>
                            Destination {index + 1}
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>

        );
    }
}

export default MyMap;
