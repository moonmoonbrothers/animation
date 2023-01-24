import { assert } from "../utils/assert"
import DefaultFrameLoop from "./FrameLoop"
import DefaultNumericalAnalyzer from "./NumericalAnalyzer"

export class AnimationController {
  protected frameLoop!: DefaultFrameLoop
  protected NumericalAnalyzer: new (
    ...args: ConstructorParameters<typeof DefaultNumericalAnalyzer>
  ) => DefaultNumericalAnalyzer
  protected FrameLoop: new (...args: ConstructorParameters<typeof DefaultFrameLoop>) => DefaultFrameLoop

  constructor({
    NumericalAnalyzer = DefaultNumericalAnalyzer,
    FrameLoop  = DefaultFrameLoop,
  }: AnimationControllerOptions = {}) {
    this.FrameLoop = FrameLoop
    this.NumericalAnalyzer = NumericalAnalyzer
  }

  public animate() {
    assert(!!this.frameLoop)
    this.frameLoop.start()
  }

  // Must be called when not used
  public cancel() {
    assert(!!this.frameLoop)
    this.frameLoop.cancel()
  }
}

export default AnimationController

export type AnimationControllerOptions = {
  FrameLoop?: new (...args: ConstructorParameters<typeof DefaultFrameLoop>) => DefaultFrameLoop
  NumericalAnalyzer?: new (
    ...args: ConstructorParameters<typeof DefaultNumericalAnalyzer>
  ) => DefaultNumericalAnalyzer
}
