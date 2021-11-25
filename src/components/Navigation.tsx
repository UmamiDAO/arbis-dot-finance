import React from 'react';
import NavigationLink from './NavigationLink';
import { NAVIGATION_LINKS } from '../config';

export default function Navigation() {
  return (
    <nav>
      <ul className="flex items-center justify-center text-center max-w-3xl w-full m-auto">
        {NAVIGATION_LINKS.map((link) => (
          <NavigationLink link={link} key={link.text} />
        ))}
      </ul>
    </nav>
  );
}
