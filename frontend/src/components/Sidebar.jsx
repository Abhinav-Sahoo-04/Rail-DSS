import React from 'react'
import { useState } from 'react'
import styles from '../styles/sidebar.module.css'
import SidebarContentItem from './SidebarContentItem'
export default function Sidebar() {
  const [sidebar,setSidebar]=useState([{
    name:'Live Tracking',
    icon:<i class="ri-route-fill"></i>
  },{
    name:'Platform Allocaction',
    icon:<i class="ri-box-3-fill"></i>
  },
{
  name:'Logout',
  icon:<i class="ri-logout-box-line"></i>
}])
  return (
    <div className={styles.sidebar}>
      <div className={styles.top}>
        <i class="ri-train-fill"></i> Rail DSS
      </div>
      <ul className={styles.contentList}>
        {sidebar.map(ele=>(
          <SidebarContentItem ele={ele}/>
        ))}
      </ul>
    </div>
  )
}
