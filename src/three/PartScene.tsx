import { ELECTRICAL, LAMP_COLORS, LED_COLORS } from '@/circuit/catalog'
import type { PartResult } from '@/circuit/solver'
import type { LampColor, LedColor, PartData } from '@/circuit/types'
import { Stage, type Framing } from './helpers'
import { BatteryModel } from './models/Battery'
import { BuzzerModel } from './models/Buzzer'
import { ButtonModel, DimmerModel, ResistorModel, SwitchModel } from './models/Controls'
import { LampModel } from './models/Lamp'
import { LedModel } from './models/Led'
import { MotorModel } from './models/Motor'

/*
 * Camera framing for every model, measured so each one sits in the middle of
 * its card's 3D window with a clear margin on all four sides. Parts that can
 * be turned (battery, switch, resistor) get a second framing for when they
 * stand upright, because the window is wider than it is tall.
 */
const FRAMING = {
  battery: { camera: [0, 0.3, 4.4], scale: 0.93, lift: 0.05 },
  switch: { camera: [0, 0.4, 4.6], scale: 1.06, lift: 0.35 },
  switchUpright: { camera: [0, 0.4, 4.6], scale: 1.25, lift: 0 },
  button: { camera: [0, 0.55, 4.6], scale: 0.78, lift: -0.22 },
  dimmer: { camera: [0, 0.2, 4.6], scale: 1.09, lift: -0.19 },
  resistor: { camera: [0, 0.3, 4.4], scale: 0.8, lift: 0 },
  resistorUpright: { camera: [0, 0.3, 4.4], scale: 1.36, lift: 0 },
  lamp: { camera: [0, 0.35, 4.4], scale: 1.13, lift: -0.08 },
  led: { camera: [0, 0.35, 4.2], scale: 1.15, lift: -0.13 },
  motor: { camera: [0, 0.5, 4.8], scale: 1.08, lift: -0.34 },
  buzzer: { camera: [0, 0.55, 4.6], scale: 0.82, lift: -0.26 },
} satisfies Record<string, Framing>

/** The animated 3D preview of one part, driven by its simulation result. */
export function PartScene({ data, result }: { data: PartData; result?: PartResult }) {
  const level = result?.level ?? 0
  const status = result?.status ?? 'idle'
  const upright = data.rotation === 90 || data.rotation === 270

  switch (data.type) {
    case 'lamp':
      return (
        <Stage {...FRAMING.lamp}>
          <LampModel
            level={level}
            burnt={!!data.burnt}
            color={LAMP_COLORS[(data.color as LampColor) ?? 'warm'] ?? LAMP_COLORS.warm}
          />
        </Stage>
      )
    case 'led':
      return (
        <Stage {...FRAMING.led}>
          <LedModel
            level={level}
            burnt={!!data.burnt}
            color={LED_COLORS[(data.color as LedColor) ?? 'red'] ?? LED_COLORS.red}
          />
        </Stage>
      )
    case 'motor':
      return (
        <Stage {...FRAMING.motor}>
          <MotorModel speed={level} overheated={status === 'over'} />
        </Stage>
      )
    case 'buzzer':
      return (
        <Stage {...FRAMING.buzzer}>
          <BuzzerModel level={level} />
        </Stage>
      )
    case 'battery':
      return (
        <Stage {...FRAMING.battery}>
          <BatteryModel
            voltage={data.voltage ?? 3}
            rotation={data.rotation}
            delivering={status === 'on'}
            short={status === 'short'}
          />
        </Stage>
      )
    case 'switch':
      return (
        <Stage {...(upright ? FRAMING.switchUpright : FRAMING.switch)}>
          <SwitchModel closed={!!data.closed} rotation={data.rotation} current={result?.current ?? 0} />
        </Stage>
      )
    case 'button':
      return (
        <Stage {...FRAMING.button}>
          <ButtonModel pressed={!!data.pressed} />
        </Stage>
      )
    case 'resistor':
      return (
        <Stage {...(upright ? FRAMING.resistorUpright : FRAMING.resistor)}>
          <ResistorModel
            ohms={data.resistance ?? 100}
            rotation={data.rotation}
            heat={(result?.power ?? 0) / ELECTRICAL.resistor.ratedPower}
          />
        </Stage>
      )
    case 'dimmer':
      return (
        <Stage {...FRAMING.dimmer}>
          <DimmerModel level={data.level ?? 0.7} />
        </Stage>
      )
  }
}
