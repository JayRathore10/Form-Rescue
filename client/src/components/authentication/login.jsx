import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { signin, signup } from "../../services/auth";

function Login({ onLogin }) {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("login");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [formMessage, setFormMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const switchTab = (tab) => {
    setActiveTab(tab);
    setFormMessage("");
  };

  // ---------------------------------------
  // LOGIN API
  // ---------------------------------------
  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormMessage("");

    if (!email.trim() || !password) {
      setFormMessage("Email and password are required.");
      return;
    }

    if (password.length < 6) {
      setFormMessage("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const response = await signin({
        email: email.trim(),
        password,
      });

      console.log("Login successful:", response);

      // Send backend response to parent
      onLogin?.(response);

      // Redirect to home page after successful login
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Login failed:", error);

      setFormMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Login failed. Please check your email and password."
      );
    } finally {
      setLoading(false);
    }
  };

  // ---------------------------------------
  // SIGNUP API
  // ---------------------------------------
  const handleSignup = async (event) => {
    event.preventDefault();
    setFormMessage("");

    const emailInput = event.currentTarget.elements["signup-email"];

    if (
      !name.trim() ||
      !email.trim() ||
      !password ||
      !confirmPassword
    ) {
      setFormMessage("Please complete all fields.");
      return;
    }

    if (!emailInput?.validity.valid) {
      setFormMessage("Enter a valid email address.");
      return;
    }

    if (password.length < 6) {
      setFormMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setFormMessage("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await signup({
        name: name.trim(),
        email: email.trim(),
        password,
      });

      console.log("Signup successful:", response);

      // Send backend response to parent
      onLogin?.(response);

      // Redirect to home page after successful signup
      navigate("/", { replace: true });
    } catch (error) {
      console.error("Signup failed:", error);

      setFormMessage(
        error?.response?.data?.message ||
          error?.message ||
          "Signup failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full flex-col overflow-x-hidden bg-[#0d0d2c] text-white leading-[normal]">
      <main
        className="
          relative
          flex
          min-h-screen
          w-full
          flex-1
          flex-col
          overflow-hidden
          bg-[#0d0d2c]
        "
      >
        {/* RIGHT DECORATION */}
        <div
          className="
            pointer-events-none
            absolute
            top-[-170px]
            right-[55px]
            z-0
            h-[780px]
            w-[300px]
            rotate-[39deg]
            rounded-[34px]
            bg-[#252653]
            opacity-90
            after:absolute
            after:inset-0
            after:rounded-[inherit]
            after:bg-[rgba(81,75,180,0.12)]
            after:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.015)]
            max-[900px]:right-[-70px]
            max-[600px]:top-[-100px]
            max-[600px]:right-[-180px]
            max-[600px]:opacity-[0.55]
          "
        />

        {/* NAVBAR */}
        <nav
          className="
            relative
            z-[5]
            flex
            h-[68px]
            w-full
            items-center
            justify-between
            px-7
            max-[600px]:px-[17px]
            max-[430px]:h-[62px]
          "
        >
          <div className="flex items-center gap-9 max-[600px]:gap-[18px]">
            <div
              className="
                text-[23px]
                font-extrabold
                tracking-[-1.5px]
                max-[600px]:text-[20px]
              "
            >
              formrescue
              <sup className="relative top-[-8px] ml-0.5 text-[6px]">
                ™
              </sup>
            </div>

            <button
              type="button"
              className="
                cursor-pointer
                border-0
                bg-transparent
                px-[6px]
                py-[2px]
                !text-[14px]
                !font-semibold
                text-[#b9b6d0]
                hover:text-white
                max-[600px]:hidden
              "
            >
              How it works
            </button>
          </div>

          <div className="flex items-center gap-[9px] max-[430px]:gap-[5px]">
            <button
              type="button"
              className="
                h-[39px]
                cursor-pointer
                rounded-[7px]
                border-0
                bg-[#30305c]
                px-[17px]
                !text-[13px]
                !font-bold
                text-white
                transition-[transform,background]
                duration-[180ms]
                ease-[ease]
                hover:translate-y-[-1px]
                hover:bg-[#3b3a6c]
                max-[600px]:h-9
                max-[600px]:px-3
                max-[600px]:!text-xs
                max-[430px]:px-[10px]
              "
              onClick={() => switchTab("login")}
            >
              Log in
            </button>

            <button
              type="button"
              className="
                h-[39px]
                cursor-pointer
                rounded-[7px]
                border-0
                bg-white
                px-[17px]
                !text-[13px]
                !font-bold
                text-[#1b1a35]
                transition-[transform,background]
                duration-[180ms]
                ease-[ease]
                hover:translate-y-[-1px]
                hover:bg-[#f0efff]
                max-[600px]:h-9
                max-[600px]:px-3
                max-[600px]:!text-xs
                max-[430px]:px-[10px]
              "
              onClick={() => switchTab("signup")}
            >
              Sign up
            </button>
          </div>
        </nav>

        {/* CENTER */}
        <section
          className="
            relative
            z-[2]
            flex
            flex-1
            flex-col
            items-center
            justify-center
            px-0
            py-6
            max-[600px]:px-5
            max-[600px]:py-6
          "
        >
          <div
            className="
              mb-[26px]
              flex
              items-start
              text-[43px]
              font-extrabold
              leading-none
              tracking-[-2.8px]
              max-[600px]:text-[36px]
              max-[430px]:mb-[22px]
              max-[430px]:text-[32px]
            "
          >
            formrescue
            <sup
              className="
                relative
                top-[-4px]
                ml-[3px]
                text-[8px]
                tracking-normal
              "
            >
              ™
            </sup>
          </div>

          {/* AUTH CARD */}
          <div
            className="
              w-[388px]
              rounded-[13px]
              bg-[#29284f]
              px-6
              pt-7
              pb-[25px]
              shadow-[0_20px_50px_rgba(0,0,0,0.14)]
              max-[600px]:w-full
              max-[600px]:max-w-[388px]
              max-[430px]:px-[19px]
              max-[430px]:pt-[23px]
              max-[430px]:pb-[22px]
            "
          >
            {/* TABS */}
            <div className="mb-[22px] flex w-full border-b border-white/[0.09]">
              <button
                type="button"
                className={`relative h-[42px] flex-1 cursor-pointer border-0 bg-transparent text-[14px] hover:text-white ${
                  activeTab === "login"
                    ? "!font-bold text-white"
                    : "!font-medium text-[#9e9bb9]"
                }`}
                onClick={() => switchTab("login")}
              >
                Log in

                <span
                  className={`absolute right-0 bottom-[-1px] left-0 h-0.5 bg-white ${
                    activeTab === "login" ? "" : "hidden"
                  }`}
                />
              </button>

              <button
                type="button"
                className={`relative h-[42px] flex-1 cursor-pointer border-0 bg-transparent !text-[14px] hover:text-white ${
                  activeTab === "signup"
                    ? "!font-bold text-white"
                    : "!font-medium text-[#9e9bb9]"
                }`}
                onClick={() => switchTab("signup")}
              >
                Sign up

                <span
                  className={`absolute right-0 bottom-[-1px] left-0 h-0.5 bg-white ${
                    activeTab === "signup" ? "" : "hidden"
                  }`}
                />
              </button>
            </div>

            {/* MESSAGE */}
            {formMessage && (
              <div
                className="
                  mb-4
                  rounded-lg
                  border
                  border-red-400/30
                  bg-red-500/10
                  p-3
                  text-center
                  text-xs
                  text-red-300
                "
                role="alert"
              >
                {formMessage}
              </div>
            )}

            {/* LOGIN */}
            {activeTab === "login" ? (
              <form
                className="flex flex-col gap-[15px]"
                onSubmit={handleSubmit}
              >
                {/* EMAIL */}
                <div className="flex flex-col gap-[7px]">
                  <label
                    htmlFor="email"
                    className="text-[13px] font-medium text-[#bbb9cf]"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="you@example.com"
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border
                      border-transparent
                      bg-[#49486f]
                      px-[13px]
                      !text-[14px]
                      text-white
                      outline-none
                      transition-[border,box-shadow,background]
                      duration-200
                      placeholder:text-[#9290a7]
                      focus:border-[#9189e9]
                      focus:bg-[#4d4c75]
                      focus:shadow-[0_0_0_3px_rgba(145,137,233,0.12)]
                    "
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setFormMessage("");
                    }}
                  />
                </div>

                {/* PASSWORD */}
                <div className="flex flex-col gap-[7px]">
                  <label
                    htmlFor="password"
                    className="text-[13px] font-medium text-[#bbb9cf]"
                  >
                    Password
                  </label>

                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="At least 6 characters"
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border
                      border-transparent
                      bg-[#49486f]
                      px-[13px]
                      !text-[14px]
                      text-white
                      outline-none
                      transition-[border,box-shadow,background]
                      duration-200
                      placeholder:text-[#9290a7]
                      focus:border-[#9189e9]
                      focus:bg-[#4d4c75]
                      focus:shadow-[0_0_0_3px_rgba(145,137,233,0.12)]
                    "
                    minLength={6}
                    required
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFormMessage("");
                    }}
                  />
                </div>

                {/* LOGIN BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    mt-[5px]
                    h-[45px]
                    w-full
                    cursor-pointer
                    rounded-[7px]
                    border-0
                    bg-white
                    !text-[14px]
                    !font-bold
                    text-[#18172d]
                    transition-[transform,background]
                    duration-[180ms]
                    ease-[ease]
                    hover:translate-y-[-1px]
                    hover:bg-[#f0efff]
                    active:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {loading ? "Logging in..." : "Log in"}
                </button>

                <button
                  type="button"
                  className="
                    mt-6
                    cursor-pointer
                    self-center
                    border-0
                    bg-transparent
                    p-0
                    !text-[13px]
                    text-[#aaa7bd]
                    underline
                    hover:text-white
                  "
                >
                  Forgot your password?
                </button>
              </form>
            ) : (
              /* SIGN UP */
              <form
                className="flex flex-col gap-[15px]"
                onSubmit={handleSignup}
                noValidate
              >
                {/* NAME */}
                <div className="flex flex-col gap-[7px]">
                  <label
                    htmlFor="signup-name"
                    className="text-[13px] font-medium text-[#bbb9cf]"
                  >
                    Full name
                  </label>

                  <input
                    id="signup-name"
                    name="signup-name"
                    type="text"
                    placeholder="John Doe"
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border
                      border-transparent
                      bg-[#49486f]
                      px-[13px]
                      !text-[14px]
                      text-white
                      outline-none
                      transition-[border,box-shadow,background]
                      duration-200
                      placeholder:text-[#9290a7]
                      focus:border-[#9189e9]
                      focus:bg-[#4d4c75]
                      focus:shadow-[0_0_0_3px_rgba(145,137,233,0.12)]
                    "
                    required
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setFormMessage("");
                    }}
                  />
                </div>

                {/* EMAIL */}
                <div className="flex flex-col gap-[7px]">
                  <label
                    htmlFor="signup-email"
                    className="text-[13px] font-medium text-[#bbb9cf]"
                  >
                    Email address
                  </label>

                  <input
                    id="signup-email"
                    name="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border
                      border-transparent
                      bg-[#49486f]
                      px-[13px]
                      !text-[14px]
                      text-white
                      outline-none
                      transition-[border,box-shadow,background]
                      duration-200
                      placeholder:text-[#9290a7]
                      focus:border-[#9189e9]
                      focus:bg-[#4d4c75]
                      focus:shadow-[0_0_0_3px_rgba(145,137,233,0.12)]
                    "
                    required
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setFormMessage("");
                    }}
                  />
                </div>

                {/* PASSWORD */}
                <div className="flex flex-col gap-[7px]">
                  <label
                    htmlFor="signup-password"
                    className="text-[13px] font-medium text-[#bbb9cf]"
                  >
                    Password
                  </label>

                  <input
                    id="signup-password"
                    name="signup-password"
                    type="password"
                    placeholder="At least 6 characters"
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border
                      border-transparent
                      bg-[#49486f]
                      px-[13px]
                      !text-[14px]
                      text-white
                      outline-none
                      transition-[border,box-shadow,background]
                      duration-200
                      placeholder:text-[#9290a7]
                      focus:border-[#9189e9]
                      focus:bg-[#4d4c75]
                      focus:shadow-[0_0_0_3px_rgba(145,137,233,0.12)]
                    "
                    minLength={6}
                    required
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setFormMessage("");
                    }}
                  />
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="flex flex-col gap-[7px]">
                  <label
                    htmlFor="confirm-password"
                    className="text-[13px] font-medium text-[#bbb9cf]"
                  >
                    Confirm password
                  </label>

                  <input
                    id="confirm-password"
                    name="confirm-password"
                    type="password"
                    placeholder="Re-enter your password"
                    className="
                      h-12
                      w-full
                      rounded-lg
                      border
                      border-transparent
                      bg-[#49486f]
                      px-[13px]
                      !text-[14px]
                      text-white
                      outline-none
                      transition-[border,box-shadow,background]
                      duration-200
                      placeholder:text-[#9290a7]
                      focus:border-[#9189e9]
                      focus:bg-[#4d4c75]
                      focus:shadow-[0_0_0_3px_rgba(145,137,233,0.12)]
                    "
                    required
                    value={confirmPassword}
                    onChange={(event) => {
                      setConfirmPassword(event.target.value);
                      setFormMessage("");
                    }}
                  />
                </div>

                {/* SIGNUP BUTTON */}
                <button
                  type="submit"
                  disabled={loading}
                  className="
                    mt-[5px]
                    h-[45px]
                    w-full
                    cursor-pointer
                    rounded-[7px]
                    border-0
                    bg-white
                    !text-[14px]
                    !font-bold
                    text-[#18172d]
                    transition-[transform,background]
                    duration-[180ms]
                    ease-[ease]
                    hover:translate-y-[-1px]
                    hover:bg-[#f0efff]
                    active:translate-y-0
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {loading ? "Creating account..." : "Sign up"}
                </button>
              </form>
            )}
          </div>

          <p className="my-[18px] mb-10 text-center text-xs text-[#aaa7c0]">
            {activeTab === "login"
              ? "Sign in to save and manage your forms."
              : "Create an account to save your forms."}
          </p>
        </section>
      </main>
    </div>
  );
}

export default Login;