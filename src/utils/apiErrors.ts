export type FieldErrors = Record<string, string>;

export type ParsedApiError = {
  fieldErrors: FieldErrors;
  message: string | null;
  status?: number;
  isValidation: boolean;
  isNetwork: boolean;
  isServerError: boolean;
  raw: any;
};

export function parseApiErrors(error: any): ParsedApiError {
  const raw = error?.response?.data ?? error?.data ?? error ?? {};
  const status = error?.response?.status ?? error?.status;

  const fieldErrorsObject =
    raw && typeof raw === 'object' && raw.errors && typeof raw.errors === 'object'
      ? raw.errors
      : {};

  const fieldErrors = Object.entries(fieldErrorsObject).reduce((acc, [key, value]) => {
    const firstMessage = Array.isArray(value)
      ? value[0]
      : typeof value === 'string'
        ? value
        : typeof value === 'object' && value !== null && 'message' in value
          ? String((value as any).message)
          : null;

    if (firstMessage) {
      acc[key] = firstMessage;
    }

    return acc;
  }, {} as FieldErrors);

  const message =
    typeof raw?.message === 'string'
      ? raw.message
      : typeof error?.message === 'string'
        ? error.message
        : null;

  const isNetwork =
    !error?.response &&
    (String(error?.message ?? '').toLowerCase().includes('network error') ||
      String(error?.code ?? '').toLowerCase() === 'err_network');

  const isValidation = status === 422 || Object.keys(fieldErrors).length > 0;
  const isServerError = Boolean(status && status >= 500) || (!isNetwork && !isValidation && status === 500);

  return {
    fieldErrors,
    message,
    status,
    isValidation,
    isNetwork,
    isServerError,
    raw,
  };
}
