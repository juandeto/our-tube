export class CreateVideoListDto {
  private constructor(
    public readonly title: string,
    public readonly subject?: string
  ) {}

  static create(props: { [key: string]: any }): [string?, CreateVideoListDto?] {
    const { title, subject } = props;

    if (typeof title !== 'string') return ['Title must be a string'];
    if (subject && typeof subject !== 'string')
      return ['Subject must be a string'];

    return [undefined, new CreateVideoListDto(title, subject)];
  }
}
