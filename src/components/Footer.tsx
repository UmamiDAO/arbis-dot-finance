import React from 'react'
import { FOOTER_LINKS } from '../config'

export default function Footer() {
  return (
    <footer className="mt-12 py-8">
      <div className="flex items-center p-4 justify-center text-center max-w-2xl m-auto w-full">
        <ul>
          {FOOTER_LINKS.map((link, index) => (
            <li className="inline-block mr-8 last:mr-0" key={index}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-display font-extrabold uppercase"
              >
                {link.text}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
