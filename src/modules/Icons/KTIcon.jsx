import React from 'react'
import icons from './icons-config'
const  mainLayout =  {
    type: 'default',
    darkSkinEnabled: true,
    primaryColor: '#04C8C8',
    pageBgWhite: false,
    iconType: 'duotone',
  }

const KTIcon = ({className = '', iconType, iconName}) => {
  if (!iconType) {
    iconType = mainLayout.iconType
  }
  return (
    <i className={`ki-${iconType} ki-${iconName}${className && ' ' + className}`}>
      {iconType === 'duotone' &&
        [...Array(icons[iconName])].map((e, i) => {
          return (
            <span
              key={`${iconType}-${iconName}-${className}-path-${i + 1}`}
              className={`path${i + 1}`}
            ></span>
          )
        })}
    </i>
  )
}

export {KTIcon}
