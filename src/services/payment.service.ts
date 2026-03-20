import { apiClient } from "@/lib/axios";

export const createCheckoutSession = async ({
    projectId,
    amount,
}: {
    projectId: string;
    amount: number;
}) => {
    // Backend currently serves this via donations module.
    const response = await apiClient.post("/donations/initiate-payment", {
        projectId,
        amount,
    });

    const payload = response.data.data;

    return {
        ...payload,
        // Normalize API shape so UI can always use `url`
        url: payload?.url || payload?.paymentUrl,
    };
};
