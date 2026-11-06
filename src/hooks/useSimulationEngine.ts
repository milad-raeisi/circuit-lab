import { useEffect, useRef } from 'react'
import { toast } from 'sonner'
import { MISSION_IDS, evaluateMissions, type MissionMemory } from '@/circuit/missions'
import { EMPTY_RESULT, solveCircuit } from '@/circuit/solver'
import type { PartNode, WireEdge } from '@/circuit/types'
import {
  playPop,
  playSuccess,
  setBuzzerLevel,
  setMotorLevel,
  setSizzle,
  setSoundEnabled,
  stopContinuousSounds,
} from '@/lib/sound'
import { currentDictionary } from '@/i18n'
import { useCircuit } from '@/store/circuit'
import { useSettings } from '@/store/settings'
import { useSimulation } from '@/store/simulation'

/**
 * Only the electrical facts of the board matter to the solver: moving a part
 * around must not trigger a new solve. This key changes exactly when the
 * netlist or a part's electrical state changes.
 */
function electricalKey(nodes: PartNode[], edges: WireEdge[]) {
  const parts = nodes.map(({ id, data: d }) =>
    [id, d.type, d.voltage, d.closed, d.pressed, d.resistance, d.level, d.burnt, d.color].join(','),
  )
  const wires = edges.map((e) => [e.id, e.source, e.sourceHandle, e.target, e.targetHandle].join(','))
  return `${parts.join(';')}|${wires.join(';')}`
}

export function useSimulationEngine() {
  const key = useCircuit((s) => electricalKey(s.nodes, s.edges))
  const running = useSimulation((s) => s.running)
  const sound = useSettings((s) => s.sound)
  const wasShort = useRef(false)
  const memory = useRef<MissionMemory>({ motorForward: false, motorBackward: false })

  useEffect(() => setSoundEnabled(sound), [sound])
  useEffect(() => stopContinuousSounds, [])

  useEffect(() => {
    const { nodes, edges, updatePart } = useCircuit.getState()
    const t = currentDictionary()

    if (!running) {
      useSimulation.setState({ result: EMPTY_RESULT })
      stopContinuousSounds()
      wasShort.current = false
      return
    }

    const result = solveCircuit(
      nodes.map((n) => ({ id: n.id, data: n.data })),
      edges,
    )
    useSimulation.setState({ result })

    // parts that received too much power burn out (this re-runs the solver)
    for (const node of nodes) {
      if (!result.parts[node.id]?.damaged || node.data.burnt) continue
      updatePart(node.id, { burnt: true }, { history: false })
      playPop()
      toast.error(node.data.type === 'led' ? t.toasts.ledBurnt : t.toasts.lampBurnt, {
        id: `burnt-${node.id}`,
      })
    }

    if (result.shortCircuit && !wasShort.current) {
      toast.warning(t.toasts.short, { id: 'short-circuit' })
    }
    wasShort.current = result.shortCircuit
    setSizzle(result.shortCircuit)

    // continuous sounds
    let buzz = 0
    let hum = 0
    for (const node of nodes) {
      const r = result.parts[node.id]
      if (!r) continue
      if (node.data.type === 'buzzer') buzz += r.level
      if (node.data.type === 'motor') hum = Math.max(hum, Math.abs(r.level))
    }
    setBuzzerLevel(buzz)
    setMotorLevel(hum)

    // missions
    for (const node of nodes) {
      if (node.data.type !== 'motor') continue
      const level = result.parts[node.id]?.level ?? 0
      if (level > 0.3) memory.current.motorForward = true
      if (level < -0.3) memory.current.motorBackward = true
    }
    const { completed, completeMission } = useSettings.getState()
    const done = evaluateMissions(nodes, result, memory.current)
    for (const id of MISSION_IDS) {
      if (!done.has(id) || completed.includes(id)) continue
      completeMission(id)
      playSuccess()
      toast.success(t.toasts.mission, { description: t.missions.items[id], id: `mission-${id}` })
    }
  }, [key, running])
}
