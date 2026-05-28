"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { setAuthData } from "@/helpers/token";
import {
  getMe,
  loginWithPassword,
  registerWithPassword,
} from "@/services/auth";

type AuthMode = "login" | "register";

type AuthModalProps = {
  isOpen: boolean;
  onAuthenticated?: () => void;
  onClose: () => void;
};

const formFields = {
  login: [
    {
      autoComplete: "username",
      icon: "user",
      name: "identifier",
      placeholder: "Nhập Tên Tài Khoản Của Bạn",
      type: "text",
    },
    {
      autoComplete: "current-password",
      icon: "lock",
      name: "password",
      placeholder: "Nhập Mật Khẩu Của Bạn",
      trailing: "eye",
      type: "password",
    },
  ],
  register: [
    {
      autoComplete: "username",
      icon: "user",
      name: "identifier",
      placeholder: "Nhập Tên Tài Khoản Của Bạn",
      type: "text",
    },
    {
      autoComplete: "tel",
      icon: "phone",
      name: "phone",
      placeholder: "Nhập Số Điện Thoại Đăng Ký",
      type: "tel",
    },
    {
      autoComplete: "new-password",
      icon: "lock",
      name: "password",
      placeholder: "Nhập Mật Khẩu Của Bạn",
      trailing: "eye",
      type: "password",
    },
    {
      autoComplete: "new-password",
      icon: "lock",
      name: "confirmPassword",
      placeholder: "Nhập Lại Mật Khẩu",
      trailing: "eye",
      type: "password",
    },
  ],
} satisfies Record<AuthMode, AuthFieldProps[]>;

