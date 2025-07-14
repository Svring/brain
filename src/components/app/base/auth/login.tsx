"use client";

import PayloadLogin from "./payload-login";

export default function Login() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-1 flex-col justify-center px-4 py-10 lg:px-6">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <h2 className="text-center font-semibold text-foreground text-xl mb-6">
            Sealos Brain
          </h2>

          <PayloadLogin />
        </div>
      </div>
    </div>
  );
}
