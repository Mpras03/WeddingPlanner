export class ApiResponseDto<T> {
  status: boolean;
  message: string;
  data: T;
}