import React from 'react'
import NavigationLink from './NavigationLink'
import { NAVIGATION_LINKS } from '../config'

export default function Navigation() {
  return (
    <nav className="flex-1">
      <ul className="flex-1 flex items-center">
        {NAVIGATION_LINKS.map((link) => (
          <NavigationLink link={link} key={link.text} />
        ))}
      </ul>
    </nav>
  )
}
