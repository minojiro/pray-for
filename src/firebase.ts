import firebase from 'firebase/app'
import 'firebase/auth'
import 'firebase/database'
import dayjs from 'dayjs'
import { FirebaseConfig } from './firebase-config'

const app = firebase.initializeApp(FirebaseConfig)

type DBPrayer = {
  name: string,
  prayStartAt: any|null,
  color: string
}

export type Prayer = {
  key: string,
  name: string,
  prayStartAt: dayjs.Dayjs | null,
  isMe: boolean,
  color: string,
}

const getUid = () => {
  const user = app.auth().currentUser
  return user ? user.uid : ''
}

export const login = async () => {
  const {user} = await app.auth().signInAnonymously()
  if (user) {
    return user.uid
  }
  return ''
}

export const join = async (name: string, color: string) => {
  const db = firebase.database()
  const doc: DBPrayer = {
    name,
    prayStartAt: null,
    color,
  }
  await db.ref(`prayers/${getUid()}`).set(doc)
}

export const setPray = async (name:string,color:string,praying: boolean) => {
  const db = firebase.database()
  const prayStartAt = (praying ? firebase.database.ServerValue.TIMESTAMP : null)
  const doc: DBPrayer = {
    name,
    prayStartAt,
    color,
  }
  await db.ref(`prayers/${getUid()}`).set(doc)
}

export const listenPrayers = (callback: (prayers: Prayer[]) => void) => {
  const db = firebase.database()
  const user = app.auth().currentUser
  db.ref(`prayers`).on('value', (dbPrayers) => {
    const prayers: Prayer[] = []
    dbPrayers.forEach(dbPrayer => {
      const val = dbPrayer.val() as DBPrayer
      prayers.push({
        key: dbPrayer.key as string,
        name: val.name,
        prayStartAt: val.prayStartAt ? dayjs(val.prayStartAt) : null,
        isMe: dbPrayer.key === user?.uid,
        color: val.color,
      })
    })
    console.log(prayers)
    callback(prayers.sort((a, b) => (b.isMe ? 1 : 0) - (a.isMe ? 1 : 0)))
  })
}
