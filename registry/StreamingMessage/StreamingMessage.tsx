// src/primitives/StreamingMessage/StreamingMessage.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* StreamingMessage. An agent message that may still be arriving. Text renders as plain text with its line breaks
   kept, never as HTML. It is aria-busy until the host marks it complete, and says so when the text was capped. */
import type { MessageView } from '../../agent/reduce.js';
import { ChatMessage } from '../ChatMessage/ChatMessage.js';

export interface StreamingMessageProps {
  className?: string;
  slotProps?: { root?: PrimitivePartProps };

  /** The message as the store folded it. */
  message: MessageView;
  /** Author name, e.g. "Researcher". Optional. */
  author?: string;
  /** Display time, e.g. "9:41 AM". Optional. */
  time?: string;
  /** Note shown when the text was capped. Defaults to "Truncated". */
  truncatedText?: string;
}

export function StreamingMessage({ className, slotProps, message, author, time, truncatedText = 'Truncated' }: StreamingMessageProps) {
  return (
    <ChatMessage author={author} time={time}>
      <div className="cieo cieo-p-streaming-message" data-complete={message.complete ? 'true' : 'false'} aria-busy={message.complete ? undefined : true} {...customizePart(slotProps?.root, "cieo cieo-p-streaming-message", undefined, className)}>
        <p data-text>{message.text}</p>
        {message.truncated ? <p data-truncated>{truncatedText}</p> : null}
      </div>
    </ChatMessage>
  );
}
