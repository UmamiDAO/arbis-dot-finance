import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background-color: ${(props) => props.theme.backgroundColor};
  color: ${(props) => props.theme.color};

  button[data-action='true'],
  input {
    background-color: ${(props) => props.theme.backgroundColor};
  }
`;

type Props = {
  children: React.ReactNode;
};

type ActionProps = {
  children: React.ReactNode;
  onClick: () => void;
  disabled: boolean;
};

export default function FarmInteractionCard({ children }: Props) {
  return <Card className="shadow-lg rounded p-4 mt-4 border border-gray-300">{children}</Card>;
}

function Heading({ children }: Props) {
  return <strong className="font-bold text-lg">{children}</strong>;
}

function SubHeading({ children }: Props) {
  return <div className="mt-2 text-sm text-gray-500">{children}</div>;
}

function Footer({ children }: Props) {
  return <div className="mt-4 text-sm text-gray-500">{children}</div>;
}

function Action({ children, onClick, disabled }: ActionProps) {
  return (
    <button
      type="button"
      className="text-center py-2 px-4 rounded-md mt-4 border border-gray-300 text-sm hover:text-blue-500 hover:border-blue-500 transition duration-500"
      onClick={onClick}
      disabled={disabled}
      data-action="true"
    >
      {children}
    </button>
  );
}

FarmInteractionCard.Heading = Heading;
FarmInteractionCard.SubHeading = SubHeading;
FarmInteractionCard.Footer = Footer;
FarmInteractionCard.Action = Action;
