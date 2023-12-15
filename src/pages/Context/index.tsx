import { useContext, useEffect, useState } from 'react';
import { places } from './data';
import ImageSizeContext from './imageSizeContext'


export default function App() {
    const [isLarge, setIsLarge] = useState(false);
    const imageSize = isLarge ? 150 : 100;

    return (
        <>
            <label>
                <input
                    type="checkbox"
                    checked={isLarge}
                    onChange={e => {
                        setIsLarge(e.target.checked);
                    }}
                />
                Use large DIVS
            </label>
            <hr />
            <ImageSizeContext.Provider value={imageSize}>
                <List />
            </ImageSizeContext.Provider>
            
        </>
    )
}

function List() {
    const listItems = places.map(place =>
        <li key={place.id}>
            <Place
                place={place}
            />
        </li>
    );
    return <ul>{listItems}</ul>;
}

function Place({ place }:any) {
    return (
        <>
            <PlaceImage
            />
            <p>
                <b>{place.name}</b>
                {': ' + place.description}
            </p>
        </>
    );
}

function PlaceImage() {
    const imageSize = useContext(ImageSizeContext)
    return (
        <div
            style={{
                width: imageSize,
                height: imageSize,
                background: 'red'
            }}
        />
    );
}