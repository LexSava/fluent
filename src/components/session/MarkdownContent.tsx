'use client'

import { Streamdown } from 'streamdown'

import { mdComponents } from './mdComponents'

type Props = { content: string }

export function MarkdownContent({ content }: Props) {
  return (
    <Streamdown
      mode="static"
      controls={false}
      linkSafety={{ enabled: false }}
      components={mdComponents}
    >
      {content}
    </Streamdown>
  )
}
