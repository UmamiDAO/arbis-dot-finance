import React from 'react'
import { FOOTER_LINKS } from '../config'

export default function Footer() {
  return (
    <footer className="mt-12">
      <div className="flex items-center p-4 justify-center text-center max-w-2xl m-auto w-full">
        <ul>
          {FOOTER_LINKS.map((link, index) => (
            <li className="inline-block" key={index}>
              <a
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-blue-500 transition duration-200 ease-in"
              >
                {link.text}
              </a>
              {index < FOOTER_LINKS.length - 1 ? (
                <span className="m-2">|</span>
              ) : null}
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
