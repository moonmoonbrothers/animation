export type Equation = (moveInfo: MoveInfo) => number
export type MoveInfo = {
  displacement: number
  velocity: number
}

type NumericalAnalyzerConfig = {
  moveInfo: MoveInfo
  equation: Equation
}

export class NumericalAnalyzer {
  private moveInfo: MoveInfo
  private equation: Equation
  constructor({ moveInfo, equation }: NumericalAnalyzerConfig) {
    this.equation = equation
    this.moveInfo = moveInfo
  }

  getCurrentMoveInfo() {
    return { ...this.moveInfo }
  }

  updateConfig({
    moveInfo: { displacement, velocity } = {},
    equation,
  }: {
    moveInfo?: Partial<MoveInfo>
    equation?: Equation
  }) {
    if (displacement != null) {
      this.moveInfo.displacement = displacement
    }

    if (velocity != null) {
      this.moveInfo.velocity = velocity
    }

    if (equation != null) {
      this.equation = equation
    }
  }

  move(h: number) {
    const { velocity: v, displacement: x } = this.moveInfo

    /*
      Euler Method is replaced with(Runge-Kutta method) 
    */
    const k1 = {
      v: v,
      a: this.equation({ velocity: v, displacement: x }),
    }

    const k2 = {
      v: v + (h * k1.a) / 2,
      a: this.equation({
        displacement: x + (h * k1.v) / 2,
        velocity: v + (h * k1.a) / 2,
      }),
    }

    const k3 = {
      v: v + (h * k2.a) / 2,
      a: this.equation({
        displacement: x + (h * k2.v) / 2,
        velocity: v + (h * k2.a) / 2,
      }),
    }

    const k4 = {
      v: v + h * k3.a,
      a: this.equation({
        displacement: x + k3.v * h,
        velocity: v + h * k3.a,
      }),
    }

    this.moveInfo = {
      displacement: x + (h * (k1.v + 2 * k2.v + 2 * k3.v + k4.v)) / 6,
      velocity: v + (h * (k1.a + 2 * k2.a + 2 * k3.a + k4.a)) / 6,
    }
    return this.moveInfo
  }
}

export default NumericalAnalyzer
