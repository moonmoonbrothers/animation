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

  getMoveInfo() {
    return this.moveInfo
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

  move(dt: number) {
    const { velocity, displacement } = this.moveInfo
    const acceleration = this.equation(this.moveInfo)
    // 수치해석학 보고 더 나은 근사법 찾을 예정
    this.moveInfo = {
      velocity: velocity + acceleration * dt,
      displacement: displacement + velocity * dt,
    }
    return this.moveInfo
  }
}

export default NumericalAnalyzer
