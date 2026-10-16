import { src, srcSet, type Photo } from '../data/photos'

type Props = {
  photo: Photo
  alt: string
  sizes: string
  className?: string
  focus?: string
  eager?: boolean
  /** Unveil with a clip-path wipe the first time it scrolls into view. */
  reveal?: boolean
}

export function Picture({ photo, alt, sizes, className = '', focus, eager, reveal = true }: Props) {
  return (
    <div className={`picture ${reveal ? 'reveal' : ''} ${className}`}>
      <img
        src={src(photo)}
        srcSet={srcSet(photo)}
        sizes={sizes}
        width={photo.width}
        height={photo.height}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        style={focus ? { objectPosition: focus } : undefined}
        draggable={false}
      />
    </div>
  )
}
