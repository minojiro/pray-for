import React, {useEffect, useState} from 'react';
import './App.css';
import dayjs from 'dayjs'
import PrayPerson from './PrayPerson';
import {
  login,
  join,
  setPray,
  listenPrayers,
  Prayer,
} from './firebase'

function App() {
  const [name, setName] = useState('')
  const colorChars = [
    'a',
    'b',
    'c',
    'd',
    'e',
    'f'
  ]
  const genColor = () => {
    const code = Array.from({length: 6}, () => colorChars[~~(Math.random() * colorChars.length)]).join('')
    return `#${code}`
  }
  const [color] = useState(genColor())
  const [screenStatus, setScreenStatus] = useState<'LOADING'|'NAME'|'PRAY'>('LOADING')
  const [isPraying, setIsPraying] = useState(false)
  const [prayers, setPrayers] = useState<Prayer[]>([])
  const isJoined = false
  const [lastPrayedAt,setLastPrayedAt] = useState<dayjs.Dayjs|null>(null)

  useEffect(()=>{
    (async () => {
      const uid = await login()
      if (uid) {
        setScreenStatus('NAME')
      }
    })()
  }, [])

  const submitName = async (e: any) => {
    e.preventDefault()
    await join(name, color)
    setScreenStatus('PRAY')
    listenPrayers(setPrayers)
  }

  const onPrayStart = async (e: any) => {
    await setPray(name, color, true)
    setIsPraying(true)
  }

  const onPrayEnd = async (e: any) => {
    const me = prayers.find(o => o.isMe)
    if (me) {
      setLastPrayedAt(me.prayStartAt)
    }
    await setPray(name, color, false)
    setIsPraying(false)
  }

  if (screenStatus === 'LOADING') {
    return (
      <div className="App">
        <p>loading</p>
      </div>
    )
  }

  const getTweetMsg = () => {
    const text = `${lastPrayedAt?.format('YYYY/MM/DD HH:mm:ss')} に黙祷しました🙏 #黙祷 https://pray-for.firebaseapp.com/`
    return `https://twitter.com/intent/tweet?text=${encodeURIComponent(decodeURI(text))}`
  }

  if (screenStatus === 'PRAY') {
    return (
      <div className="App">
        <h1>黙祷</h1>
        <p className="actionText">黙祷したいタイミングでボタンを押して黙祷しましょう。終わったらツイートもできます。</p>
        {
          isPraying ? (
            <>
              <button className="button is-info is-fullwidth" onClick={onPrayEnd}>黙祷を終わる</button>
            </>
          ) : (
            <>
              <button className="button is-info is-fullwidth" onClick={onPrayStart}>黙祷する</button>
              {lastPrayedAt && (
                <>
                  <a href={getTweetMsg()} className="button is-info is-fullwidth">黙祷をツイートする</a>
                </>
              )}
            </>
          )
        }
        <br/>
        <h2>みんなの黙祷</h2>
        <ul className="personList">
          {prayers.map((prayer) => (
            <li key={prayer.key}><PrayPerson prayer={prayer} /></li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="App">
      <h1>黙祷</h1>
      <form onSubmit={submitName}>
        <p className="actionText">黙祷する方のお名前を入れてください</p>
        <input value={name} onChange={e => setName(e.target.value)} className="input" type="text" placeholder="お名前"></input>
        <br /><br />
        <button type="submit" className="button is-info is-fullwidth" disabled={name === ''}>参加する</button>
      </form>
      
    </div>
  )
}

export default App;
