import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import { GeoloniaMap } from '@geolonia/embed-react';
import './App.css';
import type { Map } from 'maplibre-gl';
import { parseHash } from './lib'

const noop = (x: any) => x

function App() {

  const initialRef = useRef<{ lat: number, lng: number }>()
  const [input, setInput] = useState<string>('')
  const [output, setOutput] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  useEffect(() => {
    const { lat, lng } = parseHash()
    if(!Number.isNaN(lat) && !Number.isNaN(lng)) {
      initialRef.current = { lat, lng }
    }
  }, [])

  const onCenterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setOutput(e.currentTarget.value)
  }, [])
  const onCopyClick = useCallback(() => {
      const center = mapRef.current?.getCenter()
      const outputElement = document.getElementById('output') as HTMLInputElement
      if(center) {
        outputElement.select()
        document.execCommand("copy");
        setMessage('コピーされました')
        setTimeout(() => setMessage(''), 5000)
      }
  }, [])

  const mapRef = useRef<Map>();
  const onLoad = useCallback((map: Map) => {
    mapRef.current = map

    if(initialRef.current) {
      const { lat, lng } = initialRef.current
      const centerText = `${lat},${lng}`
      setInput(centerText)
      setOutput(centerText)
      // @ts-ignore
      new window.geolonia.Marker()
        .setLngLat([lng, lat])
        .addTo(map)
    }

    map
      .on('move', () => {
        const { lng, lat } = map.getCenter()
        const centerText = `${lat},${lng}`
        setMessage('')
        setOutput(centerText)
      })
      .on('click', (e) => {
        map.flyTo({ center: e.lngLat }, { duration: 300 })
      })

    document.addEventListener('keypress', (e) => {
      if(e.key === ' ') {
        e.preventDefault()
        onCopyClick()
      }
    })
  }, [])


  return (
    <div className="App">
      <header className="container">
        <div className="row">
          <label className="label" htmlFor="input">入力緯度経度</label>
          <input className="input" id="input" type="text" value={input} disabled={true} onChange={noop} />
        </div>
        <div className="row">
          <label className="label" htmlFor="output">中心緯度経度</label>
          <input className="input" id="output" type="text" value={output} disabled={false} onChange={onCenterChange} />
          <button className="button" type="button" onClick={onCopyClick}>コピー (スペースキー)</button>
          {message && <span className="message">{message}</span>}
        </div>
      </header>
      <main className="map">
        <GeoloniaMap
          apiKey="YOUR-API-KEY"
          style={{height: "100%", width: "100%"}}
          hash="on"
          zoom="18"
          gestureHandling="off"
          render3d="on"
          onLoad={onLoad}
        />
        <div className="center-cross"></div>
      </main>
    </div>
  );
}

export default App;
