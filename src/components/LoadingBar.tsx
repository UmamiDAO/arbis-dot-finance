import React from 'react'
import styled from 'styled-components'

const AnimatedDiv = styled.div`
  animation: shine 2s linear infinite;
  border: 1px solid transparent;
  border-radius: 1rem;
  height: 1rem;
  width: ${(props: Props) => (props.fluid ? '100%' : '4rem')};

  @keyframes shine {
    from {
      background-color: #ccc;
    }
    to {
      background-color: #bbb;
    }
  }
`

type Props = {
  fluid?: boolean
}

export default function LoadingBar({ fluid = false }: Props) {
  return <AnimatedDiv fluid={fluid} />
}
