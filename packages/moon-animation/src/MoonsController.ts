import { transform } from "./utils/transform"

import AnimationController, {
  AnimationControllerOptions,
} from "./core/AnimationController"
import NumericalAnalyzer, { Equation, MoveInfo } from "./core/NumericalAnalyzer"

export class MoonsController<KEY extends string> extends AnimationController {
  configFn: MoonsConfigFn<KEY>
  private destinationNumericalAnalyzerMaps: Record<KEY, NumericalAnalyzer>[] =
    []
  private springNumericalAnalyzerMaps: Record<KEY, NumericalAnalyzer>[] = []
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

    let destinationValueMaps: Record<KEY, number>[] = []
    let springValueMaps: Record<KEY, number>[] = []

    this.frameLoop = new this.FrameLoop((dt: number) => {
      this.destinationNumericalAnalyzerMaps.forEach(
        (destinationNumericalAnalyzerMap, index) => {
          const valueKeys = Object.keys(
            destinationNumericalAnalyzerMap
          ) as KEY[]
          valueKeys.forEach((key) => {
            const numericalAnalyzer = destinationNumericalAnalyzerMap[key]
            if (destinationValueMaps[index] == null) {
              destinationValueMaps[index] = {} as Record<KEY, number>
            }
            destinationValueMaps[index][key] =
              numericalAnalyzer.move(dt).displacement
          })
        }
      )

      this.springNumericalAnalyzerMaps.forEach(
        (springNumericalAnalyzerMap, index) => {
          const valueKeys = Object.keys(springNumericalAnalyzerMap) as KEY[]
          valueKeys.forEach((key) => {
            const springNumericalAnalyzer = springNumericalAnalyzerMap[key]
            springNumericalAnalyzer.updateConfig({
              equation: ({ displacement, velocity }) => {
                return (
                  -50 * (displacement - destinationValueMaps[index][key]) -
                  10 * velocity
                )
              },
            })
          })
        }
      )

      this.springNumericalAnalyzerMaps.forEach(
        (springNumericalAnalyzerMap, index) => {
          const valueKeys = Object.keys(springNumericalAnalyzerMap) as KEY[]
          valueKeys.forEach((key) => {
            const springNumericalAnalyzer = springNumericalAnalyzerMap[key]
            if (springValueMaps[index] == null) {
              springValueMaps[index] = {} as Record<KEY, number>
            }
            springValueMaps[index][key] =
              springNumericalAnalyzer.move(dt).displacement
          })
        }
      )

      if (targetIds.length < springValueMaps.length) {
        springValueMaps = springValueMaps.slice(0, targetIds.length)
      }
      animateFn(springValueMaps)
    })
  }

  updateTargetIds(ids: TargetIds) {
    const previousTargetIds = this.targetIds
    const previousMoveInfoMaps = this.springNumericalAnalyzerMaps.map(
      (numericalAnalyzerMap) => {
        return transform(numericalAnalyzerMap, (numericalAnalyzer) =>
          numericalAnalyzer.getCurrentMoveInfo()
        )
      }
    )

    ids.forEach((id, index) => {
      const springNumericalAnalyzerMap = this.springNumericalAnalyzerMaps[index]
      const previousIndex = previousTargetIds.findIndex(
        (previous) => previous === id
      )

      if (previousIndex === -1 || springNumericalAnalyzerMap == null) {
        this.destinationNumericalAnalyzerMaps[index] = transform(
          this.configFn(index),
          (value) => new this.NumericalAnalyzer(value)
        )
        this.springNumericalAnalyzerMaps[index] = transform(
          this.configFn(index),
          (config) =>
            new this.NumericalAnalyzer({
              moveInfo: {
                displacement: config.moveInfo.displacement,
                velocity: 0,
              },
              equation: () => 0,
            })
        )
      } else {
        const previousMoveInfoMap = previousMoveInfoMaps[previousIndex]

        const keys = Object.keys(previousMoveInfoMap) as KEY[]

        keys.forEach((key) => {
          springNumericalAnalyzerMap[key].updateConfig({
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
