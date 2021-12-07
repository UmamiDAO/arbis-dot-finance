import React from 'react';
import { Link, useResolvedPath, useMatch, useNavigate } from 'react-router-dom';

type Props = {
  link: {
    href: string;
    text: string;
  };
  crossedOut?: boolean;
};

export default function NavigationLink({ link, crossedOut }: Props) {
  const { href, text } = link;
  const { pathname: resolvedPath } = useResolvedPath(href);
  const navigate = useNavigate();
  const isActive = useMatch({ path: resolvedPath, end: true });

  const classes = React.useCallback(() => {
    const baseClasses = 'py-4 flex-1 h-16 cursor-pointer inline-block border-b-2 transition duration-500 text-xs md:text-base hover:text-primary hover:border-primary md:h-full';

    let classesArr = baseClasses.split(' ');

    if (isActive) {
      classesArr = [...classesArr, 'text-primary', 'border-primary'];
    }

    if (crossedOut) {
      classesArr.push('line-through');
    }

    return classesArr.reduce((_class, curr) => curr + ' ' + _class, '');
  }, [isActive, crossedOut])

  return (
    <li key={text} className={classes()} tabIndex={-1} onClick={() => navigate(href)}>
      <Link to={href}>{text}</Link>
    </li>
  );
}
