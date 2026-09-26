import { useCallback, useState } from 'react';
import { FieldErrors, parseApiErrors } from '../utils/apiErrors';

export function useApiError() {
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalError, setGlobalError] = useState<string | null>(null);
  const [technicalError, setTechnicalError] = useState<string | null>(null);

  const clearErrors = useCallback(() => {
    setFieldErrors({});
    setGlobalError(null);
    setTechnicalError(null);
  }, []);

  const handleApiError = useCallback((error: any) => {
    const parsed = parseApiErrors(error);

    setFieldErrors(parsed.fieldErrors);

    if (parsed.isNetwork) {
      setGlobalError('Impossible de joindre le serveur, vérifie ta connexion internet.');
    } else if (parsed.isServerError) {
      setGlobalError('Une erreur est survenue côté serveur, réessaie plus tard.');
    } else if (parsed.message) {
      setGlobalError(parsed.message);
    } else {
      setGlobalError('Une erreur inattendue est survenue.');
    }

    if (__DEV__ && parsed.message) {
      setTechnicalError(parsed.message);
    } else {
      setTechnicalError(null);
    }

    return parsed;
  }, []);

  return {
    fieldErrors,
    setFieldErrors,
    globalError,
    setGlobalError,
    technicalError,
    setTechnicalError,
    clearErrors,
    handleApiError,
  };
}
