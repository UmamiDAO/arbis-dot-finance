import React from 'react'
import NavigationLink, { ListItem } from './NavigationLink'
import { NAVIGATION_LINKS } from '../config'

export default function Navigation() {
  return (
    <nav className="flex-1">
      <ul className="flex-1 flex items-center">
        {NAVIGATION_LINKS.map((link) => (
          <NavigationLink link={link} key={link.text} />
        ))}
        <ListItem className="text-center inline-block mr-8 cursor-pointer inline-block uppercase font-display font-extrabold transition duration-500 hover:text-primary">
          <a
            href="https://umami.finance"
            rel="noopener noreferrer"
            target="_blank"
          >
            Umami
          </a>
        </ListItem>
      </ul>
    </nav>
  )
}
