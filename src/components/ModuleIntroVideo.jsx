import { useEffect, useRef, useState } from 'react'
import { moduleVideo } from '../data/videos.js'

/**
 * Narrated intro for a module. English subtitles are drawn in a bar under the
 * video (readable on phones, never covering the slide); in fullscreen the
 * browser's own caption rendering takes over.
 *
 * `compact` renders a small "watch the intro" tile that expands into the
 * player (used on the roadmap, where ten full players would be too heavy).
 */
export default function ModuleIntroVideo({ mod, compact = false }) {
  const v = moduleVideo(mod.id)
  const [open, setOpen] = useState(!compact)
  if (!v) return null

  if (!open) {
    return (
      <button className="intro-tile" onClick={() => setOpen(true)}>
        <span className="intro-thumb" style={{ backgroundImage: `url(${v.poster})` }}>
          <span className="intro-play" aria-hidden="true" />
        </span>
        <span className="intro-tile-text">
          <b>Watch the module intro</b>
          <span>{v.length} · narrated · subtitles</span>
        </span>
      </button>
    )
  }
  return <Player v={v} autoPlay={compact} />
}

function Player({ v, autoPlay }) {
  const videoRef = useRef(null)
  const [cue, setCue] = useState('')
  const [cc, setCc] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    const track = video?.textTracks[0]
    if (!track) return
    const nativeCaptions = (on) => { track.mode = on && cc ? 'showing' : 'hidden' }
    const onCue = () => setCue(track.activeCues?.[0]?.text || '')
    const onFs = () => nativeCaptions(document.fullscreenElement === video)
    const onIosBegin = () => nativeCaptions(true)
    const onIosEnd = () => nativeCaptions(false)

    nativeCaptions(false)
    track.addEventListener('cuechange', onCue)
    document.addEventListener('fullscreenchange', onFs)
    video.addEventListener('webkitbeginfullscreen', onIosBegin)
    video.addEventListener('webkitendfullscreen', onIosEnd)
    return () => {
      track.removeEventListener('cuechange', onCue)
      document.removeEventListener('fullscreenchange', onFs)
      video.removeEventListener('webkitbeginfullscreen', onIosBegin)
      video.removeEventListener('webkitendfullscreen', onIosEnd)
    }
  }, [cc, v.vtt])

  return (
    <figure className="intro-video">
      <video ref={videoRef} controls playsInline autoPlay={autoPlay} preload="metadata" poster={v.poster}>
        <source src={v.mp4} type="video/mp4" />
        <track kind="subtitles" src={v.vtt} srcLang="en" label="English" default />
      </video>
      {cc && <div className="intro-cc" aria-live="off">{cue}</div>}
      <figcaption>
        <span className="pill pill-nv">Module intro</span>
        <span className="intro-meta">A real-world case for why this module matters · {v.length}</span>
        <button className={`cc-btn ${cc ? 'on' : ''}`} onClick={() => setCc((c) => !c)} aria-pressed={cc} title="Subtitles">
          CC
        </button>
      </figcaption>
    </figure>
  )
}
