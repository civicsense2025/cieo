// src/primitives/LinkPreview/LinkPreview.tsx
'use client';
import type { PrimitivePartProps } from '../parts.js';
import { customizePart } from '../customization.js';
/* LinkPreview. A link card (image, site, title) that is one tab stop. The host fetches the metadata; this draws it, safely, and fades content in over its own skeleton. */
import { useEffect, useRef, useState } from 'react';
import { usePresence } from '../../react/index.js';
import { safeHref } from '../Mention/Mention.js';

export type LinkPreviewVariant = 'large' | 'compact';

/** Hostname without a leading www., or an empty string when the address does not parse as http(s). */
export function displayDomain(url: string): string {
  const safe = safeHref(url, { relative: false });
  if (!safe) return '';
  try {
    const parsed = new URL(safe);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return '';
    return parsed.hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

/** Preview assets are untrusted metadata, so only absolute credential-free http(s) URLs may trigger a browser request. */
function safeAssetHref(value: unknown): string | null {
  return safeHref(value, { relative: false });
}

export interface LinkPreviewImage {
  /** Image address. Must be an absolute credential-free http(s) URL. */
  src: string;
  /** Text alternative; use an empty string when the title already says it. */
  alt: string;
  /** Intrinsic width in pixels, used to reserve space. */
  width?: number;
  /** Intrinsic height in pixels, used to reserve space. */
  height?: number;
}

export interface LinkPreviewProps {
  className?: string;
  slotProps?: { titleText?: PrimitivePartProps; root?: PrimitivePartProps; media?: PrimitivePartProps; body?: PrimitivePartProps; content?: PrimitivePartProps; site?: PrimitivePartProps; favicon?: PrimitivePartProps; siteName?: PrimitivePartProps; domain?: PrimitivePartProps; title?: PrimitivePartProps; description?: PrimitivePartProps };

  /** Address the card opens. Only credential-free absolute http(s) URLs render as links. */
  url: string;
  /** Page title, clamped to two lines. */
  title: string;
  /** Optional branding shown beside the favicon. The parsed destination hostname stays visible. */
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

function PreviewImage({ image, src, className }: { image: LinkPreviewImage; src: string; className: string }) {
  const ref = useRef<HTMLImageElement>(null);
  const [state, setState] = useState<'pending' | 'loaded' | 'failed'>('pending');
  useEffect(() => {
    setState('pending');
    const el = ref.current;
    if (el?.complete && el.naturalWidth > 0) setState('loaded');
  }, [src]);
  if (!src || state === 'failed') return null;
  return (
    <img
      key={src}
      ref={ref}
      className={className}
      data-state={state}
      src={src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      referrerPolicy="no-referrer"
      loading="lazy"
      decoding="async"
      onLoad={() => setState('loaded')}
      onError={() => setState('failed')}
    />
  );
}

export function LinkPreview({ className, slotProps, url, title, siteName, description, image, favicon, variant = 'large', loading = false }: LinkPreviewProps) {
  const href = safeHref(url, { relative: false });
  const domain = displayDomain(url);
  const kind: LinkPreviewVariant = variant === 'compact' ? 'compact' : 'large';
  const skeleton = usePresence<HTMLSpanElement>(loading, { from: { y: 0, scale: 1 } });
  const imageSrc = image === undefined ? null : safeAssetHref(image.src);
  const iconSrc = favicon === undefined ? null : safeAssetHref(favicon);
  const brand = typeof siteName === 'string' ? siteName.trim() : '';
  const separateBrand = brand !== '' && brand !== domain;
  const site = brand || domain;
  const label = <span className="cieo-link-preview-title-text" {...customizePart(slotProps?.titleText, "cieo-link-preview-title-text")}>{title}</span>;
  return (
    <div className="cieo cieo-link-preview" data-variant={kind} data-loading={loading ? '' : undefined} data-linked={href ? '' : undefined} aria-busy={loading || undefined} {...customizePart(slotProps?.root, "cieo cieo-link-preview", undefined, className)}>
      {skeleton.mounted ? (
        <span ref={skeleton.ref} className="cieo-link-preview-skeleton" aria-hidden="true">
          <span className="cieo-link-preview-media cieo-link-preview-bone" {...customizePart(slotProps?.media, "cieo-link-preview-media cieo-link-preview-bone")} />
          <span className="cieo-link-preview-body" {...customizePart(slotProps?.body, "cieo-link-preview-body")}>
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
        <div className="cieo-link-preview-content" {...customizePart(slotProps?.content, "cieo-link-preview-content")}>
          {image && imageSrc ? (
            <span className="cieo-link-preview-media" {...customizePart(slotProps?.media, "cieo-link-preview-media")}>
              <PreviewImage key={imageSrc} image={image} src={imageSrc} className="cieo-link-preview-image" />
            </span>
          ) : null}
          <span className="cieo-link-preview-body" {...customizePart(slotProps?.body, "cieo-link-preview-body")}>
            {site || domain || iconSrc ? (
              <span className="cieo-link-preview-site" {...customizePart(slotProps?.site, "cieo-link-preview-site")}>
                {iconSrc ? <img className="cieo-link-preview-favicon" src={iconSrc} alt="" width={16} height={16} referrerPolicy="no-referrer" loading="lazy" decoding="async" {...customizePart(slotProps?.favicon, "cieo-link-preview-favicon")} /> : null}
                {separateBrand ? <span className="cieo-link-preview-site-name" {...customizePart(slotProps?.siteName, "cieo-link-preview-site-name")}>{brand}</span> : null}
                {domain ? <span className="cieo-link-preview-domain" {...customizePart(slotProps?.domain, "cieo-link-preview-domain")}>{domain}</span> : site ? <span className="cieo-link-preview-site-name" {...customizePart(slotProps?.siteName, "cieo-link-preview-site-name")}>{site}</span> : null}
              </span>
            ) : null}
            {href ? (
              <a className="cieo-link-preview-title" href={href} target="_blank" rel="noopener noreferrer ugc nofollow" {...customizePart(slotProps?.title, "cieo-link-preview-title")}>
                {label}
              </a>
            ) : (
              <span className="cieo-link-preview-title" {...customizePart(slotProps?.title, "cieo-link-preview-title")}>{label}</span>
            )}
            {description && kind === 'large' ? <span className="cieo-link-preview-description" {...customizePart(slotProps?.description, "cieo-link-preview-description")}>{description}</span> : null}
          </span>
        </div>
      )}
    </div>
  );
}
