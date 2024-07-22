export interface ResponseModel<T> {
  result?: T;
  error?: any;
}

export interface ErrorService {
  error: string;
}
