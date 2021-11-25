import React from 'react';
import styled from 'styled-components';
import { FOOTER_LINKS } from '../config';

const SupportStyles = styled.aside`
  --spacing: 0.5rem;

  display: flex;
  position: fixed;
  left: var(--spacing);
  bottom: var(--spacing);
`;

export default function Support() {
  const discordLink = FOOTER_LINKS.find((link) => link.text === 'Discord');
  const href = discordLink ? discordLink.href : '';

  return (
    <SupportStyles>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="border hover:text-blue-500 hover:border-blue-500 transition duration-200 ease-in border-gray-300 rounded-full flex-1 px-4 py-2"
      >
        <span role="img" aria-label="support" className="mr-2">
          💬
        </span>
        <span>Support</span>
      </a>
    </SupportStyles>
  );
}
