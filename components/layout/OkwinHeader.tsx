"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, useSyncExternalStore } from "react";
import AuthModal from "@/components/auth/AuthModal";
import {
  AuthLocalData,
  clearAuthData,
  getAuthLocalData,
  tokenChecker,
} from "@/helpers/token";
import { getProfileInitial } from "@/helpers/string";
import type { User } from "@/models/types";
import HomeSidebar from "@/modules/homes/components/HomeSidebar";
import { logout } from "@/services/auth";
import { emptyHomeAssets, getAssetImageUrl, getHomeAssets } from "@/services/homeAssets";
import { defaultLiveRoomSettings, getLiveRoomSettings } from "@/services/liveRoomSettings";
import OkwinLogo from "./OkwinLogo";

const authSubscribe = (onStoreChange: () => void) => {
  window.addEventListener("storage", onStoreChange);
  window.addEventListener("auth:changed", onStoreChange);

  return () => {
    window.removeEventListener("storage", onStoreChange);
    window.removeEventListener("auth:changed", onStoreChange);
  };
};

const getAuthSnapshot = () => {
  const authData = getAuthLocalData();

  return tokenChecker(authData) ? JSON.stringify(authData) : "";
};
const getServerAuthSnapshot = () => "";

export default function OkwinHeader() {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [headerPromoImageUrl, setHeaderPromoImageUrl] = useState(
    emptyHomeAssets.headerPromoImageUrl,
  );
  const [customerSupportUrl, setCustomerSupportUrl] = useState(
    defaultLiveRoomSettings.customerSupportUrl,
  );
  const authSnapshot = useSyncExternalStore(
    authSubscribe,
    getAuthSnapshot,
    getServerAuthSnapshot,
  );
  const authData = parseAuthSnapshot(authSnapshot);
  const isAuthenticated = Boolean(authData?.token);

  useEffect(() => {
    let isActive = true;

    async function loadHeaderData() {
      try {
        const [homeAssets, liveRoomSettings] = await Promise.all([
          getHomeAssets(),
          getLiveRoomSettings(),
        ]);

        if (!isActive) {
          return;
        }

        setHeaderPromoImageUrl(homeAssets.headerPromoImageUrl);
        setCustomerSupportUrl(liveRoomSettings.customerSupportUrl);
      } catch (error) {
        console.error("header client request failed", error);
      }
    }

    void loadHeaderData();

    return () => {
      isActive = false;
    };
  }, []);

  return (
    <>
      <header className="fixed left-0 top-0 z-50 h-[50px] w-full bg-[linear-gradient(0deg,#353535_0%,#585858_100%)] shadow-[0_2px_16px_rgba(0,0,0,.55)] sm:h-[60px] sm:bg-gradient-to-b sm:from-[#4b4b4b] sm:to-[#171717]">
        <div className="mx-auto flex h-full max-w-[1920px] items-center justify-between gap-2 px-2 sm:grid sm:grid-cols-[minmax(0,1fr)_auto] sm:gap-3 sm:px-5 2xl:grid-cols-[250px_minmax(0,1fr)] 2xl:px-0">
          <div className="flex min-w-0 items-center gap-2 sm:gap-[17px] 2xl:px-4">
            <button
              aria-label={"M\u1edf menu"}
              className="flex h-8 w-6 cursor-pointer items-center justify-center text-[28px] font-bold leading-none text-[#f68c1f] 2xl:hidden"
              type="button"
              onClick={() => setIsNavOpen((value) => !value)}
            >
              &#9776;
            </button>
            <span className="inline-flex sm:hidden">
              <OkwinLogo compact />
            </span>
            <span className="hidden sm:inline-flex">
              <OkwinLogo />
            </span>
          </div>
          <div className="hidden min-w-0 items-center justify-between gap-3 sm:flex 2xl:px-5">
            <Image
              src={
                getAssetImageUrl(headerPromoImageUrl) ||
                "/assets/header_qc.png"
              }
              alt=""
              width={280}
              height={40}
              priority
              className="hidden h-10 w-[280px] select-none object-contain 2xl:block"
            />
            <div
              className={`flex shrink-0 items-center text-[13px] font-bold sm:text-[16px] ${
                isAuthenticated ? "gap-3 sm:gap-[24px]" : "gap-[8px]"
              }`}
            >
              {isAuthenticated ? (
                <LoggedInActions user={authData?.user as User | undefined} />
              ) : (
                <button
                  className="h-[36px] cursor-pointer rounded-[5px] border border-[#ff8c13] bg-[#2c2c2c] px-2 text-[#ff8c13] shadow-[inset_0_0_0_1px_rgba(255,255,255,.08)] sm:px-[13px]"
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                >
                  Đăng Nhập/ Đăng Ký
                </button>
              )}
              <button
                className="hidden h-[36px] cursor-pointer items-center gap-[6px] rounded-[5px] bg-[#ff8c13] px-[13px] text-white shadow-[inset_0_1px_0_rgba(255,255,255,.28)] sm:flex"
                type="button"
              >
                <span className="text-[18px] leading-none">⬇</span>
                Tải APP
              </button>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:hidden">
            {!isAuthenticated ? (
              <>
                <button
                  className="h-[26px] rounded-[4px] border border-[#f68c1f] bg-[#343434] px-2 text-[10px] font-bold text-[#f68c1f]"
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                >
                  Đăng Nhập
                </button>
                <button
                  className="h-[26px] rounded-[4px] bg-[#f68c1f] px-2 text-[10px] font-bold text-white"
                  type="button"
                  onClick={() => setIsAuthOpen(true)}
                >
                  Đăng Ký
                </button>
              </>
            ) : (
              <MobileLoggedInActions
                user={authData?.user as User | undefined}
              />
            )}
          </div>
        </div>
      </header>
      <ResponsiveNavDrawer
        customerSupportUrl={customerSupportUrl}
        isOpen={isNavOpen}
        onClose={() => setIsNavOpen(false)}
      />
      {isAuthOpen ? (
        <AuthModal
          isOpen={isAuthOpen}
          onAuthenticated={() => setIsAuthOpen(false)}
          onClose={() => setIsAuthOpen(false)}
        />
      ) : null}
    </>
  );
}

