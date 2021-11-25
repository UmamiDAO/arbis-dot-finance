import React from 'react';
import styled from 'styled-components';

const Spinner = styled.div`
    width: 100px;
    height: 100px;
    display: inline-block;
    margin-top: 2em;
    animation-name: spin;
    animation-duration: 2000ms;
    animation-iteration-count: infinite;
    animation-timing-function: linear;

    span {
      position: absolute;
      font-size: 1.5em;
      width: 2em;
      height: 2em;
      line-height: 2em;
      left: 50%;
      top: 50%;
      margin-left: -1em;
      margin-top: -1em;
      animation-duration: 2000ms;
      animation-iteration-count: infinite;
      animation-timing-function: linear;

      &:nth-child(1) {
        animation-name: spinZ1;

        @keyframes spinZ1 {
          from {
            transform: rotate(0deg) translate(1.5em) rotateZ(360deg);
          }
          to {
            transform: rotate(0deg) translate(1.5em) rotateZ(0deg);
          }
        }
      }

      &:nth-child(2) {
        animation-name: spinZ2;
        @keyframes spinZ2 {
          from {
            transform: rotate(90deg) translate(1.5em) rotateZ(270deg);
          }
          to {
            transform: rotate(90deg) translate(1.5em) rotateZ(-90deg);
          }
        }
      }

      &:nth-child(3) {
        animation-name: spinZ3;

        @keyframes spinZ3 {
          from {
            transform: rotate(180deg) translate(1.5em) rotateZ(180deg);
          }
          to {
            transform: rotate(180deg) translate(1.5em) rotateZ(-180deg);
          }
        }
      }

      &:nth-child(4) {
        animation-name: spinZ4;

        @keyframes spinZ4 {
          from {
            transform: rotate(270deg) translate(1.5em) rotateZ(90deg);
          }
          to {
            transform: rotate(270deg) translate(1.5em) rotateZ(-270deg);
          }
        }
      }
    }
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

export default function ArbisSpinner() {
  return (
    <Spinner>
      <span>🍟</span>
      <span>🍔</span>
      <span>🍟</span>
      <span>🍔</span>
    </Spinner>
  );
}
