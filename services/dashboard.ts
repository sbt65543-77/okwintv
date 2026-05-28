import { Axios } from "./Axios";

export interface TrackPageVisitPayload {
  visitorId: string;
  path: string;
}

export const trackPageVisit = async (payload: TrackPageVisitPayload) => {
  const response = await Axios(false).post<{ success: boolean }>("/dashboard/page-visit", payload);

  return response.data;
};
