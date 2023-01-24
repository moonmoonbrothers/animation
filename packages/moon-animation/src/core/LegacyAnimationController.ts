import { transform } from "../utils/transform"
import { assert } from "../utils/assert"
import FrameLoop from "./FrameLoop"
import NumericalAnalyzer, { Equation, MoveInfo } from "./NumericalAnalyzer"

export class AnimationController<KEY extends string> {
  private frameLoop!: FrameLoop
  private numericalAnalyzers: Record<KEY, NumericalAnalyzer>
  private animateFn: AnimateFn<KEY> | undefined

  constructor(
    {
      configs,
      animateFn,
    }: {
      configs: AnimationControllerConfigs<KEY>
      animateFn?: AnimateFn<KEY>
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

    if (animateFn) this.animateFn = animateFn

    const valueKeys = Object.keys(configs) as KEY[]
    const values = {} as AnimateValues<KEY>
    const frameLoopCallback = (dt: number) => {
      valueKeys.forEach((key) => {
        const { displacement } = this.numericalAnalyzers[key].move(dt)
        values[key] = displacement
      })

      this.animateFn && this.animateFn(values)
    }

    this.frameLoop = new FrameLoop(frameLoopCallback)
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

  public animate(animateFn?: AnimateFn<KEY>) {
    if (animateFn) this.animateFn = animateFn

    assert(!!this.animateFn)

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

export type AnimateFn<KEY extends string> = (values: AnimateValues<KEY>) => void
