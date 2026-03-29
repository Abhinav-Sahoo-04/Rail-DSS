import React from 'react'
import styles from '../styles/sidebarItem.module.css'

export default function SidebarContentItem({ele}) {
  return (
    <li key={ele.name} className={styles.listItem}>
     {ele.icon} {ele.name}
    </li>
  )
}
