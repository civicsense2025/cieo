// src/primitives/LinkPreview/LinkPreview.tsx
'use client';
/* LinkPreview. A link card (image, site, title) that is one tab stop. The host fetches the metadata; this draws it, safely, and fades content in over its own skeleton. */
import { useEffect, useRef, useState } from 'react';
import { usePresence } from '../../react/index.js';
import { safeHref } from '../Mention/Mention.js';

export type LinkPreviewVariant = 'large' | 'compact';

/** Hostname without a leading www., or an empty string when the address does not parse as http(s). */
export function displayDomain(url: string): string {
  try {
    const parsed = new URL(String(url ?? '').trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

export interface LinkPreviewImage {
  /** Image address. Only absolute http and https addresses render. */
  src: string;
  /** Text alternative; use an empty string when the title already says it. */
  alt: string;
  /** Intrinsic width in pixels, used to reserve space. */
  width?: number;
  /** Intrinsic height in pixels, used to reserve space. */
  height?: number;
}

export interface LinkPreviewProps {
  /** Address the card opens. Anything but http or https renders a card that is not a link. */
  url: string;
  /** Page title, clamped to two lines. */
  title: string;
  /** Site name shown beside the favicon. Defaults to the domain. */
  siteName?: string;
  /** Short summary, shown on the large card only. */
  description?: string;
  /** Lead image: 16:9 on top for large, a square thumbnail for compact. */
  image?: LinkPreviewImage;
  /** Small site icon address. */
  favicon?: string;
  /** large puts the image on top; compact puts a thumbnail on the left. Defaults to large. */
  variant?: LinkPreviewVariant;
  /** True shows a skeleton with the same footprint, then cross-fades to the content when it turns false. */
  loading?: boolean;
}

function PreviewImage({ image, className }: { image: LinkPreviewImage; className: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'pending' | 'loaded' | 'failed'>('pending');
  useEffect(() => {
    const el = ref.current;
    if (el?.complete && el.naturalWidth > 0) setState('loaded');
  }, []);
  const src = safeHref(image.src, { relative: false });
  if (!src || state === 'failed') return null;
  return (
    <img
      ref={ref}
      className={className}
      data-state={state}
      src={src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      loading="lazy"
      decoding="async"
      onLoad={() => setState('loaded')}
      onError={() => setState('failed')}
    />
  );
}

export function LinkPreview({ url, title, siteName, description, image, favicon, variant = 'large', loading = false }: LinkPreviewProps) {
  const href = safeHref(url, { relative: false });
  const domain = displayDomain(url);
  const kind: LinkPreviewVariant = variant === 'compact' ? 'compact' : 'large';
  const skeleton = usePresence<HTMLSpanElement>(loading, { from: { y: 0, scale: 1 } });
  const iconSrc = favicon === undefined ? null : safeHref(favicon, { relative: false });
  const site = siteName || domain;
  const label = <span className="cieo-link-preview-title-text">{title}</span>;
  return (
    <div className="cieo cieo-link-preview" data-variant={kind} data-loading={loading ? '' : undefined} data-linked={href ? '' : undefined} aria-busy={loading || undefined}>
      {skeleton.mounted ? (
        <span ref={skeleton.ref} className="cieo-link-preview-skeleton" aria-hidden="true">
          <span className="cieo-link-preview-media cieo-link-preview-bone" />
          <span className="cieo-link-preview-body">
            <span className="cieo-link-preview-bone cieo-link-preview-bone-site" />
            <span className="cieo-link-preview-bone cieo-link-preview-bone-title" />
            <span className="cieo-link-preview-bone cieo-link-preview-bone-title cieo-link-preview-bone-short" />
          </span>
        </span>
      ) : null}
      {loading ? (
        <span className="cieo-sr-only" role="status">
          Loading link preview
        </span>
      ) : (
        <div className="cieo-link-preview-content">
          {image && safeHref(image.src, { relative: false }) ? (
            <span className="cieo-link-preview-media">
              <PreviewImage image={image} className="cieo-link-preview-image" />
            </span>
          ) : null}
          <span className="cieo-link-preview-body">
            {site || iconSrc ? (
              <span className="cieo-link-preview-site">
                {iconSrc ? <img className="cieo-link-preview-favicon" src={iconSrc} alt="" width={16} height={16} loading="lazy" decoding="async" /> : null}
                {site ? <span className="cieo-link-preview-domain">{site}</span> : null}
              </span>
            ) : null}
            {href ? (
              <a className="cieo-link-preview-title" href={href} target="_blank" rel="noopener noreferrer ugc nofollow">
                {label}
              </a>
            ) : (
              <span className="cieo-link-preview-title">{label}</span>
            )}
            {description && kind === 'large' ? <span className="cieo-link-preview-description">{description}</span> : null}
          </span>
        </div>
      )}
    </div>
  );
}
