import React from 'react';
import { Link, useResolvedPath, useMatch, useNavigate } from 'react-router-dom';

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

  const classes = `py-4 flex-1 cursor-pointer inline-block border-b-2 transition duration-500 hover:text-primary hover:border-primary ${
    isActive ? 'text-primary border-primary' : ''
  }`;

  return (
    <li key={text} className={classes} tabIndex={-1} onClick={() => navigate(href)}>
      <Link to={href}>{text}</Link>
    </li>
  );
}
