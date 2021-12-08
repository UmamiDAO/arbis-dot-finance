import React from 'react';
import styled from 'styled-components';
import { Link, useResolvedPath, useMatch, useNavigate } from 'react-router-dom';

const ListItem = styled.li`
  position: relative;

  &:hover {
    &::after {
      position: absolute;
      bottom: -5px;
      background-color: var(--color-primary);
      content "";
      display: block;
      height: 3px;
      width: 100%;
    }
  }

  &[data-active="true"] {
    &::after {
      position: absolute;
      bottom: -5px;
      background-color: var(--color-primary);
      content "";
      display: block;
      height: 3px;
      width: 100%;
    }
  }
`;

type Props = {
  link: {
    href: string;
    text: string;
  };
};

export default function NavigationLink({ link }: Props) {
  const { href, text } = link;
  const { pathname: resolvedPath } = useResolvedPath(href);
  const navigate = useNavigate();
  const isActive = useMatch({ path: resolvedPath, end: true });

  return (
    <ListItem
      key={text}
      className="text-center inline-block mr-8 cursor-pointer inline-block uppercase font-display font-extrabold transition duration-500 hover:text-primary"
      tabIndex={-1}
      onClick={() => navigate(href)}
      data-active={isActive ? 'true' : 'false'}
    >
      <Link to={href}>{text}</Link>
    </ListItem>
  );
}
