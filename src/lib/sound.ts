/**
 * Tiny Web Audio synth: no audio files, everything is generated.
 * The context is created lazily on the first user gesture (autoplay policy).
 */

type Voice = { osc: OscillatorNode; gain: GainNode; lfo?: OscillatorNode }

let ctx: AudioContext | null = null
let master: GainNode | null = null
let enabled = true
let buzzer: Voice | null = null
let motor: Voice | null = null
let sizzle: { source: AudioBufferSourceNode; gain: GainNode } | null = null

function context(): AudioContext | null {
  if (typeof window === 'undefined' || !('AudioContext' in window)) return null
  if (!ctx) {
    ctx = new AudioContext()
    master = ctx.createGain()
    master.gain.value = enabled ? 1 : 0
    master.connect(ctx.destination)
  }
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

/** Call from a user gesture so later sounds are allowed to play. */
export function unlockAudio() {
  context()
}

export function setSoundEnabled(on: boolean) {
  enabled = on
  if (ctx && master) master.gain.setTargetAtTime(on ? 1 : 0, ctx.currentTime, 0.05)
}

function noiseBuffer(ac: AudioContext, seconds: number) {
  const buffer = ac.createBuffer(1, Math.floor(ac.sampleRate * seconds), ac.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1
  return buffer
}

function continuousVoice(
  current: Voice | null,
  level: number,
  build: (ac: AudioContext) => Voice,
  apply: (voice: Voice, level: number, ac: AudioContext) => void,
): Voice | null {
  const ac = ctx
  if (!ac || !master) return current
  if (level <= 0) {
    if (current) current.gain.gain.setTargetAtTime(0, ac.currentTime, 0.04)
    return current
  }
  const voice = current ?? build(ac)
  apply(voice, level, ac)
  return voice
}

/** Active buzzer: a slightly warbling beep, louder with more current. */
export function setBuzzerLevel(level: number) {
  buzzer = continuousVoice(
    buzzer,
    level,
    (ac) => {
      const osc = ac.createOscillator()
      osc.type = 'square'
      osc.frequency.value = 1320
      const lfo = ac.createOscillator()
      lfo.frequency.value = 9
      const lfoGain = ac.createGain()
      lfoGain.gain.value = 40
      lfo.connect(lfoGain).connect(osc.frequency)
      const filter = ac.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 2600
      const gain = ac.createGain()
      gain.gain.value = 0
      osc.connect(filter).connect(gain).connect(master!)
      osc.start()
      lfo.start()
      return { osc, gain, lfo }
    },
    (voice, value, ac) => {
      voice.gain.gain.setTargetAtTime(0.05 * Math.min(1.4, value), ac.currentTime, 0.03)
      voice.osc.frequency.setTargetAtTime(1150 + 220 * Math.min(1.5, value), ac.currentTime, 0.05)
    },
  )
}

/** Motor hum: a low saw wave whose pitch follows the speed. */
export function setMotorLevel(level: number) {
  motor = continuousVoice(
    motor,
    level,
    (ac) => {
      const osc = ac.createOscillator()
      osc.type = 'sawtooth'
      const filter = ac.createBiquadFilter()
      filter.type = 'lowpass'
      filter.frequency.value = 420
      const gain = ac.createGain()
      gain.gain.value = 0
      osc.connect(filter).connect(gain).connect(master!)
      osc.start()
      return { osc, gain }
    },
    (voice, value, ac) => {
      voice.osc.frequency.setTargetAtTime(48 + 95 * Math.min(2.2, value), ac.currentTime, 0.25)
      voice.gain.gain.setTargetAtTime(0.022 * Math.min(1.6, value), ac.currentTime, 0.15)
    },
  )
}

/** Crackling noise while a battery is short-circuited. */
export function setSizzle(on: boolean) {
  const ac = ctx
  if (!ac || !master) return
  if (on && !sizzle) {
    const source = ac.createBufferSource()
    source.buffer = noiseBuffer(ac, 2)
    source.loop = true
    const filter = ac.createBiquadFilter()
    filter.type = 'bandpass'
    filter.frequency.value = 3200
    filter.Q.value = 0.8
    const gain = ac.createGain()
    gain.gain.value = 0
    gain.gain.setTargetAtTime(0.05, ac.currentTime, 0.05)
    source.connect(filter).connect(gain).connect(master)
    source.start()
    sizzle = { source, gain }
  } else if (!on && sizzle) {
    const { source, gain } = sizzle
    gain.gain.setTargetAtTime(0, ac.currentTime, 0.05)
    source.stop(ac.currentTime + 0.3)
    sizzle = null
  }
}

function blip(frequency: number, duration: number, type: OscillatorType, volume: number, delay = 0) {
  const ac = context()
  if (!ac || !master) return
  const start = ac.currentTime + delay
  const osc = ac.createOscillator()
  osc.type = type
  osc.frequency.setValueAtTime(frequency, start)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0, start)
  gain.gain.linearRampToValueAtTime(volume, start + 0.008)
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration)
  osc.connect(gain).connect(master)
  osc.start(start)
  osc.stop(start + duration + 0.05)
}

/** Mechanical click for switches and buttons. */
export function playClick(on = true) {
  blip(on ? 1900 : 1300, 0.05, 'square', 0.06)
  blip(on ? 260 : 200, 0.07, 'triangle', 0.08)
}

/** A part burning out: a pop with a falling pitch and a puff of noise. */
export function playPop() {
  const ac = context()
  if (!ac || !master) return
  const now = ac.currentTime
  const osc = ac.createOscillator()
  osc.type = 'triangle'
  osc.frequency.setValueAtTime(700, now)
  osc.frequency.exponentialRampToValueAtTime(60, now + 0.3)
  const gain = ac.createGain()
  gain.gain.setValueAtTime(0.25, now)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.35)
  osc.connect(gain).connect(master)
  osc.start(now)
  osc.stop(now + 0.4)

  const noise = ac.createBufferSource()
  noise.buffer = noiseBuffer(ac, 0.4)
  const noiseGain = ac.createGain()
  noiseGain.gain.setValueAtTime(0.18, now)
  noiseGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.4)
  noise.connect(noiseGain).connect(master)
  noise.start(now)
}

/** Happy arpeggio for completed missions. */
export function playSuccess() {
  ;[523.25, 659.25, 783.99, 1046.5].forEach((f, i) => blip(f, 0.32, 'triangle', 0.09, i * 0.09))
}

/** Soft pluck when a part is placed or a wire is connected. */
export function playPlace() {
  blip(880, 0.12, 'sine', 0.07)
  blip(1320, 0.1, 'sine', 0.04, 0.04)
}

export function stopContinuousSounds() {
  setBuzzerLevel(0)
  setMotorLevel(0)
  setSizzle(false)
}
