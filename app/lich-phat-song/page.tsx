import SchedulePage from "@/modules/schedule";
import { getLiveRoomSettingsServer } from "@/services/liveRoomSettingsServer";

export const dynamic = "force-dynamic";

export default async function Page() {
  const liveRoomSettings = await getLiveRoomSettingsServer();

  return (
    <SchedulePage customerSupportUrl={liveRoomSettings.customerSupportUrl} />
  );
}
