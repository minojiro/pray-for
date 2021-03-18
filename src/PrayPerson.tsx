import React from 'react';
import {Prayer} from './firebase'
import person1Pray from './images/person1_pray.png'
import person1 from './images/person1_stand.png'

function PrayPerson(props: {prayer: Prayer}) {
  const imgSrc = props.prayer.prayStartAt ? person1Pray : person1
  return (
    <div className="PrayPerson">
      <div className="PrayPerson__avatar" style={{background: props.prayer.color}}>
        <img src={imgSrc} alt="person" />
      </div>
      <p>
        {props.prayer.name}
        {props.prayer.isMe && (
          <span><br />（あなた）</span>
        )}
      </p>
    </div>
  )
}

export default PrayPerson
