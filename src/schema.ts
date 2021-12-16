abstract class Schema<Create, Represent> {
  public readonly data: Create;
  constructor(data: Create) {
    this.data = data;
  }

  public abstract get public(): Represent;
}
export default Schema;
