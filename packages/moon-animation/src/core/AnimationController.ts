import { transform } from "../utils/transform"
import FrameLoop from "./FrameLoop"
import NumericalAnalyzer, { Equation, MoveInfo } from "./NumericalAnalyzer"

class AnimationController<KEY extends string> {
  private frameLoop: FrameLoop
  private numericalAnalyzers: Record<KEY, NumericalAnalyzer>

  constructor(
    {
      configs,
      animateFn,
    }: {
      configs: AnimationControllerConfigs<KEY>
      animateFn: (values: AnimateValues<KEY>) => void
    },
    {
      NumericalAnalyzer: _NumericalAnalyzer = NumericalAnalyzer,
      FrameLoop: _FrameLoop = FrameLoop,
    }: Partial<AnimationControllerOptions> = {}
  ) {
    this.numericalAnalyzers = transform(
      configs,
      (config) => new NumericalAnalyzer(config)
    )

    const valueKeys = Object.keys(configs) as KEY[]
    const values = {} as AnimateValues<KEY>

    this.frameLoop = new FrameLoop((dt: number) => {
      valueKeys.forEach((key) => {
        const { displacement } = this.numericalAnalyzers[key].move(dt)
        values[key] = displacement
      })

      animateFn(values)
    })
  }

  public updateConfigs(
    configs: Partial<Record<KEY, { moveInfo?: MoveInfo; equation?: Equation }>>
  ) {
    const valueKeys = Object.keys(configs) as KEY[]

    valueKeys.forEach((key) => {
      const config = configs[key]
      if (config == null) return
      this.numericalAnalyzers[key].updateConfig(config)
    })
  }

  public animate() {
    this.frameLoop.start()
  }

  // Must be called when not used
  public cancel() {
    this.frameLoop.cancel()
  }
}

export default AnimationController

export type AnimateValues<KEY extends string> = Record<KEY, number>

export type AnimationControllerOptions = {
  FrameLoop: new (...args: ConstructorParameters<typeof FrameLoop>) => FrameLoop
  NumericalAnalyzer: new (
    ...args: ConstructorParameters<typeof NumericalAnalyzer>
  ) => NumericalAnalyzer
}

export type AnimationControllerConfigs<T extends string> = {
  [key in T]: { moveInfo: MoveInfo; equation: Equation }
}
