"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  buildBirthday,
  formatBirthday,
  getProfileInitial,
  parseBirthday,
} from "@/helpers/string";
import { clearAuthData, getAuthLocalData, setAuthData } from "@/helpers/token";
import {
  getMyBroadcastRooms,
  startBroadcastRoom,
  stopBroadcastRoom,
  type BroadcastLiveItem,
  type BroadcastRoom,
  type BroadcastStatus,
} from "@/services/channels";
import {
  getProfile,
  logout,
  updateProfile,
  uploadProfileImage,
  type UpdateProfilePayload,
  type UserProfile,
} from "@/services/auth";
import HomeSidebar from "@/modules/homes/components/HomeSidebar";

const defaultProfile = {
  coverUrl: "/assets/profile/profile-cover.png",
};

const profileMenu = [
  { id: "profile", icon: "user", label: "Thông Tin Cá Nhân" },
  { id: "password", icon: "lock", label: "Thay Đổi Mật Khẩu" },
  { id: "wallet", icon: "wallet", label: "Ví Của Tôi" },
  { id: "history", icon: "history", label: "Lịch Sử Giao Dịch" },
  { id: "follow", icon: "heart", label: "Theo Dõi" },
  {
    id: "broadcasts",
    icon: "mic",
    label: "Phòng Phát Sóng",
    broadcasterOnly: true,
  },
] as const;

type ProfileMenuId = (typeof profileMenu)[number]["id"];