function LoggedInActions({ user }: { user?: User }) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLogoutConfirmOpen, setIsLogoutConfirmOpen] = useState(false);
  const displayName =
    user?.name || user?.username || user?.email || user?.phone || "Tài khoản";
  const avatarUrl = getHeaderAvatarUrl(user);
  const fallbackInitial = getProfileInitial(displayName);
  const userId = user?.id ? user.id.slice(-6).toUpperCase() : "999999";

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
      <div className="flex h-[58px] items-center gap-[24px]">
        <div className="group relative flex h-[58px] items-center">
          <button
            aria-label={displayName}
            className="relative flex h-[39px] w-[39px] cursor-pointer items-center justify-center overflow-hidden rounded-full border border-[#ff8c13] bg-[#232323] text-[16px] font-bold leading-none text-[#ff8c13]"
            title={displayName}
            type="button"
            onClick={() => router.push("/profile")}
          >
            {avatarUrl ? (
              <span
                className="block h-full w-full bg-cover bg-center"
                style={{ backgroundImage: `url(${avatarUrl})` }}
              />
            ) : (
              fallbackInitial
            )}
          </button>
          <HeaderAccountPopover
            avatarUrl={avatarUrl}
            displayName={displayName}
            fallbackInitial={fallbackInitial}
            userId={userId}
            onLogout={() => setIsLogoutConfirmOpen(true)}
            onProfile={() => router.push("/profile")}
          />
        </div>

        <button
          aria-label="Thông báo"
          className="relative flex h-[39px] w-[31px] cursor-pointer items-center justify-center text-white"
          type="button"
        >
          <BellIcon />
          <span className="absolute right-[-4px] top-[1px] flex h-[13px] min-w-[13px] items-center justify-center rounded-full bg-[#ff8c13] px-[3px] text-[9px] font-bold leading-none text-white">
            6
          </span>
        </button>

        <button
          className="flex h-[44px] w-[50px] cursor-pointer flex-col items-center justify-center gap-[1px] text-white"
          type="button"
        >
          <HeartIcon />
          <span className="text-[12px] font-bold leading-none">Theo dõi</span>
        </button>
      </div>
      {isLogoutConfirmOpen ? (
        <HeaderLogoutConfirmModal
          isLoggingOut={isLoggingOut}
          onCancel={() => setIsLogoutConfirmOpen(false)}
          onConfirm={confirmLogout}
        />
      ) : null}
    </>
  );
}

