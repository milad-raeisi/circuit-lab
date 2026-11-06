import { ELECTRICAL, LAMP_COLORS, LED_COLORS } from '@/circuit/catalog'
import type { PartResult } from '@/circuit/solver'
import type { LampColor, LedColor, PartData } from '@/circuit/types'
import { Stage } from './helpers'
import { BatteryModel } from './models/Battery'
import { BuzzerModel } from './models/Buzzer'
import { ButtonModel, DimmerModel, ResistorModel, SwitchModel } from './models/Controls'
import { LampModel } from './models/Lamp'
import { LedModel } from './models/Led'
import { MotorModel } from './models/Motor'

/** The animated 3D preview of one part, driven by its simulation result. */
export function PartScene({ data, result }: { data: PartData; result?: PartResult }) {
  const level = result?.level ?? 0
  const status = result?.status ?? 'idle'

  switch (data.type) {
    case 'lamp':
      return (
        <Stage camera={[0, 0.35, 4.4]}>
          <LampModel
            level={level}
            burnt={!!data.burnt}
            color={LAMP_COLORS[(data.color as LampColor) ?? 'warm'] ?? LAMP_COLORS.warm}
          />
        </Stage>
      )
    case 'led':
      return (
        <Stage camera={[0, 0.35, 4.2]}>
          <LedModel
            level={level}
            burnt={!!data.burnt}
            color={LED_COLORS[(data.color as LedColor) ?? 'red'] ?? LED_COLORS.red}
          />
        </Stage>
      )
    case 'motor':
      return (
        <Stage camera={[0, 0.5, 4.8]}>
          <MotorModel speed={level} overheated={status === 'over'} />
        </Stage>
      )
    case 'buzzer':
      return (
        <Stage>
          <BuzzerModel level={level} />
        </Stage>
      )
    case 'battery':
      return (
        <Stage camera={[0, 0.3, 4.4]}>
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
        <Stage camera={[0, 0.4, 4.6]}>
          <SwitchModel closed={!!data.closed} rotation={data.rotation} current={result?.current ?? 0} />
        </Stage>
      )
    case 'button':
      return (
        <Stage>
          <ButtonModel pressed={!!data.pressed} />
        </Stage>
      )
    case 'resistor':
      return (
        <Stage camera={[0, 0.3, 4.4]}>
          <ResistorModel
            ohms={data.resistance ?? 100}
            rotation={data.rotation}
            heat={(result?.power ?? 0) / ELECTRICAL.resistor.ratedPower}
          />
        </Stage>
      )
    case 'dimmer':
      return (
        <Stage camera={[0, 0.2, 4.6]}>
          <DimmerModel level={data.level ?? 0.7} />
        </Stage>
      )
  }
}
