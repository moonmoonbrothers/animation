export type LoopCallback = (dt: number) => void

export class FrameLoop {
  private now: number = 0
  private animationId: number = -1
  private loopCallback: LoopCallback

  constructor(loopCallback: LoopCallback) {
    this.loopCallback = loopCallback
  }

  updateLoopCallback(loopCallback: LoopCallback) {
    this.loopCallback = loopCallback
  }

  private loop() {
    const prev = this.now
    this.now = Date.now()
    const dt = (prev ? Math.min(64, this.now - prev) : 16.667) * 0.001
    this.loopCallback(dt)
    this.animationId = window.requestAnimationFrame(this.loop.bind(this))
  }

  start() {
    this.loop()
  }

  cancel() {
    if (this.animationId == null) return
    window.cancelAnimationFrame(this.animationId)
  }
}

export default FrameLoop