function HeaderAccountPopover({
  avatarUrl,
  displayName,
  fallbackInitial,
  onLogout,
  onProfile,
  userId,
}: {
  avatarUrl?: string;
  displayName: string;
  fallbackInitial: string;
  onLogout: () => void;
  onProfile: () => void;
  userId: string;
}) {
  return (
    <div className="pointer-events-none absolute hidden right-[-40px] top-[75px] z-[80] w-[370px] h-[206px] pt-[11px] opacity-0 transition duration-150 group-hover:pointer-events-auto group-hover:block group-hover:opacity-100">
      <svg
        aria-hidden="true"
        className="absolute left-[261px] top-[-18px] z-[2] h-[39px] w-[92px]"
        viewBox="0 0 92 39"
      >
        <path
          d="M1 30H18C24 30 27 25 31 20L43 7C47 3 51 3 55 7L67 20C71 25 74 30 80 30H91V39H1Z"
          fill="#2b2b2b"
        />
        <path
          d="M1 30H18C24 30 27 25 31 20L43 7C47 3 51 3 55 7L67 20C71 25 74 30 80 30H91"
          fill="none"
          stroke="#ffffff"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
        />
      </svg>
      <div className="relative overflow-hidden rounded-[14px] border-2 border-white bg-[#2b2b2b] px-[14px] py-[18px] text-white shadow-[0_12px_28px_rgba(0,0,0,.48)]">
        <div className="flex h-[25px] items-start justify-between gap-[12px]">
          <h3 className="max-w-[220px] truncate text-[20px] font-normal uppercase leading-[25px] text-[#ff8c13]">
            {displayName}
          </h3>
          <span className="mt-[1px] shrink-0 text-[15px] font-normal leading-[22px] text-white/85">
            ID : {userId}
          </span>
        </div>
        <div className="mt-[5px] grid grid-cols-[124px_minmax(0,1fr)] gap-[11px]">
          <div className="flex flex-col items-center">
            <div className="relative h-[108px] w-[108px] overflow-hidden rounded-full border-2 border-[#ff8c13] bg-[#232323] text-[42px] font-bold leading-none text-[#ff8c13]">
              {avatarUrl ? (
                <span
                  aria-label={displayName}
                  className="block h-full w-full bg-cover bg-center"
                  style={{ backgroundImage: `url(${avatarUrl})` }}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center">
                  {fallbackInitial}
                </span>
              )}
            </div>
            <span className="relative z-[1] mt-[-12px] flex h-[25px] min-w-[53px] items-center justify-center rounded-full bg-[#ff8c13] px-[9px] text-[13px] font-bold leading-none text-white shadow-[0_2px_8px_rgba(0,0,0,.35)]">
              &#9819; 89
            </span>
          </div>
          <div className="min-w-0">
            <button
              className="flex h-11 w-[206px] items-center justify-center gap-[7px] rounded-bl-[8px] rounded-tr-[8px] bg-[#ff8c13] px-[12px] text-[20px] font-normal leading-none text-white"
              type="button"
            >
              <Image
                src="/assets/profile/ic_plus.svg"
                alt=""
                width={26}
                height={26}
                className="h-[26px] w-[26px]"
              />
              Nạp kim cương
            </button>
            <div className="mt-[8px] flex flex-row justify-between text-[14px] font-normal leading-[19px]">
              <div className="w-[103px]">
                <p className="flex items-center gap-[4px] truncate text-white/80">
                  <Image
                    src="/assets/profile/ic_kimcuong.svg"
                    alt=""
                    width={23}
                    height={23}
                    className="h-[23px] w-[23px] shrink-0"
                  />
                  <span>Kim cương:</span>
                </p>
                <p className="pl-[27px] text-[17px] leading-[18px] text-[#ff4dff]">
                  0
                </p>
              </div>
              <div className="w-[89px]">
                <p className="flex items-center gap-[4px] truncate text-white/80">
                  <Image
                    src="/assets/profile/ic_coint.svg"
                    alt=""
                    width={24}
                    height={24}
                    className="h-[24px] w-[24px] shrink-0"
                  />
                  <span>Win coin:</span>
                </p>
                <p className="pl-[28px] text-[17px] leading-[18px] text-[#ff8c13]">
                  0
                </p>
              </div>
            </div>
            <div className="mt-[7px] flex flex-row justify-between">
              <button
                className="h-[30px] w-[103px] cursor-pointer rounded-[3px] bg-[#ff8c13] text-[14px] font-normal whitespace-nowrap text-white"
                type="button"
                onClick={onProfile}
              >
                Trang cá nhân
              </button>
              <button
                className="h-[30px] w-[89px] cursor-pointer rounded-[3px] bg-[#6a6a6a] text-[14px] font-normal whitespace-nowrap text-white"
                type="button"
                onClick={onLogout}
              >
                Đăng xuất
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HeaderLogoutConfirmModal({
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
        aria-labelledby="header-logout-confirm-title"
        onClick={(event) => event.stopPropagation()}
      >
        <h2
          id="header-logout-confirm-title"
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

function MobileLoggedInActions({ user }: { user?: User }) {
  const router = useRouter();
  const displayName =
    user?.name || user?.username || user?.email || user?.phone || "Tài khoản";
  const avatarUrl = getHeaderAvatarUrl(user);
  const fallbackInitial = getProfileInitial(displayName);

  return (
    <div className="flex h-[50px] shrink-0 items-center gap-[9px]">
      <button
        aria-label="Chế độ hiển thị"
        className="flex h-[24px] w-[48px] items-center overflow-hidden rounded-[5px] bg-[#222] shadow-[inset_0_0_0_1px_rgba(255,255,255,.06)]"
        type="button"
      >
        <span className="flex h-full w-1/2 items-center justify-center text-white/90">
          <SunIcon />
        </span>
        <span className="flex h-full w-1/2 items-center justify-center rounded-[5px] bg-[#ff8c13] text-white">
          <MoonIcon />
        </span>
      </button>

      <button
        aria-label="Thông báo"
        className="relative flex h-[31px] w-[25px] items-center justify-center text-white"
        type="button"
      >
        <BellIcon className="h-[25px] w-[25px]" />
        <span className="absolute right-[-2px] top-[0px] flex h-[13px] min-w-[13px] items-center justify-center rounded-full bg-[#ff8c13] px-[3px] text-[9px] font-bold leading-none text-white">
          6
        </span>
      </button>

      <button
        aria-label={displayName}
        className="relative flex h-[31px] w-[31px] items-center justify-center overflow-hidden rounded-full border border-[#ff8c13] bg-[#232323] text-[13px] font-bold leading-none text-[#ff8c13]"
        title={displayName}
        type="button"
        onClick={() => router.push("/profile")}
      >
        {avatarUrl ? (
          <span
            className="block h-full w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${avatarUrl})` }}
          />
        ) : (
          fallbackInitial
        )}
      </button>
    </div>
  );
}

function getHeaderAvatarUrl(user?: User) {
  const avatarUrl = user?.avatarUrl || user?.avatar || user?.photoUrl;

  return getAssetImageUrl(avatarUrl) || avatarUrl;
}

function ResponsiveNavDrawer({
  customerSupportUrl,
  isOpen,
  onClose,
}: {
  customerSupportUrl?: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={`fixed inset-x-0 bottom-0 top-[50px] z-40 transition sm:top-[60px] 2xl:hidden ${
        isOpen ? "pointer-events-auto" : "pointer-events-none"
      }`}
      aria-hidden={!isOpen}
    >
      <button
        aria-label={"Đóng menu"}
        className={`absolute inset-0 bg-black/60 transition-opacity ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        type="button"
        onClick={onClose}
      />
      <div
        className={`absolute left-0 top-0 h-full w-[250px] max-w-[86vw] touch-pan-y overflow-hidden shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <HomeSidebar
          customerSupportUrl={customerSupportUrl}
          variant="drawer"
          onNavigate={onClose}
        />
      </div>
    </div>
  );
}

function parseAuthSnapshot(snapshot: string) {
  if (!snapshot) {
    return null;
  }

  try {
    return JSON.parse(snapshot) as AuthLocalData;
  } catch {
    return null;
  }
}

function BellIcon({ className = "h-[31px] w-[31px]" }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 22a2.7 2.7 0 0 0 2.6-2H9.4A2.7 2.7 0 0 0 12 22Zm7-6.2V11a7 7 0 0 0-5-6.7V3.5a2 2 0 0 0-4 0v.8A7 7 0 0 0 5 11v4.8L3.4 18c-.5.7 0 1.7.9 1.7h15.4c.9 0 1.4-1 .9-1.7L19 15.8Z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg className="h-[15px] w-[15px]" fill="none" viewBox="0 0 24 24">
      <path
        d="M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6ZM12 2v2.2M12 19.8V22M4.9 4.9l1.6 1.6M17.5 17.5l1.6 1.6M2 12h2.2M19.8 12H22M4.9 19.1l1.6-1.6M17.5 6.5l1.6-1.6"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="2"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="h-[15px] w-[15px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.2 14.7A8.1 8.1 0 0 1 9.3 3.8a.8.8 0 0 0-.8-1.2A9.8 9.8 0 1 0 21.4 15.5a.8.8 0 0 0-1.2-.8Z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg className="h-[26px] w-[31px]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 21.4 10.6 20C5.4 15.3 2 12.2 2 8.4 2 5.3 4.4 3 7.5 3c1.7 0 3.4.8 4.5 2.1A5.9 5.9 0 0 1 16.5 3C19.6 3 22 5.3 22 8.4c0 3.8-3.4 6.9-8.6 11.6L12 21.4Z" />
    </svg>
  );
}
