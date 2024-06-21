class Vector {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  static fromClient(obj: { clientX: number; clientY: number }): Vector {
    return new Vector(obj.clientX, obj.clientY);
  }

  add(rhs: Vector): Vector {
    return new Vector(this.x + rhs.x, this.y + rhs.y);
  }

  sub(rhs: Vector): Vector {
    return new Vector(this.x - rhs.x, this.y - rhs.y);
  }

  mul(rhs: number): Vector {
    return new Vector(this.x * rhs, this.y * rhs);
  }

  div(rhs: number): Vector {
    return new Vector(this.x / rhs, this.y / rhs);
  }
}

function objectMap<F, T, Obj extends { [key: string]: F }>(
  object: Obj,
  func: (val: F) => T,
): { [Property in keyof Obj]: T } {
  return Object.fromEntries(
    Object.entries(object).map(([k, v]) => [k, func(v)]),
  ) as { [Property in keyof Obj]: T };
}

function apply_on_rows<Row extends { [key: string]: Vector }>(
  matrix: Row,
  func: (row: { [Property in keyof Row]: number }) => number,
): Vector {
  return new Vector(
    func(objectMap<Vector, number, Row>(matrix, (val) => val.x)),
    func(objectMap<Vector, number, Row>(matrix, (val) => val.y)),
  );
}

export { Vector, apply_on_rows };