export default function AuthModal({
  isOpen,
  onAuthenticated,
  onClose,
}: AuthModalProps) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [values, setValues] = useState<AuthFormValues>(getEmptyValues());
  const [captchaCode, setCaptchaCode] = useState(createCaptchaCode);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [toastMessage, setToastMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const toastTimeoutRef = useRef<number | null>(null);
  const [visiblePasswordFields, setVisiblePasswordFields] =
    useState<PasswordVisibilityState>(getHiddenPasswordFields());

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
      if (toastTimeoutRef.current) {
        window.clearTimeout(toastTimeoutRef.current);
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const isLogin = mode === "login";
  const isSubmitDisabled =
    isSubmitting ||
    !values.identifier.trim() ||
    !values.password ||
    !values.captcha.trim() ||
    (!isLogin &&
      (!values.phone.trim() ||
        !values.confirmPassword ||
        !acceptedTerms));

  function handleModeChange(nextMode: AuthMode) {
    setMode(nextMode);
    setValues(getEmptyValues());
    setAcceptedTerms(false);
    setError("");
    setMessage("");
    setToastMessage("");
    setIsSubmitting(false);
    setVisiblePasswordFields(getHiddenPasswordFields());
    setCaptchaCode(createCaptchaCode());
  }

  function updateField(name: AuthFieldName, value: string) {
    setValues((currentValues) => ({
      ...currentValues,
      [name]: value,
    }));
    setError("");
    setMessage("");
  }

  function showToast(nextMessage: string) {
    if (toastTimeoutRef.current) {
      window.clearTimeout(toastTimeoutRef.current);
    }

    setToastMessage(nextMessage);
    toastTimeoutRef.current = window.setTimeout(() => {
      setToastMessage("");
      toastTimeoutRef.current = null;
    }, 3000);
  }

  function togglePasswordVisibility(name: PasswordFieldName) {
    setVisiblePasswordFields((currentFields) => ({
      ...currentFields,
      [name]: !currentFields[name],
    }));
  }

  async function handleSubmit() {
    const validationError = validateAuthForm(mode, values, captchaCode, acceptedTerms);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError("");
    setMessage("");
    setIsSubmitting(true);

    try {
      const response = isLogin
        ? await loginWithPassword({
            password: values.password,
            username: values.identifier.trim(),
          })
        : await registerWithPassword({
            phone: values.phone.trim(),
            password: values.password,
            username: values.identifier.trim(),
          });

      if (isLogin) {
        setAuthData(response.accessToken, response.user);
        const currentUser = await getMe();
        setAuthData(response.accessToken, currentUser);
        showToast("Đăng nhập thành công");
        window.setTimeout(() => {
          onAuthenticated?.();
          onClose();
        }, 700);
        return;
      }

      setValues(getEmptyValues());
      setAcceptedTerms(false);
      setCaptchaCode(createCaptchaCode());
      setMode("login");
      setVisiblePasswordFields(getHiddenPasswordFields());
      showToast("Đăng ký thành công");
    } catch (submitError) {
      setCaptchaCode(createCaptchaCode());
      setValues((currentValues) => ({ ...currentValues, captcha: "" }));
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center overflow-y-auto bg-black/60 px-3 py-4 text-white backdrop-blur-[2px] sm:items-start sm:px-4 sm:pb-4 sm:pt-[89px]"
      role="presentation"
      onClick={onClose}
    >
      {toastMessage ? <AuthToast message={toastMessage} /> : null}
      <div
        className={`relative max-h-[calc(100dvh-32px)] w-full max-w-[420px] overflow-y-auto rounded-[4px] bg-[linear-gradient(180deg,#686868_0%,#060606_16%,#111111_76%,#3b3b3b_100%)] shadow-[0_22px_60px_rgba(0,0,0,.75)] sm:w-[571px] sm:max-w-full sm:overflow-hidden ${
          isLogin ? "sm:h-[703px]" : "sm:h-[785px]"
        }`}
        role="dialog"
        aria-modal="true"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          aria-label="Đóng"
          className="absolute right-[12px] top-[12px] z-10 flex h-[24px] w-[24px] cursor-pointer items-center justify-center rounded-full bg-[#ff8c13] text-[28px] font-light leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,.35)]"
          type="button"
          onClick={onClose}
        >
          ×
        </button>

        <div className="flex justify-center pt-[24px] sm:pt-[35px]">
          <Image
            src="/assets/logo.png"
            alt="OKwinTV"
            width={300}
            height={51}
            priority
            className="h-auto w-[210px] select-none sm:w-[300px]"
          />
        </div>

        <form
          className={`mx-auto w-[calc(100%-24px)] rounded-[14px] bg-[linear-gradient(180deg,#2f3032_0%,#090909_25%,#080808_72%,#242424_100%)] px-[10px] pb-[18px] shadow-[0_22px_35px_rgba(0,0,0,.32)] sm:w-[440px] sm:rounded-[18px] sm:pb-0 ${
            isLogin
              ? "mt-[18px] pt-[16px] sm:mt-[23px] sm:h-[554px] sm:pt-[22px]"
              : "mt-[18px] pt-[16px] sm:mt-[28px] sm:min-h-[624px] sm:pt-[22px]"
          }`}
          autoComplete="on"
          onSubmit={(event) => {
            event.preventDefault();
            handleSubmit();
          }}
        >
          <AuthTabs mode={mode} onChange={handleModeChange} />

          <div
            className={
              isLogin
                ? "mt-[14px] space-y-[9px] sm:mt-[16px] sm:space-y-[11px]"
                : "mt-[14px] space-y-[9px] sm:mt-[15px] sm:space-y-[11px]"
            }
          >
            {formFields[mode].map((field, index) => (
              <AuthField
                key={`${mode}-${index}`}
                {...field}
                isPasswordVisible={
                  isPasswordField(field.name)
                    ? visiblePasswordFields[field.name]
                    : false
                }
                value={values[field.name]}
                onChange={(value) => updateField(field.name, value)}
                onTogglePasswordVisibility={() => {
                  if (isPasswordField(field.name)) {
                    togglePasswordVisibility(field.name);
                  }
                }}
              />
            ))}
            <CaptchaField
              code={captchaCode}
              value={values.captcha}
              onChange={(value) => updateField("captcha", value)}
              onRefresh={() => {
                setCaptchaCode(createCaptchaCode());
                updateField("captcha", "");
              }}
            />
          </div>

          <button
            className="mt-[14px] h-[48px] w-full cursor-pointer rounded-[8px] bg-[linear-gradient(180deg,#ff880f_0%,#ff9f35_100%)] text-[18px] font-bold leading-none text-white shadow-[inset_0_1px_0_rgba(255,255,255,.28),0_4px_10px_rgba(255,132,19,.22)] disabled:cursor-not-allowed disabled:opacity-65 sm:mt-[16px] sm:h-[59px] sm:text-[22px]"
            disabled={isSubmitDisabled}
            type="submit"
          >
            {isSubmitting ? "Đang xử lý..." : isLogin ? "Đăng Nhập" : "Đăng ký"}
          </button>

          {error ? (
            <p className="mt-[10px] px-[2px] text-[12px] font-medium text-[#ff6868]">
              {error}
            </p>
          ) : null}
          {message ? (
            <p className="mt-[10px] px-[2px] text-[12px] font-medium text-[#3fd073]">
              {message}
            </p>
          ) : null}

          {isLogin ? (
            <LoginOptions />
          ) : (
            <RegisterAgreement
              checked={acceptedTerms}
              onChange={setAcceptedTerms}
            />
          )}

          <Divider />
          <GoogleButton />
        </form>
      </div>
    </div>
  );
}

function AuthToast({ message }: { message: string }) {
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[10000] rounded-[8px] border border-[#ff8c13] bg-[#202020] px-[18px] py-[12px] text-[14px] font-bold text-white shadow-[0_12px_30px_rgba(0,0,0,.45)] sm:bottom-6 sm:right-6">
      <span className="text-[#3fd073]">{message}</span>
    </div>
  );
}

function AuthTabs({
  mode,
  onChange,
}: {
  mode: AuthMode;
  onChange: (mode: AuthMode) => void;
}) {
  return (
    <div className="grid h-[48px] grid-cols-2 overflow-hidden rounded-[9px] border-2 border-[#ff8c13] bg-[#171717] sm:h-[60px]">
      <button
        className={`cursor-pointer text-[16px] font-bold leading-none sm:text-[21px] ${
          mode === "login"
            ? "bg-[linear-gradient(180deg,#ff8810_0%,#ff9d32_100%)] text-white"
            : "text-[#ff8c13]"
        }`}
        type="button"
        onClick={() => onChange("login")}
      >
        Đăng Nhập
      </button>
      <button
        className={`cursor-pointer text-[16px] font-bold leading-none sm:text-[21px] ${
          mode === "register"
            ? "bg-[linear-gradient(180deg,#ff8810_0%,#ff9d32_100%)] text-white"
            : "text-[#ff8c13]"
        }`}
        type="button"
        onClick={() => onChange("register")}
      >
        Đăng ký
      </button>
    </div>
  );
}

type AuthFieldProps = {
  autoComplete?: string;
  icon: "lock" | "phone" | "user";
  name: AuthFieldName;
  placeholder: string;
  trailing?: "eye" | "eye-off";
  type: string;
};

type AuthFieldName =
  | "captcha"
  | "confirmPassword"
  | "identifier"
  | "password"
  | "phone";

type AuthFormValues = Record<AuthFieldName, string>;
type PasswordFieldName = "confirmPassword" | "password";
type PasswordVisibilityState = Record<PasswordFieldName, boolean>;

function AuthField({
  autoComplete,
  icon,
  isPasswordVisible,
  name,
  onChange,
  onTogglePasswordVisibility,
  placeholder,
  trailing,
  type,
  value,
}: AuthFieldProps & {
  isPasswordVisible?: boolean;
  onChange: (value: string) => void;
  onTogglePasswordVisibility?: () => void;
  value: string;
}) {
  const inputType = type === "password" && isPasswordVisible ? "text" : type;

  return (
    <label className="flex h-[44px] cursor-text items-center rounded-[8px] border border-[#d9d9d9] bg-black/45 px-[10px] sm:h-[50px] sm:px-[13px]">
      <FieldIcon name={icon} />
      <input
        autoComplete={autoComplete}
        className="h-full min-w-0 flex-1 bg-transparent pl-[8px] text-[13px] font-normal text-white outline-none placeholder:text-[#d8d8d8] sm:pl-[10px] sm:text-[15px]"
        name={getAuthInputName(name)}
        placeholder={placeholder}
        type={inputType}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {trailing ? (
        <button
          aria-label={isPasswordVisible ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
          className="flex h-[30px] w-[30px] shrink-0 cursor-pointer items-center justify-center sm:h-[32px] sm:w-[32px]"
          type="button"
          onClick={onTogglePasswordVisibility}
        >
          <FieldIcon name={isPasswordVisible ? "eye-off" : "eye"} />
        </button>
      ) : null}
    </label>
  );
}

function CaptchaField({
  code,
  onChange,
  onRefresh,
  value,
}: {
  code: string;
  onChange: (value: string) => void;
  onRefresh: () => void;
  value: string;
}) {
  return (
    <div className="flex h-[44px] overflow-hidden rounded-[8px] border border-[#d9d9d9] bg-black/45 sm:h-[50px]">
      <input
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent px-[10px] text-[13px] font-normal text-white outline-none placeholder:text-[#d8d8d8] sm:px-[14px] sm:text-[15px]"
        name="okwin-captcha"
        placeholder="Mã CAPTCHA"
        type="text"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <div className="relative flex h-full w-[112px] select-none items-center justify-center overflow-hidden bg-[#f4ecf5] [--captcha-left:10px] [--captcha-step:19px] sm:w-[136px] sm:[--captcha-left:14px] sm:[--captcha-step:23px]">
        {code.split("").map((char, index) => (
          <span
            className={`absolute top-[4px] text-[35px] font-medium leading-none sm:top-[2px] sm:text-[43px] ${
              captchaColors[index % captchaColors.length]
            }`}
            key={`${char}-${index}`}
            style={{
              left: `calc(var(--captcha-left) + ${index} * var(--captcha-step))`,
            }}
          >
            {char}
          </span>
        ))}
        <span className="absolute left-[7px] top-[13px] h-[2px] w-[100px] rotate-[12deg] bg-[#ef7fa2] sm:top-[14px] sm:w-[126px]" />
        <span className="absolute left-[22px] top-[29px] h-[2px] w-[82px] rotate-[-8deg] bg-[#7bbfba] sm:left-[27px] sm:top-[31px] sm:w-[105px]" />
      </div>
      <button
        aria-label="Tải lại CAPTCHA"
        className="flex h-full w-[40px] cursor-pointer items-center justify-center bg-[#ff8c13] text-white sm:w-[45px]"
        type="button"
        onClick={onRefresh}
      >
        <RefreshIcon />
      </button>
    </div>
  );
}

function LoginOptions() {
  const [rememberAccount, setRememberAccount] = useState(false);

  return (
    <div className="mt-[12px] flex items-center justify-between gap-3 px-[2px] text-[11px] text-white sm:mt-[16px] sm:px-[10px] sm:text-[12px]">
      <label className="flex cursor-pointer items-center gap-[7px]">
        <input
          className="peer sr-only"
          checked={rememberAccount}
          type="checkbox"
          onChange={(event) => setRememberAccount(event.target.checked)}
        />
        <span className="flex h-[16px] w-[16px] shrink-0 items-center justify-center border border-white bg-transparent text-white peer-checked:border-[#ff8c13] peer-checked:bg-[#ff8c13]">
          {rememberAccount ? <CheckIcon /> : null}
        </span>
        <span>Lưu tài khoản</span>
      </label>
      <button
        className="cursor-pointer text-[12px] font-normal text-white underline underline-offset-2"
        type="button"
      >
        Quên mật khẩu
      </button>
    </div>
  );
}

function RegisterAgreement({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="mt-[12px] flex cursor-pointer items-start gap-[7px] px-[1px] text-[11px] leading-[16px] text-[#9b9b9b] sm:mt-[18px] sm:items-center sm:text-[13px] sm:leading-normal">
      <input
        className="peer sr-only"
        checked={checked}
        type="checkbox"
        onChange={(event) => onChange(event.target.checked)}
      />
      <span className="mt-[1px] flex h-[16px] w-[16px] shrink-0 items-center justify-center border border-white bg-transparent text-white peer-checked:border-[#ff8c13] peer-checked:bg-[#ff8c13] sm:mt-0">
        {checked ? <CheckIcon /> : null}
      </span>
      <span>
        Tôi đã đọc và đồng ý với tất cả{" "}
        <button
          className="cursor-pointer font-bold text-[#a7a7a7] underline underline-offset-2"
          type="button"
        >
          Điều Khoản Và Điều Kiện
        </button>
      </span>
    </label>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-[12px] w-[12px]"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="3"
      viewBox="0 0 24 24"
    >
      <path d="m5 12 4 4 10-10" />
    </svg>
  );
}

function Divider() {
  return (
    <div className="mt-[16px] flex items-center justify-center gap-[7px] sm:mt-[21px]">
      <span className="h-px flex-1 bg-[linear-gradient(90deg,transparent,#ff8c13)] sm:w-[160px] sm:flex-none" />
      <span className="text-[13px] font-normal leading-none text-[#ff8c13] sm:text-[15px]">
        Hoặc
      </span>
      <span className="h-px flex-1 bg-[linear-gradient(90deg,#ff8c13,transparent)] sm:w-[160px] sm:flex-none" />
    </div>
  );
}

function GoogleButton() {
  return (
    <button
      className="mt-[14px] flex h-[44px] w-full cursor-pointer items-center justify-center gap-[8px] rounded-[8px] border border-[#ff8c13] bg-[#202020] px-2 text-[13px] font-normal text-white sm:mt-[17px] sm:h-[51px] sm:gap-[10px] sm:text-[16px]"
      type="button"
    >
      <span>Đăng nhập nhanh bằng google</span>
      <Image
        src="/ic_google.svg"
        alt="Google"
        width={20}
        height={20}
        className="h-[20px] w-[20px] shrink-0"
      />
    </button>
  );
}

const captchaColors = [
  "text-[#31a936]",
  "text-[#287fc7]",
  "text-[#287fc7]",
  "text-[#b52758]",
  "text-[#b52758]",
];

function createCaptchaCode() {
  return String(Math.floor(10000 + Math.random() * 90000));
}

function getEmptyValues(): AuthFormValues {
  return {
    captcha: "",
    confirmPassword: "",
    identifier: "",
    password: "",
    phone: "",
  };
}

function getHiddenPasswordFields(): PasswordVisibilityState {
  return {
    confirmPassword: false,
    password: false,
  };
}

function isPasswordField(name: AuthFieldName): name is PasswordFieldName {
  return name === "password" || name === "confirmPassword";
}

function getAuthInputName(name: AuthFieldName) {
  if (name === "identifier") {
    return "username";
  }

  return name;
}

function validateAuthForm(
  mode: AuthMode,
  values: AuthFormValues,
  captchaCode: string,
  acceptedTerms: boolean,
) {
  if (!values.identifier.trim()) {
    return "Vui lòng nhập tên tài khoản";
  }

  if (!values.password) {
    return "Vui lòng nhập mật khẩu";
  }

  if (values.captcha.trim() !== captchaCode) {
    return "Mã CAPTCHA không chính xác";
  }

  if (mode === "login") {
    return "";
  }

  if (!values.phone.trim()) {
    return "Vui lòng nhập số điện thoại đăng ký";
  }

  if (values.identifier.trim().length < 3) {
    return "Tên tài khoản phải có ít nhất 3 ký tự";
  }

  if (values.password.length < 6) {
    return "Mật khẩu phải có ít nhất 6 ký tự";
  }

  if (values.password !== values.confirmPassword) {
    return "Mật khẩu nhập lại không khớp";
  }

  if (!acceptedTerms) {
    return "Vui lòng đồng ý với Điều Khoản Và Điều Kiện";
  }

  return "";
}

function getErrorMessage(error: unknown) {
  const maybeError = error as {
    response?: {
      data?: {
        detail?: { message?: string } | string;
        message?: string;
      };
    };
    message?: string;
  };

  const detail = maybeError.response?.data?.detail;
  if (typeof detail === "string") {
    return detail;
  }

  return (
    detail?.message ||
    maybeError.response?.data?.message ||
    maybeError.message ||
    "Không thể xử lý yêu cầu"
  );
}

function FieldIcon({
  name,
}: {
  name: AuthFieldProps["icon"] | NonNullable<AuthFieldProps["trailing"]>;
}) {
  if (name === "user") {
    return (
      <svg className="h-[22px] w-[22px] shrink-0 text-[#9e9e9e]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9Zm-8 8.2c0-4.1 3.6-7.2 8-7.2s8 3.1 8 7.2c0 .7-.5 1.3-1.2 1.3H5.2c-.7 0-1.2-.6-1.2-1.3Z" />
      </svg>
    );
  }

  if (name === "phone") {
    return (
      <svg className="h-[22px] w-[22px] shrink-0 text-[#9e9e9e]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M6.6 2.8c.5-.5 1.4-.5 1.9.1l2.2 2.6c.4.5.5 1.2.2 1.8L9.7 9.4c.9 1.8 2.5 3.4 4.5 4.6l2.2-1.2c.6-.3 1.3-.2 1.8.2l2.6 2.2c.6.5.6 1.4.1 1.9l-1.4 1.5c-1.1 1.2-2.9 1.5-4.5.8A22 22 0 0 1 4.6 9C3.9 7.4 4.2 5.6 5.4 4.5l1.2-1.7Z" />
      </svg>
    );
  }

  if (name === "lock") {
    return (
      <svg className="h-[22px] w-[22px] shrink-0 text-[#9e9e9e]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M7 10V8a5 5 0 0 1 10 0v2h.5A1.5 1.5 0 0 1 19 11.5v8a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5v-8A1.5 1.5 0 0 1 6.5 10H7Zm2 0h6V8a3 3 0 0 0-6 0v2Zm4 4.7a1.5 1.5 0 1 0-2 1.4V18h2v-1.9c.6-.3 1-.8 1-1.4Z" />
      </svg>
    );
  }

  if (name === "eye-off") {
    return (
      <svg className="h-[22px] w-[22px] shrink-0 text-[#9e9e9e]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" viewBox="0 0 24 24">
        <path d="m3 3 18 18" />
        <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
        <path d="M9.5 5.3A9.8 9.8 0 0 1 12 5c5 0 8.6 4.5 9.7 6a1.8 1.8 0 0 1 0 2c-.4.6-1.2 1.6-2.4 2.6" />
        <path d="M6.6 6.7A16.5 16.5 0 0 0 2.3 11a1.8 1.8 0 0 0 0 2C3.4 14.5 7 19 12 19c1.5 0 2.8-.4 4-1" />
      </svg>
    );
  }

  return (
    <svg className="h-[22px] w-[22px] shrink-0 text-[#9e9e9e]" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 5c5.1 0 8.7 4.7 9.7 6.2.3.5.3 1.1 0 1.6C20.7 14.3 17.1 19 12 19s-8.7-4.7-9.7-6.2a1.5 1.5 0 0 1 0-1.6C3.3 9.7 6.9 5 12 5Zm0 10.2A3.2 3.2 0 1 0 12 8.8a3.2 3.2 0 0 0 0 6.4Z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-[26px] w-[26px]" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" viewBox="0 0 24 24">
      <path d="M20 12a8 8 0 1 1-2.3-5.7" />
      <path d="M20 4v5h-5" />
    </svg>
  );
}