const days = Array.from({ length: 31 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);
const months = Array.from({ length: 12 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);
const years = Array.from({ length: 70 }, (_, index) => String(2026 - index));

const vietnamProvinces = [
  "Thành phố Hà Nội",
  "Thành phố Hồ Chí Minh",
  "Thành phố Hải Phòng",
  "Thành phố Đà Nẵng",
  "Thành phố Huế",
  "Thành phố Cần Thơ",
  "Tuyên Quang",
  "Cao Bằng",
  "Lai Châu",
  "Lào Cai",
  "Thái Nguyên",
  "Điện Biên",
  "Lạng Sơn",
  "Sơn La",
  "Phú Thọ",
  "Bắc Ninh",
  "Quảng Ninh",
  "Hưng Yên",
  "Ninh Bình",
  "Thanh Hóa",
  "Nghệ An",
  "Hà Tĩnh",
  "Quảng Trị",
  "Quảng Ngãi",
  "Gia Lai",
  "Đắk Lắk",
  "Khánh Hòa",
  "Lâm Đồng",
  "Đồng Nai",
  "Tây Ninh",
  "Đồng Tháp",
  "An Giang",
  "Vĩnh Long",
  "Cà Mau",
];

export default function ProfilePage({
  customerSupportUrl,
}: {
  customerSupportUrl?: string;
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeMenu, setActiveMenu] = useState<ProfileMenuId>("profile");
  const [toastMessage, setToastMessage] = useState("");

  useEffect(() => {
    let isMounted = true;

    getProfile()
      .then((data) => {
        if (isMounted) {
          setProfile(data);
        }
      })
      .catch(() => {
        const authData = getAuthLocalData();
        if (isMounted) {
          setProfile((authData?.user as UserProfile | undefined) || null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const viewModel = useMemo(() => normalizeProfile(profile), [profile]);
  const canUseBroadcastRooms = isBroadcasterProfile(profile);

  return (
    <main className="min-h-screen bg-[#111] text-white">
      <div className="mx-auto grid max-w-[1920px] grid-cols-1 pt-[60px] 2xl:grid-cols-[250px_minmax(0,1fr)]">
        <div className="hidden 2xl:block">
          <HomeSidebar customerSupportUrl={customerSupportUrl} />
        </div>
        <section className="min-h-[calc(100vh-60px)] bg-[#111] px-4 pb-10 pt-[22px] sm:px-5 md:px-8 lg:px-10 xl:px-12 2xl:min-h-[1070px] 2xl:px-0 2xl:pb-[90px] 2xl:pt-[52px]">
          <div className="mx-auto flex w-full max-w-[760px] flex-col gap-6 lg:max-w-[1120px] xl:max-w-[1320px] xl:flex-row xl:items-start xl:gap-7 2xl:ml-[125px] 2xl:w-[1422px] 2xl:max-w-none 2xl:gap-[31px]">
            <aside className="w-full xl:w-[282px] xl:shrink-0">
              <ProfileSummary profile={viewModel} />
              <ProfileMenu
                activeMenu={activeMenu}
                canUseBroadcastRooms={canUseBroadcastRooms}
                onSelectMenu={setActiveMenu}
              />
            </aside>
            {activeMenu === "broadcasts" && canUseBroadcastRooms ? (
              <BroadcastRoomsPanel onToast={setToastMessage} />
            ) : (
              <ProfileForm
                key={JSON.stringify(viewModel)}
                profile={viewModel}
                onProfileUpdated={setProfile}
                onToast={setToastMessage}
              />
            )}
          </div>
        </section>
      </div>
      {toastMessage ? (
        <ProfileToast
          message={toastMessage}
          onDone={() => setToastMessage("")}
        />
      ) : null}
    </main>
  );
}

function ProfileToast({
  message,
  onDone,
}: {
  message: string;
  onDone: () => void;
}) {
  useEffect(() => {
    const timeout = window.setTimeout(onDone, 3000);

    return () => window.clearTimeout(timeout);
  }, [onDone]);

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[10000] rounded-[8px] border border-[#ff8c13] bg-[#202020] px-[18px] py-[12px] text-[14px] font-bold text-[#3fd073] shadow-[0_12px_30px_rgba(0,0,0,.45)] sm:bottom-6 sm:right-6">
      {message}
    </div>
  );
}

function ProfileSummary({ profile }: { profile: ProfileViewModel }) {
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[150px] w-[150px] overflow-hidden rounded-full border-[3px] border-[#ff8c13] bg-[#242424] sm:h-[170px] sm:w-[170px] 2xl:h-[198px] 2xl:w-[198px]">
        <ProfileAvatar
          avatarUrl={profile.avatarUrl}
          displayName={profile.displayName}
          initial={profile.initial}
          size="large"
        />
      </div>
      <h1 className="mt-[13px] text-center text-[22px] font-bold leading-[28px] text-[#ff8c13] 2xl:text-[25px] 2xl:leading-[32px]">
        {profile.headingName}
      </h1>

      <div className="mt-[16px] w-full max-w-[420px] rounded-[6px] bg-[#282828] px-[13px] py-[10px] text-[14px] leading-[18px] text-[#f1f1f1] xl:max-w-none">
        <InfoLine icon="pen" label="Tiểu sử:" value={profile.bio} />
        <InfoLine icon="gender" label="Giới tính:" value={profile.gender} />
        <InfoLine
          icon="birthday"
          label="Sinh nhật:"
          value={formatBirthday(profile)}
        />
        <InfoLine icon="city" label="Tỉnh:" value={profile.province} />
      </div>
    </div>
  );
}

function ProfileMenu({
  activeMenu,
  canUseBroadcastRooms,
  onSelectMenu,
}: {
  activeMenu: ProfileMenuId;
  canUseBroadcastRooms: boolean;
  onSelectMenu: (menu: ProfileMenuId) => void;
}) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);

  async function confirmLogout() {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    try {
      await logout();
    } catch {
      // Local auth must still be cleared if the token is already expired.
    } finally {
      clearAuthData();
      router.push("/");
    }
  }

  return (
    <>
      <nav className="mx-auto mt-[20px] max-w-[520px] rounded-[8px] bg-[#282828] px-[10px] py-[20px] xl:max-w-none">
        <div className="grid gap-[9px] sm:grid-cols-2 xl:grid-cols-1">
          {profileMenu
            .filter(
              (item) => !("broadcasterOnly" in item) || canUseBroadcastRooms,
            )
            .map((item) => (
              <button
                key={item.id}
                className={`flex h-[43px] w-full cursor-pointer items-center gap-[13px] rounded-[6px] px-[11px] text-left text-[15px] font-bold leading-none sm:text-[16px] 2xl:text-[18px] ${
                  activeMenu === item.id
                    ? "bg-[#5b5b5b] text-[#ff8c13] before:absolute before:left-0 before:h-[43px] before:w-[10px] before:rounded-l-[6px] before:bg-[#ff8c13]"
                    : "text-[#bcbcbc]"
                } relative`}
                type="button"
                onClick={() => onSelectMenu(item.id)}
              >
                <ProfileIcon name={item.icon} />
                <span>{item.label}</span>
              </button>
            ))}
        </div>
        <button
          className="mt-[17px] h-[38px] w-full cursor-pointer rounded-[4px] bg-[linear-gradient(90deg,#8e8e8e_0%,#6d6d6d_100%)] text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
          disabled={isLoggingOut}
          type="button"
          onClick={() => setIsLogoutConfirmOpen(true)}
        >
          {isLoggingOut ? "Đang đăng xuất..." : "Đăng Xuất"}
        </button>
      </nav>
      {isLogoutConfirmOpen ? (
        <LogoutConfirmModal
          isLoggingOut={isLoggingOut}
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={confirmLogout}
        />
      ) : null}
    </>
  );
}

function LogoutConfirmModal({
  isLoggingOut,
  onCancel,
  onConfirm,
}: {
  isLoggingOut: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 px-4 text-white backdrop-blur-[2px]"
      role="presentation"
      onClick={onCancel}
    >
      <div
        className="w-[360px] max-w-full rounded-[8px] border border-[#ff8c13] bg-[#1f1f1f] p-[20px] shadow-[0_20px_50px_rgba(0,0,0,.55)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="logout-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="logout-confirm-title"
          className="text-center text-[20px] font-bold text-[#ff8c13]"
        >
          Xác nhận đăng xuất
        </h2>
        <p className="mt-[12px] text-center text-[15px] leading-[22px] text-[#e5e5e5]">
          Bạn có chắc chắn muốn đăng xuất?
        </p>
        <div className="mt-[22px] grid grid-cols-2 gap-[12px]">
          <button
            className="h-[38px] cursor-pointer rounded-[5px] bg-[#5b5b5b] text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoggingOut}
            type="button"
            onClick={onCancel}
          >
            Hủy
          </button>
          <button
            className="h-[38px] cursor-pointer rounded-[5px] bg-[#ff8c13] text-[15px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isLoggingOut}
            type="button"
            onClick={onConfirm}
          >
            {isLoggingOut ? "Đang xử lý..." : "Đồng ý"}
          </button>
        </div>
      </div>
    </div>
  );
}

type BroadcastTableRow = {
  away: string;
  duration: string;
  home: string;
  id: string;
  key: string;
  league: string;
  pullAddress: string;
  rawStatus: BroadcastStatus | "";
  roomId: string;
  server: string;
  status: string;
  streamKey: string;
  time: string;
  title: string;
  type: string;
  views: string;
};

function BroadcastRoomsPanel({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const [rooms, setRooms] = useState<BroadcastRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [operatingRoomId, setOperatingRoomId] = useState("");
  const [page, setPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [selectedConfigKey, setSelectedConfigKey] = useState("");
  const rows = useMemo(
    () => sortBroadcastRows(flattenBroadcastRows(rooms)),
    [rooms],
  );
  const rowsPerPage = 5;
  const totalPages = Math.max(Math.ceil(rows.length / rowsPerPage), 1);
  const currentPage = Math.min(page, totalPages);
  const visibleRows = rows.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage,
  );
  const selectedConfigRow =
    rows.find((row) => row.key === selectedConfigKey) || rows[0];
  const pushAddress = selectedConfigRow?.server || "";
  const streamKey = selectedConfigRow?.streamKey || "";

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage("");
    getMyBroadcastRooms({
      limit: 100,
      status: ["scheduled", "live", "finished"],
    })
      .then((response) => {
        if (isMounted) {
          setRooms(response.items || []);
          setPage(1);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage("Không thể tải phòng phát sóng");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  async function copyText(value: string) {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    onToast("Đã copy");
  }

  function showRowConfig(row: BroadcastTableRow) {
    setSelectedConfigKey(row.key);
    onToast("Đã chọn cấu hình");
  }

  async function handleLiveAction(row: BroadcastTableRow) {
    if (operatingRoomId) {
      return;
    }

    setOperatingRoomId(row.roomId);
    try {
      if (row.rawStatus === "scheduled") {
        await startBroadcastRoom(row.roomId);
        onToast("Đã bắt đầu live");
      } else if (row.rawStatus === "live") {
        await stopBroadcastRoom(row.roomId);
        onToast("Đã kết thúc live");
      }
      setRefreshKey((currentKey) => currentKey + 1);
    } catch {
      onToast("Không thể cập nhật live");
    } finally {
      setOperatingRoomId("");
    }
  }

  return (
    <section className="min-w-0 w-full rounded-[14px] border border-[#ff8c13] bg-[#1c1c1c] px-3 py-6 shadow-[0_0_0_1px_rgba(255,140,19,.08)_inset] sm:px-5 md:py-[46px] lg:px-[34px] xl:flex-1 2xl:w-[1110px] 2xl:flex-none 2xl:px-[50px]">
      <div className="grid gap-4 text-[14px] font-bold text-[#ff9a1f]">
        <StreamAddressRow
          id="broadcast-push-address"
          label="Địa chỉ đẩy"
          value={pushAddress}
          onCopy={() => copyText(pushAddress)}
        />
        <StreamAddressRow
          id="broadcast-stream-key"
          label="Stream key"
          value={streamKey}
          onCopy={() => copyText(streamKey)}
        />
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[14px] text-white/70">
          Đang tải phòng phát sóng...
        </div>
      ) : errorMessage ? (
        <div className="py-12 text-center text-[14px] text-[#ff8c13]">
          {errorMessage}
        </div>
      ) : !rows.length ? (
        <div className="py-12 text-center text-[14px] text-white/70">
          Chưa có trận đấu nào được gán.
        </div>
      ) : (
        <div className="broadcast-table-scroll -mx-1 mt-10 overflow-x-auto pb-2 2xl:mx-0 2xl:overflow-x-visible 2xl:pb-0">
          <table className="w-full min-w-[760px] table-fixed border-separate border-spacing-0 text-left text-[11px] text-[#eeeeee] sm:min-w-[980px] sm:text-[12px] 2xl:min-w-0 2xl:text-[14px]">
            <BroadcastTableColGroup />
            <thead>
              <BroadcastTableHeader />
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr
                  key={row.key}
                  className={`h-[88px] align-middle ${
                    selectedConfigRow?.key === row.key ? "bg-[#242424]" : ""
                  }`}
                >
                  <td className="border-b border-[#303030] px-1 py-3 md:px-2">
                    {row.type}
                  </td>
                  <td className="truncate border-b border-[#303030] px-1 py-3 md:px-2">
                    {row.league}
                  </td>
                  <td className="truncate border-b border-[#303030] px-1 py-3 md:px-2">
                    {row.home}
                  </td>
                  <td className="truncate border-b border-[#303030] px-1 py-3 md:px-2">
                    {row.away}
                  </td>
                  <td className="border-b border-[#303030] px-1 py-3 leading-[16px] md:px-2">
                    {row.time}
                  </td>
                  <td className="border-b border-[#303030] px-1 py-3 md:px-2">
                    {row.status}
                  </td>
                  <td className="border-b border-[#303030] px-1 py-3 md:px-2">
                    {row.duration}
                  </td>
                  <td className="border-b border-[#303030] px-1 py-3 md:px-2">
                    {row.views}
                  </td>
                  <td className="border-b border-[#303030] px-1 py-3 md:px-2">0</td>
                  <td
                    className={`sticky right-0 z-10 border-b border-[#303030] px-1 py-3 shadow-[-10px_0_14px_rgba(0,0,0,.22)] md:px-2 ${
                      selectedConfigRow?.key === row.key ? "bg-[#242424]" : "bg-[#1c1c1c]"
                    }`}
                  >
                    <div className="flex w-full flex-col gap-2">
                      <button
                        type="button"
                        className="h-[28px] cursor-pointer rounded-[5px] bg-[#777] px-1 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 md:text-[11px] 2xl:text-[12px]"
                        disabled={
                          Boolean(operatingRoomId) ||
                          !["scheduled", "live"].includes(row.rawStatus)
                        }
                        onClick={() => handleLiveAction(row)}
                      >
                        {getLiveActionLabel(row, operatingRoomId)}
                      </button>
                      <button
                        type="button"
                        className="h-[28px] cursor-pointer rounded-[5px] bg-[#777] px-1 text-[10px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50 md:text-[11px] 2xl:text-[12px]"
                        disabled={!row.server && !row.streamKey}
                        onClick={() => showRowConfig(row)}
                      >
                        Cài Đặt
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {totalPages > 1 ? (
            <BroadcastPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          ) : null}
        </div>
      )}
    </section>
  );
}

function StreamAddressRow({
  id,
  label,
  onCopy,
  value,
}: {
  id: string;
  label: string;
  onCopy: () => void;
  value: string;
}) {
  return (
    <div className="grid grid-cols-1 items-center gap-2 sm:grid-cols-[105px_minmax(0,1fr)_82px] sm:gap-[14px]">
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        readOnly
        value={value}
        className="h-[48px] min-w-0 rounded-[10px] border border-[#d8d8d8] bg-[#202020] px-4 text-[14px] font-normal text-white outline-none"
      />
      <button
        type="button"
        className="h-[36px] cursor-pointer justify-self-start rounded-[5px] text-[14px] font-bold text-[#ff9a1f] disabled:cursor-not-allowed disabled:opacity-40 sm:h-[48px] sm:justify-self-stretch"
        disabled={!value}
        onClick={onCopy}
      >
        Sao chép
      </button>
    </div>
  );
}

const broadcastTableColumns = [
  { heading: "Thể loại", width: 7 },
  { heading: "Giải đấu", width: 10 },
  { heading: "Home", width: 10 },
  { heading: "Away", width: 10 },
  { heading: "Time", width: 14 },
  { heading: "Trạng thái", width: 10 },
  { heading: "Thời lượng", width: 8 },
  { heading: "View", width: 5 },
  { heading: "Nhận quà", width: 6 },
  { heading: "Vận hành", width: 13 },
] as const;

function BroadcastTableColGroup() {
  return (
    <colgroup>
      {broadcastTableColumns.map((column) => (
        <col key={column.heading} style={{ width: `${column.width}%` }} />
      ))}
    </colgroup>
  );
}

function BroadcastTableHeader() {
  return (
    <tr className="h-[36px] bg-[#272727] text-[10px] font-normal text-[#e9e9e9] md:text-[11px] lg:text-[12px] 2xl:text-[14px]">
      {broadcastTableColumns.map((column, index) => (
        <th
          key={column.heading}
          className={`truncate border-y border-[#ff8c13] px-1 py-[8px] font-normal md:px-2 ${
            index === 0 ? "rounded-l-[8px] border-l pl-1 md:pl-2" : ""
          } ${
            index === broadcastTableColumns.length - 1
              ? "sticky right-0 z-20 rounded-r-[8px] border-r bg-[#272727] text-[#ff8c13] shadow-[-10px_0_14px_rgba(0,0,0,.22)]"
              : ""
          }`}
        >
          {column.heading}
        </th>
      ))}
    </tr>
  );
}

function BroadcastPagination({
  currentPage,
  onPageChange,
  totalPages,
}: {
  currentPage: number;
  onPageChange: (page: number) => void;
  totalPages: number;
}) {
  return (
    <div className="mt-5 flex items-center justify-center gap-2 text-[13px] font-bold">
      <button
        type="button"
        className="h-[30px] min-w-[30px] cursor-pointer rounded-[5px] bg-[#3a3a3a] px-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(Math.max(currentPage - 1, 1))}
      >
        Trước
      </button>
      {Array.from({ length: totalPages }, (_, index) => index + 1).map(
        (pageNumber) => (
          <button
            key={pageNumber}
            type="button"
            className={`h-[30px] min-w-[30px] cursor-pointer rounded-[5px] px-2 ${
              pageNumber === currentPage
                ? "bg-[#ff9b2f] text-white"
                : "bg-[#3a3a3a] text-white/80"
            }`}
            onClick={() => onPageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        ),
      )}
      <button
        type="button"
        className="h-[30px] min-w-[30px] cursor-pointer rounded-[5px] bg-[#3a3a3a] px-2 text-white disabled:cursor-not-allowed disabled:opacity-40"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(Math.min(currentPage + 1, totalPages))}
      >
        Sau
      </button>
    </div>
  );
}

function getLiveActionLabel(row: BroadcastTableRow, operatingRoomId: string) {
  if (operatingRoomId === row.roomId) {
    return row.rawStatus === "scheduled" ? "Đang bắt đầu" : "Đang kết thúc";
  }

  if (row.rawStatus === "scheduled") {
    return "Bắt đầu";
  }

  if (row.rawStatus === "live") {
    return "Kết thúc";
  }

  return "Bắt đầu";
}

function LegacyBroadcastRoomsPanel({
  onToast,
}: {
  onToast: (message: string) => void;
}) {
  const [rooms, setRooms] = useState<BroadcastRoom[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    setIsLoading(true);
    setErrorMessage("");
    getMyBroadcastRooms({
      limit: 100,
      status: ["scheduled", "live", "finished"],
    })
      .then((response) => {
        if (isMounted) {
          setRooms(response.items || []);
        }
      })
      .catch(() => {
        if (isMounted) {
          setErrorMessage("Không thể tải phòng phát sóng");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [refreshKey]);

  async function copyText(value: string) {
    if (!value) {
      return;
    }

    await navigator.clipboard.writeText(value);
    onToast("Đã copy");
  }

  async function copyAll(liveChannels: BroadcastLiveItem[]) {
    const text = liveChannels
      .map((liveChannel, index) => {
        const server = buildStreamServer(liveChannel.ivsIngestEndpoint);
        const streamKey = getStreamKey(liveChannel);

        return [
          `Kênh ${index + 1}: ${liveChannel.liveName || liveChannel.roomName || "-"}`,
          `Server: ${server}`,
          `Stream key: ${streamKey}`,
        ].join("\n");
      })
      .join("\n\n");

    await copyText(text);
  }

  return (
    <section className="min-w-0 w-full rounded-[14px] border border-[#ff8c13] bg-[#171717] px-3 py-[14px] sm:px-[15px] xl:flex-1 2xl:w-[1110px] 2xl:flex-none">
      <div className="flex flex-col gap-2 border-b border-[#3b3b3b] pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-[22px] font-bold text-[#ff8c13]">
            Phòng phát sóng
          </h2>
          <p className="mt-1 text-[13px] text-white/60">
            Danh sách trận được gán cho tài khoản của bạn.
          </p>
        </div>
        <button
          type="button"
          className="h-[36px] rounded-[5px] bg-[#2d2d2d] px-4 text-[13px] font-bold text-white"
          onClick={() => setRefreshKey((currentKey) => currentKey + 1)}
        >
          Làm mới
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center text-[14px] text-white/70">
          Đang tải phòng phát sóng...
        </div>
      ) : errorMessage ? (
        <div className="py-12 text-center text-[14px] text-[#ff8c13]">
          {errorMessage}
        </div>
      ) : !rooms.length ? (
        <div className="py-12 text-center text-[14px] text-white/70">
          Chưa có trận đấu nào được gán.
        </div>
      ) : (
        <div className="mt-4 grid gap-4">
          {rooms.map((room) => (
            <article
              key={room._id}
              className="rounded-[8px] border border-[#3f3f3f] bg-[#222] p-4"
            >
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-[18px] font-bold text-white">
                      {room.title}
                    </h3>
                    <span className="rounded bg-[#ff8c13] px-2 py-1 text-[11px] font-bold uppercase text-white">
                      {room.status || "scheduled"}
                    </span>
                    <span className="rounded bg-[#333] px-2 py-1 text-[11px] font-bold uppercase text-white/70">
                      {room.liveStatus || "offline"}
                    </span>
                  </div>
                  <p className="mt-2 text-[13px] text-white/60">
                    {room.matchStartTime
                      ? new Date(room.matchStartTime).toLocaleString("vi-VN")
                      : "Chưa có thời gian bắt đầu"}
                    {typeof room.viewerCount === "number"
                      ? ` · ${room.viewerCount.toLocaleString("vi-VN")} người xem`
                      : ""}
                  </p>
                </div>
                <button
                  type="button"
                  className="h-[34px] shrink-0 rounded-[5px] bg-[#ff8c13] px-3 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={!room.channels?.length}
                  onClick={() => copyAll(room.channels || [])}
                >
                  Copy tất cả
                </button>
              </div>

              <div className="mt-4 grid gap-3">
                {(room.channels || []).map((liveChannel, index) => {
                  const server = buildStreamServer(
                    liveChannel.ivsIngestEndpoint,
                  );
                  const streamKey = getStreamKey(liveChannel);

                  return (
                    <div
                      key={`${liveChannel.roomName || liveChannel.liveName}-${index}`}
                      className="rounded-[6px] border border-[#444] bg-[#171717] p-3"
                    >
                      <div className="mb-3 text-[14px] font-bold text-[#ff8c13]">
                        {index + 1}.{" "}
                        {liveChannel.liveName ||
                          liveChannel.roomName ||
                          "Kênh live"}
                      </div>
                      <StreamCopyRow
                        label="Server"
                        value={server}
                        onCopy={() => copyText(server)}
                      />
                      <StreamCopyRow
                        isSecret
                        label="Stream key"
                        value={streamKey}
                        onCopy={() => copyText(streamKey)}
                      />
                    </div>
                  );
                })}
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function StreamCopyRow({
  isSecret,
  label,
  onCopy,
  value,
}: {
  isSecret?: boolean;
  label: string;
  onCopy: () => void;
  value: string;
}) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="mb-1 text-[13px] font-bold text-white/80">{label}</div>
      <div className="flex min-w-0 gap-2">
        <input
          readOnly
          type={isSecret ? "password" : "text"}
          value={value}
          className="h-[38px] min-w-0 flex-1 rounded-[5px] border border-[#555] bg-[#111] px-3 text-[13px] text-white outline-none"
        />
        <button
          type="button"
          className="h-[38px] shrink-0 rounded-[5px] bg-[#3a3a3a] px-3 text-[13px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!value}
          onClick={onCopy}
        >
          Copy
        </button>
      </div>
    </div>
  );
}

function ProfileForm({
  onProfileUpdated,
  onToast,
  profile,
}: {
  onProfileUpdated: (profile: UserProfile) => void;
  onToast: (message: string) => void;
  profile: ProfileViewModel;
}) {
  const [formValues, setFormValues] = useState<ProfileFormValues>(() =>
    buildFormValues(profile),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingImageType, setUploadingImageType] = useState<
    "avatar" | "cover" | ""
  >("");
  const [saveMessage, setSaveMessage] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  function updateField(name: keyof ProfileFormValues, value: string) {
    setFormValues((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleImageChange(
    type: "avatar" | "cover",
    event: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file || uploadingImageType) {
      return;
    }

    setUploadingImageType(type);
    setSaveMessage("");
    try {
      const uploadedImage = await uploadProfileImage(file);
      updateField(
        type === "avatar" ? "avatarUrl" : "coverUrl",
        uploadedImage.url,
      );
    } catch {
      setSaveMessage("Không thể tải ảnh lên");
    } finally {
      setUploadingImageType("");
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSaving) {
      return;
    }

    setIsSaving(true);
    setSaveMessage("");
    try {
      const payload: UpdateProfilePayload = {
        avatarUrl: formValues.avatarUrl,
        bio: formValues.bio,
        birthday: buildBirthday(formValues),
        coverUrl: formValues.coverUrl,
        gender: formValues.gender,
        name: formValues.displayName,
        phone: formValues.phone,
        province: formValues.province,
      };
      const updatedProfile = await updateProfile(payload);
      const authData = getAuthLocalData();

      if (authData?.token) {
        setAuthData(authData.token, updatedProfile);
      }

      onProfileUpdated(updatedProfile);
      onToast("Cập nhật thành công");
    } catch {
      setSaveMessage("Không thể lưu thay đổi");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="min-w-0 w-full rounded-[14px] border border-[#ff8c13] bg-[#171717] px-3 pb-[15px] pt-[14px] sm:px-[15px] xl:flex-1 2xl:w-[1110px] 2xl:flex-none">
      <input
        ref={coverInputRef}
        className="hidden"
        accept="image/*"
        type="file"
        onChange={(event) => handleImageChange("cover", event)}
      />
      <input
        ref={avatarInputRef}
        className="hidden"
        accept="image/*"
        type="file"
        onChange={(event) => handleImageChange("avatar", event)}
      />
      <div className="relative h-[210px] overflow-visible rounded-[5px] bg-[#282828] sm:h-[260px] md:h-[320px] lg:h-[360px] xl:h-[340px] 2xl:h-[388px]">
        <Image
          src={formValues.coverUrl || defaultProfile.coverUrl}
          alt=""
          fill
          className="rounded-[5px] object-cover"
          sizes="(min-width: 1536px) 1075px, 100vw"
          priority
        />
        <button
          className="absolute right-[8px] top-[13px] flex h-[34px] cursor-pointer items-center gap-[6px] rounded-[3px] bg-white px-[10px] text-[13px] font-bold text-[#ff8c13] disabled:cursor-not-allowed disabled:opacity-70 sm:h-[38px] sm:gap-[8px] sm:px-[12px] sm:text-[16px]"
          disabled={Boolean(uploadingImageType)}
          type="button"
          onClick={() => coverInputRef.current?.click()}
        >
          <ProfileIcon name="pen" />
          {uploadingImageType === "cover" ? "Đang tải..." : "Đổi hình nền"}
        </button>

        <div className="absolute bottom-[-63px] left-1/2 flex -translate-x-1/2 flex-col items-center 2xl:bottom-[-73px]">
          <div className="relative h-[96px] w-[96px] rounded-full border-[5px] border-white bg-[#252525] sm:h-[106px] sm:w-[106px] 2xl:h-[114px] 2xl:w-[114px]">
            <ProfileAvatar
              avatarUrl={formValues.avatarUrl}
              displayName={profile.displayName}
              initial={profile.initial}
              size="small"
            />
            <button
              className="absolute bottom-[3px] right-[-1px] flex h-[29px] w-[29px] cursor-pointer items-center justify-center rounded-full border-[2px] border-white bg-white text-[#ff8c13] disabled:cursor-not-allowed disabled:opacity-70"
              disabled={Boolean(uploadingImageType)}
              type="button"
              aria-label="Đổi ảnh đại diện"
              onClick={() => avatarInputRef.current?.click()}
            >
              <ProfileIcon name="pen" />
            </button>
          </div>
          <div className="mt-[12px] flex items-center gap-[6px]">
            <span className="rounded-full bg-[#ff4962] px-[9px] py-[3px] text-[14px] font-bold leading-none">
              ♛ 71
            </span>
            <span className="rounded-full bg-[#ffe7ca] px-[9px] py-[3px] text-[13px] font-bold leading-none text-[#ff8c13]">
              ◆ Level
            </span>
          </div>
        </div>
      </div>

      <form className="mt-[82px] 2xl:mt-[90px]" onSubmit={handleSubmit}>
        <FormLabel icon="user" label="Biệt danh" />
        <TextInput
          value={formValues.displayName}
          onChange={(value) => updateField("displayName", value)}
        />

        <div className="mt-[16px] grid grid-cols-1 gap-[16px] md:grid-cols-2">
          <div>
            <FormLabel icon="gender" label="Giới tính" />
            <SelectInput
              className="w-[80px]"
              value={formValues.gender}
              onChange={(value) => updateField("gender", value)}
            >
              <option value=""></option>
              <option>Nữ</option>
              <option>Nam</option>
              <option>Khác</option>
            </SelectInput>
          </div>
          <div>
            <FormLabel icon="birthday" label="Sinh nhật" />
            <div className="grid grid-cols-3 gap-[10px] sm:gap-[15px]">
              <SelectInput
                value={formValues.day}
                onChange={(value) => updateField("day", value)}
              >
                <option value=""></option>
                {days.map((day) => (
                  <option key={day}>{day}</option>
                ))}
              </SelectInput>
              <SelectInput
                value={formValues.month}
                onChange={(value) => updateField("month", value)}
              >
                <option value=""></option>
                {months.map((month) => (
                  <option key={month}>{month}</option>
                ))}
              </SelectInput>
              <SelectInput
                value={formValues.year}
                onChange={(value) => updateField("year", value)}
              >
                <option value=""></option>
                {years.map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </SelectInput>
            </div>
          </div>
        </div>

        <div className="mt-[16px] grid grid-cols-1 gap-[16px] md:grid-cols-2">
          <div>
            <FormLabel icon="phone" label="Số điện thoại" />
            <TextInput
              value={formValues.phone}
              onChange={(value) => updateField("phone", value)}
            />
          </div>
          <div>
            <FormLabel icon="city" label="Tỉnh thành" />
            <SelectInput
              value={formValues.province}
              onChange={(value) => updateField("province", value)}
            >
              <option value=""></option>
              {vietnamProvinces.map((province) => (
                <option key={province}>{province}</option>
              ))}
            </SelectInput>
          </div>
        </div>

        <div className="mt-[16px]">
          <FormLabel icon="pen" label="Tiểu sử" />
          <TextInput
            value={formValues.bio}
            onChange={(value) => updateField("bio", value)}
          />
        </div>

        <div className="mt-[24px] flex justify-center">
          <button
            className="h-[37px] cursor-pointer rounded-[5px] bg-[#ff941f] px-[12px] text-[16px] font-bold text-white disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? "Đang lưu..." : "Lưu Thay Đổi"}
          </button>
        </div>
        {saveMessage ? (
          <p className="mt-[10px] text-center text-[14px] text-[#ff8c13]">
            {saveMessage}
          </p>
        ) : null}
      </form>
    </section>
  );
}

function InfoLine({
  icon,
  label,
  value,
}: {
  icon: ProfileIconName;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-[10px] py-[6px]">
      <ProfileIcon name={icon} />
      <p>
        <span>{label}</span> <span>{value}</span>
      </p>
    </div>
  );
}

function FormLabel({ icon, label }: { icon: ProfileIconName; label: string }) {
  return (
    <label className="mb-[7px] flex items-center gap-[6px] text-[16px] font-bold leading-none text-[#ff8c13]">
      <ProfileIcon name={icon} />
      {label}
    </label>
  );
}

function TextInput({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <input
      className="h-[48px] w-full rounded-[7px] border border-[#747474] bg-[#1b1b1b] px-[12px] text-[14px] text-white outline-none placeholder:text-[#bfbfbf] focus:border-[#ff8c13]"
      value={value}
      onChange={(event) => onChange(event.target.value)}
    />
  );
}

function SelectInput({
  children,
  className = "w-full",
  onChange,
  value,
}: {
  children: React.ReactNode;
  className?: string;
  onChange: (value: string) => void;
  value: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        className="h-[48px] w-full appearance-none rounded-[7px] border border-[#747474] bg-[#1b1b1b] px-[12px] pr-[34px] text-[14px] text-white outline-none focus:border-[#ff8c13]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
      <span className="pointer-events-none absolute right-[13px] top-1/2 flex h-[12px] w-[12px] -translate-y-1/2 items-center justify-center text-[#d9d9d9]">
        <SelectChevronIcon />
      </span>
    </div>
  );
}

type ProfileFormValues = {
  avatarUrl?: string;
  bio: string;
  coverUrl: string;
  day: string;
  displayName: string;
  gender: string;
  month: string;
  phone: string;
  province: string;
  year: string;
};

type ProfileViewModel = {
  avatarUrl?: string;
  bio: string;
  coverUrl: string;
  day: string;
  displayName: string;
  gender: string;
  headingName: string;
  initial: string;
  month: string;
  phone: string;
  province: string;
  year: string;
};

function isBroadcasterProfile(profile: UserProfile | null) {
  return profile?.role === "BLV" || profile?.role === "STREAMER";
}

function flattenBroadcastRows(rooms: BroadcastRoom[]): BroadcastTableRow[] {
  return rooms.flatMap((room, roomIndex) => {
    const channels = room.channels?.length
      ? room.channels
      : [{} as BroadcastLiveItem];

    return channels.map((liveChannel, channelIndex) => {
      const title =
        room.title || liveChannel.liveName || liveChannel.roomName || "-";
      const teams = splitMatchTitle(title);
      const startTime = room.matchStartTime
        ? new Date(room.matchStartTime)
        : null;

      return {
        away: teams.away,
        duration: formatBroadcastDuration(liveChannel.streamStartTime),
        home: teams.home,
        id: buildShortBroadcastId(room._id, roomIndex, channelIndex),
        key: `${room._id}-${liveChannel.roomName || liveChannel.liveName || channelIndex}`,
        league: room.matchTournament || "-",
        pullAddress:
          liveChannel.playbackUrl || liveChannel.ivsPlaybackUrl || "",
        rawStatus: room.status || "",
        roomId: room._id,
        server: buildStreamServer(liveChannel.ivsIngestEndpoint),
        status: formatBroadcastStatus(room.status),
        streamKey: getStreamKey(liveChannel),
        time: formatBroadcastStartTime(startTime),
        title,
        type: formatBroadcastType(room.type),
        views: String(
          Math.max(room.viewerCount || liveChannel.viewerCount || 0, 0),
        ),
      };
    });
  });
}

function sortBroadcastRows(rows: BroadcastTableRow[]) {
  return [...rows].sort((left, right) => {
    const statusPriority =
      getBroadcastStatusPriority(left.rawStatus) -
      getBroadcastStatusPriority(right.rawStatus);

    if (statusPriority !== 0) {
      return statusPriority;
    }

    return left.time.localeCompare(right.time, "vi-VN");
  });
}

function getBroadcastStatusPriority(status: BroadcastStatus | "") {
  if (status === "scheduled") {
    return 0;
  }

  if (status === "live") {
    return 1;
  }

  if (status === "finished") {
    return 2;
  }

  return 3;
}

function splitMatchTitle(title: string) {
  const [home, away] = title.split(/\s+(?:vs|VS|v|V|-)\s+/);

  return {
    home: home?.trim() || title,
    away: away?.trim() || "-",
  };
}

function buildShortBroadcastId(
  id: string,
  roomIndex: number,
  channelIndex: number,
) {
  const digits = id.replace(/\D/g, "");
  return (
    digits.slice(0, 5) || String((roomIndex + 1) * 1000 + channelIndex + 1)
  );
}

function formatBroadcastType(type?: string) {
  if (type === "SPORTS") {
    return "Thể thao";
  }

  if (type === "STREAMER") {
    return "Streamer";
  }

  if (type === "ESPORT") {
    return "Esport";
  }

  if (type === "CASINO") {
    return "Casino";
  }

  return "-";
}

function formatBroadcastStatus(status?: string) {
  if (status === "live") {
    return "Đang live";
  }

  if (status === "finished") {
    return "Đã kết thúc";
  }

  if (status === "cancelled") {
    return "Đã hủy";
  }

  return "Chưa bắt đầu";
}

function formatBroadcastStartTime(startTime: Date | null) {
  if (!startTime || Number.isNaN(startTime.getTime())) {
    return "-";
  }

  return startTime.toLocaleString("vi-VN", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function formatBroadcastDuration(streamStartTime?: string) {
  if (!streamStartTime) {
    return "0p";
  }

  const startTime = new Date(streamStartTime).getTime();
  if (Number.isNaN(startTime)) {
    return "0p";
  }

  return `${Math.max(Math.floor((Date.now() - startTime) / 60000), 0)}p`;
}

function buildStreamServer(server?: string) {
  if (!server) {
    return "";
  }

  return /^rtmps?:\/\//i.test(server) ? server : `rtmps://${server}`;
}

function getStreamKey(liveChannel: BroadcastLiveItem) {
  return liveChannel.streamKey || liveChannel.ivsStreamKeyValue || "";
}

function normalizeProfile(profile: UserProfile | null): ProfileViewModel {
  const displayName = profile?.name ?? "";
  const birthday = parseBirthday(profile);

  return {
    avatarUrl: profile?.avatarUrl ?? profile?.avatar ?? profile?.photoUrl,
    bio: profile?.bio ?? "",
    coverUrl: profile?.coverUrl || defaultProfile.coverUrl,
    day: birthday.day,
    displayName,
    gender: profile?.gender ?? "",
    headingName: (displayName || profile?.username || "").toUpperCase(),
    initial: getProfileInitial(displayName),
    month: birthday.month,
    phone: profile?.phone ?? "",
    province: profile?.province ?? "",
    year: birthday.year,
  };
}

function ProfileAvatar({
  avatarUrl,
  displayName,
  initial,
  size,
}: {
  avatarUrl?: string;
  displayName: string;
  initial: string;
  size: "large" | "small";
}) {
  if (avatarUrl) {
    return (
      <Image
        src={avatarUrl}
        alt={displayName}
        fill
        className="rounded-full object-cover"
        sizes={size === "large" ? "198px" : "114px"}
        priority={size === "large"}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full items-center justify-center rounded-full bg-[#2b2b2b] font-bold text-[#ff8c13] ${
        size === "large" ? "text-[82px]" : "text-[46px]"
      }`}
      aria-label={displayName}
      role="img"
    >
      {initial}
    </div>
  );
}

function buildFormValues(profile: ProfileViewModel): ProfileFormValues {
  return {
    avatarUrl: profile.avatarUrl,
    bio: profile.bio,
    coverUrl: profile.coverUrl,
    day: profile.day,
    displayName: profile.displayName,
    gender: profile.gender,
    month: profile.month,
    phone: profile.phone,
    province: profile.province,
    year: profile.year,
  };
}

function SelectChevronIcon() {
  return (
    <svg className="h-[10px] w-[10px]" fill="currentColor" viewBox="0 0 20 20">
      <path d="M5.2 7.3 10 12.1l4.8-4.8 1.1 1.1-5.3 5.3a.8.8 0 0 1-1.2 0L4.1 8.4l1.1-1.1Z" />
    </svg>
  );
}

type ProfileIconName =
  | "birthday"
  | "city"
  | "gender"
  | "heart"
  | "history"
  | "lock"
  | "mic"
  | "pen"
  | "phone"
  | "user"
  | "wallet";

function ProfileIcon({ name }: { name: ProfileIconName }) {
  const commonClass = "h-[20px] w-[20px] shrink-0";

  if (name === "user") {
    return (
      <svg className={commonClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12a4.7 4.7 0 1 0 0-9.4 4.7 4.7 0 0 0 0 9.4Zm-8.2 8.2c0-4.3 3.7-7.5 8.2-7.5s8.2 3.2 8.2 7.5c0 .8-.6 1.3-1.3 1.3H5.1c-.7 0-1.3-.5-1.3-1.3Z" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg className={commonClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M7.3 10V7.8a4.7 4.7 0 0 1 9.4 0V10h.7c.9 0 1.6.7 1.6 1.6v7.8c0 .9-.7 1.6-1.6 1.6H6.6c-.9 0-1.6-.7-1.6-1.6v-7.8c0-.9.7-1.6 1.6-1.6h.7Zm2 0h5.4V7.8a2.7 2.7 0 0 0-5.4 0V10Z" />
      </svg>
    );
  }

  if (name === "wallet") {
    return (
      <svg className={commonClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M3 7.2c0-1.2 1-2.2 2.2-2.2h12.6c1.2 0 2.2 1 2.2 2.2v1H8.3A3.3 3.3 0 0 0 5 11.5v5.7H3V7.2Zm4 4.3c0-.8.7-1.5 1.5-1.5H21v8.8c0 .7-.6 1.2-1.2 1.2H8.5c-.8 0-1.5-.7-1.5-1.5v-7Zm10.3 3.5a1.2 1.2 0 1 0 0-2.4 1.2 1.2 0 0 0 0 2.4Z" />
      </svg>
    );
  }

  if (name === "history") {
    return (
      <svg className={commonClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M6 2.5h9l4 4V21H6V2.5Zm8 1.8v3.2h3.2L14 4.3ZM8.4 11h7.2v1.7H8.4V11Zm0 4h5.2v1.7H8.4V15Z" />
      </svg>
    );
  }

  if (name === "heart") {
    return (
      <svg className={commonClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 21.1 10.5 19.8C5.4 15.2 2 12.2 2 8.5 2 5.5 4.4 3.2 7.4 3.2c1.7 0 3.4.8 4.6 2.1a6 6 0 0 1 4.6-2.1c3 0 5.4 2.3 5.4 5.3 0 3.7-3.4 6.7-8.5 11.3L12 21.1Z" />
      </svg>
    );
  }

  if (name === "mic") {
    return (
      <svg className={commonClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 14.5a3 3 0 0 0 3-3V5.2a3 3 0 0 0-6 0v6.3a3 3 0 0 0 3 3Zm5.5-3a5.5 5.5 0 0 1-11 0H4.7a7.3 7.3 0 0 0 6.4 7.2V21h1.8v-2.3a7.3 7.3 0 0 0 6.4-7.2h-1.8Z" />
      </svg>
    );
  }

  if (name === "pen") {
    return (
      <svg className={commonClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="m4 16.7 9.9-9.9 3.3 3.3-9.9 9.9H4v-3.3Zm11.1-11.1 1.5-1.5c.6-.6 1.6-.6 2.2 0l1.1 1.1c.6.6.6 1.6 0 2.2l-1.5 1.5-3.3-3.3Z" />
      </svg>
    );
  }

  if (name === "gender") {
    return (
      <svg
        className={commonClass}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        viewBox="0 0 24 24"
      >
        <path d="M12 13.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Z" />
        <path d="M12 13.5V21M8.7 17.7h6.6M16 4.5h4v4M19.7 4.8l-4.1 4.1" />
      </svg>
    );
  }

  if (name === "birthday") {
    return (
      <svg
        className={commonClass}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        viewBox="0 0 24 24"
      >
        <path d="M4 10h16v10H4V10Z" />
        <path d="M7 10V7m5 3V7m5 3V7M4 14h16M8 18h8" />
      </svg>
    );
  }

  if (name === "city") {
    return (
      <svg className={commonClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2 3 6.8l9 4.8 9-4.8L12 2ZM3 9.1l8.2 4.4v8.2L3 17.3V9.1Zm18 0v8.2l-8.2 4.4v-8.2L21 9.1Z" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg className={commonClass} fill="currentColor" viewBox="0 0 24 24">
        <path d="M8 2.5h8c1 0 1.8.8 1.8 1.8v15.4c0 1-.8 1.8-1.8 1.8H8c-1 0-1.8-.8-1.8-1.8V4.3c0-1 .8-1.8 1.8-1.8Zm1.8 16h4.4V17H9.8v1.5Z" />
      </svg>
    );
  }

  return null;
}
