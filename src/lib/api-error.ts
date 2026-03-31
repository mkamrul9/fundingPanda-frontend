import axios from "axios";

type ApiErrorItem = {
    message?: unknown;
};

type ApiErrorPayload = {
    message?: unknown;
    errorSources?: ApiErrorItem[];
    errors?: ApiErrorItem[];
};

export const extractApiErrorMessage = (
    error: unknown,
    fallback = "Something went wrong. Please try again."
) => {
    if (axios.isAxiosError(error)) {
        const payload = error.response?.data as ApiErrorPayload | undefined;

        if (typeof payload?.message === "string" && payload.message.trim()) {
            return payload.message;
        }

        const sourceMessage = Array.isArray(payload?.errorSources)
            ? payload.errorSources.find((item) => typeof item?.message === "string")?.message
            : undefined;

        if (typeof sourceMessage === "string" && sourceMessage.trim()) {
            return sourceMessage;
        }

        const validationMessage = Array.isArray(payload?.errors)
            ? payload.errors.find((item) => typeof item?.message === "string")?.message
            : undefined;

        if (typeof validationMessage === "string" && validationMessage.trim()) {
            return validationMessage;
        }

        if (typeof error.message === "string" && error.message.trim()) {
            return error.message;
        }
    }

    if (error instanceof Error && error.message.trim()) {
        return error.message;
    }

    return fallback;
};