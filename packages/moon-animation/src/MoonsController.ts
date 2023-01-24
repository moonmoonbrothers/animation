import { transform } from "./utils/transform"

import AnimationController, {
  AnimationControllerOptions,
} from "./core/AnimationController"
import NumericalAnalyzer, { Equation, MoveInfo } from "./core/NumericalAnalyzer"

export class MoonsController<KEY extends string> extends AnimationController {
  configFn: MoonsConfigFn<KEY>
  private numericalAnalyzerMaps: Record<KEY, NumericalAnalyzer>[] = []
  private targetIds: TargetIds = []
  constructor(
    {
      targetIds,
      configFn,
      animateFn,
    }: {
      targetIds: any[]
      configFn: MoonsConfigFn<KEY>
      animateFn: AnimateFn<KEY>
    },
    options: AnimationControllerOptions = {}
  ) {
    super(options)

    this.configFn = configFn
    this.targetIds = targetIds
    this.updateTargetIds(targetIds)

    let valueMaps: Record<KEY, number>[] = []

    this.frameLoop = new this.FrameLoop((dt: number) => {
      this.numericalAnalyzerMaps.forEach((numericalAnalyzerMap, index) => {
        const valueKeys = Object.keys(numericalAnalyzerMap) as KEY[]
        valueKeys.forEach((key) => {
          const numericalAnalyzer = numericalAnalyzerMap[key]
          if (valueMaps[index] == null) {
            valueMaps[index] = {} as Record<KEY, number>
          }
          valueMaps[index][key] = numericalAnalyzer.move(dt).displacement
        })
      })

      if (targetIds.length < valueMaps.length) {
        valueMaps = valueMaps.slice(0, targetIds.length)
      }
      animateFn(valueMaps)
    })
  }

  updateTargetIds(ids: TargetIds) {
    const previewTargetIds = this.targetIds
    const previousMoveInfoMaps = this.numericalAnalyzerMaps.map(
      (numericalAnalyzerMap) => {
        return transform(numericalAnalyzerMap, (numericalAnalyzer) =>
          numericalAnalyzer.getCurrentMoveInfo()
        )
      }
    )

    ids.forEach((id, index) => {
      const numericalAnalyzerMap = this.numericalAnalyzerMaps[index]
      const previousIndex = previewTargetIds.findIndex(
        (previous) => previous === id
      )

      if (previousIndex === -1 || numericalAnalyzerMap == null) {
        this.numericalAnalyzerMaps[index] = transform(
          this.configFn(index),
          (value) => new this.NumericalAnalyzer(value)
        )
      } else {
        const previousMoveInfoMap = previousMoveInfoMaps[previousIndex]

        const keys = Object.keys(previousMoveInfoMap) as KEY[]

        keys.forEach((key) => {
          numericalAnalyzerMap[key].updateConfig({
            moveInfo: previousMoveInfoMap[key],
          })
        })
      }
    })

    this.targetIds = ids
  }
}

type TargetIds = any[]
type MoonsConfigFn<KEY extends string> = (
  index: number
) => Record<KEY, { moveInfo: MoveInfo; equation: Equation }>
type AnimateFn<KEY extends string> = (values: Record<KEY, number>[]) => void
